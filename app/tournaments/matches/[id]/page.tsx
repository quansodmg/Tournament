import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import MatchResultForm from "@/components/tournaments/match-result-form"
import { ErrorBoundary } from "@/components/error-boundary"

export default function MatchPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <MatchContent params={params} />
    </ErrorBoundary>
  )
}

async function MatchContent({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get session for conditional rendering
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get match details
  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      tournament:tournament_id(
        id,
        name,
        slug,
        created_by
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Check if user is the tournament creator
  const isOrganizer = session.user.id === match.tournament.created_by

  // Get match participants
  const { data: participants } = await supabase
    .from("match_participants")
    .select(`
      *,
      team:team_id(id, name, logo_url),
      profile:profile_id(id, username, avatar_url)
    `)
    .eq("match_id", match.id)

  // Format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled"

    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href={`/tournaments/${match.tournament.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournament
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2">
                    {match.status === "completed"
                      ? "Completed"
                      : match.status === "scheduled"
                        ? "Scheduled"
                        : "Pending"}
                  </Badge>
                  <CardTitle className="text-2xl">
                    Match {match.match_number} • Round {match.round}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Start Time</h3>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(match.start_time)}</span>
                  </div>
                </div>
                {match.end_time && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">End Time</h3>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{formatDate(match.end_time)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Participants</h3>
                {participants && participants.length > 0 ? (
                  <div className="space-y-4">
                    {participants.map((participant) => {
                      const isTeam = !!participant.team_id
                      const name = isTeam ? participant.team?.name : participant.profile?.username
                      const image = isTeam ? participant.team?.logo_url : participant.profile?.avatar_url
                      const initial = name ? name[0].toUpperCase() : "?"

                      return (
                        <div
                          key={participant.id}
                          className={`flex items-center justify-between p-4 rounded-md ${
                            participant.result === "win"
                              ? "bg-green-500/10 border border-green-500/30"
                              : participant.result === "loss"
                                ? "bg-red-500/10 border border-red-500/30 opacity-75"
                                : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={image || ""} alt={name} />
                              <AvatarFallback>{initial}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{name || "TBD"}</span>
                          </div>

                          <div className="flex items-center">
                            {participant.score !== null && (
                              <Badge
                                variant={participant.result === "win" ? "default" : "outline"}
                                className="text-lg px-3 py-1"
                              >
                                {participant.score}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">No participants assigned to this match yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {isOrganizer && match.status === "scheduled" && participants && participants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Update Match Result</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchResultForm match={match} participants={participants} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
