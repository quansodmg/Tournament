"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface TournamentHistoryProps {
  tournamentParticipations: any[]
}

export default function TournamentHistory({ tournamentParticipations = [] }: TournamentHistoryProps) {
  // If no tournaments, show empty state
  if (!tournamentParticipations || tournamentParticipations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tournament History</CardTitle>
          <CardDescription>You haven't participated in any tournaments yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">Register for tournaments to see your tournament history here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort tournaments by date (most recent first)
  const sortedTournaments = [...tournamentParticipations].sort((a, b) => {
    const dateA = a.tournaments?.start_date ? new Date(a.tournaments.start_date).getTime() : 0
    const dateB = b.tournaments?.start_date ? new Date(b.tournaments.start_date).getTime() : 0
    return dateB - dateA
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament History</CardTitle>
        <CardDescription>Your tournament participations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTournaments.map((tournament, index) => {
            const startDate = tournament.tournaments?.start_date
              ? format(new Date(tournament.tournaments.start_date), "MMM d, yyyy")
              : "No date"

            const status = tournament.tournaments?.status || "Unknown"
            const placement = tournament.placement || "Participated"
            const gameName = tournament.tournaments?.games?.name || "Unknown Game"

            return (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{tournament.tournaments?.name || `Tournament #${index + 1}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {startDate} • {gameName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={status === "completed" ? "outline" : "secondary"}>{status}</Badge>
                    {placement === "1st" && <Badge className="bg-yellow-500">1st Place</Badge>}
                    {placement === "2nd" && <Badge className="bg-gray-400">2nd Place</Badge>}
                    {placement === "3rd" && <Badge className="bg-amber-700">3rd Place</Badge>}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Placement: </span>
                  {placement}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
