"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, PlusCircle, Users, AlertCircle, GamepadIcon as GameController, Trophy } from "lucide-react"
import { format } from "date-fns"
import { getSupabaseClient } from "@/lib/supabase/client"

// Game mode display names
const GAME_MODE_NAMES: Record<string, string> = {
  hardpoint: "Hardpoint",
  search_and_destroy: "Search and Destroy",
  control: "Control",
  domination: "Domination",
  free_for_all: "Free for All",
  kill_confirmed: "Kill Confirmed",
  team_deathmatch: "Team Deathmatch",
}

// Match format display names
const MATCH_FORMAT_NAMES: Record<string, string> = {
  bo1: "Best of 1",
  bo3: "Best of 3",
  bo5: "Best of 5",
}

export function MatchesClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const [publicMatches, setPublicMatches] = useState<any[]>([])
  const [userMatches, setUserMatches] = useState<any[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([])
  const [games, setGames] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        // Check authentication
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error("Error fetching session:", sessionError)
        } else {
          setSession(sessionData.session)
        }

        // Get all games for reference
        const { data: gamesData } = await supabase.from("games").select("id, name, slug")
        const gamesMap: Record<string, any> = {}
        if (gamesData) {
          gamesData.forEach((game) => {
            gamesMap[game.id] = game
          })
        }
        setGames(gamesMap)

        // Get all public matches
        const { data: publicMatchesData, error: publicMatchesError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            participants:match_participants(
              team:team_id(id, name, logo_url),
              profile:profile_id(id, username, avatar_url)
            )
          `)
          .eq("is_private", false)
          .order("start_time", { ascending: true })
          .limit(20)

        if (publicMatchesError) {
          console.error("Error fetching public matches:", publicMatchesError)
          setError("Failed to load matches. Please try again later.")
        } else {
          setPublicMatches(publicMatchesData || [])
        }

        // Get upcoming matches (next 7 days)
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)

        const { data: upcomingMatchesData, error: upcomingMatchesError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            participants:match_participants(
              team:team_id(id, name, logo_url),
              profile:profile_id(id, username, avatar_url)
            )
          `)
          .eq("is_private", false)
          .gte("start_time", new Date().toISOString())
          .lte("start_time", nextWeek.toISOString())
          .order("start_time", { ascending: true })
          .limit(10)

        if (upcomingMatchesError) {
          console.error("Error fetching upcoming matches:", upcomingMatchesError)
        } else {
          setUpcomingMatches(upcomingMatchesData || [])
        }

        // If user is logged in, get their matches
        if (sessionData.session) {
          try {
            // Get user's teams
            const { data: userTeams } = await supabase
              .from("team_members")
              .select("team_id")
              .eq("profile_id", sessionData.session.user.id)

            const userTeamIds = userTeams?.map((item) => item.team_id) || []
            let userMatchesArray: any[] = []

            if (userTeamIds.length > 0) {
              // Get matches where user's teams are participants
              const { data: teamMatches } = await supabase
                .from("match_participants")
                .select(`
                  match:match_id(
                    *,
                    game:game_id(*),
                    participants:match_participants(
                      team:team_id(id, name, logo_url),
                      profile:profile_id(id, username, avatar_url)
                    )
                  )
                `)
                .in("team_id", userTeamIds)
                .order("match(start_time)", { ascending: true })

              if (teamMatches) {
                userMatchesArray = teamMatches.map((item) => item.match)
              }
            }

            // Also get matches scheduled by the user
            const { data: scheduledMatches } = await supabase
              .from("matches")
              .select(`
                *,
                game:game_id(*),
                participants:match_participants(
                  team:team_id(id, name, logo_url),
                  profile:profile_id(id, username, avatar_url)
                )
              `)
              .eq("scheduled_by", sessionData.session.user.id)
              .order("start_time", { ascending: true })

            if (scheduledMatches) {
              // Combine and deduplicate
              const allUserMatches = [...userMatchesArray, ...scheduledMatches]
              userMatchesArray = Array.from(new Set(allUserMatches.map((match) => match.id))).map((id) =>
                allUserMatches.find((match) => match.id === id),
              )
            }

            setUserMatches(userMatchesArray)
          } catch (err) {
            console.error("Error fetching user matches:", err)
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Matches</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        {session && (
          <Button asChild className="ml-auto">
            <Link href="/matches/schedule">
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Match
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue={session ? "my-matches" : "upcoming"}>
        <TabsList>
          {session && <TabsTrigger value="my-matches">My Matches</TabsTrigger>}
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Matches</TabsTrigger>
        </TabsList>

        {session && (
          <TabsContent value="my-matches" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMatches.length > 0 ? (
                userMatches.map((match) => <MatchCard key={match.id} match={match} />)
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Matches Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven&apos;t scheduled or participated in any matches yet.
                  </p>
                  <Button asChild>
                    <Link href="/matches/schedule">Schedule Your First Match</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="col-span-3 text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Upcoming Matches</h2>
                <p className="text-muted-foreground">There are no matches scheduled for the next 7 days.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicMatches.length > 0 ? (
              publicMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="col-span-3 text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Matches Available</h2>
                <p className="text-muted-foreground">There are no public matches scheduled at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

function MatchCard({ match }: { match: any }) {
  const startTime = match.start_time ? new Date(match.start_time) : null
  const participants = match.participants || []
  const isCallOfDuty = match.game?.slug?.includes("call-of-duty")

  // Format game mode and match format for display
  const gameMode = match.game_mode ? GAME_MODE_NAMES[match.game_mode] || match.game_mode : null
  const matchFormat = match.match_format ? MATCH_FORMAT_NAMES[match.match_format] || match.match_format : null

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">{match.match_type}</Badge>
            <CardTitle>
              {participants.length === 2
                ? `${participants[0]?.team?.name || participants[0]?.profile?.username || "Team 1"} vs ${
                    participants[1]?.team?.name || participants[1]?.profile?.username || "Team 2"
                  }`
                : "Open Match"}
            </CardTitle>
          </div>
          <Badge variant={match.status === "completed" ? "outline" : "secondary"}>{match.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {match.game && (
            <div className="flex items-center text-sm">
              <GameController className="mr-2 h-4 w-4 opacity-70" />
              <span>{match.game.name}</span>
            </div>
          )}

          {isCallOfDuty && gameMode && (
            <div className="flex items-center text-sm">
              <GameController className="mr-2 h-4 w-4 opacity-70" />
              <span>{gameMode}</span>
            </div>
          )}

          {matchFormat && (
            <div className="flex items-center text-sm">
              <Trophy className="mr-2 h-4 w-4 opacity-70" />
              <span>{matchFormat}</span>
            </div>
          )}

          {startTime && (
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>{format(startTime, "PPP 'at' p")}</span>
            </div>
          )}

          {match.location && (
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>{match.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 opacity-70" />
            <span>
              {participants.length} / 2 {participants.length === 1 ? "Team" : "Teams"}
            </span>
          </div>

          {isCallOfDuty && (
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 opacity-70" />
              <span>Teams of 4</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/matches/${match.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
