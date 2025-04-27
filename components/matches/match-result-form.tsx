"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle, ChevronLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MatchResultFormProps {
  match: any
  userId: string
  userTeamId: string
}

export default function MatchResultForm({ match, userId, userTeamId }: MatchResultFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [winnerTeamId, setWinnerTeamId] = useState<string>("")
  const [winnerScore, setWinnerScore] = useState<string>("1")
  const [loserScore, setLoserScore] = useState<string>("0")
  const [notes, setNotes] = useState<string>("")

  // Get user's team and opponent team
  const userTeam = match.participants.find((p: any) => p.team_id === userTeamId)?.team
  const opponentTeam = match.participants.find((p: any) => p.team_id !== userTeamId)?.team

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

      const loserTeamId = match.participants.find((p: any) => p.team_id !== winnerTeamId)?.team_id

      if (!loserTeamId) {
        throw new Error("Could not determine loser team")
      }

      // Create match result
      const { error: resultError } = await supabase.from("match_results").insert({
        match_id: match.id,
        winner_team_id: winnerTeamId,
        loser_team_id: loserTeamId,
        winner_score: winnerScoreNum,
        loser_score: loserScoreNum,
        reported_by: userId,
        reported_by_team_id: userTeamId,
        notes: notes,
      })

      if (resultError) throw resultError

      // Update match status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
        })
        .eq("id", match.id)

      if (matchError) throw matchError

      // Update match participants
      await supabase
        .from("match_participants")
        .update({ result: "win", score: winnerScoreNum })
        .eq("match_id", match.id)
        .eq("team_id", winnerTeamId)

      await supabase
        .from("match_participants")
        .update({ result: "loss", score: loserScoreNum })
        .eq("match_id", match.id)
        .eq("team_id", loserTeamId)

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: match.id,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `Match result reported: ${winnerScoreNum}-${loserScoreNum} in favor of ${
          winnerTeamId === userTeamId ? userTeam?.name : opponentTeam?.name
        }. ELO ratings will be updated.`,
        is_system: true,
      })

      // Trigger ELO update
      try {
        await fetch(`/api/matches/${match.id}/update-elo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (eloError) {
        console.error("Error updating ELO ratings:", eloError)
        // Continue with success flow even if ELO update fails
      }

      // Redirect to match page
      router.push(`/matches/${match.id}`)
    } catch (err: any) {
      console.error("Error reporting match result:", err)
      setError(err.message || "Failed to report match result")
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
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={`/matches/${match.id}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Match
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Report Match Result</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
          <CardDescription>Submit the outcome of your match</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="font-medium mb-3">Select Winner</h3>
              <RadioGroup value={winnerTeamId} onValueChange={setWinnerTeamId}>
                <div className="space-y-3">
                  <div
                    className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-secondary/50"
                    onClick={() => setWinnerTeamId(userTeam.id)}
                  >
                    <RadioGroupItem value={userTeam.id} id="user-team" />
                    <Label htmlFor="user-team" className="flex items-center cursor-pointer flex-1">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={userTeam.logo_url || ""} alt={userTeam.name} />
                        <AvatarFallback>{userTeam.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userTeam.name}</p>
                        <p className="text-xs text-muted-foreground">Your Team</p>
                      </div>
                    </Label>
                  </div>

                  <div
                    className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-secondary/50"
                    onClick={() => setWinnerTeamId(opponentTeam.id)}
                  >
                    <RadioGroupItem value={opponentTeam.id} id="opponent-team" />
                    <Label htmlFor="opponent-team" className="flex items-center cursor-pointer flex-1">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={opponentTeam.logo_url || ""} alt={opponentTeam.name} />
                        <AvatarFallback>{opponentTeam.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{opponentTeam.name}</p>
                        <p className="text-xs text-muted-foreground">Opponent Team</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="winner-score">Winner Score</Label>
                <Input
                  id="winner-score"
                  type="number"
                  min="1"
                  value={winnerScore}
                  onChange={(e) => setWinnerScore(e.target.value)}
                  className="mt-2"
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
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Match Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information about the match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </div>

            <Alert>
              <Trophy className="h-4 w-4 mr-2" />
              <AlertDescription>
                By submitting this result, you confirm that the information is accurate. This will update team rankings
                and ELO ratings.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !winnerTeamId}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Result
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
