"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface TournamentMetricsProps {
  tournamentsByGame: {
    name: string
    value: number
  }[]
}

export default function TournamentMetrics({ tournamentsByGame }: TournamentMetricsProps) {
  const [viewType, setViewType] = useState<"games" | "status">("games")

  // Process tournament data for charts
  const processTournamentsByGame = () => {
    return tournamentsByGame.map((item) => ({
      name: item.name || "Unknown Game",
      value: Number.parseInt(item.value as any),
    }))
  }

  // Placeholder data for tournament status
  const tournamentsByStatus = [
    { name: "Upcoming", value: 12 },
    { name: "Active", value: 8 },
    { name: "Completed", value: 24 },
  ]

  const chartData = viewType === "games" ? processTournamentsByGame() : tournamentsByStatus

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  // Calculate total tournaments
  const totalTournaments = chartData.reduce((sum, item) => sum + item.value, 0)

  // Calculate completion rate (placeholder)
  const completionRate = 85 // 85% completion rate as a placeholder

  // Calculate average participants (placeholder)
  const avgParticipants = 16 // 16 participants per tournament as a placeholder

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalTournaments}</CardTitle>
            <CardDescription>Total Tournaments</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{completionRate}%</CardTitle>
            <CardDescription>Completion Rate</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{avgParticipants}</CardTitle>
            <CardDescription>Avg. Participants</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tournament Distribution</CardTitle>
              <CardDescription>
                {viewType === "games" ? "Tournaments by game" : "Tournaments by status"}
              </CardDescription>
            </div>
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)}>
              <TabsList>
                <TabsTrigger value="games">By Game</TabsTrigger>
                <TabsTrigger value="status">By Status</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tournaments`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No tournament data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
