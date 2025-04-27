"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { recalculateEloRatings } from "@/app/actions/recalculate-elo"

interface AdminEloManagerProps {
  games: Array<{
    id: string
    name: string
    logo_url?: string
  }>
  stats: any
}

export default function AdminEloManager({ games, stats }: AdminEloManagerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const supabase = createClient()

  const handleResetElo = async () => {
    if (!confirm("Are you sure you want to reset ALL ELO ratings? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { error } = await supabase.rpc("reset_elo_ratings")

      if (error) throw error

      setSuccess("All ELO ratings have been reset successfully.")
    } catch (err: any) {
      console.error("Error resetting ELO ratings:", err)
      setError(err.message || "Failed to reset ELO ratings")
    } finally {
      setLoading(false)
    }
  }

  const handleResetGameElo = async () => {
    if (!selectedGame) {
      setError("Please select a game first")
      return
    }

    if (!confirm(`Are you sure you want to reset ELO ratings for this game? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { error } = await supabase.rpc("recalculate_game_elo", {
        game_id_param: selectedGame,
      })

      if (error) throw error

      const selectedGameName = games.find((g) => g.id === selectedGame)?.name || "selected game"
      setSuccess(`ELO ratings for ${selectedGameName} have been reset successfully.`)
    } catch (err: any) {
      console.error("Error resetting game ELO ratings:", err)
      setError(err.message || "Failed to reset game ELO ratings")
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateElo = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Use the server action instead of direct API call
      const result = await recalculateEloRatings()

      if (!result.success) {
        throw new Error(result.message)
      }

      setSuccess(`Recalculated ELO for ${result.results?.length || 0} matches.`)
    } catch (err: any) {
      console.error("Error recalculating ELO ratings:", err)
      setError(err.message || "Failed to recalculate ELO ratings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ELO Rating Statistics</CardTitle>
          <CardDescription>Overview of ELO ratings across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Total Players with Ratings</p>
              <p className="text-2xl font-bold">{stats.player_count || 0}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Total Teams with Ratings</p>
              <p className="text-2xl font-bold">{stats.team_count || 0}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Rated Matches</p>
              <p className="text-2xl font-bold">{stats.match_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recalculate">
        <TabsList>
          <TabsTrigger value="recalculate">Recalculate ELO</TabsTrigger>
          <TabsTrigger value="reset">Reset ELO</TabsTrigger>
        </TabsList>

        <TabsContent value="recalculate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recalculate ELO Ratings</CardTitle>
              <CardDescription>Process any pending matches that need ELO rating updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This will process up to 50 completed matches that haven't had their ELO ratings calculated yet. You can
                run this multiple times to process all pending matches in batches.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRecalculateElo} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Recalculate ELO Ratings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reset Game-Specific ELO</CardTitle>
              <CardDescription>Reset ELO ratings for a specific game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This will reset all ELO ratings for the selected game. Players and teams will start from the default
                rating again.
              </p>

              <div>
                <Select value={selectedGame || ""} onValueChange={setSelectedGame}>
                  <SelectTrigger>
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
            </CardContent>
            <CardFooter>
              <Button onClick={handleResetGameElo} disabled={loading || !selectedGame} variant="destructive">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Game ELO Ratings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset All ELO Ratings</CardTitle>
              <CardDescription>Reset all ELO ratings across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This will reset ALL ELO ratings for all players and teams across all games. Everyone will start from the
                default rating again.
              </p>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Warning: This action cannot be undone and will affect all users on the platform.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={handleResetElo} disabled={loading} variant="destructive">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset All ELO Ratings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
