"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns"

interface UserMetricsProps {
  userRegistrations: { created_at: string }[]
}

export default function UserMetrics({ userRegistrations }: UserMetricsProps) {
  const [timeframe, setTimeframe] = useState<"6m" | "1y" | "all">("6m")

  // Process user registration data by month
  const processRegistrationsByMonth = () => {
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
        // Find the earliest registration date or default to 1 year ago
        startDate = userRegistrations.length > 0 ? parseISO(userRegistrations[0].created_at) : subMonths(endDate, 12)
    }

    // Create array of all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    // Initialize counts for each month
    const monthlyCounts = months.map((month) => ({
      month: format(month, "MMM yyyy"),
      count: 0,
    }))

    // Count registrations for each month
    userRegistrations.forEach((registration) => {
      const regDate = parseISO(registration.created_at)

      // Skip if outside our timeframe
      if (regDate < startDate) return

      const monthIndex = months.findIndex((month) => regDate >= startOfMonth(month) && regDate <= endOfMonth(month))

      if (monthIndex !== -1) {
        monthlyCounts[monthIndex].count++
      }
    })

    return monthlyCounts
  }

  const registrationsByMonth = processRegistrationsByMonth()

  // Calculate active users (placeholder - in a real app, this would be based on login activity)
  const activeUsers = Math.floor(userRegistrations.length * 0.7) // 70% of total as a placeholder

  // Calculate user retention (placeholder)
  const retentionRate = 65 // 65% retention rate as a placeholder

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{userRegistrations.length}</CardTitle>
            <CardDescription>Total Registrations</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{activeUsers}</CardTitle>
            <CardDescription>Active Users</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{retentionRate}%</CardTitle>
            <CardDescription>User Retention</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Registrations</CardTitle>
              <CardDescription>New user sign-ups over time</CardDescription>
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
          {registrationsByMonth.length > 0 ? (
            <div className="h-[300px]">
              <div className="flex h-full items-end gap-2">
                {registrationsByMonth.map((data, i) => (
                  <div key={i} className="relative flex flex-1 flex-col items-center">
                    <div
                      className="bg-primary w-full rounded-md transition-all"
                      style={{
                        height: `${Math.max(5, (data.count / Math.max(...registrationsByMonth.map((d) => d.count))) * 100)}%`,
                      }}
                    />
                    <span className="absolute bottom-0 translate-y-full text-xs text-muted-foreground mt-2">
                      {data.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No registration data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
