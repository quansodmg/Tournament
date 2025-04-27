"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Calendar, Users, MapPin, Shield } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import MatchStatistics from "./match-statistics"
import MapVetoSystem from "./map-veto-system"
import InviteTeamDialog from "./invite-team-dialog"
import PendingMatchInvitations from "./pending-match-invitations"

interface EnhancedMatchDetailsProps {
  matchId: string
  userId: string
}

export default function EnhancedMatchDetails({ matchId, userId }: EnhancedMatchDetailsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<any>(null)
  const [opponentTeam, setOpponentTeam] = useState<any>(null)
  const [isScheduler, setIsScheduler] = useState(false)
  const [isParticipant, setIsParticipant] = useState(false)
  const [selectedMaps, setSelectedMaps] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function fetchMatchDetails() {
      try {
        setLoading(true)

        // Get match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            settings:match_settings(*),
            participants:match_participants(
              *,
              team:team_id(
                *,
                members:team_members(
                  profile_id,
                  role
                )
              )
            ),
            results:match_results(*)
          `)
          .eq("id", matchId)
          .single()

        if (matchError) throw matchError
        setMatch(matchData)

        // Check if user is the scheduler
        setIsScheduler(matchData.created_by === userId)

        // Find user's team and opponent team
        let userTeamData = null
        let opponentTeamData = null

        for (const participant of matchData.participants) {
          const isUserInTeam = participant.team?.members?.some((m: any) => m.profile_id === userId)

          if (isUserInTeam) {
            userTeamData = participant
            setIsParticipant(true)
          } else {
            opponentTeamData = participant
          }
        }

        setUserTeam(userTeamData)
        setOpponentTeam(opponentTeamData)

        // Get selected maps
        if (matchData.settings?.selected_maps) {
          setSelectedMaps(matchData.settings.selected_maps)
        }
      } catch (err: any) {
        console.error("Error fetching match details:", err)
        setError(err.message || "Failed to load match details")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetails()
  }, [matchId, userId, supabase])

  const handleMapSelectionComplete = async (maps: string[]) => {
    try {
      // Update match settings with selected maps
      const { error } = await supabase.from("match_settings").update({ selected_maps: maps }).eq("match_id", matchId)

      if (error) throw error

      setSelectedMaps(maps)

      // Refresh match data
      router.refresh()
    } catch (err: any) {
      console.error("Error updating selected maps:", err)
      setError(err.message || "Failed to update selected maps")
    }
  }

  const handleStartMatch = async () => {
    try {
      // Update match status to in_progress
      const { error } = await supabase
        .from("matches")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", matchId)

      if (error) throw error

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: "Match has started! Good luck and have fun!",
        is_system: true,
      })

      // Refresh match data
      router.refresh()
    } catch (err: any) {
      console.error("Error starting match:", err)
      setError(err.message || "Failed to start match")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!match) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>Match not found</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const startTime = match.start_time ? new Date(match.start_time) : null
  const formattedStartTime = startTime ? format(startTime, "EEEE, MMMM d, yyyy 'at' h:mm a") : "Not scheduled"
  const isMatchPending = match.status === "pending"
  const isMatchInProgress = match.status === "in_progress"
  const isMatchCompleted = ["completed", "pending_confirmation", "disputed"].includes(match.status)
  const canStartMatch = (isScheduler || isParticipant) && isMatchPending && startTime && new Date() >= startTime
  const canReportResult = (isScheduler || isParticipant) && isMatchInProgress
  const showMapVeto = isMatchPending && userTeam && opponentTeam && selectedMaps.length === 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge>{match.match_type}</Badge>
                <Badge variant={isMatchCompleted ? "outline" : "secondary"}>{match.status.replace(/_/g, " ")}</Badge>
                {match.is_private && <Badge variant="outline">Private</Badge>}
              </div>
              <CardTitle>{match.game?.name || "Match"}</CardTitle>
              <CardDescription>{formattedStartTime}</CardDescription>
            </div>
            <div className="flex space-x-2">
              {canStartMatch && <Button onClick={handleStartMatch}>Start Match</Button>}
              {canReportResult && (
                <Button asChild>
                  <Link href={`/matches/${matchId}/report`}>Report Result</Link>
                </Button>
              )}
              {isScheduler && isMatchPending && (
                <Button variant="outline" asChild>
                  <Link href={`/matches/${matchId}/edit`}>Edit Match</Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            {/* Team 1 */}
            <div className="md:col-span-3 bg-secondary p-4 rounded-lg">
              {userTeam ? (
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={userTeam.team?.logo_url || ""} alt={userTeam.team?.name || "Team 1"} />
                    <AvatarFallback className="text-xl">{(userTeam.team?.name || "T1")[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-center">{userTeam.team?.name || "Your Team"}</h2>
                  {userTeam.result && (
                    <Badge className="mt-2" variant={userTeam.result === "win" ? "default" : "outline"}>
                      {userTeam.result === "win" ? "Winner" : userTeam.result}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarFallback>T1</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">Waiting for team...</p>
                </div>
              )}
            </div>

            {/* VS */}
            <div className="md:col-span-1 flex items-center justify-center">
              <div className="text-2xl font-bold">VS</div>
            </div>

            {/* Team 2 */}
            <div className="md:col-span-3 bg-secondary p-4 rounded-lg">
              {opponentTeam ? (
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={opponentTeam.team?.logo_url || ""} alt={opponentTeam.team?.name || "Team 2"} />
                    <AvatarFallback className="text-xl">{(opponentTeam.team?.name || "T2")[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-center">{opponentTeam.team?.name || "Opponent Team"}</h2>
                  {opponentTeam.result && (
                    <Badge className="mt-2" variant={opponentTeam.result === "win" ? "default" : "outline"}>
                      {opponentTeam.result === "win" ? "Winner" : opponentTeam.result}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarFallback>T2</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">Waiting for team...</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Game</h3>
              </div>
              <p className="text-muted-foreground">{match.game?.name || "Unknown Game"}</p>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Game Mode</h3>
              </div>
              <p className="text-muted-foreground">{match.settings?.settings?.gameMode || "Standard"}</p>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Platform</h3>
              </div>
              <p className="text-muted-foreground">{match.platform || "Any"}</p>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Ruleset</h3>
              </div>
              <p className="text-muted-foreground">{match.settings?.ruleset_id || "Standard"}</p>
            </div>
          </div>

          {isScheduler && match.participants?.length < 2 && (
            <div className="mb-6">
              <InviteTeamDialog matchId={matchId} />
            </div>
          )}

          {showMapVeto && userTeam && opponentTeam && (
            <div className="mb-6">
              <MapVetoSystem
                matchId={matchId}
                teamId={userTeam.team_id}
                opponentTeamId={opponentTeam.team_id}
                gameMode={match.settings?.settings?.gameMode || "tdm"}
                availableMaps={[]}
                vetoType="standard"
                onComplete={handleMapSelectionComplete}
              />
            </div>
          )}

          {selectedMaps.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Selected Maps</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMaps.map((map) => (
                  <Badge key={map} variant="outline">
                    {map}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          {isScheduler && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          {isMatchCompleted ? (
            <MatchStatistics matchId={matchId} userId={userId} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Match Overview</CardTitle>
                <CardDescription>
                  {isMatchPending ? "Match has not started yet" : "Match is in progress"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {match.description || "No description provided for this match."}
                    </p>
                  </div>

                  {match.settings?.settings && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">Match Settings</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(match.settings.settings).map(([key, value]) => (
                            <div key={key}>
                              <dt className="text-sm text-muted-foreground">{key}</dt>
                              <dd>{String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="participants" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Participants</CardTitle>
            </CardHeader>
            <CardContent>
              {match.participants && match.participants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {match.participants.map((participant: any) => (
                    <div key={participant.id} className="bg-secondary p-4 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={participant.team?.logo_url || ""} alt={participant.team?.name} />
                          <AvatarFallback>{participant.team?.name?.[0] || "T"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.team?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {format(new Date(participant.joined_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      {participant.team?.members && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Team Members</h4>
                          <div className="flex flex-wrap gap-2">
                            {participant.team.members.map((member: any) => (
                              <Badge key={member.profile_id} variant="outline">
                                {member.profile?.username || member.profile_id}
                                {member.role === "captain" && " (Captain)"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>No participants have joined this match yet.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isScheduler && (
          <TabsContent value="invitations" className="pt-4">
            <PendingMatchInvitations matchId={matchId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
