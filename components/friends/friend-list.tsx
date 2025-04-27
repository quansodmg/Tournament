"use client"

import { useEffect, useState } from "react"
import { getFriends, setupFriendsSubscription } from "@/lib/utils/friends"
import { FriendCard } from "./friend-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type Friend = {
  id: string
  username: string
  avatar_url: string | null
  online_status: string | boolean
  last_seen: string | null
  friendship_id?: string
  since?: string
}

export function FriendList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([])
  const [offlineFriends, setOfflineFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFriends = async () => {
    setLoading(true)
    const { success, friends: fetchedFriends } = await getFriends()

    if (success) {
      setFriends(fetchedFriends)

      // Split into online and offline
      const online = fetchedFriends.filter((friend) => friend.online_status)
      const offline = fetchedFriends.filter((friend) => !friend.online_status)

      setOnlineFriends(online)
      setOfflineFriends(offline)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchFriends()

    // Set up real-time subscription
    const cleanup = setupFriendsSubscription(fetchFriends)

    return cleanup
  }, [])

  const handleRemoveFriend = (id: string) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== id))
    setOnlineFriends((prev) => prev.filter((friend) => friend.id !== id))
    setOfflineFriends((prev) => prev.filter((friend) => friend.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No friends yet</h3>
        <p className="text-muted-foreground mt-2">Search for users and send friend requests to get started</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" className="ml-2">
            {friends.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="online">
          Online
          <Badge variant="secondary" className="ml-2">
            {onlineFriends.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="offline">
          Offline
          <Badge variant="secondary" className="ml-2">
            {offlineFriends.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            id={friend.id}
            username={friend.username}
            avatarUrl={friend.avatar_url}
            onlineStatus={friend.online_status}
            lastSeen={friend.last_seen}
            onRemove={handleRemoveFriend}
          />
        ))}
      </TabsContent>

      <TabsContent value="online" className="space-y-4">
        {onlineFriends.length > 0 ? (
          onlineFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              id={friend.id}
              username={friend.username}
              avatarUrl={friend.avatar_url}
              onlineStatus={friend.online_status}
              lastSeen={friend.last_seen}
              onRemove={handleRemoveFriend}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">None of your friends are currently online</div>
        )}
      </TabsContent>

      <TabsContent value="offline" className="space-y-4">
        {offlineFriends.length > 0 ? (
          offlineFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              id={friend.id}
              username={friend.username}
              avatarUrl={friend.avatar_url}
              onlineStatus={friend.online_status}
              lastSeen={friend.last_seen}
              onRemove={handleRemoveFriend}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">All your friends are currently online</div>
        )}
      </TabsContent>
    </Tabs>
  )
}
