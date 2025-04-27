"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Trophy, Gamepad2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    userCount: 0,
    tournamentCount: 0,
    activeTournamentCount: 0,
    gameCount: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const supabase = await createClient()

        // Get user count
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        // Get tournament count
        const { count: tournamentCount, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*", { count: "exact", head: true })

        // Get active tournament count
        const { count: activeTournamentCount, error: activeTournamentError } = await supabase
          .from("tournaments")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")

        // Get game count
        const { count: gameCount, error: gameError } = await supabase
          .from("games")
          .select("*", { count: "exact", head: true })

        // Get recent activity - if the table exists
        let activityData: any[] = []
        try {
          const { data, error: activityError } = await supabase
            .from("admin_activity_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(3)

          if (!activityError && data) {
            activityData = data
          }
        } catch (err) {
          console.log("Admin activity log table might not exist yet")
        }

        // Update state with fetched data
        setStats({
          userCount: userCount || 0,
          tournamentCount: tournamentCount || 0,
          activeTournamentCount: activeTournamentCount || 0,
          gameCount: gameCount || 0,
        })

        setRecentActivity(activityData)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Calculate growth percentages (in a real app, you'd compare with previous period)
  const userGrowth = "+12%"
  const tournamentGrowth = "8 starting this week"
  const gameGrowth = "3 added this month"
  const activeUserGrowth = "+5%"

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#1a1b1e] border-[#2a2b30]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#0bb5ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userCount.toLocaleString()}</div>
              <p className="text-xs text-gray-400">{userGrowth} from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1b1e] border-[#2a2b30]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Tournaments</CardTitle>
              <Trophy className="h-4 w-4 text-[#0bb5ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTournamentCount}</div>
              <p className="text-xs text-gray-400">{tournamentGrowth}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1b1e] border-[#2a2b30]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Games</CardTitle>
              <Gamepad2 className="h-4 w-4 text-[#0bb5ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gameCount}</div>
              <p className="text-xs text-gray-400">{gameGrowth}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1b1e] border-[#2a2b30]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Daily Active Users</CardTitle>
              <Activity className="h-4 w-4 text-[#0bb5ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">587</div>
              <p className="text-xs text-gray-400">{activeUserGrowth} from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-[#1a1b1e] border-[#2a2b30]">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="mr-4 rounded-full bg-[#0bb5ff]/10 p-2">
                        {activity.type === "tournament" && <Trophy className="h-4 w-4 text-[#0bb5ff]" />}
                        {activity.type === "user" && <Users className="h-4 w-4 text-[#0bb5ff]" />}
                        {activity.type === "game" && <Gamepad2 className="h-4 w-4 text-[#0bb5ff]" />}
                      </div>
                      <div>
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-[#0bb5ff]/10 p-2">
                        <Trophy className="h-4 w-4 text-[#0bb5ff]" />
                      </div>
                      <div>
                        <p className="text-sm">
                          New tournament created: <span className="font-medium">Summer Championship</span>
                        </p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-[#0bb5ff]/10 p-2">
                        <Users className="h-4 w-4 text-[#0bb5ff]" />
                      </div>
                      <div>
                        <p className="text-sm">
                          New team registered: <span className="font-medium">Phoenix Flames</span>
                        </p>
                        <p className="text-xs text-gray-400">5 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-[#0bb5ff]/10 p-2">
                        <Gamepad2 className="h-4 w-4 text-[#0bb5ff]" />
                      </div>
                      <div>
                        <p className="text-sm">
                          New game added: <span className="font-medium">Stellar Warfare</span>
                        </p>
                        <p className="text-xs text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1b1e] border-[#2a2b30]">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">Server Load</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#2a2b30]">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: "28%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#2a2b30]">
                    <div className="h-2 rounded-full bg-yellow-500" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#2a2b30]">
                    <div className="h-2 rounded-full bg-[#0bb5ff]" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
