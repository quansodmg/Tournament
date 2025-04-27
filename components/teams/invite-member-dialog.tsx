"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"

interface InviteMemberDialogProps {
  teamId: string
  teamName: string
  onInviteSent?: () => void
}

export default function InviteMemberDialog({ teamId, teamName, onInviteSent }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [role, setRole] = useState("member")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleInvite = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Find the user by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.trim())
        .single()

      if (profileError) {
        setError("User not found")
        return
      }

      // Check if user is already a member of the team
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("profile_id", profile.id)
        .single()

      if (existingMember) {
        setError("This user is already a member of your team")
        return
      }

      // Check if there's already a pending invitation
      const { data: existingInvitation } = await supabase
        .from("team_invitations")
        .select("id, status")
        .eq("team_id", teamId)
        .eq("profile_id", profile.id)
        .eq("status", "pending")
        .single()

      if (existingInvitation) {
        setError("An invitation has already been sent to this user")
        return
      }

      // Create the invitation
      const { error: inviteError } = await supabase.from("team_invitations").insert({
        team_id: teamId,
        profile_id: profile.id,
        role,
        message: message.trim() || null,
      })

      if (inviteError) {
        throw inviteError
      }

      setSuccess(true)
      if (onInviteSent) {
        onInviteSent()
      }

      // Reset form after successful invitation
      setTimeout(() => {
        setUsername("")
        setRole("member")
        setMessage("")
        setOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (error: any) {
      console.error("Error sending invitation:", error)
      setError(error.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Player to {teamName}</DialogTitle>
          <DialogDescription>
            Send an invitation to a player to join your team. They will receive a notification and can accept or
            decline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Invitation sent successfully!</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter player's username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="captain">Captain</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleInvite} disabled={loading || success}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
