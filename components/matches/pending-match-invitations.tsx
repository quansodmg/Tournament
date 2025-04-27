"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface PendingMatchInvitationsProps {
  userId: string
  matchId: string
}

export default function PendingMatchInvitations({ userId, matchId }: PendingMatchInvitationsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitations, setInvitations] = useState<any[]>([])

  useEffect(() => {
    async function fetchInvitations() {
      try {
        setLoading(true)

        // Fetch pending invitations for this match
        const { data, error } = await supabase
          .from("match_invitations")
          .select(`
            *,
            team:team_id(*)
          `)
          .eq("match_id", matchId)
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
      .channel(`match_invitations:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_invitations",
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchInvitations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      // Delete invitation
      const { error } = await supabase.from("match_invitations").delete().eq("id", invitationId)

      if (error) throw error

      // Update local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } catch (err: any) {
      console.error("Error canceling invitation:", err)
      setError(err.message || "Failed to cancel invitation")
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
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Teams that have been invited to this match</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={invitation.team?.logo_url || ""} alt={invitation.team?.name} />
                  <AvatarFallback>{invitation.team?.name?.[0] || "T"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{invitation.team?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Invited {format(new Date(invitation.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Pending</Badge>
                <Button variant="ghost" size="sm" onClick={() => handleCancelInvitation(invitation.id)}>
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
