"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Check, X } from "lucide-react"
import type { GameMode } from "@/lib/data/cod-rulesets"

// Default maps for different game modes if none are provided
const DEFAULT_MAPS = {
  tdm: ["Nuketown", "Firing Range", "Summit", "Crash", "Standoff", "Raid", "Slums"],
  snd: ["Raid", "Express", "Standoff", "Meltdown", "Slums", "Firing Range", "Nuketown"],
  ctf: ["Raid", "Standoff", "Slums", "Firing Range", "Express", "Meltdown", "Overflow"],
  hp: ["Raid", "Standoff", "Slums", "Firing Range", "Express", "Meltdown", "Overflow"],
  dom: ["Raid", "Standoff", "Slums", "Firing Range", "Express", "Meltdown", "Overflow"],
}

interface MapVetoSystemProps {
  matchId: string
  teamId: string
  opponentTeamId: string
  gameMode: GameMode
  availableMaps?: string[]
  vetoType: "standard" | "captain" | "random"
  onComplete: (selectedMaps: string[]) => void
}

export default function MapVetoSystem({
  matchId,
  teamId,
  opponentTeamId,
  gameMode = "tdm",
  availableMaps = [],
  vetoType = "standard",
  onComplete,
}: MapVetoSystemProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maps, setMaps] = useState<string[]>([])
  const [vetoes, setVetoes] = useState<{ map: string; team: string }[]>([])
  const [selectedMaps, setSelectedMaps] = useState<string[]>([])
  const [currentTeam, setCurrentTeam] = useState<string>(teamId)
  const [isUserTurn, setIsUserTurn] = useState(true)
  const [vetoComplete, setVetoComplete] = useState(false)

  // Initialize maps
  useEffect(() => {
    setLoading(true)

    // Use provided maps or fall back to defaults
    const mapsToUse =
      availableMaps.length > 0 ? availableMaps : DEFAULT_MAPS[gameMode as keyof typeof DEFAULT_MAPS] || DEFAULT_MAPS.tdm

    setMaps(mapsToUse)
    setLoading(false)
  }, [availableMaps, gameMode])

  // Handle map veto
  const handleVeto = async (map: string) => {
    // Add to vetoes
    const newVetoes = [...vetoes, { map, team: currentTeam }]
    setVetoes(newVetoes)

    // Remove from available maps
    const remainingMaps = maps.filter((m) => !newVetoes.some((v) => v.map === m))

    // Check if veto process is complete
    if (remainingMaps.length <= 3) {
      // Veto complete, set selected maps
      setSelectedMaps(remainingMaps)
      setVetoComplete(true)
      onComplete(remainingMaps)
      return
    }

    // Switch to other team
    setCurrentTeam(currentTeam === teamId ? opponentTeamId : teamId)
    setIsUserTurn(!isUserTurn)
  }

  // Handle random selection
  const handleRandomSelection = () => {
    // Shuffle maps
    const shuffled = [...maps].sort(() => 0.5 - Math.random())

    // Select first 3 maps
    const selected = shuffled.slice(0, 3)

    setSelectedMaps(selected)
    setVetoComplete(true)
    onComplete(selected)
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

  if (vetoComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Map Selection Complete</CardTitle>
          <CardDescription>The following maps have been selected for this match</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedMaps.map((map) => (
                <Badge key={map} className="px-3 py-1 text-base">
                  <Check className="h-4 w-4 mr-2" />
                  {map}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Veto</CardTitle>
        <CardDescription>
          {vetoType === "standard"
            ? "Take turns banning maps until only 3 remain"
            : vetoType === "random"
              ? "Randomly select 3 maps from the pool"
              : "Team captain selects maps for the match"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {vetoType === "random" ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Click the button below to randomly select 3 maps from the available pool.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button onClick={handleRandomSelection}>Randomly Select Maps</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {isUserTurn
                  ? "It's your turn to ban a map. Click on a map to ban it."
                  : "Waiting for the other team to ban a map..."}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {maps
                .filter((map) => !vetoes.some((v) => v.map === map))
                .map((map) => (
                  <Button
                    key={map}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center"
                    onClick={() => isUserTurn && handleVeto(map)}
                    disabled={!isUserTurn}
                  >
                    <span className="text-lg font-medium">{map}</span>
                  </Button>
                ))}
            </div>

            {vetoes.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Banned Maps</h3>
                <div className="flex flex-wrap gap-2">
                  {vetoes.map((veto, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      <X className="h-4 w-4 mr-2 text-red-500" />
                      {veto.map}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
