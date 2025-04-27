"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface MatchHistoryProps {
  matchParticipations: any[]
}

export default function MatchHistory({ matchParticipations = [] }: MatchHistoryProps) {
  // If no matches, show empty state
  if (!matchParticipations || matchParticipations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>You haven't participated in any matches yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">Join or create matches to see your match history here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort matches by date (most recent first)
  const sortedMatches = [...matchParticipations].sort((a, b) => {
    const dateA = a.matches?.start_time ? new Date(a.matches.start_time).getTime() : 0
    const dateB = b.matches?.start_time ? new Date(b.matches.start_time).getTime() : 0
    return dateB - dateA
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
        <CardDescription>Your recent matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMatches.map((match, index) => {
            const startTime = match.matches?.start_time
              ? format(new Date(match.matches.start_time), "MMM d, yyyy")
              : "No date"

            const status = match.matches?.status || "Unknown"
            const result = match.result || "Unknown"

            return (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Match #{match.matches?.id?.substring(0, 8) || index}</h3>
                    <p className="text-sm text-muted-foreground">{startTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={status === "completed" ? "outline" : "secondary"}>{status}</Badge>
                    {result === "won" && <Badge className="bg-green-500">Won</Badge>}
                    {result === "lost" && <Badge variant="destructive">Lost</Badge>}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Type: </span>
                  {match.matches?.match_type || "Standard"}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
