"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MatchStatisticsProps {
  matchId: string
  userId: string
}

export default function MatchStatistics({ matchId, userId }: MatchStatisticsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any[]>([])
  const [teamStats, setTeamStats] = useState<any[]>([])
  const [userTeamId, setUserTeamId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatchStatistics() {
      try {
        setLoading(true)

        // Get match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            participants:match_participants(
              team_id,
              team:team_id(
                id,
                name,
                logo_url,
                members:team_members(
                  profile_id,
                  profile:profile_id(
                    id,
                    username,
                    display_name,
                    avatar_url
                  )
                )
              )
            ),
            player_stats:match_player_stats(*)
          `)
          .eq("id", matchId)
          .single()

        if (matchError) throw matchError
        setMatch(matchData)

        // Find user's team
        const userTeam = matchData.participants.find((p: any) =>
          p.team?.members?.some((m: any) => m.profile_id === userId),
        )

        if (userTeam) {
          setUserTeamId(userTeam.team_id)
        }

        // Process player stats
        if (matchData.player_stats) {
          setPlayerStats(matchData.player_stats)
        }

        // Calculate team stats
        const teamStatsMap = new Map()

        if (matchData.player_stats) {
          matchData.player_stats.forEach((stat: any) => {
            if (!teamStatsMap.has(stat.team_id)) {
              teamStatsMap.set(stat.team_id, {
                team_id: stat.team_id,
                kills: 0,
                deaths: 0,
                assists: 0,
                score: 0,
                objectives: 0,
                player_count: 0,
              })
            }

            const teamStat = teamStatsMap.get(stat.team_id)
            teamStat.kills += stat.kills || 0
            teamStat.deaths += stat.deaths || 0
            teamStat.assists += stat.assists || 0
            teamStat.score += stat.score || 0
            teamStat.objectives += stat.objectives || 0
            teamStat.player_count += 1
          })
        }

        setTeamStats(Array.from(teamStatsMap.values()))
      } catch (err: any) {
        console.error("Error fetching match statistics:", err)
        setError(err.message || "Failed to load match statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchStatistics()
  }, [matchId, userId, supabase])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!match || !match.player_stats || match.player_stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Statistics</CardTitle>
          <CardDescription>No statistics available for this match</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Statistics will be available once the match is completed and results are reported.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Statistics</CardTitle>
        <CardDescription>Performance statistics for this match</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="players">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="players">Player Stats</TabsTrigger>
            <TabsTrigger value="teams">Team Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Player</th>
                    <th className="text-center py-2">Kills</th>
                    <th className="text-center py-2">Deaths</th>
                    <th className="text-center py-2">Assists</th>
                    <th className="text-center py-2">K/D</th>
                    <th className="text-center py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.map((stat) => {
                    const player = match.participants
                      .flatMap((p: any) => p.team?.members || [])
                      .find((m: any) => m.profile_id === stat.profile_id)?.profile

                    const isUserTeam = stat.team_id === userTeamId

                    return (
                      <tr key={stat.id} className={`border-b ${isUserTeam ? "bg-muted/30" : ""}`}>
                        <td className="py-2">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 rounded-full bg-cover bg-center mr-2"
                              style={{
                                backgroundImage: player?.avatar_url
                                  ? `url(${player.avatar_url})`
                                  : "url(/placeholder.svg?height=32&width=32&query=avatar)",
                              }}
                            />
                            <span>{player?.username || player?.display_name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="text-center py-2">{stat.kills || 0}</td>
                        <td className="text-center py-2">{stat.deaths || 0}</td>
                        <td className="text-center py-2">{stat.assists || 0}</td>
                        <td className="text-center py-2">
                          {stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : stat.kills}
                        </td>
                        <td className="text-center py-2">{stat.score || 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Team</th>
                    <th className="text-center py-2">Kills</th>
                    <th className="text-center py-2">Deaths</th>
                    <th className="text-center py-2">K/D</th>
                    <th className="text-center py-2">Score</th>
                    <th className="text-center py-2">Objectives</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats.map((stat) => {
                    const team = match.participants.find((p: any) => p.team_id === stat.team_id)?.team
                    const isUserTeam = stat.team_id === userTeamId

                    return (
                      <tr key={stat.team_id} className={`border-b ${isUserTeam ? "bg-muted/30" : ""}`}>
                        <td className="py-2">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 rounded-full bg-cover bg-center mr-2"
                              style={{
                                backgroundImage: team?.logo_url
                                  ? `url(${team.logo_url})`
                                  : "url(/placeholder.svg?height=32&width=32&query=team)",
                              }}
                            />
                            <span>{team?.name || "Unknown Team"}</span>
                          </div>
                        </td>
                        <td className="text-center py-2">{stat.kills}</td>
                        <td className="text-center py-2">{stat.deaths}</td>
                        <td className="text-center py-2">
                          {stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : stat.kills}
                        </td>
                        <td className="text-center py-2">{stat.score}</td>
                        <td className="text-center py-2">{stat.objectives}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
