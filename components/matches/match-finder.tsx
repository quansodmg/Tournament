"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Search, Calendar, Clock, Users, Filter } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface MatchFinderProps {
  userId: string
  userTeams: any[]
}

export default function MatchFinder({ userId, userTeams }: MatchFinderProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [gameFilter, setGameFilter] = useState<string>("")
  const [matchTypeFilter, setMatchTypeFilter] = useState<string>("")
  const [teamSizeFilter, setTeamSizeFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [hideJoinedFilter, setHideJoinedFilter] = useState(false)

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase.from("games").select("*").order("name")
        if (error) throw error
        setGames(data || [])
      } catch (err: any) {
        console.error("Error fetching games:", err)
      }
    }

    fetchGames()
  }, [supabase])

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)

        // Get user's team IDs
        const userTeamIds = userTeams.map((team) => team.id)

        // Build query
        let query = supabase
          .from("matches")
          .select(`
            *,
            game:game_id(*),
            participants:match_participants(team_id)
          `)
          .eq("status", "scheduled")
          .gt("start_time", new Date().toISOString())
          .order("start_time")

        // Apply filters
        if (gameFilter) {
          query = query.eq("game_id", gameFilter)
        }

        if (matchTypeFilter) {
          query = query.eq("match_type", matchTypeFilter)
        }

        if (teamSizeFilter) {
          query = query.eq("team_size", teamSizeFilter)
        }

        if (dateFilter) {
          const startOfDay = new Date(dateFilter)
          const endOfDay = new Date(dateFilter)
          endOfDay.setHours(23, 59, 59, 999)

          query = query.gte("start_time", startOfDay.toISOString()).lte("start_time", endOfDay.toISOString())
        }

        const { data, error } = await query

        if (error) throw error

        // Process matches
        const processedMatches = data
          .filter((match) => {
            // Filter out private matches
            if (match.is_private) return false

            // Filter out matches that already have enough participants
            const participantCount = match.participants?.length || 0
            if (participantCount >= 2) return false

            // Filter out matches the user's teams are already part of
            if (hideJoinedFilter) {
              const isParticipant = match.participants?.some((p: any) => userTeamIds.includes(p.team_id))
              if (isParticipant) return false
            }

            return true
          })
          .map((match) => ({
            ...match,
            participantCount: match.participants?.length || 0,
          }))

        setMatches(processedMatches)
      } catch (err: any) {
        console.error("Error fetching matches:", err)
        setError(err.message || "Failed to load available matches")
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [supabase, userTeams, gameFilter, matchTypeFilter, teamSizeFilter, dateFilter, hideJoinedFilter])

  const resetFilters = () => {
    setGameFilter("")
    setMatchTypeFilter("")
    setTeamSizeFilter("")
    setDateFilter("")
    setHideJoinedFilter(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Find Matches</CardTitle>
            <CardDescription>Join available matches</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="game-filter">Game</Label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger id="game-filter">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="match-type-filter">Match Type</Label>
              <Select value={matchTypeFilter} onValueChange={setMatchTypeFilter}>
                <SelectTrigger id="match-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="scrim">Scrim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team-size-filter">Team Size</Label>
              <Select value={teamSizeFilter} onValueChange={setTeamSizeFilter}>
                <SelectTrigger id="team-size-filter">
                  <SelectValue placeholder="Any Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Size</SelectItem>
                  <SelectItem value="1">1v1</SelectItem>
                  <SelectItem value="2">2v2</SelectItem>
                  <SelectItem value="3">3v3</SelectItem>
                  <SelectItem value="4">4v4</SelectItem>
                  <SelectItem value="5">5v5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-filter">Date</Label>
              <Input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center mt-4">
            <Checkbox
              id="hide-joined"
              checked={hideJoinedFilter}
              onCheckedChange={(checked) => setHideJoinedFilter(checked === true)}
            />
            <Label htmlFor="hide-joined" className="ml-2">
              Hide matches my teams have joined
            </Label>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      )}

      <CardContent className="pt-6">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">There are no available matches that match your criteria.</p>
            <Button asChild>
              <Link href="/matches/schedule">Schedule a Match</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-secondary p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={match.game?.logo_url || ""} alt={match.game?.name} />
                      <AvatarFallback>{match.game?.name?.[0] || "G"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{match.game?.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground space-x-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(match.start_time), "MMM d")}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(match.start_time), "h:mm a")}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {match.team_size}v{match.team_size}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">
                      {match.match_type.charAt(0).toUpperCase() + match.match_type.slice(1)}
                    </Badge>
                    <Button size="sm" asChild>
                      <Link href={`/matches/${match.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-6">
        <Button asChild>
          <Link href="/matches/schedule">Schedule Your Own Match</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
