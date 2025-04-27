"use client"

import { useEffect, useState } from "react"
import { getPendingRequests, setupFriendsSubscription } from "@/lib/utils/friends"
import { FriendRequestCard } from "./friend-request-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type FriendRequest = {
  id: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export function FriendRequests() {
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    setLoading(true)
    const { success, incoming, outgoing } = await getPendingRequests()

    if (success) {
      setIncomingRequests(incoming)
      setOutgoingRequests(outgoing)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()

    // Set up real-time subscription
    const cleanup = setupFriendsSubscription(fetchRequests)

    return cleanup
  }, [])

  const handleAcceptRequest = (id: string) => {
    setIncomingRequests((prev) => prev.filter((request) => request.id !== id))
  }

  const handleRejectRequest = (id: string) => {
    setIncomingRequests((prev) => prev.filter((request) => request.id !== id))
  }

  const handleCancelRequest = (id: string) => {
    setOutgoingRequests((prev) => prev.filter((request) => request.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No pending requests</h3>
        <p className="text-muted-foreground mt-2">You don't have any pending friend requests</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="incoming" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="incoming">
          Incoming
          <Badge variant="secondary" className="ml-2">
            {incomingRequests.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="outgoing">
          Outgoing
          <Badge variant="secondary" className="ml-2">
            {outgoingRequests.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="space-y-4">
        {incomingRequests.length > 0 ? (
          incomingRequests.map((request) => (
            <FriendRequestCard
              key={request.id}
              id={request.id}
              username={request.user.username}
              avatarUrl={request.user.avatar_url}
              createdAt={request.created_at}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">You don't have any incoming friend requests</div>
        )}
      </TabsContent>

      <TabsContent value="outgoing" className="space-y-4">
        {outgoingRequests.length > 0 ? (
          outgoingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="font-medium">{request.user.username}</div>
                <div className="text-xs text-muted-foreground">
                  Sent {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleCancelRequest(request.id)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">You don't have any outgoing friend requests</div>
        )}
      </TabsContent>
    </Tabs>
  )
}
