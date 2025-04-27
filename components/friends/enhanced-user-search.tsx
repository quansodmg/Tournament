"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Search, Users, X, Check, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendFriendRequest } from "@/lib/utils/friends"
import type { Database } from "@/lib/database.types"

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  bio?: string | null
  games_played?: string[] | null
}

type SearchFilters = {
  game?: string
  onlineOnly?: boolean
}

export function EnhancedUserSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [sentRequests, setSentRequests] = useState<string[]>([])
  const [filters, setFilters] = useState<SearchFilters>({})
  const [activeTab, setActiveTab] = useState("search")
  const supabase = createClientComponentClient<Database>()

  // Load suggested users when component mounts
  useEffect(() => {
    loadSuggestedUsers()
  }, [])

  const loadSuggestedUsers = async () => {
    setIsLoadingSuggestions(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // In a real app, you would implement logic to find users with similar interests,
      // mutual friends, etc. For now, we'll just get some random users.
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .neq("id", user.id)
        .limit(5)

      if (error) {
        if (error.message.includes('relation "public.profiles" does not exist')) {
          // Mock suggested users
          const mockUsers = [
            { id: "s1", username: "ProGamer123", avatar_url: null, bio: "Competitive FPS player" },
            { id: "s2", username: "RPGMaster", avatar_url: null, bio: "RPG enthusiast and strategy game lover" },
            { id: "s3", username: "SpeedRunner", avatar_url: null, bio: "World record holder in multiple games" },
            { id: "s4", username: "GameDesigner", avatar_url: null, bio: "Indie game developer and esports fan" },
          ]
          setSuggestedUsers(mockUsers)
        } else {
          console.error("Error fetching suggested users:", error)
          toast({
            title: "Error",
            description: "Failed to load suggested users",
            variant: "destructive",
          })
        }
      } else {
        setSuggestedUsers(data as Profile[])
      }
    } catch (error) {
      console.error("Error in loadSuggestedUsers:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() && !filters.game && !filters.onlineOnly) {
      toast({
        title: "Search criteria needed",
        description: "Please enter a username or select filters",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Build the query
      let query = supabase.from("profiles").select("id, username, avatar_url, bio, games_played").neq("id", user.id)

      // Add filters
      if (searchQuery.trim()) {
        query = query.ilike("username", `%${searchQuery}%`)
      }

      if (filters.onlineOnly) {
        query = query.eq("online_status", "online")
      }

      if (filters.game) {
        // This assumes games_played is an array column
        // In a real app, you might have a different schema
        query = query.contains("games_played", [filters.game])
      }

      // Execute the query
      const { data, error } = await query.limit(20)

      if (error) {
        if (error.message.includes('relation "public.profiles" does not exist')) {
          // Mock search results based on filters
          let mockResults = [
            {
              id: "7",
              username: `${searchQuery || "User"}1`,
              avatar_url: null,
              bio: "Casual gamer who loves FPS and strategy games",
              games_played: ["Fortnite", "League of Legends"],
            },
            {
              id: "8",
              username: `${searchQuery || "Pro"}2`,
              avatar_url: null,
              bio: "Professional esports player",
              games_played: ["Counter-Strike", "Valorant"],
            },
            {
              id: "9",
              username: `Epic${searchQuery || "Gamer"}3`,
              avatar_url: null,
              bio: "Streaming daily on Twitch",
              games_played: ["Apex Legends", "Call of Duty"],
            },
          ]

          // Apply filters to mock results
          if (filters.game) {
            mockResults = mockResults.filter((user) => user.games_played?.includes(filters.game as string))
          }

          setSearchResults(mockResults as Profile[])
        } else {
          console.error("Error searching users:", error)
          toast({
            title: "Error",
            description: "Failed to search users. Please try again later.",
            variant: "destructive",
          })
        }
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

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setFilters({})
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4 mt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.onlineOnly ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, onlineOnly: !prev.onlineOnly }))}
              >
                Online Only{" "}
                {filters.onlineOnly && (
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFilters((prev) => ({ ...prev, onlineOnly: false }))
                    }}
                  />
                )}
              </Badge>

              {["Fortnite", "League of Legends", "Counter-Strike", "Valorant"].map((game) => (
                <Badge
                  key={game}
                  variant={filters.game === game ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, game: prev.game === game ? undefined : game }))}
                >
                  {game}{" "}
                  {filters.game === game && (
                    <X
                      className="h-3 w-3 ml-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilters((prev) => ({ ...prev, game: undefined }))
                      }}
                    />
                  )}
                </Badge>
              ))}

              {(searchQuery || filters.game || filters.onlineOnly) && (
                <Button variant="ghost" size="sm" onClick={clearSearch} className="h-6">
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSendRequest={handleSendRequest}
                  requestSent={sentRequests.includes(user.id)}
                />
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
              <Users className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>No users found matching your search criteria</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="suggested" className="space-y-4 mt-4">
          {isLoadingSuggestions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : suggestedUsers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">People you might know</h3>
              {suggestedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSendRequest={handleSendRequest}
                  requestSent={sentRequests.includes(user.id)}
                />
              ))}
              <Button variant="outline" className="w-full" onClick={loadSuggestedUsers}>
                Refresh Suggestions
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No suggested users available</p>
              <Button variant="outline" className="mt-2" onClick={loadSuggestedUsers}>
                Try Again
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UserCard({
  user,
  onSendRequest,
  requestSent,
}: {
  user: Profile
  onSendRequest: (userId: string) => void
  requestSent: boolean
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.username}</div>
              {user.bio && <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>}
              {user.games_played && user.games_played.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.games_played.slice(0, 2).map((game) => (
                    <Badge key={game} variant="secondary" className="text-xs">
                      {game}
                    </Badge>
                  ))}
                  {user.games_played.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{user.games_played.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSendRequest(user.id)}
            disabled={requestSent}
            className="flex items-center"
          >
            {requestSent ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Sent
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
