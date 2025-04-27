import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Calendar } from "lucide-react"
import { format } from "date-fns"

interface MatchResultDisplayProps {
  match: any
}

export default function MatchResultDisplay({ match }: MatchResultDisplayProps) {
  if (!match.match_results || match.match_results.length === 0) {
    return null
  }

  const result = match.match_results[0]
  const winnerTeam = match.participants.find((p: any) => p.team_id === result.winner_team_id)?.team
  const loserTeam = match.participants.find((p: any) => p.team_id === result.loser_team_id)?.team

  if (!winnerTeam || !loserTeam) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Match Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Winner */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={winnerTeam.logo_url || ""} alt={winnerTeam.name} />
              <AvatarFallback>{winnerTeam.name[0]}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{winnerTeam.name}</h3>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mt-1">Winner</div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">
              {result.winner_score} - {result.loser_score}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3 mr-1" />
              {match.end_time ? format(new Date(match.end_time), "PPP") : "Unknown date"}
            </div>
          </div>

          {/* Loser */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={loserTeam.logo_url || ""} alt={loserTeam.name} />
              <AvatarFallback>{loserTeam.name[0]}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{loserTeam.name}</h3>
            <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded mt-1">Loser</div>
          </div>
        </div>

        {result.notes && (
          <div className="mt-6">
            <h4 className="font-medium mb-1">Match Notes</h4>
            <p className="text-sm text-muted-foreground">{result.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
