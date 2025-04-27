"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface GamePerformanceProps {
  playerStats: any[]
}

export default function GamePerformance({ playerStats = [] }: GamePerformanceProps) {
  // If no stats, show empty state
  if (!playerStats || playerStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Performance</CardTitle>
          <CardDescription>You haven't played any games yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              Join matches and tournaments to see your game performance stats here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Performance</CardTitle>
        <CardDescription>Your stats across different games</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {playerStats.map((stat, index) => {
            const winRate = stat.matches_played > 0 ? Math.round((stat.matches_won / stat.matches_played) * 100) : 0

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 relative rounded-md overflow-hidden">
                  {stat.games?.cover_image ? (
                    <Image
                      src={stat.games.cover_image || "/placeholder.svg"}
                      alt={stat.games?.name || "Game"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs">{stat.games?.name?.substring(0, 2) || "??"}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{stat.games?.name || "Unknown Game"}</h3>
                  <div className="text-sm text-muted-foreground">
                    {stat.matches_won} wins / {stat.matches_played} matches
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={winRate} className="h-2" />
                    <span className="text-xs font-medium">{winRate}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
