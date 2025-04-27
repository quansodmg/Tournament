"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Bell, X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    action_url?: string | null
    is_read: boolean
    created_at: string
  }
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { markAsRead, deleteNotification } = useNotifications()

  const handleClick = async () => {
    if (!notification.is_read) {
      setIsLoading(true)
      try {
        await markAsRead(notification.id)
      } catch (error) {
        console.error("Error marking notification as read:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    try {
      await deleteNotification(notification.id)
    } catch (error) {
      console.error("Error dismissing notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const content = (
    <div className="flex items-start gap-2 p-3 w-full">
      <div className={`mt-0.5 rounded-full p-1 ${notification.is_read ? "bg-muted" : "bg-primary"}`}>
        <Bell className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className="flex-1 space-y-1">
        <p
          className={`text-sm font-medium leading-none ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        disabled={isLoading}
        className="rounded-full p-1 hover:bg-muted"
        aria-label="Dismiss notification"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )

  if (notification.action_url) {
    return (
      <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted p-0" disabled={isLoading}>
        <Link href={notification.action_url} onClick={handleClick}>
          {content}
        </Link>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem className="cursor-default focus:bg-muted p-0" disabled={isLoading}>
      {content}
    </DropdownMenuItem>
  )
}
