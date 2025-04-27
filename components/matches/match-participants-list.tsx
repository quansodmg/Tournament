import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users } from "lucide-react"
import Link from "next/link"

interface MatchParticipantsListProps {
  participants: any[]
  matchResults?: any[]
  userTeamIds: string[]
}

export default function MatchParticipantsList({ participants, matchResults, userTeamIds }: MatchParticipantsListProps) {
  // Get winner and loser team IDs if results exist
  const winnerTeamId = matchResults && matchResults.length > 0 ? matchResults[0].winner_team_id : null
  const loserTeamId = matchResults && matchResults.length > 0 ? matchResults[0].loser_team_id : null

  return (
    <div>
      <h3 className="font-medium mb-4">Participants</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.length > 0 ? (
          participants.map((participant) => {
            const isUserTeam = userTeamIds.includes(participant.team_id)
            const isWinner = participant.team_id === winnerTeamId
            const isLoser = participant.team_id === loserTeamId

            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isUserTeam ? "border-primary/50 bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={participant.team?.logo_url || ""} alt={participant.team?.name} />
                    <AvatarFallback>{participant.team?.name?.[0] || "T"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{participant.team?.name}</h4>
                      {isUserTeam && (
                        <Badge variant="outline" className="ml-2">
                          Your Team
                        </Badge>
                      )}
                      {isWinner && (
                        <Badge className="ml-2 bg-green-500">
                          <Trophy className="h-3 w-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                      {isLoser && (
                        <Badge variant="destructive" className="ml-2">
                          Loser
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{participant.team?.members?.length || 0} members</span>
                    </div>
                  </div>
                </div>
                <Link href={`/teams/${participant.team_id}`} className="text-xs text-primary hover:underline">
                  View Team
                </Link>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No participants have joined this match yet.
          </div>
        )}

        {participants.length === 1 && (
          <div className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Waiting for opponent</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
