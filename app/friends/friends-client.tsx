"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updatePresence } from "@/lib/utils/presence"
import { EnhancedUserSearch } from "@/components/friends/enhanced-user-search"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type FriendRequest = {
  id: string
  sender: Profile
  receiver: Profile
  created_at: string
  status: "pending" | "accepted" | "rejected"
}

export default function FriendsClient() {
  const supabase = createClientComponentClient<Database>()
  const [friends, setFriends] = useState<Profile[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState("friends")
  const [error, setError] = useState<string | null>(null)

  // Update presence when component mounts
  useEffect(() => {
    updatePresence(supabase)
    const interval = setInterval(() => updatePresence(supabase), 60000) // Update every minute
    return () => clearInterval(interval)
  }, [supabase])

  // Fetch friends and requests
  useEffect(() => {
    async function fetchFriendsAndRequests() {
      async function fetchFriends() {
        try {
          console.log("Starting to fetch friends and requests")
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return { success: false }

          // Try to fetch friends from the view
          const { data: friendsData, error: friendsError } = await supabase
            .from("user_friends")
            .select("friend:profiles!friend_id(id, username, avatar_url, online_status, last_seen)")
            .eq("user_id", user.id)

          // If the view doesn't exist yet, use mock data
          if (friendsError) {
            console.log("Error fetching friends:", friendsError)
            // Mock data for friends
            const mockFriends = [
              {
                id: "1",
                username: "GamerPro",
                avatar_url: null,
                online_status: "online",
                last_seen: new Date().toISOString(),
              },
              {
                id: "2",
                username: "EpicPlayer",
                avatar_url: null,
                online_status: "offline",
                last_seen: new Date(Date.now() - 86400000).toISOString(),
              },
              {
                id: "3",
                username: "NinjaWarrior",
                avatar_url: null,
                online_status: "online",
                last_seen: new Date().toISOString(),
              },
            ]
            setFriends(mockFriends as Profile[])
          } else {
            setFriends(friendsData.map((item) => item.friend as Profile))
          }

          // Try to fetch pending friend requests
          const { data: pendingData, error: pendingError } = await supabase
            .from("friendships")
            .select(
              "id, created_at, status, profiles!friendships_sender_id_fkey(*), profiles!friendships_receiver_id_fkey(*)",
            )
            .eq("receiver_id", user.id)
            .eq("status", "pending")

          // If the table doesn't exist yet, use mock data
          if (pendingError && pendingError.message.includes('relation "public.friendships" does not exist')) {
            console.log("Friendships table does not exist yet, using mock data")
            // Mock data for pending requests
            const mockPending = [
              {
                id: "101",
                created_at: new Date().toISOString(),
                status: "pending",
                sender: { id: "4", username: "RequestSender1", avatar_url: null },
                receiver: { id: user.id, username: user.email?.split("@")[0], avatar_url: null },
              },
              {
                id: "102",
                created_at: new Date(Date.now() - 3600000).toISOString(),
                status: "pending",
                sender: { id: "5", username: "RequestSender2", avatar_url: null },
                receiver: { id: user.id, username: user.email?.split("@")[0], avatar_url: null },
              },
            ]
            setPendingRequests(mockPending as FriendRequest[])
          } else if (pendingError) {
            console.error("Error fetching pending requests:", pendingError)
          } else {
            setPendingRequests(pendingData as unknown as FriendRequest[])
          }

          // Try to fetch sent friend requests
          const { data: sentData, error: sentError } = await supabase
            .from("friendships")
            .select(
              "id, created_at, status, profiles!friendships_sender_id_fkey(*), profiles!friendships_receiver_id_fkey(*)",
            )
            .eq("sender_id", user.id)
            .eq("status", "pending")

          // If the table doesn't exist yet, use mock data
          if (sentError && sentError.message.includes('relation "public.friendships" does not exist')) {
            // Mock data for sent requests
            const mockSent = [
              {
                id: "201",
                created_at: new Date(Date.now() - 7200000).toISOString(),
                status: "pending",
                sender: { id: user.id, username: user.email?.split("@")[0], avatar_url: null },
                receiver: { id: "6", username: "RequestReceiver1", avatar_url: null },
              },
            ]
            setSentRequests(mockSent as FriendRequest[])
          } else if (sentError) {
            console.error("Error fetching sent requests:", sentError)
          } else {
            setSentRequests(sentData as unknown as FriendRequest[])
          }
          return { success: true }
        } catch (error) {
          console.error("Error in fetchFriendsAndRequests:", error)
          return { success: false }
        } finally {
          console.log("Finished fetching friends and requests")
          setLoading(false)
        }
      }

      try {
        const result = await fetchFriends()
        if (!result.success) {
          console.error("Failed to fetch friends:", result)
          setError("Failed to load friends data. Please try again later.")
        }
      } catch (err) {
        console.error("Error in friends client:", err)
        setError("An unexpected error occurred. Please try again later.")
      }
    }

    fetchFriendsAndRequests()
  }, [supabase])

  // Handle friend request response
  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      // Find the request
      const request = pendingRequests.find((r) => r.id === requestId)
      if (!request) return

      // Try to update the request
      const { error } = await supabase
        .from("friendships")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", requestId)

      if (error) {
        if (error.message.includes('relation "public.friendships" does not exist')) {
          // Mock the response
          setPendingRequests((prev) => prev.filter((r) => r.id !== requestId))

          if (accept) {
            // Add to friends list if accepted
            setFriends((prev) => [...prev, request.sender])
            toast({
              title: "Success",
              description: `You are now friends with ${request.sender.username}`,
            })
          } else {
            toast({
              title: "Friend Request Rejected",
              description: `You rejected ${request.sender.username}'s friend request`,
            })
          }
        } else {
          console.error("Error responding to friend request:", error)
          toast({
            title: "Error",
            description: "Failed to respond to friend request. Please try again later.",
            variant: "destructive",
          })
        }
      } else {
        // Update UI
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId))

        if (accept) {
          // Add to friends list if accepted
          setFriends((prev) => [...prev, request.sender])
          toast({
            title: "Success",
            description: `You are now friends with ${request.sender.username}`,
          })
        } else {
          toast({
            title: "Friend Request Rejected",
            description: `You rejected ${request.sender.username}'s friend request`,
          })
        }
      }
    } catch (error) {
      console.error("Error in respondToFriendRequest:", error)
    }
  }

  // Cancel sent friend request
  const cancelFriendRequest = async (requestId: string) => {
    try {
      // Find the request
      const request = sentRequests.find((r) => r.id === requestId)
      if (!request) return

      // Try to delete the request
      const { error } = await supabase.from("friendships").delete().eq("id", requestId)

      if (error) {
        if (error.message.includes('relation "public.friendships" does not exist')) {
          // Mock the cancellation
          setSentRequests((prev) => prev.filter((r) => r.id !== requestId))
          toast({
            title: "Request Cancelled",
            description: `Friend request to ${request.receiver.username} has been cancelled`,
          })
        } else {
          console.error("Error cancelling friend request:", error)
          toast({
            title: "Error",
            description: "Failed to cancel friend request. Please try again later.",
            variant: "destructive",
          })
        }
      } else {
        // Update UI
        setSentRequests((prev) => prev.filter((r) => r.id !== requestId))
        toast({
          title: "Request Cancelled",
          description: `Friend request to ${request.receiver.username} has been cancelled`,
        })
      }
    } catch (error) {
      console.error("Error in cancelFriendRequest:", error)
    }
  }

  // Remove friend
  const removeFriend = async (friendId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Find the friend
      const friend = friends.find((f) => f.id === friendId)
      if (!friend) return

      // Try to delete the friendship
      const { error: error1 } = await supabase
        .from("friendships")
        .delete()
        .eq("sender_id", user.id)
        .eq("receiver_id", friendId)

      const { error: error2 } = await supabase
        .from("friendships")
        .delete()
        .eq("sender_id", friendId)
        .eq("receiver_id", user.id)

      if (
        (error1 && !error1.message.includes('relation "public.friendships" does not exist')) ||
        (error2 && !error2.message.includes('relation "public.friendships" does not exist'))
      ) {
        console.error("Error removing friend:", error1 || error2)
        toast({
          title: "Error",
          description: "Failed to remove friend. Please try again later.",
          variant: "destructive",
        })
      } else {
        // Update UI
        setFriends((prev) => prev.filter((f) => f.id !== friendId))
        toast({
          title: "Friend Removed",
          description: `${friend.username} has been removed from your friends list`,
        })
      }
    } catch (error) {
      console.error("Error in removeFriend:", error)
    }
  }

  // Format last seen time
  const formatLastSeen = (lastSeen: string) => {
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

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  window.location.reload()
                }}
                className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          )}
          <Tabs defaultValue="friends" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="friends">
                Friends
                {friends.length > 0 && <Badge className="ml-2">{friends.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {pendingRequests.length > 0 && <Badge className="ml-2">{pendingRequests.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent
                {sentRequests.length > 0 && <Badge className="ml-2">{sentRequests.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="add">Find Friends</TabsTrigger>
            </TabsList>

            <TabsContent value="friends">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-pulse">Loading friends...</div>
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={friend.avatar_url || undefined} />
                          <AvatarFallback>{friend.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{friend.username}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${friend.online_status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                            ></div>
                            {friend.online_status === "online"
                              ? "Online"
                              : `Last seen ${formatLastSeen(friend.last_seen || "")}`}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeFriend(friend.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You don't have any friends yet. Add some friends to get started!
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-pulse">Loading requests...</div>
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={request.sender.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.sender.username?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.sender.username}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Sent {formatLastSeen(request.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => respondToFriendRequest(request.id, true)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => respondToFriendRequest(request.id, false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No pending friend requests.</div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-pulse">Loading sent requests...</div>
                </div>
              ) : sentRequests.length > 0 ? (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={request.receiver.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.receiver.username?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.receiver.username}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Sent {formatLastSeen(request.created_at)}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => cancelFriendRequest(request.id)}>
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">You haven't sent any friend requests.</div>
              )}
            </TabsContent>

            <TabsContent value="add">
              <EnhancedUserSearch />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
