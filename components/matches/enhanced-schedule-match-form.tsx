"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { getAvailableRuleSets, type GameMode } from "@/lib/data/cod-rulesets"

interface EnhancedScheduleMatchFormProps {
  userId: string
  userTeams: any[]
}

export default function EnhancedScheduleMatchForm({ userId, userTeams }: EnhancedScheduleMatchFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [games, setGames] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [matchType, setMatchType] = useState<"casual" | "competitive" | "tournament">("casual")
  const [gameMode, setGameMode] = useState<GameMode>("tdm")
  const [ruleset, setRuleset] = useState<string>("")
  const [availableRulesets, setAvailableRulesets] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [startTime, setStartTime] = useState<string>(format(new Date(Date.now() + 3600000), "HH:mm"))
  const [isWager, setIsWager] = useState<boolean>(false)
  const [wagerAmount, setWagerAmount] = useState<number>(0)
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [description, setDescription] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<"team" | "game" | "schedule">("team")

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase.from("games").select("*").eq("active", true).order("name")

        if (error) throw error

        setGames(data || [])
      } catch (err: any) {
        console.error("Error fetching games:", err)
        setError(err.message || "Failed to load games")
      }
    }

    fetchGames()
  }, [supabase])

  useEffect(() => {
    // Set teams from props
    setTeams(userTeams.filter((team) => team.role === "captain" || team.created_by === userId))

    // Set default team if only one team
    if (userTeams.length === 1) {
      setSelectedTeam(userTeams[0].id)
    }
  }, [userTeams, userId])

  useEffect(() => {
    // Update available rulesets when game mode changes
    if (gameMode) {
      const rulesets = getAvailableRuleSets(gameMode)
      setAvailableRulesets(rulesets)

      // Set default ruleset if available
      if (rulesets.length > 0 && (!ruleset || !rulesets.some((r) => r.id === ruleset))) {
        setRuleset(rulesets[0].id)
      }
    }
  }, [gameMode, ruleset])

  const handleNextStep = () => {
    if (currentStep === "team") {
      if (!selectedTeam) {
        setError("Please select a team")
        return
      }
      setCurrentStep("game")
    } else if (currentStep === "game") {
      if (!selectedGame) {
        setError("Please select a game")
        return
      }
      if (!gameMode) {
        setError("Please select a game mode")
        return
      }
      if (!ruleset) {
        setError("Please select a ruleset")
        return
      }
      setCurrentStep("schedule")
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === "game") {
      setCurrentStep("team")
    } else if (currentStep === "schedule") {
      setCurrentStep("game")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTeam || !selectedGame || !startDate || !startTime) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create match
      const startDateTime = new Date(`${startDate}T${startTime}`)

      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          game_id: selectedGame,
          match_type: matchType,
          status: "pending",
          created_by: userId,
          start_time: startDateTime.toISOString(),
          description: description,
          is_private: isPrivate,
        })
        .select()
        .single()

      if (matchError) throw matchError

      // Create match settings
      const selectedRuleset = availableRulesets.find((r) => r.id === ruleset)

      const { error: settingsError } = await supabase.from("match_settings").insert({
        match_id: match.id,
        ruleset_id: ruleset,
        settings: {
          gameMode: gameMode,
          teamSize: selectedRuleset?.teamSize || 4,
          scoreLimit: selectedRuleset?.rules.scoreLimit,
          timeLimit: selectedRuleset?.rules.timeLimit,
          roundsToWin: selectedRuleset?.rules.roundsToWin,
          customRules: selectedRuleset?.rules.customRules,
        },
      })

      if (settingsError) throw settingsError

      // Add user's team as participant
      const { error: participantError } = await supabase.from("match_participants").insert({
        match_id: match.id,
        team_id: selectedTeam,
        status: "confirmed",
        joined_at: new Date().toISOString(),
      })

      if (participantError) throw participantError

      // Create wager if selected
      if (isWager && wagerAmount > 0) {
        const platformFee = wagerAmount * 0.1 // 10% platform fee

        const { error: wagerError } = await supabase.from("match_wagers").insert({
          match_id: match.id,
          amount: wagerAmount,
          platform_fee: platformFee,
          status: "pending",
        })

        if (wagerError) throw wagerError
      }

      // Redirect to match page
      router.push(`/matches/${match.id}`)
    } catch (err: any) {
      console.error("Error creating match:", err)
      setError(err.message || "Failed to create match")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Match</CardTitle>
        <CardDescription>Create a new match and invite opponents</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="game">Game & Rules</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="team">Select Your Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.length === 0 ? (
                      <SelectItem value="no-teams" disabled>
                        No teams available
                      </SelectItem>
                    ) : (
                      teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {teams.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    You need to create a team or be a captain to schedule matches.
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNextStep} disabled={teams.length === 0}>
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="game" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="game">Select Game</Label>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger id="game">
                    <SelectValue placeholder="Select a game" />
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

              <div>
                <Label htmlFor="match-type">Match Type</Label>
                <RadioGroup
                  value={matchType}
                  onValueChange={(value) => setMatchType(value as any)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="competitive" id="competitive" />
                    <Label htmlFor="competitive">Competitive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tournament" id="tournament" />
                    <Label htmlFor="tournament">Tournament</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <Label htmlFor="game-mode">Game Mode</Label>
                <Select value={gameMode} onValueChange={(value) => setGameMode(value as GameMode)}>
                  <SelectTrigger id="game-mode">
                    <SelectValue placeholder="Select game mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tdm">Team Deathmatch</SelectItem>
                    <SelectItem value="snd">Search and Destroy</SelectItem>
                    <SelectItem value="hp">Hardpoint</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="ffa">Free For All</SelectItem>
                    <SelectItem value="gunfight">Gunfight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ruleset">Ruleset</Label>
                <Select value={ruleset} onValueChange={setRuleset}>
                  <SelectTrigger id="ruleset">
                    <SelectValue placeholder="Select ruleset" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRulesets.map((rs) => (
                      <SelectItem key={rs.id} value={rs.id}>
                        {rs.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button onClick={handleNextStep}>Next</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div>
                  <Label htmlFor="start-time">Time</Label>
                  <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add details about the match"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is-wager" checked={isWager} onCheckedChange={setIsWager} />
                <Label htmlFor="is-wager">This is a wager match</Label>
              </div>

              {isWager && (
                <div>
                  <Label htmlFor="wager-amount">Wager Amount ($)</Label>
                  <Input
                    id="wager-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={wagerAmount || ""}
                    onChange={(e) => setWagerAmount(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">10% platform fee applies. Minimum wager: $1</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch id="is-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
                <Label htmlFor="is-private">Private match (invitation only)</Label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Match"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
