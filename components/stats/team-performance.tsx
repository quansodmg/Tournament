"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface TeamPerformanceProps {
  teamMemberships: any[]
  matchParticipations: any[]
}

export default function TeamPerformance({ teamMemberships = [], matchParticipations = [] }: TeamPerformanceProps) {
  // If no teams, show empty state
  if (!teamMemberships || teamMemberships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>You're not a member of any teams yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">Join or create teams to see your team performance stats here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process team data
  const teamData = teamMemberships.map((membership) => {
    const teamId = membership.team_id
    const teamName = membership.teams?.name || "Unknown Team"
    const teamLogo = membership.teams?.logo_url

    // Count matches for this team
    const teamMatches = matchParticipations.filter((match) => match.team_id === teamId)
    const matchesPlayed = teamMatches.length
    const matchesWon = teamMatches.filter((match) => match.result === "won").length
    const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0

    return {
      id: teamId,
      name: teamName,
      logo: teamLogo,
      matchesPlayed,
      matchesWon,
      winRate,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Your performance across different teams</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {teamData.map((team, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={team.logo || ""} alt={team.name} />
                <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{team.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {team.matchesWon} wins / {team.matchesPlayed} matches
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={team.winRate} className="h-2" />
                  <span className="text-xs font-medium">{team.winRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
