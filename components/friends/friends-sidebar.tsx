"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Friend = {
  id: string
  username: string
  avatar_url: string | null
  online_status: boolean
}

export default function FriendsSidebar() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)
  const supabase = createClientComponentClient<Database>()

  // Mock data for friends
  const mockFriends: Friend[] = [
    { id: "1", username: "GamerPro99", avatar_url: null, online_status: true },
    { id: "2", username: "EpicSniper", avatar_url: null, online_status: false },
    { id: "3", username: "NinjaWarrior", avatar_url: null, online_status: true },
    { id: "4", username: "StrategyMaster", avatar_url: null, online_status: true },
    { id: "5", username: "LegendaryGamer", avatar_url: null, online_status: false },
    { id: "6", username: "ProLeaguer", avatar_url: null, online_status: true },
    { id: "7", username: "TacticalPlayer", avatar_url: null, online_status: true },
    { id: "8", username: "StealthAssassin", avatar_url: null, online_status: false },
  ]

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          setUseMockData(true)
          setFriends(mockFriends)
          setOnlineCount(mockFriends.filter((friend) => friend.online_status).length)
          return
        }

        try {
          // Fetch accepted friendships
          const { data: acceptedFriendships, error: friendshipsError } = await supabase
            .from("friendships")
            .select("sender_id, receiver_id")
            .eq("status", "accepted")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

          if (friendshipsError) {
            console.error("Error fetching friends:", friendshipsError)
            setUseMockData(true)
            setFriends(mockFriends)
            setOnlineCount(mockFriends.filter((friend) => friend.online_status).length)
          } else if (acceptedFriendships.length === 0) {
            // No friends found, use mock data
            setUseMockData(true)
            setFriends(mockFriends)
            setOnlineCount(mockFriends.filter((friend) => friend.online_status).length)
          } else {
            // Extract friend IDs
            const friendIds = acceptedFriendships.map((friendship) =>
              friendship.sender_id === user.id ? friendship.receiver_id : friendship.sender_id,
            )

            // Fetch friend profiles
            const { data: friendProfiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, username, avatar_url, online_status")
              .in("id", friendIds)

            if (profilesError) {
              console.error("Error fetching friend profiles:", profilesError)
              setUseMockData(true)
              setFriends(mockFriends)
              setOnlineCount(mockFriends.filter((friend) => friend.online_status).length)
            } else {
              setUseMockData(false)
              setFriends(friendProfiles)
              setOnlineCount(friendProfiles.filter((friend) => friend.online_status).length)
            }
          }
        } catch (error) {
          console.error("Error in friend fetching:", error)
          setUseMockData(true)
          setFriends(mockFriends)
          setOnlineCount(mockFriends.filter((friend) => friend.online_status).length)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error in fetchFriends:", error)
        setIsLoading(false)
        setUseMockData(true)
        setFriends(mockFriends)
        setOnlineCount(mockFriends.filter((friend) => friend.online_status).length)
      }
    }

    fetchFriends()

    // Set up real-time subscription for online status changes
    try {
      const presenceChannel = supabase
        .channel("online-users")
        .on("presence", { event: "sync" }, () => {
          fetchFriends()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(presenceChannel)
      }
    } catch (error) {
      console.error("Error setting up real-time subscription:", error)
    }
  }, [supabase])

  // Function to get initials from username
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  return (
    <div className="w-[80px] bg-[#101113] border-l border-[#1e2023] flex flex-col items-center py-4">
      <div className="mb-4 flex flex-col items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 rounded-full bg-[#1e2023] flex items-center justify-center text-[#0bb5ff] mb-1">
                <Users size={20} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Friends</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-[#0bb5ff]">{onlineCount} Online</span>
      </div>

      <div className="flex flex-col items-center space-y-4 overflow-y-auto scrollbar-hide">
        {isLoading
          ? // Loading skeletons
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1e2023] animate-pulse"></div>
                  <div className="mt-1 w-12 h-2 bg-[#1e2023] rounded animate-pulse"></div>
                </div>
              ))
          : friends.map((friend) => (
              <TooltipProvider key={friend.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          {friend.avatar_url ? (
                            <AvatarImage src={friend.avatar_url || "/placeholder.svg"} alt={friend.username} />
                          ) : (
                            <AvatarFallback className="bg-[#1e2023] text-[#0bb5ff]">
                              {getInitials(friend.username)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#101113] ${
                            friend.online_status ? "bg-green-500" : "bg-gray-500"
                          }`}
                        ></span>
                      </div>
                      <span className="mt-1 text-xs text-gray-400 truncate w-16 text-center">{friend.username}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>
                      {friend.username} ({friend.online_status ? "Online" : "Offline"})
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
      </div>
    </div>
  )
}
