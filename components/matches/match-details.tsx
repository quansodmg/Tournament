"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, Calendar, Clock, MapPin, Users, Trophy, Flag } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface MatchDetailsProps {
  matchId: string
  userId: string
  userTeamId?: string
}

export default function MatchDetails({ matchId, userId, userTeamId }: MatchDetailsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [userIsParticipant, setUserIsParticipant] = useState(false)
  const [canReportResult, setCanReportResult] = useState(false)
  const [canReportDispute, setCanReportDispute] = useState(false)

  useEffect(() => {
    async function fetchMatchDetails() {
      try {
        setLoading(true)

        // Fetch match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            scheduled_by_profile:scheduled_by(username, avatar_url),
            results:match_results(*)
          `)
          .eq("id", matchId)
          .single()

        if (matchError) throw matchError

        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from("match_participants")
          .select(`
            *,
            team:team_id(
              id,
              name,
              logo_url,
              members:team_members(
                profile:profile_id(id, username, avatar_url)
              )
            )
          `)
          .eq("match_id", matchId)

        if (participantsError) throw participantsError

        setMatch(matchData)
        setParticipants(participantsData || [])

        // Check if user is a participant
        const isParticipant = participantsData.some((p) => {
          return p.team?.members?.some((m: any) => m.profile?.id === userId)
        })
        setUserIsParticipant(isParticipant)

        // Check if user can report result
        const canReport =
          isParticipant &&
          (matchData.status === "scheduled" || matchData.status === "in_progress") &&
          new Date(matchData.start_time) <= new Date()

        setCanReportResult(canReport)

        // Check if user can report dispute
        const canDispute = isParticipant && matchData.status === "pending_confirmation" && matchData.results?.length > 0

        setCanReportDispute(canDispute)
      } catch (err: any) {
        console.error("Error fetching match details:", err)
        setError(err.message || "Failed to load match details")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetails()

    // Set up real-time subscription for match updates
    const matchChannel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        () => {
          fetchMatchDetails()
        },
      )
      .subscribe()

    // Set up real-time subscription for match results
    const resultsChannel = supabase
      .channel(`match_results:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_results",
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchMatchDetails()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(matchChannel)
      supabase.removeChannel(resultsChannel)
    }
  }, [matchId, userId, supabase])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !match) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Match not found"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const matchResult = match.results && match.results.length > 0 ? match.results[0] : null
  const winnerTeam = matchResult ? participants.find((p) => p.team_id === matchResult.winner_team_id)?.team : null
  const loserTeam = matchResult ? participants.find((p) => p.team_id === matchResult.loser_team_id)?.team : null

  const getStatusBadge = () => {
    switch (match.status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "pending_confirmation":
        return <Badge variant="warning">Pending Confirmation</Badge>
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{match.status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">Match Details {getStatusBadge()}</CardTitle>
            <CardDescription>
              {match.match_type.charAt(0).toUpperCase() + match.match_type.slice(1)} match
            </CardDescription>
          </div>
          {canReportResult && (
            <Button asChild>
              <Link href={`/matches/${matchId}/report`}>
                <Trophy className="mr-2 h-4 w-4" />
                Report Result
              </Link>
            </Button>
          )}
          {canReportDispute && (
            <Button variant="outline" asChild>
              <Link href={`/matches/${matchId}/dispute`}>
                <Flag className="mr-2 h-4 w-4" />
                Report Dispute
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={match.game?.logo_url || ""} alt={match.game?.name} />
                <AvatarFallback>{match.game?.name?.[0] || "G"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{match.game?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {match.match_format === "bo1"
                    ? "Best of 1"
                    : match.match_format === "bo3"
                      ? "Best of 3"
                      : match.match_format === "bo5"
                        ? "Best of 5"
                        : match.match_format}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(match.start_time), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(match.start_time), "h:mm a")}</span>
              </div>
              {match.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{match.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {match.team_size}v{match.team_size}
                </span>
              </div>
            </div>
          </div>

          {matchResult ? (
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="font-medium mb-3">Match Result</h3>
              <div className="grid grid-cols-7 gap-2 items-center">
                <div className="col-span-3 text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={winnerTeam?.logo_url || ""} alt={winnerTeam?.name} />
                    <AvatarFallback>{winnerTeam?.name?.[0] || "W"}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{winnerTeam?.name}</p>
                  <Badge className="mt-1">Winner</Badge>
                </div>
                <div className="col-span-1 text-center text-2xl font-bold">
                  {matchResult.winner_score} - {matchResult.loser_score}
                </div>
                <div className="col-span-3 text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={loserTeam?.logo_url || ""} alt={loserTeam?.name} />
                    <AvatarFallback>{loserTeam?.name?.[0] || "L"}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{loserTeam?.name}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="font-medium mb-3">Teams</h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={participant.team?.logo_url || ""} alt={participant.team?.name} />
                      <AvatarFallback>{participant.team?.name?.[0] || "T"}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{participant.team?.name}</p>
                    {participant.team_id === userTeamId && (
                      <Badge variant="outline" className="ml-2">
                        Your Team
                      </Badge>
                    )}
                  </div>
                ))}
                {participants.length < 2 && (
                  <div className="text-sm text-muted-foreground">Waiting for opponent...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {match.match_notes && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">Match Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{match.match_notes}</p>
            </div>
          </>
        )}

        {!userIsParticipant && match.status === "scheduled" && (
          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link href={`/matches/${matchId}/join`}>Join Match</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
