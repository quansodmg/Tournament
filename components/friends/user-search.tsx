"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Search } from "lucide-react"
import { sendFriendRequest } from "@/lib/utils/friends"
import type { Database } from "@/lib/database.types"

type Profile = {
  id: string
  username: string
  avatar_url: string | null
}

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sentRequests, setSentRequests] = useState<string[]>([])
  const supabase = createClientComponentClient<Database>()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Search for users by username
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user.id)
        .limit(10)

      if (error) {
        console.error("Error searching users:", error)
      } else {
        setSearchResults(data as Profile[])
      }
    } catch (error) {
      console.error("Error in handleSearch:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    const result = await sendFriendRequest(userId)
    if (result.success) {
      setSentRequests((prev) => [...prev, userId])
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.username}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sentRequests.includes(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {sentRequests.includes(user.id) ? "Request Sent" : "Add Friend"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery && !isSearching ? (
        <div className="text-center py-8 text-muted-foreground">No users found matching "{searchQuery}"</div>
      ) : null}
    </div>
  )
}
