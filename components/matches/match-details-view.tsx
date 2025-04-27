"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  GamepadIcon,
  MessageSquare,
  Settings,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatchChat from "./match-chat"
import MatchResultDisplay from "./match-result-display"
import MatchSetupStatus from "./match-setup-status"
import MatchParticipantsList from "./match-participants-list"
import ReportDisputeDialog from "./report-dispute-dialog"

interface MatchDetailsViewProps {
  match: any
  userId: string
  userProfile: any
  userTeamIds: string[]
  isParticipant: boolean
  chatMessages: any[]
}

export default function MatchDetailsView({
  match,
  userId,
  userProfile,
  userTeamIds,
  isParticipant,
  chatMessages,
}: MatchDetailsViewProps) {
  const supabase = createClient()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

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
      disputed: "destructive",
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
      disputed: "Disputed",
    }
    return names[status] || status
  }

  // Check if user can report results
  const canReportResults = isParticipant && match.status === "in_progress"

  // Check if user can report dispute
  const canReportDispute = isParticipant && match.status === "completed"

  // Check if user can join match
  const canJoinMatch = !isParticipant && match.status === "scheduled" && participants.length < 2

  // Check if user can setup match
  const canSetupMatch = isParticipant && match.status === "scheduled" && participants.length === 2

  // Get user's team in this match
  const userTeam = participants.find((p) => userTeamIds.includes(p.team_id))?.team

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" size="sm" asChild className="gap-1">
          <Link href="/matches">
            <ChevronLeft className="h-4 w-4" />
            Back to Matches
          </Link>
        </Button>

        <Badge variant={getStatusVariant(match.status)} className="text-sm px-3 py-1">
          {getStatusName(match.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {match.game && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={match.game.logo_url || ""} alt={match.game.name} />
                        <AvatarFallback>{match.game.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <Badge variant="outline">{match.match_type}</Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl">
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
                  <CardDescription className="text-base mt-1">
                    {match.game?.name} • {getMatchFormatName(match.match_format)}
                  </CardDescription>
                </div>

                {match.status === "completed" && match.match_results && match.match_results.length > 0 && (
                  <div className="bg-secondary rounded-lg px-6 py-3 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Final Score</div>
                    <div className="text-2xl font-bold">
                      {match.match_results[0].winner_score} - {match.match_results[0].loser_score}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Match Details</h3>
                    <div className="space-y-3">
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
                          <span>{match.location}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 opacity-70" />
                        <span>Team Size: {match.team_size || "Standard"}</span>
                      </div>

                      {match.game_mode && (
                        <div className="flex items-center text-sm">
                          <GamepadIcon className="mr-2 h-4 w-4 opacity-70" />
                          <span>Game Mode: {match.game_mode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {match.match_notes && (
                    <div>
                      <h3 className="font-medium mb-2">Match Notes</h3>
                      <p className="text-sm text-muted-foreground">{match.match_notes}</p>
                    </div>
                  )}

                  {match.status === "disputed" && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-700">Match Disputed</h4>
                          <p className="text-sm text-red-600">
                            This match has been disputed. An admin will review the case and make a decision.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <MatchParticipantsList
                participants={participants}
                matchResults={match.match_results}
                userTeamIds={userTeamIds}
              />
            </CardContent>

            <CardFooter className="flex flex-wrap gap-3 pt-2">
              {canJoinMatch && (
                <Button asChild>
                  <Link href={`/matches/${match.id}/join`}>Join Match</Link>
                </Button>
              )}

              {canSetupMatch && (
                <Button asChild>
                  <Link href={`/matches/${match.id}/setup`}>Setup Match</Link>
                </Button>
              )}

              {canReportResults && (
                <Button asChild>
                  <Link href={`/matches/${match.id}/report`}>Report Results</Link>
                </Button>
              )}

              {canReportDispute && userTeam && (
                <ReportDisputeDialog matchId={match.id} userId={userId} teamId={userTeam.id} />
              )}
            </CardFooter>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              {match.status === "scheduled" && participants.length === 2 && <MatchSetupStatus match={match} />}

              {match.status === "completed" && match.match_results && match.match_results.length > 0 && (
                <MatchResultDisplay match={match} />
              )}

              {/* Additional match details can go here */}
            </TabsContent>

            <TabsContent value="chat" className="pt-4">
              <MatchChat matchId={match.id} userId={userId} userProfile={userProfile} initialMessages={chatMessages} />
            </TabsContent>

            <TabsContent value="settings" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Match Settings</CardTitle>
                  <CardDescription>Configuration and rules for this match</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {match.match_settings ? (
                    <div className="space-y-4">
                      {match.match_settings.selected_maps && match.match_settings.selected_maps.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Selected Maps</h3>
                          <div className="flex flex-wrap gap-2">
                            {match.match_settings.selected_maps.map((map: string) => (
                              <Badge key={map} variant="secondary">
                                {map}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {match.match_settings.rules && (
                        <div>
                          <h3 className="font-medium mb-2">Rules</h3>
                          <p className="text-sm text-muted-foreground">{match.match_settings.rules}</p>
                        </div>
                      )}

                      {match.match_settings.settings && (
                        <div>
                          <h3 className="font-medium mb-2">Game Settings</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(match.match_settings.settings).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}: </span>
                                <span className="text-muted-foreground">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No custom settings for this match.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Actions</CardTitle>
              <CardDescription>Available actions for this match</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/matches">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Matches
                  </Link>
                </Button>

                {canJoinMatch && (
                  <Button asChild className="justify-start">
                    <Link href={`/matches/${match.id}/join`}>
                      <Users className="mr-2 h-4 w-4" />
                      Join Match
                    </Link>
                  </Button>
                )}

                {canSetupMatch && (
                  <Button asChild className="justify-start">
                    <Link href={`/matches/${match.id}/setup`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Setup Match
                    </Link>
                  </Button>
                )}

                {canReportResults && (
                  <Button asChild className="justify-start">
                    <Link href={`/matches/${match.id}/report`}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Report Results
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="justify-start" onClick={() => setActiveTab("chat")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Match Chat
                </Button>

                {canReportDispute && userTeam && (
                  <ReportDisputeDialog
                    matchId={match.id}
                    userId={userId}
                    teamId={userTeam.id}
                    buttonProps={{
                      variant: "outline",
                      className: "justify-start w-full",
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {match.game && (
            <Card>
              <CardHeader>
                <CardTitle>Game Information</CardTitle>
                <CardDescription>{match.game.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={match.game.logo_url || ""} alt={match.game.name} />
                    <AvatarFallback>{match.game.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{match.game.name}</h3>
                    {match.game.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{match.game.description}</p>
                    )}
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href={`/games/${match.game.slug}`}>View Game Details</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Additional sidebar components can go here */}
        </div>
      </div>
    </div>
  )
}
