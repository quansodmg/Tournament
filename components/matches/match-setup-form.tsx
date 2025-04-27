"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle, ChevronLeft, Settings, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MatchSetupFormProps {
  match: any
  userId: string
  userTeam: any
}

export default function MatchSetupForm({ match, userId, userTeam }: MatchSetupFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"maps" | "rules" | "confirm">("maps")

  // Maps selection
  const [availableMaps, setAvailableMaps] = useState<string[]>(
    match.game?.maps || ["Nuketown", "Firing Range", "Summit", "Raid", "Standoff", "Express", "Slums"],
  )
  const [selectedMaps, setSelectedMaps] = useState<string[]>(match.match_settings?.selected_maps || [])

  // Rules settings
  const [gameMode, setGameMode] = useState<string>(match.match_settings?.settings?.gameMode || "standard")
  const [scoreLimit, setScoreLimit] = useState<string>(match.match_settings?.settings?.scoreLimit || "75")
  const [timeLimit, setTimeLimit] = useState<string>(match.match_settings?.settings?.timeLimit || "10")
  const [customRules, setCustomRules] = useState<string>(match.match_settings?.rules || "")

  // Confirm settings
  const [readyToStart, setReadyToStart] = useState(false)

  const handleMapToggle = (map: string) => {
    if (selectedMaps.includes(map)) {
      setSelectedMaps(selectedMaps.filter((m) => m !== map))
    } else {
      if (selectedMaps.length < 3) {
        setSelectedMaps([...selectedMaps, map])
      }
    }
  }

  const handleNextStep = () => {
    if (currentStep === "maps") {
      if (selectedMaps.length < 1) {
        setError("Please select at least one map")
        return
      }
      setCurrentStep("rules")
    } else if (currentStep === "rules") {
      setCurrentStep("confirm")
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === "rules") {
      setCurrentStep("maps")
    } else if (currentStep === "confirm") {
      setCurrentStep("rules")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!readyToStart) {
      setError("Please confirm you're ready to start the match")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Update match settings
      const { error: settingsError } = await supabase.from("match_settings").upsert({
        match_id: match.id,
        selected_maps: selectedMaps,
        rules: customRules,
        settings: {
          gameMode,
          scoreLimit,
          timeLimit,
        },
      })

      if (settingsError) throw settingsError

      // Update match status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          status: "in_progress",
          setup_completed_at: new Date().toISOString(),
        })
        .eq("id", match.id)

      if (matchError) throw matchError

      // Add system message to match chat
      await supabase.from("match_chats").insert({
        match_id: match.id,
        profile_id: "00000000-0000-0000-0000-000000000000", // System user ID
        message: "Match setup has been completed. The match is now in progress.",
        is_system: true,
      })

      // Redirect to match page
      router.push(`/matches/${match.id}`)
    } catch (err: any) {
      console.error("Error completing match setup:", err)
      setError(err.message || "Failed to complete match setup")
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
        <h1 className="text-2xl font-bold">Match Setup</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Match Settings</CardTitle>
          <CardDescription>Set up the rules and maps for your match</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="maps">Map Selection</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="confirm">Confirm</TabsTrigger>
            </TabsList>

            <TabsContent value="maps" className="space-y-6 pt-6">
              <div>
                <h3 className="font-medium mb-3">Select Maps (Choose up to 3)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These maps will be available for play during your match.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableMaps.map((map) => (
                    <div
                      key={map}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedMaps.includes(map)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary/50"
                      }`}
                      onClick={() => handleMapToggle(map)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{map}</span>
                        <Checkbox checked={selectedMaps.includes(map)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNextStep}>Next Step</Button>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="game-mode">Game Mode</Label>
                    <Select value={gameMode} onValueChange={setGameMode}>
                      <SelectTrigger id="game-mode">
                        <SelectValue placeholder="Select game mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="tdm">Team Deathmatch</SelectItem>
                        <SelectItem value="ctf">Capture the Flag</SelectItem>
                        <SelectItem value="dom">Domination</SelectItem>
                        <SelectItem value="hp">Hardpoint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="score-limit">Score Limit</Label>
                    <Input
                      id="score-limit"
                      type="number"
                      value={scoreLimit}
                      onChange={(e) => setScoreLimit(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-rules">Custom Rules (Optional)</Label>
                  <textarea
                    id="custom-rules"
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-transparent"
                    placeholder="Enter any additional rules or notes for the match..."
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button onClick={handleNextStep}>Next Step</Button>
              </div>
            </TabsContent>

            <TabsContent value="confirm" className="space-y-6 pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Match Summary</h3>
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 opacity-70" />
                        <span className="font-medium">Selected Maps:</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedMaps.map((map) => (
                          <Badge key={map} variant="outline">
                            {map}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2 opacity-70" />
                        <span className="font-medium">Game Mode:</span>
                      </div>
                      <span>{gameMode}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Score Limit:</span>
                      <span>{scoreLimit}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Time Limit:</span>
                      <span>{timeLimit} minutes</span>
                    </div>

                    {customRules && (
                      <div>
                        <span className="font-medium">Custom Rules:</span>
                        <p className="text-sm text-muted-foreground mt-1">{customRules}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ready"
                    checked={readyToStart}
                    onCheckedChange={(checked) => setReadyToStart(!!checked)}
                  />
                  <Label htmlFor="ready">
                    I confirm these settings are correct and my team is ready to start the match
                  </Label>
                </div>

                <Alert>
                  <AlertDescription>
                    Once you complete the setup, the match will be marked as in progress and players can begin.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !readyToStart}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Complete Setup
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
