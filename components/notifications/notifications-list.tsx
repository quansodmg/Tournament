"use client"

import { Bell, Loader2 } from "lucide-react"
import NotificationItem from "./notification-item"

interface NotificationsListProps {
  notifications: any[]
  isLoading: boolean
}

export default function NotificationsList({ notifications, isLoading }: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No notifications</p>
      </div>
    )
  }

  return (
    <div className="max-h-[300px] overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={() => {}} />
      ))}
    </div>
  )
}
