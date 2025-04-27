"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AvailableMatches from "@/components/matches/available-matches"

export default function MatchesClientPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session) {
          router.push("/auth")
          return
        }

        setUserId(session.user.id)

        // Get user's teams
        const { data: userTeamsData, error: teamsError } = await supabase
          .from("team_members")
          .select(`
            team:teams(
              id,
              name,
              logo_url
            )
          `)
          .eq("profile_id", session.user.id)

        if (teamsError) throw teamsError

        const teams = userTeamsData?.map((item) => item.team) || []
        setUserTeams(teams)

        // Get games
        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("id, name, slug")
          .order("name")

        if (gamesError) throw gamesError

        setGames(gamesData || [])
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [supabase, router])

  const handleCreateMatch = () => {
    router.push("/matches/schedule")
  }

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Matches</h1>
          <Button onClick={handleCreateMatch} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Match
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Matches</h1>
          <Button onClick={handleCreateMatch} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Match
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Matches</h1>
        <Button onClick={handleCreateMatch} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Create Match
        </Button>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="available">Available Matches</TabsTrigger>
          <TabsTrigger value="my-matches">My Matches</TabsTrigger>
          <TabsTrigger value="past-matches">Past Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Matches</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by game" />
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
          </div>

          {userId && (
            <AvailableMatches
              userId={userId}
              userTeamIds={userTeams.map((team) => team.id)}
              gameFilter={selectedGame}
            />
          )}
        </TabsContent>

        <TabsContent value="my-matches">
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">My Matches Coming Soon</h3>
            <p className="text-muted-foreground mb-6">This section will show matches you've created or joined</p>
          </div>
        </TabsContent>

        <TabsContent value="past-matches">
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Past Matches Coming Soon</h3>
            <p className="text-muted-foreground mb-6">This section will show your match history</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
