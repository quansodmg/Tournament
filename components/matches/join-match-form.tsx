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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface JoinMatchFormProps {
  match: any
  userId: string
  availableTeams: any[]
}

export default function JoinMatchForm({ match, userId, availableTeams }: JoinMatchFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string>(availableTeams[0]?.id || "")
  const [agreeToRules, setAgreeToRules] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTeamId) {
      setError("Please select a team")
      return
    }

    if (!agreeToRules) {
      setError("You must agree to the match rules")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Add team as match participant
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: match.id,
        team_id: selectedTeamId,
        status: "confirmed",
        joined_at: new Date().toISOString(),
      })

      if (participantError) throw participantError

      // Add system message to match chat
      const selectedTeam = availableTeams.find((t) => t.id === selectedTeamId)
      await supabase.from("match_chats").insert({
        match_id: match.id,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: `${selectedTeam?.name || "A team"} has joined the match.`,
        is_system: true,
      })

      // Redirect to match setup page
      router.push(`/matches/${match.id}/setup`)
    } catch (err: any) {
      console.error("Error joining match:", err)
      setError(err.message || "Failed to join match")
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold">Join Match</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
          <CardDescription>Review the match details before joining</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{match.participants[0]?.team?.name || "Team"} vs Opponent</h2>
              <p className="text-muted-foreground">
                {match.game?.name} • {format(new Date(match.start_time), "PPP 'at' p")}
              </p>
            </div>
            {match.game && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={match.game.logo_url || ""} alt={match.game.name} />
                <AvatarFallback>{match.game.name[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Current Participants</h3>
            {match.participants.map((participant: any) => (
              <div key={participant.id} className="flex items-center p-3 bg-secondary/50 rounded-lg">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={participant.team?.logo_url || ""} alt={participant.team?.name} />
                  <AvatarFallback>{participant.team?.name?.[0] || "T"}</AvatarFallback>
                </Avatar>
                <span>{participant.team?.name}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="font-medium mb-3">Select Your Team</h3>
              <RadioGroup value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <div className="space-y-3">
                  {availableTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-secondary/50"
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      <RadioGroupItem value={team.id} id={`team-${team.id}`} />
                      <Label htmlFor={`team-${team.id}`} className="flex items-center cursor-pointer flex-1">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={team.logo_url || ""} alt={team.name} />
                          <AvatarFallback>{team.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{team.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree-rules"
                checked={agreeToRules}
                onCheckedChange={(checked) => setAgreeToRules(!!checked)}
              />
              <Label htmlFor="agree-rules">
                I agree to the match rules and confirm my team will be available at the scheduled time
              </Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !selectedTeamId || !agreeToRules}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Join Match
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
