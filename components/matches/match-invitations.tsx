"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

interface MatchInvitationsProps {
  invitations: any[]
  userId?: string
}

export default function MatchInvitations({ invitations, userId }: MatchInvitationsProps) {
  const supabase = createClient()
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [localInvitations, setLocalInvitations] = useState(invitations)

  const handleAccept = async (invitation: any) => {
    if (!userId) return

    try {
      setProcessingIds((prev) => [...prev, invitation.id])

      // Update invitation status
      const { error: updateError } = await supabase
        .from("match_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Add team to match participants
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: invitation.match_id,
        team_id: invitation.team_id,
        joined_at: new Date().toISOString(),
      })

      if (participantError) throw participantError

      // Remove from local state
      setLocalInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id))

      toast({
        title: "Invitation accepted",
        description: `Your team has joined the match scheduled for ${format(new Date(invitation.match.start_time), "MMM d, h:mm a")}`,
      })
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast({
        title: "Error",
        description: "Failed to accept the invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== invitation.id))
    }
  }

  const handleDecline = async (invitation: any) => {
    try {
      setProcessingIds((prev) => [...prev, invitation.id])

      // Update invitation status
      const { error } = await supabase.from("match_invitations").update({ status: "declined" }).eq("id", invitation.id)

      if (error) throw error

      // Remove from local state
      setLocalInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id))

      toast({
        title: "Invitation declined",
        description: "The match invitation has been declined.",
      })
    } catch (error) {
      console.error("Error declining invitation:", error)
      toast({
        title: "Error",
        description: "Failed to decline the invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== invitation.id))
    }
  }

  if (localInvitations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Invitations</CardTitle>
        <CardDescription>You have pending invitations to join matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {invitation.match?.game?.name || "Match"} -{" "}
                  {format(new Date(invitation.match.start_time), "MMM d, h:mm a")}
                </p>
                <p className="text-sm text-muted-foreground">Team: {invitation.team?.name || "Unknown Team"}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation)}
                  disabled={processingIds.includes(invitation.id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation)}
                  disabled={processingIds.includes(invitation.id)}
                >
                  <X className="h-4 w-4 mr-1" /> Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
