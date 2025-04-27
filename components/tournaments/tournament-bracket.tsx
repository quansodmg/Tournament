"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface TournamentBracketProps {
  tournamentId: string
  isOrganizer?: boolean
}

export default function TournamentBracket({ tournamentId, isOrganizer = false }: TournamentBracketProps) {
  const [matches, setMatches] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maxRound, setMaxRound] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchBracketData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get tournament details to check if it's team-based
        const { data: tournament, error: tournamentError } = await supabase
          .from("tournaments")
          .select("team_size")
          .eq("id", tournamentId)
          .single()

        if (tournamentError) throw tournamentError

        const isTeamTournament = tournament.team_size > 1

        // Get all matches for this tournament
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
            *,
            next_match:next_match_id(id, round, match_number, bracket_position)
          `)
          .eq("tournament_id", tournamentId)
          .order("round", { ascending: true })
          .order("bracket_position", { ascending: true })

        if (matchesError) throw matchesError

        // Get all participants for these matches
        const matchIds = matchesData.map((match) => match.id)

        const { data: participantsData, error: participantsError } = await supabase
          .from("match_participants")
          .select(`
            *,
            team:team_id(id, name, logo_url),
            profile:profile_id(id, username, avatar_url)
          `)
          .in("match_id", matchIds)

        if (participantsError) throw participantsError

        // Calculate max round
        const maxRoundValue = Math.max(...matchesData.map((match) => match.round))

        setMatches(matchesData)
        setParticipants(participantsData)
        setMaxRound(maxRoundValue)
      } catch (error: any) {
        console.error("Error fetching bracket data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBracketData()
  }, [tournamentId, supabase])

  const getMatchParticipants = (matchId: string) => {
    return participants.filter((p) => p.match_id === matchId)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bracket...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading bracket: {error}</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bracket has been generated for this tournament yet.</p>
      </div>
    )
  }

  // Group matches by round
  const matchesByRound: Record<number, any[]> = {}
  matches.forEach((match) => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = []
    }
    matchesByRound[match.round].push(match)
  })

  return (
    <div className="tournament-bracket overflow-x-auto">
      <div className="flex min-w-max">
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => (
          <div key={round} className="bracket-round flex flex-col px-2" style={{ minWidth: "240px" }}>
            <h3 className="text-center font-semibold mb-4">
              {round === maxRound ? "Final" : round === maxRound - 1 ? "Semifinals" : `Round ${round}`}
            </h3>
            <div className="flex flex-col space-y-4">
              {matchesByRound[round]?.map((match, index) => {
                const matchParticipants = getMatchParticipants(match.id)
                const spacingMultiplier = Math.pow(2, round - 1)

                return (
                  <div
                    key={match.id}
                    className="bracket-match relative"
                    style={{
                      marginTop: index > 0 ? `${spacingMultiplier * 2}rem` : 0,
                    }}
                  >
                    <MatchCard match={match} participants={matchParticipants} isOrganizer={isOrganizer} />

                    {/* Draw connector lines to next match */}
                    {match.next_match && (
                      <div
                        className="connector-line absolute right-0 h-1/2 border-r-2 border-muted-foreground/30"
                        style={{
                          top: match.next_match_position === 1 ? "50%" : 0,
                          bottom: match.next_match_position === 2 ? "50%" : 0,
                          width: "1rem",
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .tournament-bracket {
          padding: 1rem 0;
        }
      `}</style>
    </div>
  )
}

interface MatchCardProps {
  match: any
  participants: any[]
  isOrganizer: boolean
}

function MatchCard({ match, participants, isOrganizer }: MatchCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const updateMatchResult = async (participantId: string, score: number, result: string) => {
    if (!isOrganizer) return

    setIsUpdating(true)

    try {
      // Update this participant's result
      await supabase.from("match_participants").update({ score, result }).eq("id", participantId)

      // If this is a win, set the other participant to lose
      if (result === "win") {
        const otherParticipants = participants.filter((p) => p.id !== participantId)

        for (const otherParticipant of otherParticipants) {
          await supabase.from("match_participants").update({ result: "loss" }).eq("id", otherParticipant.id)
        }

        // Update match status to completed
        await supabase.from("matches").update({ status: "completed" }).eq("id", match.id)

        // If there's a next match, advance the winner
        if (match.next_match_id) {
          const winner = participants.find((p) => p.id === participantId)

          // Check if the participant is a team or individual
          const isTeam = !!winner.team_id

          // Add the winner to the next match
          await supabase.from("match_participants").insert({
            match_id: match.next_match_id,
            [isTeam ? "team_id" : "profile_id"]: isTeam ? winner.team_id : winner.profile_id,
            score: null,
            result: null,
          })

          // Update next match status if both participants are now present
          const { data: nextMatchParticipants } = await supabase
            .from("match_participants")
            .select("*")
            .eq("match_id", match.next_match_id)

          if (nextMatchParticipants && nextMatchParticipants.length === 2) {
            await supabase.from("matches").update({ status: "scheduled" }).eq("id", match.next_match_id)
          }
        }
      }

      // Refresh the page to show updated bracket
      window.location.reload()
    } catch (error) {
      console.error("Error updating match result:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className={`w-full ${match.status === "completed" ? "border-primary/30" : ""}`}>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground mb-2">
          Match {match.match_number} •{" "}
          {match.status === "completed" ? "Completed" : match.status === "scheduled" ? "Scheduled" : "Pending"}
        </div>

        {participants.length === 0 ? (
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {participants.map((participant) => {
              const isTeam = !!participant.team_id
              const name = isTeam ? participant.team?.name : participant.profile?.username
              const image = isTeam ? participant.team?.logo_url : participant.profile?.avatar_url
              const initial = name ? name[0].toUpperCase() : "?"

              return (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    participant.result === "win"
                      ? "bg-green-500/10 border border-green-500/30"
                      : participant.result === "loss"
                        ? "bg-red-500/10 border border-red-500/30 opacity-75"
                        : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={image || ""} alt={name} />
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate max-w-[120px]">{name || "TBD"}</span>
                  </div>

                  <div className="flex items-center">
                    {participant.score !== null && (
                      <Badge variant={participant.result === "win" ? "default" : "outline"} className="mr-2">
                        {participant.score}
                      </Badge>
                    )}

                    {isOrganizer && match.status === "scheduled" && (
                      <div className="flex space-x-1">
                        <button
                          disabled={isUpdating}
                          onClick={() => updateMatchResult(participant.id, 1, "win")}
                          className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded"
                        >
                          Win
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
