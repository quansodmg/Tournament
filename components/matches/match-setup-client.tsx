"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, Check } from "lucide-react"
import MapVetoSystem from "./map-veto-system"

interface MatchSetupClientProps {
  matchId: string
  userId: string
}

export default function MatchSetupClient({ matchId, userId }: MatchSetupClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<any>(null)
  const [opponentTeam, setOpponentTeam] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<"maps" | "rules" | "ready">("maps")
  const [selectedMaps, setSelectedMaps] = useState<string[]>([])
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    async function fetchMatchDetails() {
      try {
        setLoading(true)

        // Get match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            settings:match_settings(*),
            participants:match_participants(
              *,
              team:team_id(*)
            )
          `)
          .eq("id", matchId)
          .single()

        if (matchError) throw matchError
        setMatch(matchData)

        // Check if setup is already complete
        if (matchData.setup_completed_at) {
          setSetupComplete(true)
        }

        // Find user's team and opponent team
        let userTeamData = null
        let opponentTeamData = null

        for (const participant of matchData.participants) {
          const isUserInTeam = participant.team?.members?.some((m: any) => m.profile_id === userId)

          if (isUserInTeam) {
            userTeamData = participant
          } else {
            opponentTeamData = participant
          }
        }

        setUserTeam(userTeamData)
        setOpponentTeam(opponentTeamData)

        // Get selected maps
        if (matchData.settings?.selected_maps && matchData.settings.selected_maps.length > 0) {
          setSelectedMaps(matchData.settings.selected_maps)
          setCurrentStep("rules")
        }
      } catch (err: any) {
        console.error("Error fetching match details:", err)
        setError(err.message || "Failed to load match details")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetails()
  }, [matchId, userId, supabase])

  const handleMapSelectionComplete = async (maps: string[]) => {
    try {
      // Update match settings with selected maps
      const { error } = await supabase.from("match_settings").update({ selected_maps: maps }).eq("match_id", matchId)

      if (error) throw error

      setSelectedMaps(maps)
      setCurrentStep("rules")
    } catch (err: any) {
      console.error("Error updating selected maps:", err)
      setError(err.message || "Failed to update selected maps")
    }
  }

  const handleCompleteSetup = async () => {
    try {
      // Update match with setup completed
      const { error } = await supabase
        .from("matches")
        .update({
          setup_completed_at: new Date().toISOString(),
          status: "scheduled",
        })
        .eq("id", matchId)

      if (error) throw error

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: matchId,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: "Match setup has been completed. The match is now scheduled.",
        is_system: true,
      })

      setSetupComplete(true)

      // Redirect to match page
      router.push(`/matches/${matchId}`)
    } catch (err: any) {
      console.error("Error completing setup:", err)
      setError(err.message || "Failed to complete setup")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!match) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>Match not found</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (setupComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Setup Complete</CardTitle>
          <CardDescription>This match has already been set up</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Check className="h-4 w-4 mr-2" />
            <AlertDescription>The match setup has been completed. You can now view the match details.</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button asChild>
              <a href={`/matches/${matchId}`}>View Match</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userTeam || !opponentTeam) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              This match doesn't have enough participants yet. Both teams need to join before setup can begin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Setup</CardTitle>
        <CardDescription>Configure the match settings before it begins</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maps">Map Selection</TabsTrigger>
            <TabsTrigger value="rules" disabled={selectedMaps.length === 0}>
              Rules
            </TabsTrigger>
            <TabsTrigger value="ready" disabled={selectedMaps.length === 0}>
              Ready Check
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maps" className="pt-4">
            <MapVetoSystem
              matchId={matchId}
              teamId={userTeam.team_id}
              opponentTeamId={opponentTeam.team_id}
              gameMode={match.settings?.settings?.gameMode || "tdm"}
              availableMaps={match.game?.maps || []}
              vetoType="standard"
              onComplete={handleMapSelectionComplete}
            />
          </TabsContent>

          <TabsContent value="rules" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Match Rules</CardTitle>
                <CardDescription>Review the rules for this match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Selected Maps</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaps.map((map) => (
                      <div key={map} className="bg-secondary px-3 py-1 rounded-md text-sm">
                        {map}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Game Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Game</p>
                      <p>{match.game?.name || "Unknown Game"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Game Mode</p>
                      <p>{match.settings?.settings?.gameMode || "Standard"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Match Type</p>
                      <p>{match.match_type || "Standard"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Platform</p>
                      <p>{match.platform || "Any"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep("ready")}>Continue</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ready" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ready Check</CardTitle>
                <CardDescription>Confirm that you're ready to start the match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    By completing the setup, you confirm that both teams are ready to play according to the selected
                    maps and rules.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button onClick={handleCompleteSetup}>Complete Setup</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
