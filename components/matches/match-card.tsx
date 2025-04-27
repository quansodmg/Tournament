import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, GamepadIcon, Trophy, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface MatchCardProps {
  match: any
  showJoinButton?: boolean
}

export default function MatchCard({ match, showJoinButton = false }: MatchCardProps) {
  // Format dates
  const startTime = match.start_time ? new Date(match.start_time) : null
  const endTime = match.end_time ? new Date(match.end_time) : null

  // Get participants
  const participants = match.participants || []

  // Get match format display name
  const getMatchFormatName = (format: string) => {
    const formats: Record<string, string> = {
      bo1: "Best of 1",
      bo3: "Best of 3",
      bo5: "Best of 5",
      bo7: "Best of 7",
    }
    return formats[format] || format
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "secondary",
      in_progress: "default",
      completed: "outline",
      cancelled: "destructive",
    }
    return variants[status] || "outline"
  }

  // Get status display name
  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      scheduled: "Scheduled",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    }
    return names[status] || status
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">{match.match_type}</Badge>
            <CardTitle className="line-clamp-1">
              {participants.length === 2 ? (
                <>
                  {participants[0]?.team?.name || "Team 1"} vs {participants[1]?.team?.name || "Team 2"}
                </>
              ) : participants.length === 1 ? (
                <>{participants[0]?.team?.name || "Team 1"} vs TBD</>
              ) : (
                "Open Match"
              )}
            </CardTitle>
          </div>
          <Badge variant={getStatusVariant(match.status)}>{getStatusName(match.status)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-3">
          {match.game && (
            <div className="flex items-center text-sm">
              <GamepadIcon className="mr-2 h-4 w-4 opacity-70" />
              <span>{match.game.name}</span>
            </div>
          )}

          {match.match_format && (
            <div className="flex items-center text-sm">
              <Trophy className="mr-2 h-4 w-4 opacity-70" />
              <span>{getMatchFormatName(match.match_format)}</span>
            </div>
          )}

          {startTime && (
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>{format(startTime, "PPP")}</span>
            </div>
          )}

          {startTime && (
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 opacity-70" />
              <span>{format(startTime, "p")}</span>
            </div>
          )}

          {match.location && (
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 opacity-70" />
              <span className="line-clamp-1">{match.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 opacity-70" />
            <span>
              {participants.length} / 2 {participants.length === 1 ? "Team" : "Teams"}
            </span>
          </div>
        </div>
      </CardContent>

      {match.status === "completed" && match.match_results && match.match_results.length > 0 && (
        <div className="px-6 py-2 bg-secondary/50">
          <div className="flex justify-center items-center gap-2 text-sm">
            <span className="font-semibold">{match.match_results[0].winner_score}</span>
            <span>-</span>
            <span className="font-semibold">{match.match_results[0].loser_score}</span>
          </div>
        </div>
      )}

      <CardFooter className="pt-4">
        {showJoinButton ? (
          <Button asChild className="w-full">
            <Link href={`/matches/${match.id}/join`}>Join Match</Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/matches/${match.id}`}>View Details</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
