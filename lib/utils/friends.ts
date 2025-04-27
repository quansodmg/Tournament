import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"

type FriendRequestStatus = "pending" | "accepted" | "rejected"

export async function sendFriendRequest(receiverId: string) {
  const supabase = createClientComponentClient<Database>()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send friend requests",
        variant: "destructive",
      })
      return { success: false }
    }

    // Check if a request already exists
    const { data: existingRequest, error: checkError } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`,
      )
      .single()

    if (checkError && !checkError.message.includes("No rows found")) {
      console.error("Error checking existing friendship:", checkError)
      toast({
        title: "Error",
        description: "Failed to check existing friendship",
        variant: "destructive",
      })
      return { success: false }
    }

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        toast({
          title: "Already friends",
          description: "You are already friends with this user",
        })
        return { success: false, alreadyFriends: true }
      } else if (existingRequest.status === "pending") {
        toast({
          title: "Request pending",
          description: "A friend request already exists between you and this user",
        })
        return { success: false, alreadyRequested: true }
      }
    }

    // Create friend request
    const { error } = await supabase.from("friendships").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: "pending",
    })

    if (error) {
      console.error("Error sending friend request:", error)
      toast({
        title: "Request Failed",
        description: "Failed to send friend request",
        variant: "destructive",
      })
      return { success: false }
    }

    toast({
      title: "Request Sent",
      description: "Friend request sent successfully",
    })

    return { success: true }
  } catch (error) {
    console.error("Error in sendFriendRequest:", error)
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    })
    return { success: false }
  }
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  const supabase = createClientComponentClient<Database>()

  try {
    // Get the request details first
    const { data: request, error: fetchError } = await supabase
      .from("friendships")
      .select("*, sender:profiles!friendships_sender_id_fkey(username)")
      .eq("id", requestId)
      .single()

    if (fetchError) {
      console.error("Error fetching friend request:", fetchError)
      toast({
        title: "Error",
        description: "Failed to fetch friend request details",
        variant: "destructive",
      })
      return { success: false }
    }

    // Update the request status
    const { error } = await supabase
      .from("friendships")
      .update({
        status: accept ? "accepted" : "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      console.error("Error responding to friend request:", error)
      toast({
        title: "Action Failed",
        description: "Failed to respond to friend request",
        variant: "destructive",
      })
      return { success: false }
    }

    toast({
      title: accept ? "Friend Added" : "Request Rejected",
      description: accept ? `You are now friends with ${request.sender.username}` : `You rejected the friend request`,
    })

    return { success: true, accepted: accept }
  } catch (error) {
    console.error("Error in respondToFriendRequest:", error)
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    })
    return { success: false }
  }
}

export async function removeFriend(friendId: string) {
  const supabase = createClientComponentClient<Database>()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false }

    // Delete the friendship record (need to check both directions)
    const { error: error1 } = await supabase
      .from("friendships")
      .delete()
      .eq("sender_id", user.id)
      .eq("receiver_id", friendId)
      .eq("status", "accepted")

    const { error: error2 } = await supabase
      .from("friendships")
      .delete()
      .eq("sender_id", friendId)
      .eq("receiver_id", user.id)
      .eq("status", "accepted")

    if (error1 && error2) {
      console.error("Error removing friend:", error1, error2)
      toast({
        title: "Action Failed",
        description: "Failed to remove friend",
        variant: "destructive",
      })
      return { success: false }
    }

    toast({
      title: "Friend Removed",
      description: "Friend has been removed from your list",
    })

    return { success: true }
  } catch (error) {
    console.error("Error in removeFriend:", error)
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    })
    return { success: false }
  }
}

export async function getFriends() {
  const supabase = createClientComponentClient<Database>()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, friends: [] }

    // Get all accepted friendships
    const { data: friendships, error } = await supabase
      .from("friendships")
      .select("id, sender_id, receiver_id, status, created_at")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")

    if (error) {
      console.error("Error fetching friends:", error)
      return { success: false, friends: [] }
    }

    if (!friendships || friendships.length === 0) {
      return { success: true, friends: [] }
    }

    // Extract friend IDs
    const friendIds = friendships.map((friendship) =>
      friendship.sender_id === user.id ? friendship.receiver_id : friendship.sender_id,
    )

    // Fetch friend profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, online_status, last_seen")
      .in("id", friendIds)

    if (profilesError) {
      console.error("Error fetching friend profiles:", profilesError)
      return { success: false, friends: [] }
    }

    // Map profiles to friendships
    const friends = friendships
      .map((friendship) => {
        const friendId = friendship.sender_id === user.id ? friendship.receiver_id : friendship.sender_id
        const profile = profiles?.find((p) => p.id === friendId)

        if (!profile) return null

        return {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          online_status: profile.online_status || "offline",
          last_seen: profile.last_seen,
          friendship_id: friendship.id,
          since: friendship.created_at,
        }
      })
      .filter(Boolean)

    return { success: true, friends }
  } catch (error) {
    console.error("Error in getFriends:", error)
    return { success: false, friends: [] }
  }
}

export async function getPendingRequests() {
  const supabase = createClientComponentClient<Database>()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, incoming: [], outgoing: [] }

    // Get incoming requests (where current user is the receiver)
    const { data: incomingRequests, error: incomingError } = await supabase
      .from("friendships")
      .select("id, sender_id, created_at")
      .eq("receiver_id", user.id)
      .eq("status", "pending")

    if (incomingError) {
      console.error("Error fetching incoming requests:", incomingError)
      return { success: false, incoming: [], outgoing: [] }
    }

    // Get outgoing requests (where current user is the sender)
    const { data: outgoingRequests, error: outgoingError } = await supabase
      .from("friendships")
      .select("id, receiver_id, created_at")
      .eq("sender_id", user.id)
      .eq("status", "pending")

    if (outgoingError) {
      console.error("Error fetching outgoing requests:", outgoingError)
      return { success: false, incoming: [], outgoing: [] }
    }

    // Fetch profiles for incoming requests
    let incomingProfiles = []
    if (incomingRequests && incomingRequests.length > 0) {
      const senderIds = incomingRequests.map((request) => request.sender_id)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", senderIds)

      if (profilesError) {
        console.error("Error fetching incoming profiles:", profilesError)
      } else {
        incomingProfiles = profiles || []
      }
    }

    // Fetch profiles for outgoing requests
    let outgoingProfiles = []
    if (outgoingRequests && outgoingRequests.length > 0) {
      const receiverIds = outgoingRequests.map((request) => request.receiver_id)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", receiverIds)

      if (profilesError) {
        console.error("Error fetching outgoing profiles:", profilesError)
      } else {
        outgoingProfiles = profiles || []
      }
    }

    // Transform the data
    const incoming = incomingRequests
      .map((request) => {
        const profile = incomingProfiles.find((p) => p.id === request.sender_id)
        if (!profile) return null

        return {
          id: request.id,
          created_at: request.created_at,
          user: {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
          },
        }
      })
      .filter(Boolean)

    const outgoing = outgoingRequests
      .map((request) => {
        const profile = outgoingProfiles.find((p) => p.id === request.receiver_id)
        if (!profile) return null

        return {
          id: request.id,
          created_at: request.created_at,
          user: {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
          },
        }
      })
      .filter(Boolean)

    return {
      success: true,
      incoming,
      outgoing,
    }
  } catch (error) {
    console.error("Error in getPendingRequests:", error)
    return { success: false, incoming: [], outgoing: [] }
  }
}

export function setupFriendsSubscription(callback: () => void) {
  const supabase = createClientComponentClient<Database>()

  try {
    const channel = supabase
      .channel("friends-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        () => {
          callback()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  } catch (error) {
    console.error("Error setting up friends subscription:", error)
    return () => {}
  }
}
