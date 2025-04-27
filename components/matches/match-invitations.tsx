"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Check, X, Clock, AlertCircle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface MatchInvitationsProps {
  invitations: any[]
  userId: string
}

export default function MatchInvitations({ invitations, userId }: MatchInvitationsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  if (invitations.length === 0) return null

  const handleAccept = async (invitation: any) => {
    try {
      setLoading((prev) => ({ ...prev, [invitation.id]: true }))
      setError(null)

      // Check if user is team captain or owner
      const { data: teamMember, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", invitation.team_id)
        .eq("profile_id", userId)
        .single()

      if (memberError) throw memberError

      if (!["owner", "captain"].includes(teamMember.role)) {
        throw new Error("Only team captains can accept match invitations")
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from("match_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Add team as match participant
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: invitation.match_id,
        team_id: invitation.team_id,
      })

      if (participantError) throw participantError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: invitation.match_id,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${invitation.team.name} has accepted the match invitation.`,
        is_system: true,
      })

      // Redirect to match setup page
      router.push(`/matches/${invitation.match_id}/setup`)
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      setError(err.message || "Failed to accept invitation")
    } finally {
      setLoading((prev) => ({ ...prev, [invitation.id]: false }))
    }
  }

  const handleDecline = async (invitation: any) => {
    try {
      setLoading((prev) => ({ ...prev, [invitation.id]: true }))
      setError(null)

      // Check if user is team captain or owner
      const { data: teamMember, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", invitation.team_id)
        .eq("profile_id", userId)
        .single()

      if (memberError) throw memberError

      if (!["owner", "captain"].includes(teamMember.role)) {
        throw new Error("Only team captains can decline match invitations")
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from("match_invitations")
        .update({ status: "declined" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: invitation.match_id,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${invitation.team.name} has declined the match invitation.`,
        is_system: true,
      })

      // Refresh the page
      router.refresh()
    } catch (err: any) {
      console.error("Error declining invitation:", err)
      setError(err.message || "Failed to decline invitation")
    } finally {
      setLoading((prev) => ({ ...prev, [invitation.id]: false }))
    }
  }

  return (
    <Card className="border-amber-500/50 bg-amber-50/10">
      <CardHeader>
        <CardTitle>Pending Match Invitations</CardTitle>
        <CardDescription>
          You have {invitations.length} pending match invitation{invitations.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {invitations.map((invitation) => {
            const isExpired = invitation.acceptance_deadline && new Date(invitation.acceptance_deadline) < new Date()
            const timeRemaining =
              invitation.acceptance_deadline && !isExpired
                ? formatDistanceToNow(new Date(invitation.acceptance_deadline), { addSuffix: false })
                : null

            return (
              <div
                key={invitation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/50 rounded-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={invitation.team?.logo_url || ""} alt={invitation.team?.name || "Team"} />
                    <AvatarFallback>{invitation.team?.name?.[0] || "T"}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{invitation.team?.name}</h4>
                      <Badge variant="outline">Invited</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Match on {format(new Date(invitation.match.start_time), "PPP 'at' p")}
                    </p>
                    {timeRemaining && (
                      <div className="flex items-center mt-1 text-xs">
                        <Clock className={`h-3 w-3 mr-1 ${isExpired ? "text-red-500" : "text-amber-500"}`} />
                        <span className={isExpired ? "text-red-500" : "text-amber-500"}>
                          {isExpired ? "Expired" : `${timeRemaining} remaining`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(invitation)}
                    disabled={loading[invitation.id] || isExpired}
                  >
                    {loading[invitation.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Decline
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleAccept(invitation)}
                    disabled={loading[invitation.id] || isExpired}
                  >
                    {loading[invitation.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
