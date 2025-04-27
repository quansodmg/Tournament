"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Trophy, TrendingUp, Medal, AlertCircle } from "lucide-react"

interface EloRatingCardProps {
  profileId: string
}

export default function EloRatingCard({ profileId }: EloRatingCardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generalRating, setGeneralRating] = useState<any>(null)
  const [gameRatings, setGameRatings] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchEloRatings() {
      try {
        setLoading(true)
        setError(null)

        // Fetch general rating
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("elo_rating, elo_matches, highest_elo, elo_history")
          .eq("id", profileId)
          .single()

        if (profileError) throw profileError

        // Fetch game-specific ratings
        const { data: gameSpecificRatings, error: gameRatingsError } = await supabase
          .from("player_elo_ratings")
          .select(`
            elo_rating, 
            elo_matches, 
            highest_elo, 
            elo_history,
            game:game_id(id, name, logo_url)
          `)
          .eq("profile_id", profileId)
          .order("elo_rating", { ascending: false })

        if (gameRatingsError) throw gameRatingsError

        setGeneralRating(profile)
        setGameRatings(gameSpecificRatings || [])
      } catch (err: any) {
        console.error("Error fetching ELO ratings:", err)
        setError(err.message || "Failed to load ELO ratings")
      } finally {
        setLoading(false)
      }
    }

    fetchEloRatings()
  }, [profileId, supabase])

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

  // Format history data for chart
  const formatHistoryData = (history: any[] = []) => {
    return history.map((entry, index) => ({
      index,
      rating: entry.rating,
      date: new Date(entry.timestamp).toLocaleDateString(),
    }))
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
          <Skeleton className="h-[200px] w-full" />
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
            Error Loading Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const generalTier = getRankTier(generalRating?.elo_rating || 1200)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          ELO Rating
        </CardTitle>
        <CardDescription>Performance rating across games</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Overall</TabsTrigger>
            <TabsTrigger value="games">By Game</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Rating</p>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold">{generalRating?.elo_rating || 1200}</p>
                    <Badge className={`ml-2 ${generalTier.color}`}>{generalTier.name}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Highest Rating</p>
                  <p className="text-xl font-semibold">{generalRating?.highest_elo || 1200}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Matches Played</p>
                <p className="text-xl">{generalRating?.elo_matches || 0}</p>
              </div>

              {generalRating?.elo_history?.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recent Trend</p>
                  <div className="h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatHistoryData(generalRating.elo_history)}>
                        <XAxis dataKey="index" hide />
                        <YAxis domain={["dataMin - 50", "dataMax + 50"]} hide />
                        <Tooltip
                          formatter={(value) => [`${value} ELO`]}
                          labelFormatter={(_, payload) => payload[0]?.payload?.date || ""}
                        />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="#0bb5ff"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="games">
            {gameRatings.length === 0 ? (
              <div className="text-center py-8">
                <Medal className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">No game-specific ratings yet</p>
                <p className="text-sm text-muted-foreground">Play matches in specific games to earn ratings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {gameRatings.map((gameRating) => {
                  const tier = getRankTier(gameRating.elo_rating)
                  return (
                    <div
                      key={gameRating.game.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
                          {gameRating.game.logo_url ? (
                            <img
                              src={gameRating.game.logo_url || "/placeholder.svg"}
                              alt={gameRating.game.name}
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold">{gameRating.game.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{gameRating.game.name}</p>
                          <p className="text-sm text-muted-foreground">{gameRating.elo_matches} matches</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end">
                          <p className="font-bold">{gameRating.elo_rating}</p>
                          <Badge className={`ml-2 ${tier.color}`}>{tier.name}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Highest: {gameRating.highest_elo}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {!generalRating?.elo_history || generalRating.elo_history.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">No rating history available</p>
                <p className="text-sm text-muted-foreground">Play more matches to build your rating history</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatHistoryData(generalRating.elo_history)}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value, index) => (index % 3 === 0 ? value : "")}
                    />
                    <YAxis domain={["dataMin - 100", "dataMax + 100"]} />
                    <Tooltip
                      formatter={(value) => [`${value} ELO`]}
                      labelFormatter={(_, payload) => payload[0]?.payload?.date || ""}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#0bb5ff"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
