"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TeamMetricsProps {
  teamCreations: { created_at: string }[]
}

export default function TeamMetrics({ teamCreations }: TeamMetricsProps) {
  const [timeframe, setTimeframe] = useState<"6m" | "1y" | "all">("6m")

  // Process team creation data by month
  const processTeamCreationsByMonth = () => {
    // Get date range based on timeframe
    const endDate = new Date()
    let startDate: Date

    switch (timeframe) {
      case "6m":
        startDate = subMonths(endDate, 6)
        break
      case "1y":
        startDate = subMonths(endDate, 12)
        break
      case "all":
      default:
        // Find the earliest team creation date or default to 1 year ago
        startDate = teamCreations.length > 0 ? parseISO(teamCreations[0].created_at) : subMonths(endDate, 12)
    }

    // Create array of all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    // Initialize counts for each month
    const monthlyCounts = months.map((month) => ({
      month: format(month, "MMM yyyy"),
      teams: 0,
      cumulative: 0,
    }))

    // Count team creations for each month
    let cumulativeCount = 0
    teamCreations.forEach((team) => {
      const creationDate = parseISO(team.created_at)

      // Skip if outside our timeframe
      if (creationDate < startDate) return

      const monthIndex = months.findIndex(
        (month) => creationDate >= startOfMonth(month) && creationDate <= endOfMonth(month),
      )

      if (monthIndex !== -1) {
        monthlyCounts[monthIndex].teams++
      }
    })

    // Calculate cumulative counts
    for (let i = 0; i < monthlyCounts.length; i++) {
      cumulativeCount += monthlyCounts[i].teams
      monthlyCounts[i].cumulative = cumulativeCount
    }

    return monthlyCounts
  }

  const teamCreationsByMonth = processTeamCreationsByMonth()

  // Calculate average team size (placeholder)
  const avgTeamSize = 5 // 5 members per team as a placeholder

  // Calculate active teams (placeholder)
  const activeTeams = Math.floor(teamCreations.length * 0.8) // 80% of total as a placeholder

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{teamCreations.length}</CardTitle>
            <CardDescription>Total Teams</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{activeTeams}</CardTitle>
            <CardDescription>Active Teams</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{avgTeamSize}</CardTitle>
            <CardDescription>Avg. Team Size</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Growth</CardTitle>
              <CardDescription>Team creations over time</CardDescription>
            </div>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
              <TabsList>
                <TabsTrigger value="6m">6 Months</TabsTrigger>
                <TabsTrigger value="1y">1 Year</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {teamCreationsByMonth.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={teamCreationsByMonth}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="teams" stroke="#8884d8" name="New Teams" />
                  <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" name="Total Teams" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No team creation data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
