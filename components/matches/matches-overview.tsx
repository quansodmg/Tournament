"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Calendar, Users, GamepadIcon, LogIn } from "lucide-react"
import Link from "next/link"
import MatchCard from "./match-card"
import UpcomingMatchesList from "./upcoming-matches-list"
import RecentMatchesList from "./recent-matches-list"
import MatchInvitations from "./match-invitations"
import { useRouter } from "next/navigation"

interface MatchesOverviewProps {
  userId?: string
  userProfile?: any
  userTeams: any[]
  games: any[]
  isAuthenticated: boolean
}

export default function MatchesOverview({
  userId,
  userProfile,
  userTeams,
  games,
  isAuthenticated,
}: MatchesOverviewProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [myMatches, setMyMatches] = useState<any[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([])
  const [availableMatches, setAvailableMatches] = useState<any[]>([])
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [gameFilter, setGameFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)

        // If not authenticated, just fetch public matches
        if (!isAuthenticated || !userId) {
          await fetchPublicMatches()
          setLoading(false)
          return
        }

        // Get user's team IDs
        const userTeamIds = userTeams?.map((team) => team?.id).filter(Boolean) || []

        // Create a games lookup map for easier access
        const gamesMap = new Map(games?.map((game) => [game.id, game]) || [])

        // Fetch matches where user is a participant - modified to avoid relationship issues
        if (userTeamIds.length > 0) {
          const { data: myParticipations, error: participationsError } = await supabase
            .from("match_participants")
            .select(`
              match_id,
              team_id,
              profile_id
            `)
            .in("team_id", userTeamIds)

          if (participationsError) {
            console.error("Error fetching participations:", participationsError)
          } else if (myParticipations && myParticipations.length > 0) {
            // Get unique match IDs
            const matchIds = [...new Set(myParticipations.map((p) => p.match_id))]

            // Fetch the actual matches
            const { data: matchesData, error: matchesError } = await supabase
              .from("matches")
              .select(`
                *,
                match_participants(
                  team_id,
                  profile_id
                )
              `)
              .in("id", matchIds)

            if (matchesError) {
              console.error("Error fetching matches:", matchesError)
            } else if (matchesData) {
              // Fetch teams for these matches
              const teamIds = [
                ...new Set(
                  matchesData.flatMap((match) => match.match_participants.map((p) => p.team_id)).filter(Boolean) || [],
                ),
              ]

              if (teamIds.length > 0) {
                const { data: teamsData, error: teamsError } = await supabase
                  .from("teams")
                  .select("*")
                  .in("id", teamIds)

                if (teamsError) {
                  console.error("Error fetching teams:", teamsError)
                } else {
                  // Create a teams lookup map
                  const teamsMap = new Map(teamsData?.map((team) => [team.id, team]) || [])

                  // Process matches with game and team data
                  const processedMatches =
                    matchesData
                      ?.map((match) => {
                        // Add game data from our games prop
                        const game = match.game_id ? gamesMap.get(match.game_id) : null

                        // Add team data to participants
                        const participants = match.match_participants.map((p) => ({
                          ...p,
                          team: p.team_id ? teamsMap.get(p.team_id) : null,
                        }))

                        return {
                          ...match,
                          game,
                          participants,
                        }
                      })
                      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) || []

                  setMyMatches(processedMatches)
                }
              } else {
                setMyMatches([])
              }
            }
          } else {
            setMyMatches([])
          }
        } else {
          setMyMatches([])
        }

        // Get upcoming matches (next 7 days)
        await fetchUpcomingMatches(gamesMap)

        // Get recent matches
        await fetchRecentMatches(gamesMap)

        // Get available matches
        await fetchAvailableMatches(gamesMap, myMatches)

        // Get pending invitations
        if (isAuthenticated && userTeamIds.length > 0) {
          await fetchPendingInvitations(userTeamIds)
        } else {
          setPendingInvitations([])
        }
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchPublicMatches() {
      // Create a games lookup map for easier access
      const gamesMap = new Map(games?.map((game) => [game.id, game]) || [])

      // Fetch upcoming and recent matches for public view
      await fetchUpcomingMatches(gamesMap)
      await fetchRecentMatches(gamesMap)
      await fetchAvailableMatches(gamesMap, [])

      setMyMatches([])
      setPendingInvitations([])
    }

    async function fetchUpcomingMatches(gamesMap: Map<string, any>) {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      const { data: upcomingMatchesData, error: upcomingMatchesError } = await supabase
        .from("matches")
        .select(`*`)
        .eq("status", "scheduled")
        .gte("start_time", new Date().toISOString())
        .lte("start_time", nextWeek.toISOString())
        .order("start_time", { ascending: true })
        .limit(10)

      if (upcomingMatchesError) {
        console.error("Error fetching upcoming matches:", upcomingMatchesError)
        return
      }

      // Fetch participants for upcoming matches
      if (upcomingMatchesData && upcomingMatchesData.length > 0) {
        const upcomingMatchIds = upcomingMatchesData.map((m) => m.id)

        const { data: upcomingParticipants, error: upcomingParticipantsError } = await supabase
          .from("match_participants")
          .select(`
            match_id,
            team_id,
            profile_id
          `)
          .in("match_id", upcomingMatchIds)

        if (upcomingParticipantsError) {
          console.error("Error fetching upcoming participants:", upcomingParticipantsError)
        }

        // Group participants by match
        const participantsByMatch =
          upcomingParticipants?.reduce(
            (acc, p) => {
              if (!acc[p.match_id]) acc[p.match_id] = []
              acc[p.match_id].push(p)
              return acc
            },
            {} as Record<string, any[]>,
          ) || {}

        // Process upcoming matches with game data
        const processedUpcomingMatches = upcomingMatchesData.map((match) => {
          const game = match.game_id ? gamesMap.get(match.game_id) : null
          const participants = participantsByMatch[match.id] || []

          return {
            ...match,
            game,
            participants,
          }
        })

        setUpcomingMatches(processedUpcomingMatches)
      } else {
        setUpcomingMatches([])
      }
    }

    async function fetchRecentMatches(gamesMap: Map<string, any>) {
      const { data: recentMatchesData, error: recentMatchesError } = await supabase
        .from("matches")
        .select(`*`)
        .eq("status", "completed")
        .order("start_time", { ascending: false })
        .limit(10)

      if (recentMatchesError) {
        console.error("Error fetching recent matches:", recentMatchesError)
        return
      }

      // Process recent matches with game data
      const processedRecentMatches =
        recentMatchesData?.map((match) => {
          const game = match.game_id ? gamesMap.get(match.game_id) : null

          return {
            ...match,
            game,
          }
        }) || []

      setRecentMatches(processedRecentMatches)
    }

    async function fetchAvailableMatches(gamesMap: Map<string, any>, existingMatches: any[]) {
      const { data: availableMatchesData, error: availableMatchesError } = await supabase
        .from("matches")
        .select(`*`)
        .eq("status", "scheduled")
        .gt("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10)

      if (availableMatchesError) {
        console.error("Error fetching available matches:", availableMatchesError)
        return
      }

      // Filter out matches the user is already part of
      const myMatchIds = new Set(existingMatches.map((m) => m.id))
      const filteredAvailableMatches = availableMatchesData?.filter((m) => !myMatchIds.has(m.id)) || []

      // Process available matches with game data
      const processedAvailableMatches = filteredAvailableMatches.map((match) => {
        const game = match.game_id ? gamesMap.get(match.game_id) : null

        return {
          ...match,
          game,
        }
      })

      setAvailableMatches(processedAvailableMatches)
    }

    async function fetchPendingInvitations(userTeamIds: string[]) {
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("match_invitations")
        .select(`*`)
        .in("team_id", userTeamIds)
        .eq("status", "pending")

      if (invitationsError) {
        console.error("Error fetching invitations:", invitationsError)
        return
      }

      // Fetch match data for invitations
      if (invitationsData && invitationsData.length > 0) {
        const invitationMatchIds = invitationsData.map((inv) => inv.match_id)

        const { data: invitationMatches, error: invitationMatchesError } = await supabase
          .from("matches")
          .select(`*`)
          .in("id", invitationMatchIds)

        if (invitationMatchesError) {
          console.error("Error fetching invitation matches:", invitationMatchesError)
          return
        }

        // Create a matches lookup map
        const matchesMap = new Map(invitationMatches?.map((match) => [match.id, match]) || [])

        // Process invitations with match data
        const processedInvitations = invitationsData.map((invitation) => {
          const match = matchesMap.get(invitation.match_id)
          const team = userTeams.find((t) => t.id === invitation.team_id)

          return {
            ...invitation,
            match,
            team,
          }
        })

        setPendingInvitations(processedInvitations)
      } else {
        setPendingInvitations([])
      }
    }

    fetchMatches()
  }, [userId, userTeams, supabase, games, isAuthenticated])

  // Filter and sort matches
  const filteredMyMatches = myMatches
    .filter((match) => {
      // Search filter
      if (searchQuery && match.game?.name && !match.game.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Game filter
      if (gameFilter !== "all" && match.game_id !== gameFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== "all" && match.status !== statusFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort
      if (sortBy === "newest") {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      } else {
        return 0
      }
    })

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
            <p className="text-muted-foreground mt-1">Browse upcoming and recent esports matches</p>
          </div>

          <Button asChild size="lg" className="gap-2">
            <Link href="/auth?redirect=/matches">
              <LogIn className="h-5 w-5" />
              Sign in to Schedule Matches
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-0">
                <UpcomingMatchesList matches={upcomingMatches} loading={loading} />
              </TabsContent>

              <TabsContent value="recent" className="mt-0">
                <RecentMatchesList matches={recentMatches} loading={loading} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Join the Action</CardTitle>
                <CardDescription>Sign in to participate in matches</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <p className="text-center text-muted-foreground">
                  Create a team, join matches, and compete in tournaments by signing in to your account.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth?redirect=/matches">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth?mode=signup&redirect=/matches">Create Account</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Games</CardTitle>
                <CardDescription>Games with active matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.slice(0, 5).map((game) => (
                    <div key={game.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                          {game.logo_url ? (
                            <img
                              src={game.logo_url || "/placeholder.svg"}
                              alt={game.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <GamepadIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="font-medium">{game.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/games/${game.slug}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground mt-1">Browse, join, and manage your esports matches</p>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href="/matches/schedule">
            <PlusCircle className="h-5 w-5" />
            Schedule Match
          </Link>
        </Button>
      </div>

      {pendingInvitations.length > 0 && <MatchInvitations invitations={pendingInvitations} userId={userId} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="my-matches" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="my-matches">My Matches</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search matches..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="my-matches" className="mt-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredMyMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMyMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      {myMatches.length > 0
                        ? "No matches match your current filters. Try adjusting your search criteria."
                        : "You haven't joined any matches yet. Schedule a match or join an existing one."}
                    </p>
                    <Button asChild>
                      <Link href="/matches/schedule">Schedule a Match</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-0">
              <UpcomingMatchesList matches={upcomingMatches} loading={loading} />
            </TabsContent>

            <TabsContent value="available" className="mt-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : availableMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableMatches.map((match) => (
                    <MatchCard key={match.id} match={match} showJoinButton />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Available Matches</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      There are no available matches at the moment. Why not create one?
                    </p>
                    <Button asChild>
                      <Link href="/matches/schedule">Schedule a Match</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <RecentMatchesList matches={recentMatches} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your match statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{myMatches.filter((m) => m.status === "completed").length}</p>
                  <p className="text-sm text-muted-foreground">Matches Played</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{myMatches.filter((m) => m.status === "scheduled").length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">
                    {myMatches.filter(
                      (m) =>
                        m.status === "completed" &&
                        m.match_results?.some((r) => userTeams.some((team) => team?.id === r.winner_team_id)),
                    ).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">
                    {myMatches.filter(
                      (m) =>
                        m.status === "completed" &&
                        m.match_results?.some((r) => userTeams.some((team) => team?.id === r.loser_team_id)),
                    ).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Losses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Teams</CardTitle>
              <CardDescription>Teams you can represent in matches</CardDescription>
            </CardHeader>
            <CardContent>
              {userTeams && userTeams.length > 0 ? (
                <div className="space-y-4">
                  {userTeams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url || "/placeholder.svg"}
                              alt={team.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-lg">{team.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(team.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/teams/${team.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You're not a member of any teams yet</p>
                  <Button asChild>
                    <Link href="/teams/create">Create Team</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Games</CardTitle>
              <CardDescription>Games with active matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {games.slice(0, 5).map((game) => (
                  <div key={game.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                        {game.logo_url ? (
                          <img
                            src={game.logo_url || "/placeholder.svg"}
                            alt={game.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <GamepadIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium">{game.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/games/${game.slug}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
