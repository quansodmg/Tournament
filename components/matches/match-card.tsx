import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy, GamepadIcon } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"

interface MatchCardProps {
  match: any
  showJoinButton?: boolean
}

export default function MatchCard({ match, showJoinButton = false }: MatchCardProps) {
  const isUpcoming = new Date(match.start_time) > new Date()
  const statusColor =
    {
      scheduled: "bg-blue-500",
      in_progress: "bg-amber-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    }[match.status] || "bg-gray-500"

  const formatMatchTime = (date: string) => {
    const matchDate = new Date(date)
    if (isUpcoming) {
      return `${formatDistanceToNow(matchDate, { addSuffix: true })} (${format(matchDate, "MMM d, h:mm a")})`
    }
    return format(matchDate, "MMM d, h:mm a")
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-2 w-full" style={{ backgroundColor: match.game?.color || "#4f46e5" }} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColor}`} />
            <span className="text-sm font-medium capitalize">{match.status.replace("_", " ")}</span>
          </div>
          <Badge variant={match.is_private ? "outline" : "secondary"}>{match.is_private ? "Private" : "Public"}</Badge>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {match.game?.logo_url ? (
            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
              <img
                src={match.game.logo_url || "/placeholder.svg"}
                alt={match.game.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
              <GamepadIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-semibold">{match.game?.name || "Unknown Game"}</h3>
            <p className="text-sm text-muted-foreground">
              {match.match_format || match.match_type || "Standard Match"}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatMatchTime(match.start_time)}</span>
          </div>
          {match.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{match.location}</span>
            </div>
          )}
          {match.team_size && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {match.team_size}v{match.team_size}
              </span>
            </div>
          )}
          {match.prize_pool && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>{typeof match.prize_pool === "number" ? `$${match.prize_pool}` : match.prize_pool}</span>
            </div>
          )}
        </div>

        {match.participants && match.participants.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Participants</h4>
            <div className="flex flex-wrap gap-2">
              {match.participants.slice(0, 4).map((participant: any) => (
                <Badge key={participant.team?.id || participant.profile_id} variant="secondary">
                  {participant.team?.name || "Individual Player"}
                </Badge>
              ))}
              {match.participants.length > 4 && (
                <Badge variant="secondary">+{match.participants.length - 4} more</Badge>
              )}
            </div>
          </div>
        )}

        {match.match_notes && (
          <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{match.match_notes}</div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 bg-secondary/50 flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/matches/${match.id}`}>View Details</Link>
        </Button>
        {showJoinButton && isUpcoming && (
          <Button asChild size="sm">
            <Link href={`/matches/${match.id}/join`}>Join Match</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
