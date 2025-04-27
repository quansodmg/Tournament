"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { Trophy, Medal, AlertCircle, Users, User } from "lucide-react"
import Link from "next/link"

interface EloLeaderboardProps {
  gameId?: string
  limit?: number
}

export default function EloLeaderboard({ gameId, limit = 10 }: EloLeaderboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [topTeams, setTopTeams] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<string | null>(gameId || null)
  const [activeTab, setActiveTab] = useState("players")
  const supabase = createClient()

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase.from("games").select("id, name, logo_url").order("name")

        if (error) throw error
        setGames(data || [])
      } catch (err: any) {
        console.error("Error fetching games:", err)
      }
    }

    fetchGames()
  }, [supabase])

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true)
        setError(null)

        // Fetch top players
        if (selectedGame) {
          // Game-specific leaderboard
          const { data: players, error: playersError } = await supabase
            .from("player_elo_ratings")
            .select(`
              elo_rating,
              elo_matches,
              highest_elo,
              profile:profile_id(id, username, avatar_url)
            `)
            .eq("game_id", selectedGame)
            .order("elo_rating", { ascending: false })
            .limit(limit)

          if (playersError) throw playersError
          setTopPlayers(players || [])

          // Game-specific team leaderboard
          const { data: teams, error: teamsError } = await supabase
            .from("team_elo_ratings")
            .select(`
              elo_rating,
              elo_matches,
              highest_elo,
              team:team_id(id, name, logo_url)
            `)
            .eq("game_id", selectedGame)
            .order("elo_rating", { ascending: false })
            .limit(limit)

          if (teamsError) throw teamsError
          setTopTeams(teams || [])
        } else {
          // General leaderboard
          const { data: players, error: playersError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, elo_rating, elo_matches, highest_elo")
            .order("elo_rating", { ascending: false })
            .limit(limit)

          if (playersError) throw playersError
          setTopPlayers(players || [])

          // General team leaderboard
          const { data: teams, error: teamsError } = await supabase
            .from("teams")
            .select("id, name, logo_url, elo_rating, elo_matches, highest_elo")
            .order("elo_rating", { ascending: false })
            .limit(limit)

          if (teamsError) throw teamsError
          setTopTeams(teams || [])
        }
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err)
        setError(err.message || "Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedGame, limit, supabase])

  // Function to get rank tier based on ELO
  const getRankTier = (elo: number) => {
    if (elo >= 2400) return { name: "Grandmaster", color: "text-yellow-500" }
    if (elo >= 2200) return { name: "Master", color: "text-purple-500" }
    if (elo >= 2000) return { name: "Diamond", color: "text-blue-500" }
    if (elo >= 1800) return { name: "Platinum", color: "text-cyan-500" }
    if (elo >= 1600) return { name: "Gold", color: "text-yellow-400" }
    if (elo >= 1400) return { name: "Silver", color: "text-gray-400" }
    return { name: "Bronze", color: "text-amber-700" }
  }

  // Function to get medal for top 3 positions
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          ELO Leaderboard
        </CardTitle>
        <CardDescription>Top players and teams by rating</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.length > 0 && (
            <div className="mb-4">
              <Tabs
                value={selectedGame || "all"}
                onValueChange={(value) => setSelectedGame(value === "all" ? null : value)}
              >
                <TabsList className="w-full flex overflow-x-auto">
                  <TabsTrigger value="all">All Games</TabsTrigger>
                  {games.map((game) => (
                    <TabsTrigger key={game.id} value={game.id}>
                      {game.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="players" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Players
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Teams
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="pt-4">
              {topPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">No player ratings available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlayers.map((player, index) => {
                    const profile = selectedGame ? player.profile : player
                    const tier = getRankTier(player.elo_rating)

                    return (
                      <div key={index} className="flex items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center w-8 mr-2">
                          {getMedalIcon(index)}
                          {index > 2 && <span className="font-medium">{index + 1}</span>}
                        </div>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                          <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Link href={`/profile/${profile.id}`} className="font-medium hover:underline">
                          {profile.username}
                        </Link>
                        <div className="ml-auto flex items-center">
                          <span className="font-bold mr-2">{player.elo_rating}</span>
                          <Badge className={tier.color}>{tier.name}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="teams" className="pt-4">
              {topTeams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">No team ratings available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topTeams.map((teamData, index) => {
                    const team = selectedGame ? teamData.team : teamData
                    const tier = getRankTier(teamData.elo_rating)

                    return (
                      <div key={index} className="flex items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center w-8 mr-2">
                          {getMedalIcon(index)}
                          {index > 2 && <span className="font-medium">{index + 1}</span>}
                        </div>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={team.logo_url || ""} alt={team.name} />
                          <AvatarFallback>{team.name[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Link href={`/teams/${team.id}`} className="font-medium hover:underline">
                          {team.name}
                        </Link>
                        <div className="ml-auto flex items-center">
                          <span className="font-bold mr-2">{teamData.elo_rating}</span>
                          <Badge className={tier.color}>{tier.name}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
