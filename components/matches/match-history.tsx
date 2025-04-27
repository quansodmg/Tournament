"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Calendar, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MatchHistoryProps {
  userId: string
  teamId?: string
  limit?: number
  showViewAll?: boolean
}

export default function MatchHistory({ userId, teamId, limit = 5, showViewAll = true }: MatchHistoryProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedMatches, setCompletedMatches] = useState<any[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)

        // Get user's teams if teamId is not provided
        let teamIds = teamId ? [teamId] : []

        if (!teamId) {
          const { data: userTeams, error: teamsError } = await supabase
            .from("team_members")
            .select("team_id")
            .eq("profile_id", userId)

          if (teamsError) throw teamsError
          teamIds = userTeams.map((t) => t.team_id)
        }

        if (teamIds.length === 0) {
          setCompletedMatches([])
          setUpcomingMatches([])
          return
        }

        // Get match IDs where user's teams are participants
        const { data: participations, error: participationsError } = await supabase
          .from("match_participants")
          .select("match_id")
          .in("team_id", teamIds)

        if (participationsError) throw participationsError
        const matchIds = participations.map((p) => p.match_id)

        if (matchIds.length === 0) {
          setCompletedMatches([])
          setUpcomingMatches([])
          return
        }

        // Get completed matches
        const { data: completed, error: completedError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            participants:match_participants(
              team:team_id(*)
            ),
            results:match_results(*)
          `)
          .in("id", matchIds)
          .in("status", ["completed", "disputed"])
          .order("completed_at", { ascending: false })
          .limit(limit)

        if (completedError) throw completedError

        // Get upcoming matches
        const { data: upcoming, error: upcomingError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            participants:match_participants(
              team:team_id(*)
            )
          `)
          .in("id", matchIds)
          .in("status", ["scheduled", "pending"])
          .gt("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(limit)

        if (upcomingError) throw upcomingError

        setCompletedMatches(completed || [])
        setUpcomingMatches(upcoming || [])
      } catch (err: any) {
        console.error("Error fetching matches:", err)
        setError(err.message || "Failed to load matches")
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [userId, teamId, limit, supabase])

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

  if (completedMatches.length === 0 && upcomingMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>Your past and upcoming matches</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>No matches found. Join or create matches to see them here.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
        <CardDescription>Your past and upcoming matches</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming ({upcomingMatches.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedMatches.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            {upcomingMatches.length === 0 ? (
              <Alert>
                <AlertDescription>No upcoming matches scheduled.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {upcomingMatches.map((match) => {
                  const userTeam = match.participants.find((p: any) => (teamId ? p.team_id === teamId : true))?.team

                  const opponentTeam = match.participants.find((p: any) => p.team?.id !== userTeam?.id)?.team

                  return (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={match.game?.logo_url || ""} alt={match.game?.name} />
                          <AvatarFallback>{match.game?.name?.[0] || "G"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{userTeam?.name || "Your Team"}</p>
                            <span className="mx-2">vs</span>
                            <p className="font-medium">{opponentTeam?.name || "TBD"}</p>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{format(new Date(match.start_time), "MMM d, h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{match.status}</Badge>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/matches/${match.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            {completedMatches.length === 0 ? (
              <Alert>
                <AlertDescription>No completed matches found.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {completedMatches.map((match) => {
                  const userTeam = match.participants.find((p: any) => (teamId ? p.team_id === teamId : true))?.team

                  const opponentTeam = match.participants.find((p: any) => p.team?.id !== userTeam?.id)?.team

                  const result = match.results?.[0]
                  const userTeamWon = result?.winner_team_id === userTeam?.id

                  return (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={match.game?.logo_url || ""} alt={match.game?.name} />
                          <AvatarFallback>{match.game?.name?.[0] || "G"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{userTeam?.name || "Your Team"}</p>
                            <span className="mx-2">vs</span>
                            <p className="font-medium">{opponentTeam?.name || "Unknown Team"}</p>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{format(new Date(match.completed_at || match.start_time), "MMM d")}</span>
                            {result && (
                              <Badge className="ml-2" variant={userTeamWon ? "default" : "outline"}>
                                {userTeamWon ? "Won" : "Lost"} {userTeamWon ? result.winner_score : result.loser_score}-
                                {userTeamWon ? result.loser_score : result.winner_score}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/matches/${match.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {showViewAll && (activeTab === "upcoming" ? upcomingMatches.length > 0 : completedMatches.length > 0) && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <Link href="/matches">View All Matches</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
