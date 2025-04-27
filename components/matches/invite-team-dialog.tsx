"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Search, UserPlus } from "lucide-react"
import { addDays } from "date-fns"

interface InviteTeamDialogProps {
  matchId: string
  userId: string
  onInviteSent?: () => void
}

export default function InviteTeamDialog({ matchId, userId, onInviteSent }: InviteTeamDialogProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null)
  const [match, setMatch] = useState<any | null>(null)

  useEffect(() => {
    if (open) {
      // Reset states
      setError(null)
      setSuccess(null)
      setSearchQuery("")
      setSearchResults([])
      setSelectedTeam(null)

      // Fetch match details
      async function fetchMatch() {
        try {
          const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single()

          if (error) throw error
          setMatch(data)
        } catch (err: any) {
          console.error("Error fetching match:", err)
          setError("Failed to load match details")
        }
      }

      fetchMatch()
    }
  }, [open, matchId, supabase])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setSearchLoading(true)
      setError(null)

      // Get teams that are already participants
      const { data: participants, error: participantsError } = await supabase
        .from("match_participants")
        .select("team_id")
        .eq("match_id", matchId)

      if (participantsError) throw participantsError

      const participantTeamIds = participants.map((p) => p.team_id)

      // Get teams that are already invited
      const { data: invitations, error: invitationsError } = await supabase
        .from("match_invitations")
        .select("team_id")
        .eq("match_id", matchId)
        .in("status", ["pending", "accepted"])

      if (invitationsError) throw invitationsError

      const invitedTeamIds = invitations.map((i) => i.team_id)

      // Combine excluded team IDs
      const excludedTeamIds = [...participantTeamIds, ...invitedTeamIds]

      // Search for teams
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .not("id", "in", `(${excludedTeamIds.join(",")})`)
        .limit(10)

      if (error) throw error

      setSearchResults(data || [])
    } catch (err: any) {
      console.error("Error searching teams:", err)
      setError(err.message || "Failed to search teams")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!selectedTeam) {
      setError("Please select a team to invite")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Calculate acceptance deadline (24 hours from now)
      const acceptanceDeadline = addDays(new Date(), 1).toISOString()

      // Create invitation
      const { error } = await supabase.from("match_invitations").insert({
        match_id: matchId,
        team_id: selectedTeam.id,
        invited_by: userId,
        status: "pending",
        acceptance_deadline: acceptanceDeadline,
      })

      if (error) throw error

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${selectedTeam.name} has been invited to join the match.`,
        is_system: true,
      })

      setSuccess(`Invitation sent to ${selectedTeam.name}`)
      setSelectedTeam(null)
      setSearchQuery("")
      setSearchResults([])

      // If callback provided, call it
      if (onInviteSent) {
        onInviteSent()
      }

      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false)
      }, 2000)
    } catch (err: any) {
      console.error("Error inviting team:", err)
      setError(err.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team</DialogTitle>
          <DialogDescription>Search for a team to invite to this match</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button type="button" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((team) => (
                <div
                  key={team.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedTeam?.id === team.id ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={team.logo_url || ""} alt={team.name} />
                    <AvatarFallback>{team.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.members_count || 0} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !searchLoading ? (
            <p className="text-sm text-muted-foreground">No teams found</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleInvite} disabled={!selectedTeam || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
