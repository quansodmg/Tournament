"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { generateTournamentBracket } from "@/lib/utils/bracket-generator"

interface BracketManagerProps {
  tournament: any
  registrations: any[]
}

export default function BracketManager({ tournament, registrations }: BracketManagerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleGenerateBracket = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if we have enough participants
      if (registrations.length < 2) {
        setError("You need at least 2 participants to generate a bracket")
        return
      }

      // Check if brackets already exist
      const { data: existingMatches, error: matchesError } = await supabase
        .from("matches")
        .select("id")
        .eq("tournament_id", tournament.id)
        .limit(1)

      if (matchesError) throw matchesError

      if (existingMatches && existingMatches.length > 0) {
        setError("Bracket already exists for this tournament")
        return
      }

      // Determine if this is a team tournament
      const isTeamTournament = tournament.team_size > 1

      // Get participant IDs
      const participantIds = registrations
        .map((reg) => (isTeamTournament ? reg.team_id : reg.profile_id))
        .filter(Boolean)

      // Generate the bracket
      const result = await generateTournamentBracket({
        tournamentId: tournament.id,
        participantIds,
        isTeamTournament,
        bracketType: "single_elimination",
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to generate bracket")
      }

      setSuccess(true)

      // Refresh the page to show the new bracket
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error("Error generating bracket:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Bracket</CardTitle>
        <CardDescription>Generate and manage the tournament bracket</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>Bracket generated successfully! Refreshing page...</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p>
            {registrations.length} {tournament.team_size > 1 ? "teams" : "players"} have registered for this tournament.
          </p>

          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">Before generating the bracket:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Make sure all registrations are finalized</li>
              <li>Once generated, the bracket cannot be changed</li>
              <li>Participants will be randomly seeded</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateBracket} disabled={loading || registrations.length < 2 || success}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Bracket"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
