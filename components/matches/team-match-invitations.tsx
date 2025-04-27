"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Calendar, Clock } from "lucide-react"
import { format, isPast } from "date-fns"
import Link from "next/link"

interface TeamMatchInvitationsProps {
  teamId: string
  userId: string
  isTeamOwner: boolean
}

export default function TeamMatchInvitations({ teamId, userId, isTeamOwner }: TeamMatchInvitationsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvitations() {
      try {
        setLoading(true)

        // Fetch pending invitations for this team
        const { data, error } = await supabase
          .from("match_invitations")
          .select(`
            *,
            match:match_id(
              *,
              game:game_id(*),
              participants:match_participants(
                team:team_id(*)
              )
            ),
            invited_by_profile:invited_by(username, avatar_url)
          `)
          .eq("team_id", teamId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (error) throw error

        setInvitations(data || [])
      } catch (err: any) {
        console.error("Error fetching invitations:", err)
        setError(err.message || "Failed to load invitations")
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()

    // Set up real-time subscription
    const channel = supabase
      .channel(`team_invitations:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_invitations",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchInvitations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, supabase])

  const handleAccept = async (invitationId: string, matchId: string) => {
    if (!isTeamOwner) return

    try {
      setActionLoading(invitationId)

      // Update invitation status
      const { error: invitationError } = await supabase
        .from("match_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId)

      if (invitationError) throw invitationError

      // Add team as match participant
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: matchId,
        team_id: teamId,
        status: "accepted",
      })

      if (participantError) throw participantError

      // Add system message to match chat
      const invitation = invitations.find((inv) => inv.id === invitationId)
      const teamName = invitation?.match?.participants?.[0]?.team?.name || "Team"

      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${teamName} has accepted the invitation and joined the match.`,
        is_system: true,
      })

      // Remove from local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      setError(err.message || "Failed to accept invitation")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (invitationId: string, matchId: string) => {
    if (!isTeamOwner) return

    try {
      setActionLoading(invitationId)

      // Update invitation status
      const { error } = await supabase.from("match_invitations").update({ status: "declined" }).eq("id", invitationId)

      if (error) throw error

      // Add system message to match chat
      const invitation = invitations.find((inv) => inv.id === invitationId)
      const teamName = invitation?.match?.participants?.[0]?.team?.name || "Team"

      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${teamName} has declined the invitation.`,
        is_system: true,
      })

      // Remove from local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } catch (err: any) {
      console.error("Error declining invitation:", err)
      setError(err.message || "Failed to decline invitation")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[100px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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

  if (invitations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Invitations</CardTitle>
        <CardDescription>Pending invitations for your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const match = invitation.match
            const opponent = match?.participants?.[0]?.team
            const isExpired = isPast(new Date(invitation.acceptance_deadline))

            return (
              <div key={invitation.id} className="bg-secondary p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={match?.game?.logo_url || ""} alt={match?.game?.name} />
                      <AvatarFallback>{match?.game?.name?.[0] || "G"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{match?.game?.name}</p>
                        <Badge className="ml-2" variant="outline">
                          {match?.match_type.charAt(0).toUpperCase() + match?.match_type.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-2">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(match?.start_time), "MMM d")}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(match?.start_time), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/matches/${match?.id}`}>
                    <Button variant="outline" size="sm">
                      View Match
                    </Button>
                  </Link>
                </div>

                <div className="bg-background p-3 rounded-md mb-3">
                  <p className="text-sm mb-1">Opponent:</p>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={opponent?.logo_url || ""} alt={opponent?.name} />
                      <AvatarFallback>{opponent?.name?.[0] || "T"}</AvatarFallback>
                    </Avatar>
                    <span>{opponent?.name || "Unknown Team"}</span>
                  </div>
                </div>

                {isExpired ? (
                  <Alert>
                    <AlertDescription>This invitation has expired.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDecline(invitation.id, match.id)}
                      disabled={!isTeamOwner || actionLoading === invitation.id}
                    >
                      {actionLoading === invitation.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAccept(invitation.id, match.id)}
                      disabled={!isTeamOwner || actionLoading === invitation.id}
                    >
                      {actionLoading === invitation.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
