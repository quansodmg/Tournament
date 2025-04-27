"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface PerformanceOverviewProps {
  playerStats: any[]
  matchParticipations: any[]
  tournamentParticipations: any[]
}

export default function PerformanceOverview({
  playerStats = [],
  matchParticipations = [],
  tournamentParticipations = [],
}: PerformanceOverviewProps) {
  // Fallback data if no stats are available
  const fallbackData = [
    { name: "Jan", value: 0 },
    { name: "Feb", value: 0 },
    { name: "Mar", value: 0 },
    { name: "Apr", value: 0 },
    { name: "May", value: 0 },
    { name: "Jun", value: 0 },
  ]

  // Process match data for the chart
  const matchData =
    playerStats.length > 0
      ? playerStats.map((stat) => ({
          name: stat.games?.name || "Unknown Game",
          wins: stat.matches_won || 0,
          losses: stat.matches_played - stat.matches_won || 0,
          winRate: stat.matches_played > 0 ? Math.round((stat.matches_won / stat.matches_played) * 100) : 0,
        }))
      : fallbackData.map((item) => ({ name: item.name, wins: 0, losses: 0, winRate: 0 }))

  // Process tournament data for the pie chart
  const tournamentData = [
    { name: "Won", value: playerStats.reduce((sum, stat) => sum + stat.tournaments_won, 0) },
    {
      name: "Participated",
      value: playerStats.reduce((sum, stat) => sum + stat.tournaments_played - stat.tournaments_won, 0),
    },
  ]

  // If no tournament data, use fallback
  if (tournamentData[0].value === 0 && tournamentData[1].value === 0) {
    tournamentData[1].value = 1 // Show at least something in the chart
  }

  const COLORS = ["#4ade80", "#94a3b8"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Performance</CardTitle>
          <CardDescription>Your win/loss ratio across different games</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={matchData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="wins" stroke="#4ade80" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="losses" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Participation</CardTitle>
          <CardDescription>Your tournament wins vs participations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tournamentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tournamentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
