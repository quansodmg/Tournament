"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, Check, X, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface MatchAcceptanceDetailsProps {
  matchId: string
  userId: string
}

export default function MatchAcceptanceDetails({ matchId, userId }: MatchAcceptanceDetailsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<any>(null)
  const [opponentTeam, setOpponentTeam] = useState<any>(null)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [declineLoading, setDeclineLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatchDetails() {
      try {
        setLoading(true)

        // Get user's teams
        const { data: userTeams, error: teamsError } = await supabase
          .from("team_members")
          .select("team_id, role")
          .eq("profile_id", userId)

        if (teamsError) throw teamsError

        // Get match invitation
        const { data: invitationData, error: invitationError } = await supabase
          .from("match_invitations")
          .select(`
            *,
            match:match_id(*),
            team:team_id(*)
          `)
          .eq("match_id", matchId)
          .in(
            "team_id",
            userTeams.map((t) => t.team_id),
          )
          .eq("status", "pending")
          .maybeSingle()

        if (invitationError) throw invitationError

        if (!invitationData) {
          setError("No pending invitation found for this match")
          setLoading(false)
          return
        }

        setInvitation(invitationData)
        setMatch(invitationData.match)
        setUserTeam(invitationData.team)

        // Get opponent team
        const { data: participants, error: participantsError } = await supabase
          .from("match_participants")
          .select("*, team:team_id(*)")
          .eq("match_id", matchId)
          .single()

        if (!participantsError && participants) {
          setOpponentTeam(participants.team)
        }

        // Calculate time remaining
        if (invitationData.acceptance_deadline) {
          const deadline = new Date(invitationData.acceptance_deadline)
          const now = new Date()

          if (deadline > now) {
            setTimeRemaining(formatDistanceToNow(deadline, { addSuffix: false }))

            // Update time remaining every minute
            const interval = setInterval(() => {
              const now = new Date()
              if (deadline > now) {
                setTimeRemaining(formatDistanceToNow(deadline, { addSuffix: false }))
              } else {
                setTimeRemaining("Expired")
                clearInterval(interval)
              }
            }, 60000)

            return () => clearInterval(interval)
          } else {
            setTimeRemaining("Expired")
          }
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

  const handleAccept = async () => {
    try {
      setAcceptLoading(true)
      setError(null)

      // Check if user is team captain or owner
      const { data: teamMember, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", userTeam.id)
        .eq("profile_id", userId)
        .single()

      if (memberError) throw memberError

      if (!["owner", "captain"].includes(teamMember.role)) {
        setError("Only team captains can accept match invitations")
        return
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from("match_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Add team as match participant
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: matchId,
        team_id: userTeam.id,
      })

      if (participantError) throw participantError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${userTeam.name} has accepted the match invitation.`,
        is_system: true,
      })

      // Redirect to match setup page
      router.push(`/matches/${matchId}/setup`)
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      setError(err.message || "Failed to accept invitation")
    } finally {
      setAcceptLoading(false)
    }
  }

  const handleDecline = async () => {
    try {
      setDeclineLoading(true)
      setError(null)

      // Check if user is team captain or owner
      const { data: teamMember, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", userTeam.id)
        .eq("profile_id", userId)
        .single()

      if (memberError) throw memberError

      if (!["owner", "captain"].includes(teamMember.role)) {
        setError("Only team captains can decline match invitations")
        return
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from("match_invitations")
        .update({ status: "declined" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${userTeam.name} has declined the match invitation.`,
        is_system: true,
      })

      // Redirect to matches page
      router.push("/matches")
    } catch (err: any) {
      console.error("Error declining invitation:", err)
      setError(err.message || "Failed to decline invitation")
    } finally {
      setDeclineLoading(false)
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

  if (!invitation || !match) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>No pending invitation found for this match</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const isExpired = timeRemaining === "Expired"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Match Invitation</CardTitle>
            <CardDescription>You've been invited to participate in a match</CardDescription>
          </div>
          {timeRemaining && (
            <div className="flex items-center">
              <Clock className={`h-4 w-4 mr-1 ${isExpired ? "text-red-500" : "text-amber-500"}`} />
              <span className={`text-sm ${isExpired ? "text-red-500" : "text-amber-500"}`}>
                {isExpired ? "Expired" : `${timeRemaining} remaining`}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* User Team */}
          <div className="md:col-span-3">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={userTeam?.logo_url || ""} alt={userTeam?.name || "Your Team"} />
                <AvatarFallback>{(userTeam?.name || "T1")[0]}</AvatarFallback>
              </Avatar>
              <p className="font-medium text-center">{userTeam?.name || "Your Team"}</p>
            </div>
          </div>

          {/* VS */}
          <div className="md:col-span-1 flex justify-center">
            <span className="text-xl font-bold">VS</span>
          </div>

          {/* Opponent Team */}
          <div className="md:col-span-3">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={opponentTeam?.logo_url || ""} alt={opponentTeam?.name || "Opponent"} />
                <AvatarFallback>{(opponentTeam?.name || "T2")[0]}</AvatarFallback>
              </Avatar>
              <p className="font-medium text-center">{opponentTeam?.name || "Opponent Team"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Match Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Game:</span>
                <span>{match.game?.name || "Unknown Game"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Match Type:</span>
                <Badge>{match.match_type || "Standard"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform:</span>
                <span>{match.platform || "Any"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Invitation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invited By:</span>
                <span>{invitation.invited_by?.username || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invited At:</span>
                <span>{new Date(invitation.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline">{invitation.status}</Badge>
              </div>
            </div>
          </div>
        </div>

        {isExpired ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This invitation has expired. Please contact the match organizer if you still want to participate.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertDescription>
              By accepting this invitation, your team will be added to the match. You'll need to complete the match
              setup process.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleDecline} disabled={declineLoading || isExpired}>
          {declineLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Declining...
            </>
          ) : (
            <>
              <X className="mr-2 h-4 w-4" />
              Decline
            </>
          )}
        </Button>
        <Button onClick={handleAccept} disabled={acceptLoading || isExpired}>
          {acceptLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Accept
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
