"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MatchMetricsProps {
  matchesByType: {
    match_type: string
    count: number
  }[]
}

export default function MatchMetrics({ matchesByType }: MatchMetricsProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month")

  // Process match data for charts
  const processMatchesByType = () => {
    return matchesByType.map((item) => ({
      name: item.match_type || "Unknown",
      matches: Number.parseInt(item.count as any),
    }))
  }

  // Placeholder data for matches by day of week
  const matchesByDay = [
    { name: "Monday", matches: 12 },
    { name: "Tuesday", matches: 18 },
    { name: "Wednesday", matches: 24 },
    { name: "Thursday", matches: 16 },
    { name: "Friday", matches: 26 },
    { name: "Saturday", matches: 38 },
    { name: "Sunday", matches: 30 },
  ]

  const chartData = processMatchesByType()

  // Calculate total matches
  const totalMatches = chartData.reduce((sum, item) => sum + item.matches, 0)

  // Calculate completion rate (placeholder)
  const completionRate = 92 // 92% completion rate as a placeholder

  // Calculate average duration in minutes (placeholder)
  const avgDuration = 45 // 45 minutes per match as a placeholder

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalMatches}</CardTitle>
            <CardDescription>Total Matches</CardDescription>
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
            <CardTitle className="text-2xl">{avgDuration} min</CardTitle>
            <CardDescription>Avg. Duration</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Match Distribution</CardTitle>
              <CardDescription>Matches by type</CardDescription>
            </div>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeframe === "week" ? matchesByDay : chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="matches" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No match data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
