"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"

interface MatchResultFormProps {
  matchId: string
  userId: string
  teamId: string
  participants: any[]
}

export default function MatchResultForm({ matchId, userId, teamId, participants }: MatchResultFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [winnerTeamId, setWinnerTeamId] = useState<string>("")
  const [winnerScore, setWinnerScore] = useState<string>("1")
  const [loserScore, setLoserScore] = useState<string>("0")
  const [notes, setNotes] = useState<string>("")

  const userTeam = participants.find((p) => p.team_id === teamId)?.team
  const opponentTeam = participants.find((p) => p.team_id !== teamId)?.team

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!winnerTeamId) {
      setError("Please select a winner")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const winnerScoreNum = Number.parseInt(winnerScore)
      const loserScoreNum = Number.parseInt(loserScore)

      if (isNaN(winnerScoreNum) || isNaN(loserScoreNum)) {
        throw new Error("Scores must be valid numbers")
      }

      if (winnerScoreNum <= loserScoreNum) {
        throw new Error("Winner's score must be higher than loser's score")
      }

      const loserTeamId = participants.find((p) => p.team_id !== winnerTeamId)?.team_id

      if (!loserTeamId) {
        throw new Error("Could not determine loser team")
      }

      // Create match result
      const { error: resultError } = await supabase.from("match_results").insert({
        match_id: matchId,
        winner_team_id: winnerTeamId,
        loser_team_id: loserTeamId,
        winner_score: winnerScoreNum,
        loser_score: loserScoreNum,
        reported_by: userId,
        reported_by_team_id: teamId,
        notes: notes,
      })

      if (resultError) throw resultError

      // Update match status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", matchId)

      if (matchError) throw matchError

      // Update match participants
      await supabase
        .from("match_participants")
        .update({ result: "win", score: winnerScoreNum })
        .eq("match_id", matchId)
        .eq("team_id", winnerTeamId)

      await supabase
        .from("match_participants")
        .update({ result: "loss", score: loserScoreNum })
        .eq("match_id", matchId)
        .eq("team_id", loserTeamId)

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `Match result reported: ${winnerScoreNum}-${loserScoreNum} in favor of ${
          winnerTeamId === teamId ? userTeam?.name : opponentTeam?.name
        }. ELO ratings will be updated.`,
        is_system: true,
      })

      // Trigger ELO update
      try {
        await fetch(`/api/matches/${matchId}/update-elo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (eloError) {
        console.error("Error updating ELO ratings:", eloError)
        // Continue with success flow even if ELO update fails
      }

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/matches/${matchId}`)
      }, 2000)
    } catch (err: any) {
      console.error("Error reporting match result:", err)
      setError(err.message || "Failed to report match result")
    } finally {
      setLoading(false)
    }
  }

  if (!userTeam || !opponentTeam) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Could not find match participants</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Match Result</CardTitle>
        <CardDescription>Submit the outcome of your match</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>Match result submitted successfully! ELO ratings will be updated.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base">Select Winner</Label>
              <RadioGroup value={winnerTeamId} onValueChange={setWinnerTeamId} className="mt-2">
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value={userTeam.id} id="user-team" />
                  <Label htmlFor="user-team" className="flex items-center cursor-pointer">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={userTeam.logo_url || ""} alt={userTeam.name} />
                      <AvatarFallback>{userTeam.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{userTeam.name} (Your Team)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value={opponentTeam.id} id="opponent-team" />
                  <Label htmlFor="opponent-team" className="flex items-center cursor-pointer">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={opponentTeam.logo_url || ""} alt={opponentTeam.name} />
                      <AvatarFallback>{opponentTeam.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{opponentTeam.name}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="winner-score">Winner Score</Label>
                <Input
                  id="winner-score"
                  type="number"
                  min="1"
                  value={winnerScore}
                  onChange={(e) => setWinnerScore(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="loser-score">Loser Score</Label>
                <Input
                  id="loser-score"
                  type="number"
                  min="0"
                  max={Number.parseInt(winnerScore) - 1}
                  value={loserScore}
                  onChange={(e) => setLoserScore(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information about the match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || success}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Result
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
