"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserMinus, MessageSquare } from "lucide-react"
import { removeFriend } from "@/lib/utils/friends"
import Link from "next/link"

interface FriendCardProps {
  id: string
  username: string
  avatarUrl: string | null
  onlineStatus: boolean
  lastSeen: string | null
  onRemove: (id: string) => void
}

export function FriendCard({ id, username, avatarUrl, onlineStatus, lastSeen, onRemove }: FriendCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const result = await removeFriend(id)
      if (result.success) {
        onRemove(id)
      }
    } finally {
      setIsRemoving(false)
    }
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never"

    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    return date.toLocaleDateString()
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl || undefined} alt={username} />
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(username)}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                  onlineStatus ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <div className="font-medium">{username}</div>
              <div className="text-xs text-muted-foreground">
                {onlineStatus ? "Online" : `Last seen ${formatLastSeen(lastSeen)}`}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/messages?user=${id}`}>
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Message</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={handleRemove} disabled={isRemoving}>
              <UserMinus className="h-4 w-4" />
              <span className="sr-only">Remove friend</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
