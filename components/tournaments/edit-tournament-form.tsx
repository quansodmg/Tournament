"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ui/image-upload"
import { deleteImage } from "@/lib/utils/image-upload"

interface Game {
  id: string
  name: string
}

interface EditTournamentFormProps {
  tournament: any
  games: Game[]
}

export default function EditTournamentForm({ tournament, games }: EditTournamentFormProps) {
  const [name, setName] = useState(tournament.name)
  const [description, setDescription] = useState(tournament.description || "")
  const [gameId, setGameId] = useState(tournament.game_id)
  const [startDate, setStartDate] = useState(tournament.start_date.slice(0, 16)) // Format for datetime-local input
  const [endDate, setEndDate] = useState(tournament.end_date.slice(0, 16))
  const [registrationCloseDate, setRegistrationCloseDate] = useState(tournament.registration_close_date.slice(0, 16))
  const [maxTeams, setMaxTeams] = useState(tournament.max_teams?.toString() || "16")
  const [teamSize, setTeamSize] = useState(tournament.team_size.toString())
  const [entryFee, setEntryFee] = useState(tournament.entry_fee.toString())
  const [prizePool, setPrizePool] = useState(tournament.prize_pool.toString())
  const [rules, setRules] = useState(tournament.rules || "")
  const [bannerImage, setBannerImage] = useState<string | null>(tournament.banner_image)
  const [isFree, setIsFree] = useState(tournament.entry_fee === 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after start date")
      setLoading(false)
      return
    }

    if (new Date(registrationCloseDate) > new Date(startDate)) {
      setError("Registration must close before the tournament starts")
      setLoading(false)
      return
    }

    try {
      // If banner image was changed and there was a previous one, delete the old image
      if (tournament.banner_image && tournament.banner_image !== bannerImage) {
        await deleteImage(tournament.banner_image)
      }

      // Update the tournament
      const { error: tournamentError } = await supabase
        .from("tournaments")
        .update({
          name,
          description,
          game_id: gameId,
          start_date: startDate,
          end_date: endDate,
          registration_close_date: registrationCloseDate,
          max_teams: Number.parseInt(maxTeams),
          team_size: Number.parseInt(teamSize),
          entry_fee: isFree ? 0 : Number.parseFloat(entryFee),
          prize_pool: Number.parseFloat(prizePool),
          rules,
          banner_image: bannerImage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tournament.id)

      if (tournamentError) {
        console.error("Tournament update error:", tournamentError)
        setError(tournamentError.message)
        return
      }

      router.push(`/tournaments/${tournament.slug}`)
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Edit Tournament</CardTitle>
          <CardDescription>Update your tournament details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="tournament-name">Tournament Name</Label>
            <Input id="tournament-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tournament-description">Description</Label>
            <Textarea
              id="tournament-description"
              placeholder="Describe your tournament..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select value={gameId} onValueChange={setGameId} required>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-close">Registration Close Date</Label>
            <Input
              id="registration-close"
              type="datetime-local"
              value={registrationCloseDate}
              onChange={(e) => setRegistrationCloseDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-teams">Maximum Teams</Label>
              <Input
                id="max-teams"
                type="number"
                min="2"
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-size">Team Size</Label>
              <Input
                id="team-size"
                type="number"
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-free" checked={isFree} onCheckedChange={(checked) => setIsFree(checked as boolean)} />
            <Label htmlFor="is-free">Free Tournament</Label>
          </div>
          {!isFree && (
            <div className="space-y-2">
              <Label htmlFor="entry-fee">Entry Fee ($)</Label>
              <Input
                id="entry-fee"
                type="number"
                min="0"
                step="0.01"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="prize-pool">Prize Pool ($)</Label>
            <Input
              id="prize-pool"
              type="number"
              min="0"
              step="0.01"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rules">Tournament Rules</Label>
            <Textarea
              id="rules"
              placeholder="Enter the rules for your tournament..."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={6}
            />
          </div>

          {/* Use the ImageUpload component */}
          <ImageUpload
            value={bannerImage}
            onChange={setBannerImage}
            label="Tournament Banner"
            aspectRatio="16/9"
            width={1200}
            height={675}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
