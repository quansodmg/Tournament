// Add this line at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable cache completely

import { createServerClient } from "@/lib/supabase/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserMetrics from "@/components/admin/stats/user-metrics"
import TournamentMetrics from "@/components/admin/stats/tournament-metrics"
import MatchMetrics from "@/components/admin/stats/match-metrics"
import TeamMetrics from "@/components/admin/stats/team-metrics"

export default async function AdminStatisticsPage() {
  try {
    // Create the Supabase client with proper error handling
    const supabase = await createServerClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Get basic stats
    const { data: statsData, error: statsError } = await supabase.rpc("get_admin_dashboard_stats")

    if (statsError) {
      console.error("Error fetching admin dashboard stats:", statsError)
      throw new Error("Failed to fetch statistics")
    }

    // Get user registration data by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: userRegistrations, error: userRegError } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (userRegError) {
      console.error("Error fetching user registrations:", userRegError)
    }

    // Get tournament data by game
    const { data: tournaments, error: tournamentError } = await supabase
      .from("tournaments")
      .select(`game_id, games(name)`)

    if (tournamentError) {
      console.error("Error fetching tournaments by game:", tournamentError)
    }

    // Group tournaments by game using JavaScript
    const tournamentsByGame =
      tournaments?.reduce((acc: any, tournament: any) => {
        const gameName = tournament.games?.name || "Unknown Game"
        const existingGame = acc.find((item: any) => item.name === gameName)

        if (existingGame) {
          existingGame.count++
        } else {
          acc.push({ name: gameName, value: 1 })
        }

        return acc
      }, []) || []

    // Get match data by type
    const { data: matches, error: matchError } = await supabase.from("matches").select("match_type")

    if (matchError) {
      console.error("Error fetching matches by type:", matchError)
    }

    // Group matches by type using JavaScript
    const matchesByType =
      matches?.reduce((acc: any, match: any) => {
        const matchType = match.match_type || "Unknown"
        const existingType = acc.find((item: any) => item.match_type === matchType)

        if (existingType) {
          existingType.count++
        } else {
          acc.push({ match_type: matchType, count: 1 })
        }

        return acc
      }, []) || []

    // Get team creation data by month (last 6 months)
    const { data: teamCreations, error: teamError } = await supabase
      .from("teams")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (teamError) {
      console.error("Error fetching team creations:", teamError)
    }

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Statistics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{statsData?.users || 0}</CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{statsData?.teams || 0}</CardTitle>
              <CardDescription>Total Teams</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{statsData?.tournaments || 0}</CardTitle>
              <CardDescription>Total Tournaments</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{statsData?.matches || 0}</CardTitle>
              <CardDescription>Total Matches</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserMetrics userRegistrations={userRegistrations || []} />
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-4">
            <TournamentMetrics tournamentsByGame={tournamentsByGame || []} />
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <MatchMetrics matchesByType={matchesByType || []} />
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <TeamMetrics teamCreations={teamCreations || []} />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error in AdminStatisticsPage:", error)
    throw error // This will be caught by the error boundary
  }
}
