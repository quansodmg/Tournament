"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface MatchResultFormProps {
  match: any
  participants: any[]
}

export default function MatchResultForm({ match, participants }: MatchResultFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    participants.reduce((acc, p) => ({ ...acc, [p.id]: p.score || 0 }), {}),
  )
  const [winner, setWinner] = useState<string | null>(participants.find((p) => p.result === "win")?.id || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleScoreChange = (participantId: string, score: number) => {
    setScores((prev) => ({ ...prev, [participantId]: score }))
  }

  const handleWinnerSelect = (participantId: string) => {
    setWinner(participantId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!winner) {
        setError("Please select a winner")
        return
      }

      // Update all participants with their scores
      for (const participant of participants) {
        await supabase
          .from("match_participants")
          .update({
            score: scores[participant.id],
            result: participant.id === winner ? "win" : "loss",
          })
          .eq("id", participant.id)
      }

      // Update match status to completed
      await supabase
        .from("matches")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
        })
        .eq("id", match.id)

      // If there's a next match, advance the winner
      if (match.next_match_id) {
        const winnerParticipant = participants.find((p) => p.id === winner)

        if (winnerParticipant) {
          // Check if the participant is a team or individual
          const isTeam = !!winnerParticipant.team_id

          // Add the winner to the next match
          await supabase.from("match_participants").insert({
            match_id: match.next_match_id,
            [isTeam ? "team_id" : "profile_id"]: isTeam ? winnerParticipant.team_id : winnerParticipant.profile_id,
            score: null,
            result: null,
          })

          // Update next match status if both participants are now present
          const { data: nextMatchParticipants } = await supabase
            .from("match_participants")
            .select("*")
            .eq("match_id", match.next_match_id)

          if (nextMatchParticipants && nextMatchParticipants.length === 2) {
            await supabase.from("matches").update({ status: "scheduled" }).eq("id", match.next_match_id)
          }
        }
      }

      // Redirect back to tournament page
      router.push(`/tournaments/${match.tournament.slug}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating match result:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {participants.map((participant) => {
          const isTeam = !!participant.team_id
          const name = isTeam ? participant.team?.name : participant.profile?.username

          return (
            <div key={participant.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`score-${participant.id}`}>{name}</Label>
                <Button
                  type="button"
                  variant={winner === participant.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleWinnerSelect(participant.id)}
                >
                  {winner === participant.id ? "Winner" : "Select Winner"}
                </Button>
              </div>
              <Input
                id={`score-${participant.id}`}
                type="number"
                min="0"
                value={scores[participant.id]}
                onChange={(e) => handleScoreChange(participant.id, Number.parseInt(e.target.value) || 0)}
                required
              />
            </div>
          )
        })}
      </div>

      <Button type="submit" className="w-full" disabled={loading || !winner}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Result"
        )}
      </Button>
    </form>
  )
}
