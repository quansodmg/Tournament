"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface TeamStatisticsProps {
  teamId: string
}

export default function TeamStatistics({ teamId }: TeamStatisticsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTeamStats = async () => {
      try {
        setLoading(true)

        // Get team matches
        const { data: teamMatches, error: teamMatchesError } = await supabase
          .from("match_participants")
          .select(`
            result,
            match:match_id(status, game_id, game_mode, match_format)
          `)
          .eq("team_id", teamId)

        if (teamMatchesError) throw teamMatchesError

        const completedMatches = teamMatches?.filter((m) => m.match?.status === "completed") || []
        const totalMatches = completedMatches.length
        const wonMatches = completedMatches.filter((m) => m.result === "win").length
        const winRate = totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0

        // Get disputes
        const { data: disputes, error: disputesError } = await supabase
          .from("disputes")
          .select("*")
          .eq("reported_by_id", teamId)

        if (disputesError) throw disputesError

        const disputeRate = totalMatches > 0 ? ((disputes?.length || 0) / totalMatches) * 100 : 0

        // Group matches by game
        const gameStats: Record<string, { played: number; won: number }> = {}
        const modeStats: Record<string, { played: number; won: number }> = {}

        completedMatches.forEach((match) => {
          const gameId = match.match?.game_id
          if (gameId) {
            if (!gameStats[gameId]) {
              gameStats[gameId] = { played: 0, won: 0 }
            }
            gameStats[gameId].played++
            if (match.result === "win") {
              gameStats[gameId].won++
            }
          }

          const gameMode = match.match?.game_mode
          if (gameMode) {
            if (!modeStats[gameMode]) {
              modeStats[gameMode] = { played: 0, won: 0 }
            }
            modeStats[gameMode].played++
            if (match.result === "win") {
              modeStats[gameMode].won++
            }
          }
        })

        // Get recent matches (last 5)
        const recentMatches = completedMatches
          .sort((a, b) => {
            const dateA = new Date(a.match?.updated_at || 0)
            const dateB = new Date(b.match?.updated_at || 0)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 5)

        setStats({
          totalMatches,
          wonMatches,
          lostMatches: totalMatches - wonMatches,
          winRate: winRate.toFixed(1),
          disputes: disputes?.length || 0,
          disputeRate: disputeRate.toFixed(1),
          gameStats,
          modeStats,
          recentMatches,
        })
      } catch (error) {
        console.error("Error fetching team stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamStats()
  }, [teamId, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Statistics</CardTitle>
        <CardDescription>Performance metrics and match history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Matches</p>
              <p className="text-2xl font-bold">{stats.totalMatches}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Wins</p>
              <p className="text-2xl font-bold">{stats.wonMatches}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">{stats.winRate}%</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Disputes</p>
              <p className="text-2xl font-bold">{stats.disputes}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Recent Performance</h4>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${stats.winRate}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>0%</span>
              <span>Win Rate: {stats.winRate}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
