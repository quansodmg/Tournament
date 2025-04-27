"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Flag } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReportDisputeDialogProps {
  matchId: string
  userId: string
  teamId: string
}

export default function ReportDisputeDialog({ matchId, userId, teamId }: ReportDisputeDialogProps) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for the dispute")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create dispute
      const { error: disputeError } = await supabase.from("disputes").insert({
        match_id: matchId,
        reported_by: userId,
        team_id: teamId,
        reason: reason,
        status: "pending",
      })

      if (disputeError) throw disputeError

      // Update match status
      const { error: matchError } = await supabase.from("matches").update({ status: "disputed" }).eq("id", matchId)

      if (matchError) throw matchError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: "A dispute has been reported for this match. An admin will review the case.",
        is_system: true,
      })

      // Close dialog and refresh page
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error("Error reporting dispute:", err)
      setError(err.message || "Failed to report dispute")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Flag className="h-4 w-4 mr-2" />
          Report Dispute
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Match Dispute</DialogTitle>
          <DialogDescription>
            If you believe the reported match result is incorrect, you can file a dispute for admin review.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="reason">Reason for Dispute</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you're disputing this match result..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
