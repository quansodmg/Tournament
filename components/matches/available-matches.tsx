"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, Calendar, Clock, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface AvailableMatchesProps {
  userId: string
  limit?: number
  showViewAll?: boolean
}

export default function AvailableMatches({ userId, limit = 5, showViewAll = true }: AvailableMatchesProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    async function fetchAvailableMatches() {
      try {
        setLoading(true)

        // Get user's teams
        const { data: userTeams, error: teamsError } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("profile_id", userId)

        if (teamsError) throw teamsError
        const userTeamIds = userTeams.map((t) => t.team_id)

        // Get matches where user's teams are participants
        const { data: userMatches, error: userMatchesError } = await supabase
          .from("match_participants")
          .select("match_id")
          .in("team_id", userTeamIds.length > 0 ? userTeamIds : ["00000000-0000-0000-0000-000000000000"])

        if (userMatchesError) throw userMatchesError
        const userMatchIds = userMatches.map((m) => m.match_id)

        // Get available matches (scheduled, not full, not user's)
        // Fix: Don't use the foreign key relationship, fetch games separately
        const { data: matchesData, error } = await supabase
          .from("matches")
          .select(`
            *,
            match_participants(*)
          `)
          .eq("status", "scheduled")
          .gt("start_time", new Date().toISOString())
          .not(
            "id",
            "in",
            userMatchIds.length > 0 ? `(${userMatchIds.join(",")})` : "(00000000-0000-0000-0000-000000000000)",
          )
          .order("start_time")
          .limit(limit)

        if (error) throw error

        // Filter matches that already have 2 participants
        const availableMatches = matchesData.filter((match) => {
          return (match.match_participants?.length || 0) < 2
        })

        // Fetch game details separately
        const gameIds = availableMatches.map((match) => match.game_id).filter((id) => id !== null) as string[]

        let gamesData: Record<string, any> = {}

        if (gameIds.length > 0) {
          const { data: games, error: gamesError } = await supabase.from("games").select("*").in("id", gameIds)

          if (gamesError) throw gamesError

          // Create a lookup object for games
          gamesData = (games || []).reduce(
            (acc, game) => {
              acc[game.id] = game
              return acc
            },
            {} as Record<string, any>,
          )
        }

        // Attach game data to matches
        const matchesWithGames = availableMatches.map((match) => ({
          ...match,
          game: match.game_id ? gamesData[match.game_id] : null,
        }))

        setMatches(matchesWithGames)
      } catch (err: any) {
        console.error("Error fetching available matches:", err)
        setError(err.message || "Failed to load available matches")
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableMatches()
  }, [userId, limit, supabase])

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

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Matches</CardTitle>
          <CardDescription>Join open matches</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>No available matches found. Check back later or create your own match.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Matches</CardTitle>
        <CardDescription>Join open matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={match.game?.logo_url || ""} alt={match.game?.name} />
                  <AvatarFallback>{match.game?.name?.[0] || "G"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{match.game?.name || "Unknown Game"}</p>
                    <Badge className="ml-2" variant="outline">
                      {match.match_type?.charAt(0).toUpperCase() + match.match_type?.slice(1) || "Match"}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(match.start_time), "MMM d")}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(match.start_time), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/matches/${match.id}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {showViewAll && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <Link href="/match-finder">Find More Matches</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
