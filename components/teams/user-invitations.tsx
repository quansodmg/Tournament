"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, RefreshCw, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UserInvitationsProps {
  userId: string
}

export function UserInvitations({ userId }: UserInvitationsProps) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchInvitations = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching invitations for user:", userId)

      const { data, error } = await supabase
        .from("team_invitations")
        .select(`
          *,
          team:team_id(id, name, logo_url, description)
        `)
        .eq("profile_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to fetch invitations: ${error.message}`)
      }

      console.log("Fetched invitations:", data?.length || 0)
      setInvitations(data || [])
    } catch (error) {
      console.error("Error fetching invitations:", error)
      setError("Failed to load team invitations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()

    // Set up real-time subscription
    const channel = supabase
      .channel("user_invitations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_invitations",
          filter: `profile_id=eq.${userId}`,
        },
        () => {
          fetchInvitations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleAcceptInvitation = async (invitationId: string, teamId: string) => {
    setProcessingId(invitationId)
    try {
      // Start a transaction using RPC (would be better, but we'll use multiple operations for now)

      // 1. Update invitation status
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId)

      if (updateError) throw updateError

      // 2. Add user to team members
      const invitation = invitations.find((inv) => inv.id === invitationId)
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: teamId,
        profile_id: userId,
        role: invitation.role,
      })

      if (memberError) throw memberError

      // Update local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))

      // Refresh the page to show updated teams
      router.refresh()
    } catch (error) {
      console.error("Error accepting invitation:", error)
      setError("Failed to accept invitation. Please try again.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    setProcessingId(invitationId)
    try {
      const { error } = await supabase.from("team_invitations").update({ status: "declined" }).eq("id", invitationId)

      if (error) throw error

      // Update local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } catch (error) {
      console.error("Error declining invitation:", error)
      setError("Failed to decline invitation. Please try again.")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={fetchInvitations}>
            <RefreshCw className="h-4 w-4 mr-1" /> Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (invitations.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">You don't have any pending team invitations</div>
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={invitation.team?.logo_url || ""} alt={invitation.team?.name} />
                <AvatarFallback>{invitation.team?.name?.[0]?.toUpperCase() || "T"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{invitation.team?.name || "Team"}</CardTitle>
                <CardDescription>
                  Invited as <Badge variant="outline">{invitation.role}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {invitation.team?.description && (
              <p className="text-sm text-muted-foreground mb-4">{invitation.team.description}</p>
            )}
            {invitation.message && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Message:</p>
                <p>{invitation.message}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeclineInvitation(invitation.id)}
              disabled={processingId === invitation.id}
            >
              {processingId === invitation.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => handleAcceptInvitation(invitation.id, invitation.team_id)}
              disabled={processingId === invitation.id}
            >
              {processingId === invitation.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Accept
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default UserInvitations
