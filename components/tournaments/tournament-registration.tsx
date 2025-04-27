"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TournamentRegistrationProps {
  tournament: any
  userId: string
}

export default function TournamentRegistration({ tournament, userId }: TournamentRegistrationProps) {
  const [registrationType, setRegistrationType] = useState<"individual" | "team">("individual")
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingTeams, setFetchingTeams] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchTeams = async () => {
      setFetchingTeams(true)

      try {
        // Get teams where the user is a member
        const { data, error } = await supabase
          .from("team_members")
          .select(`
            team:teams(
              id,
              name,
              team_members(count)
            )
          `)
          .eq("profile_id", userId)

        if (error) {
          console.error("Error fetching teams:", error)
          return
        }

        if (data) {
          // Filter teams that have enough members for the tournament
          const eligibleTeams = data
            .map((item) => item.team)
            .filter((team) => team.team_members[0].count >= tournament.team_size)

          setTeams(eligibleTeams)

          if (eligibleTeams.length > 0) {
            setSelectedTeamId(eligibleTeams[0].id)
          }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setFetchingTeams(false)
      }
    }

    fetchTeams()
  }, [supabase, userId, tournament.team_size])

  const handleRegister = async () => {
    setLoading(true)
    setError(null)

    try {
      if (registrationType === "individual") {
        const { error } = await supabase.from("tournament_registrations").insert({
          tournament_id: tournament.id,
          profile_id: userId,
        })

        if (error) {
          setError(error.message)
          return
        }
      } else {
        if (!selectedTeamId) {
          setError("Please select a team")
          setLoading(false)
          return
        }

        const { error } = await supabase.from("tournament_registrations").insert({
          tournament_id: tournament.id,
          team_id: selectedTeamId,
        })

        if (error) {
          setError(error.message)
          return
        }
      }

      router.refresh()
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RadioGroup
        value={registrationType}
        onValueChange={(value) => setRegistrationType(value as "individual" | "team")}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="individual" id="individual" />
          <Label htmlFor="individual">Register as Individual</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="team" id="team" />
          <Label htmlFor="team">Register with Team</Label>
        </div>
      </RadioGroup>

      {registrationType === "team" && (
        <div className="space-y-2">
          <Label htmlFor="team-select">Select Team</Label>
          {fetchingTeams ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading teams...</span>
            </div>
          ) : teams.length === 0 ? (
            <Alert>
              <AlertDescription>
                You don&apos;t have any eligible teams. Teams must have at least {tournament.team_size} members.
              </AlertDescription>
            </Alert>
          ) : (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger id="team-select">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <Button
        onClick={handleRegister}
        disabled={loading || (registrationType === "team" && (teams.length === 0 || !selectedTeamId))}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Register for Tournament"
        )}
      </Button>
    </div>
  )
}
