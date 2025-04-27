"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PendingInvitationsProps {
  teamId: string
}

export default function PendingInvitations({ teamId }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("team_invitations")
          .select(`
            *,
            profile:profile_id(id, username, avatar_url)
          `)
          .eq("team_id", teamId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (error) throw error
        setInvitations(data || [])
      } catch (error) {
        console.error("Error fetching invitations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()

    // Set up real-time subscription
    const channel = supabase
      .channel("team_invitations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_invitations",
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

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId)
    try {
      const { error } = await supabase.from("team_invitations").update({ status: "canceled" }).eq("id", invitationId)

      if (error) throw error

      // Update local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } catch (error) {
      console.error("Error cancelling invitation:", error)
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (invitations.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No pending invitations</div>
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={invitation.profile.avatar_url || ""} alt={invitation.profile.username} />
                  <AvatarFallback>{invitation.profile.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{invitation.profile.username}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{invitation.role}</Badge>
                    <p className="text-xs text-muted-foreground">
                      Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelInvitation(invitation.id)}
                disabled={cancellingId === invitation.id}
              >
                {cancellingId === invitation.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span className="sr-only">Cancel invitation</span>
              </Button>
            </div>
            {invitation.message && (
              <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">{invitation.message}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
