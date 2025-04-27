"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client" // Updated import
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import {
  playNotificationSound,
  showBrowserNotification,
  requestNotificationPermission,
} from "@/lib/utils/sound-notification"

type Notification = {
  id: string
  profile_id: string
  title: string
  message: string
  type: string
  reference_id: string | null
  reference_type: string | null
  is_read: boolean
  created_at: string
  action_url: string | null
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const { toast } = useToast()

  // Initialize Supabase client once
  useEffect(() => {
    const initSupabase = async () => {
      try {
        const client = await createClient()
        setSupabase(client)
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error)
      }
    }

    initSupabase()
  }, [])

  // Fetch user ID when Supabase is initialized
  useEffect(() => {
    if (!supabase) return

    const getUserId = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUserId(session.user.id)
        }
      } catch (error) {
        console.error("Error getting user session:", error)
      }
    }

    getUserId()
  }, [supabase])

  // Fetch notifications when user ID is available
  useEffect(() => {
    if (!userId || !supabase) return

    fetchNotifications()
    const cleanup = setupRealtimeSubscription()

    return cleanup
  }, [userId, supabase])

  useEffect(() => {
    // Request notification permission when the component mounts
    requestNotificationPermission()
  }, [])

  // Set up realtime subscription
  const setupRealtimeSubscription = () => {
    if (!userId || !supabase) return () => {}

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            action: newNotification.action_url ? (
              <a href={newNotification.action_url} className="text-primary hover:underline">
                View
              </a>
            ) : undefined,
            icon: <Bell className="h-4 w-4" />,
          })

          playNotificationSound()
          showBrowserNotification(newNotification.title, newNotification.message, undefined, () => {
            if (newNotification.action_url) {
              window.location.href = newNotification.action_url
            }
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === updatedNotification.id ? updatedNotification : notification,
            ),
          )

          // Update unread count
          calculateUnreadCount()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = payload.old.id
          setNotifications((prev) => prev.filter((notification) => notification.id !== deletedId))

          // Update unread count
          calculateUnreadCount()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchNotifications = async () => {
    if (!userId || !supabase) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
      calculateUnreadCount(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateUnreadCount = (notifs = notifications) => {
    const count = notifs.filter((notification) => !notification.is_read).length
    setUnreadCount(count)
  }

  const markAsRead = async (id: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
      )

      calculateUnreadCount()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId || !supabase) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("profile_id", userId)
        .eq("is_read", false)

      if (error) throw error

      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))

      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) throw error

      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      calculateUnreadCount()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  // Don't render children until Supabase is initialized
  if (!supabase) {
    return null
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
