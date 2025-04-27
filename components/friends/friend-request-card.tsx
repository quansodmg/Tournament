"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Clock } from "lucide-react"
import { respondToFriendRequest } from "@/lib/utils/friends"

interface FriendRequestCardProps {
  id: string
  username: string
  avatarUrl: string | null
  createdAt: string
  onAccept: (id: string) => void
  onReject: (id: string) => void
}

export function FriendRequestCard({ id, username, avatarUrl, createdAt, onAccept, onReject }: FriendRequestCardProps) {
  const [isResponding, setIsResponding] = useState(false)

  const handleAccept = async () => {
    setIsResponding(true)
    try {
      const result = await respondToFriendRequest(id, true)
      if (result.success) {
        onAccept(id)
      }
    } finally {
      setIsResponding(false)
    }
  }

  const handleReject = async () => {
    setIsResponding(true)
    try {
      const result = await respondToFriendRequest(id, false)
      if (result.success) {
        onReject(id)
      }
    } finally {
      setIsResponding(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

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
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(username)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{username}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>Sent {formatTime(createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleAccept}
              disabled={isResponding}
              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Accept</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReject}
              disabled={isResponding}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Reject</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
