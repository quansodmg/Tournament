"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PerformanceOverview from "./performance-overview"
import GamePerformance from "./game-performance"
import MatchHistory from "./match-history"
import TournamentHistory from "./tournament-history"
import TeamPerformance from "./team-performance"
import { createBrowserClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type PlayerStat = Database["public"]["Tables"]["player_stats"]["Row"] & {
  games: {
    id: string
    name: string
    slug: string
    cover_image: string | null
  }
}
type MatchParticipation = Database["public"]["Tables"]["match_participants"]["Row"] & {
  matches: {
    id: string
    start_time: string | null
    end_time: string | null
    status: string
    match_type: string | null
    tournament_id: string | null
  }
}
type TournamentParticipation = Database["public"]["Tables"]["tournament_registrations"]["Row"] & {
  tournaments: {
    id: string
    name: string
    slug: string
    start_date: string
    end_date: string
    status: string
    game_id: string
    games: {
      name: string
    }
  }
}
type TeamMembership = Database["public"]["Tables"]["team_members"]["Row"] & {
  teams: {
    id: string
    name: string
    logo_url: string | null
  }
}

interface UserStatsPageProps {
  userId?: string | null
}

export default function UserStatsPage({ userId }: UserStatsPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize state for all data
  const [profile, setProfile] = useState<Profile | null>(null)
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [matchParticipations, setMatchParticipations] = useState<MatchParticipation[]>([])
  const [tournamentParticipations, setTournamentParticipations] = useState<TournamentParticipation[]>([])
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([])

  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)
        setError(null)

        // If no userId is provided, try to get it from the session
        let userIdToUse = userId

        if (!userIdToUse) {
          const supabase = createBrowserClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()
          userIdToUse = session?.user?.id

          if (!userIdToUse) {
            throw new Error("User not authenticated")
          }
        }

        // Now fetch all the data using the userId
        const supabase = createBrowserClient()

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userIdToUse)
          .single()

        if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`)
        setProfile(profileData)

        // Fetch player stats
        const { data: statsData, error: statsError } = await supabase
          .from("player_stats")
          .select("*, games(id, name, slug, cover_image)")
          .eq("user_id", userIdToUse)

        if (statsError) throw new Error(`Error fetching player stats: ${statsError.message}`)
        setPlayerStats(statsData || [])

        // Fetch match participations
        const { data: matchData, error: matchError } = await supabase
          .from("match_participants")
          .select("*, matches(id, start_time, end_time, status, match_type, tournament_id)")
          .eq("user_id", userIdToUse)

        if (matchError) throw new Error(`Error fetching match participations: ${matchError.message}`)
        setMatchParticipations(matchData || [])

        // Fetch tournament participations
        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournament_registrations")
          .select("*, tournaments(id, name, slug, start_date, end_date, status, game_id, games(name))")
          .eq("user_id", userIdToUse)

        if (tournamentError) throw new Error(`Error fetching tournament participations: ${tournamentError.message}`)
        setTournamentParticipations(tournamentData || [])

        // Fetch team memberships
        const { data: teamData, error: teamError } = await supabase
          .from("team_members")
          .select("*, teams(id, name, logo_url)")
          .eq("user_id", userIdToUse)

        if (teamError) throw new Error(`Error fetching team memberships: ${teamError.message}`)
        setTeamMemberships(teamData || [])
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  // Show loading state
  if (isLoading) {
    return <StatsLoadingSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading stats</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Calculate overall stats from the fetched data
  const totalMatches = playerStats.reduce((sum, stat) => sum + stat.matches_played, 0)
  const totalWins = playerStats.reduce((sum, stat) => sum + stat.matches_won, 0)
  const totalTournaments = playerStats.reduce((sum, stat) => sum + stat.tournaments_played, 0)
  const totalTournamentWins = playerStats.reduce((sum, stat) => sum + stat.tournaments_won, 0)
  const totalEarnings = playerStats.reduce((sum, stat) => sum + stat.total_earnings, 0)

  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0
  const tournamentWinRate = totalTournaments > 0 ? Math.round((totalTournamentWins / totalTournaments) * 100) : 0

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gaming Statistics</h1>
        <p className="text-muted-foreground">View your performance across games, tournaments, and matches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl">{winRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Matches Played</CardDescription>
            <CardTitle className="text-2xl">{totalMatches}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tournaments Won</CardDescription>
            <CardTitle className="text-2xl">{totalTournamentWins}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className="text-2xl">${totalEarnings.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PerformanceOverview
            playerStats={playerStats}
            matchParticipations={matchParticipations}
            tournamentParticipations={tournamentParticipations}
          />
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <GamePerformance playerStats={playerStats} />
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <MatchHistory matchParticipations={matchParticipations} />
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          <TournamentHistory tournamentParticipations={tournamentParticipations} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamPerformance teamMemberships={teamMemberships} matchParticipations={matchParticipations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading skeleton component
function StatsLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    </div>
  )
}
