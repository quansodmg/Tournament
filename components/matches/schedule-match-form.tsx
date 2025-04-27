"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ScheduleMatchFormProps {
  userId: string
  userTeams: any[]
}

export default function ScheduleMatchForm({ userId, userTeams }: ScheduleMatchFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [gamesLoading, setGamesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [games, setGames] = useState<any[]>([])

  // Form state
  const [teamId, setTeamId] = useState<string>("")
  const [gameId, setGameId] = useState<string>("")
  const [matchType, setMatchType] = useState<string>("casual")
  const [matchFormat, setMatchFormat] = useState<string>("bo1")
  const [teamSize, setTeamSize] = useState<string>("5")
  const [startDate, setStartDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isPrivate, setIsPrivate] = useState<boolean>(false)

  useEffect(() => {
    async function fetchGames() {
      try {
        setGamesLoading(true)
        const { data, error } = await supabase.from("games").select("*").order("name")

        if (error) throw error
        setGames(data || [])
      } catch (err: any) {
        console.error("Error fetching games:", err)
        setError("Failed to load games")
      } finally {
        setGamesLoading(false)
      }
    }

    fetchGames()

    // Set default date to today
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setStartDate(formattedDate)

    // Set default time to next hour
    today.setHours(today.getHours() + 1, 0, 0, 0)
    const formattedTime = today.toTimeString().slice(0, 5)
    setStartTime(formattedTime)
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teamId || !gameId || !startDate || !startTime) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Combine date and time
      const startDateTime = new Date(`${startDate}T${startTime}`)

      if (startDateTime < new Date()) {
        throw new Error("Start time must be in the future")
      }

      // Create match
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          game_id: gameId,
          match_type: matchType,
          match_format: matchFormat,
          team_size: Number.parseInt(teamSize),
          start_time: startDateTime.toISOString(),
          location: location,
          match_notes: notes,
          is_private: isPrivate,
          status: "scheduled",
          scheduled_by: userId,
        })
        .select()
        .single()

      if (matchError) throw matchError

      // Add team as participant
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: match.id,
        team_id: teamId,
        status: "accepted",
      })

      if (participantError) throw participantError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: match.id,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: "Match has been created and is waiting for an opponent.",
        is_system: true,
      })

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/matches/${match.id}`)
      }, 2000)
    } catch (err: any) {
      console.error("Error scheduling match:", err)
      setError(err.message || "Failed to schedule match")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Match</CardTitle>
        <CardDescription>Create a new match and invite opponents</CardDescription>
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
              <AlertDescription>Match scheduled successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="team">Your Team</Label>
              <Select value={teamId} onValueChange={setTeamId} disabled={loading || success}>
                <SelectTrigger id="team">
                  <SelectValue placeholder="Select your team" />
                </SelectTrigger>
                <SelectContent>
                  {userTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select value={gameId} onValueChange={setGameId} disabled={gamesLoading || loading || success}>
                <SelectTrigger id="game">
                  <SelectValue placeholder={gamesLoading ? "Loading games..." : "Select a game"} />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="match-type">Match Type</Label>
              <Select value={matchType} onValueChange={setMatchType} disabled={loading || success}>
                <SelectTrigger id="match-type">
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="scrim">Scrim</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="match-format">Match Format</Label>
              <Select value={matchFormat} onValueChange={setMatchFormat} disabled={loading || success}>
                <SelectTrigger id="match-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bo1">Best of 1</SelectItem>
                  <SelectItem value="bo3">Best of 3</SelectItem>
                  <SelectItem value="bo5">Best of 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-size">Team Size</Label>
              <Select value={teamSize} onValueChange={setTeamSize} disabled={loading || success}>
                <SelectTrigger id="team-size">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1v1</SelectItem>
                  <SelectItem value="2">2v2</SelectItem>
                  <SelectItem value="3">3v3</SelectItem>
                  <SelectItem value="4">4v4</SelectItem>
                  <SelectItem value="5">5v5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-date">Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Server name, Discord channel, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Match Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about the match..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked === true)}
              disabled={loading || success}
            />
            <Label htmlFor="is-private">Make this match private (only visible to invited teams)</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || success}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Schedule Match
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
