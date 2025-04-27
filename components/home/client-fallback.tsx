"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { HeroSlider } from "./hero-slider"
import { GamesGrid } from "./games-grid"
import { LatestTournaments } from "./latest-tournaments"
import { TopEarners } from "./top-earners"
import { UpcomingTournaments } from "./upcoming-tournaments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

// Fallback data in case database queries fail
const fallbackGames = [
  {
    id: 1,
    name: "League of Legends",
    slug: "league-of-legends",
    cover_image: "/vibrant-esports-showdown.png",
  },
  {
    id: 2,
    name: "Counter-Strike 2",
    slug: "counter-strike-2",
    cover_image: "/tactical-shooter-scene.png",
  },
  {
    id: 3,
    name: "Valorant",
    slug: "valorant",
    cover_image: "/urban-team-clash.png",
  },
]

const fallbackTournaments = [
  {
    id: 1,
    name: "Summer Championship",
    slug: "summer-championship",
    start_date: new Date().toISOString(),
    prize_pool: 10000,
    team_size: 5,
    game: { name: "League of Legends" },
  },
  {
    id: 2,
    name: "Winter Invitational",
    slug: "winter-invitational",
    start_date: new Date(Date.now() + 86400000).toISOString(),
    prize_pool: 5000,
    team_size: 5,
    game: { name: "Counter-Strike 2" },
  },
]

const fallbackPlayers = [
  {
    id: 1,
    total_earnings: 500000,
    profile: {
      id: 1,
      username: "ProGamer123",
      avatar_url: "/placeholder-svg.png",
    },
    game: { name: "League of Legends" },
  },
  {
    id: 2,
    total_earnings: 350000,
    profile: {
      id: 2,
      username: "EsportsChamp",
      avatar_url: "/placeholder-svg.png",
    },
    game: { name: "Counter-Strike 2" },
  },
]

const fallbackSlides = [
  {
    id: 1,
    name: "Championship Finals",
    slug: "championship-finals",
    banner_image: "/esports-arena-showdown.png",
  },
  {
    id: 2,
    name: "Pro League Season 5",
    slug: "pro-league-season-5",
    banner_image: "/vibrant-esports-showdown.png",
  },
]

export default function ClientFallback() {
  console.log("ClientFallback component rendering")

  const [games, setGames] = useState(fallbackGames)
  const [latestTournaments, setLatestTournaments] = useState(fallbackTournaments)
  const [upcomingFreeTournaments, setUpcomingFreeTournaments] = useState(fallbackTournaments)
  const [topPlayers, setTopPlayers] = useState(fallbackPlayers)
  const [heroSlides, setHeroSlides] = useState(fallbackSlides)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchStage, setFetchStage] = useState("not_started")
  const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({})
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Use a ref to track if initial data has been loaded
  const initialLoadComplete = useRef(false)

  // Function to fetch data with proper caching
  const fetchData = useCallback(async () => {
    // If we've already loaded data once, don't try again automatically
    if (initialLoadComplete.current && retryCount === 0) {
      setLoading(false)
      return
    }

    console.log("fetchData function started")
    setFetchStage("initializing")
    setLoading(true)
    setError(null)

    try {
      // Get the Supabase client
      console.log("Initializing Supabase client")
      const supabase = createClient()

      if (!supabase) {
        console.error("Failed to initialize Supabase client")
        throw new Error("Failed to initialize database connection")
      }

      console.log("Supabase client initialized:", !!supabase)
      setFetchStage("supabase_initialized")

      // Simple connection test
      try {
        setFetchStage("testing_connection")
        const { error: connectionError } = await supabase.from("games").select("count").limit(1)

        if (connectionError) {
          console.error("Connection test failed:", connectionError)
          throw new Error(`Database connection error: ${connectionError.message}`)
        }

        console.log("Connection test successful")
      } catch (err) {
        console.error("Error testing connection:", err)
        throw new Error("Database connection test failed")
      }

      // Fetch games
      try {
        console.log("Fetching games data")
        setFetchStage("fetching_games")

        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("id, name, slug, cover_image")
          .order("name")

        if (gamesError) {
          console.error("Error fetching games:", gamesError)
          setFetchErrors((prev) => ({ ...prev, games: gamesError.message }))
        } else {
          console.log("Games data fetched:", gamesData ? gamesData.length : 0, "items")
          if (gamesData && gamesData.length > 0) {
            setGames(gamesData)
            setUsingFallbackData(false)
          }
        }
      } catch (err) {
        console.error("Error fetching games:", err)
        setFetchErrors((prev) => ({ ...prev, games: err instanceof Error ? err.message : String(err) }))
      }

      // Fetch latest tournaments
      try {
        console.log("Fetching latest tournaments")
        setFetchStage("fetching_tournaments")

        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from("tournaments")
          .select(`
            id, name, slug, start_date, prize_pool, team_size,
            game:games(name)
          `)
          .order("created_at", { ascending: false })
          .limit(3)

        if (tournamentsError) {
          console.error("Error fetching tournaments:", tournamentsError)
          setFetchErrors((prev) => ({ ...prev, tournaments: tournamentsError.message }))
        } else {
          console.log("Latest tournaments fetched:", tournamentsData ? tournamentsData.length : 0, "items")
          if (tournamentsData && tournamentsData.length > 0) {
            setLatestTournaments(tournamentsData)
          }
        }
      } catch (err) {
        console.error("Error fetching latest tournaments:", err)
        setFetchErrors((prev) => ({ ...prev, tournaments: err instanceof Error ? err.message : String(err) }))
      }

      // Fetch upcoming free tournaments
      try {
        console.log("Fetching upcoming free tournaments")
        setFetchStage("fetching_free_tournaments")

        const { data: freeToursData, error: freeToursError } = await supabase
          .from("tournaments")
          .select(`
            id, name, slug, start_date, entry_fee,
            game:games(name)
          `)
          .eq("entry_fee", 0)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(3)

        if (freeToursError) {
          console.error("Error fetching free tournaments:", freeToursError)
          setFetchErrors((prev) => ({ ...prev, freeTournaments: freeToursError.message }))
        } else {
          console.log("Upcoming free tournaments fetched:", freeToursData ? freeToursData.length : 0, "items")
          if (freeToursData && freeToursData.length > 0) {
            setUpcomingFreeTournaments(freeToursData)
          }
        }
      } catch (err) {
        console.error("Error fetching upcoming tournaments:", err)
        setFetchErrors((prev) => ({ ...prev, freeTournaments: err instanceof Error ? err.message : String(err) }))
      }

      // Fetch top players
      try {
        console.log("Fetching top players")
        setFetchStage("fetching_players")

        const { data: playersData, error: playersError } = await supabase
          .from("player_stats")
          .select(`
            id, total_earnings,
            profile:profiles(id, username, avatar_url),
            game:games(name)
          `)
          .order("total_earnings", { ascending: false })
          .limit(3)

        if (playersError) {
          console.error("Error fetching players:", playersError)
          setFetchErrors((prev) => ({ ...prev, players: playersError.message }))
        } else {
          console.log("Top players fetched:", playersData ? playersData.length : 0, "items")
          if (playersData && playersData.length > 0) {
            setTopPlayers(playersData)
          }
        }
      } catch (err) {
        console.error("Error fetching top players:", err)
        setFetchErrors((prev) => ({ ...prev, players: err instanceof Error ? err.message : String(err) }))
      }

      // Fetch hero slides
      try {
        console.log("Fetching hero slides")
        setFetchStage("fetching_slides")

        const { data: slidesData, error: slidesError } = await supabase
          .from("tournaments")
          .select(`
            id, name, slug, banner_image
          `)
          .limit(3)

        if (slidesError) {
          console.error("Error fetching hero slides:", slidesError)
          setFetchErrors((prev) => ({ ...prev, slides: slidesError.message }))
        } else {
          console.log("Hero slides fetched:", slidesData ? slidesData.length : 0, "items")
          if (slidesData && slidesData.length > 0) {
            setHeroSlides(slidesData)
          }
        }
      } catch (err) {
        console.error("Error fetching hero slides:", err)
        setFetchErrors((prev) => ({ ...prev, slides: err instanceof Error ? err.message : String(err) }))
      }

      console.log("All data fetching completed")
      setFetchStage("completed")

      // Mark initial load as complete
      initialLoadComplete.current = true
    } catch (err) {
      console.error("Error initializing Supabase client or general fetch error:", err)
      setError(`Database connection error: ${err instanceof Error ? err.message : String(err)}`)
      setFetchStage("error")
      setUsingFallbackData(true)

      // Still mark initial load as complete even if it failed
      initialLoadComplete.current = true
    } finally {
      console.log("Fetch process completed, setting loading to false")
      setLoading(false)
    }
  }, [retryCount])

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    setLoading(true)
    setError(null)
    setFetchStage("retrying")
    fetchData()
  }, [fetchData])

  useEffect(() => {
    console.log("ClientFallback useEffect running")

    // Force exit from loading state after 5 seconds no matter what
    const forceExitTimeout = setTimeout(() => {
      console.log("Forcing exit from loading state after timeout")
      setLoading(false)

      if (!initialLoadComplete.current) {
        setUsingFallbackData(true)
        setError("Unable to load data from the database. Showing fallback content.")
        initialLoadComplete.current = true
      }
    }, 5000)

    // Only fetch data on initial mount or when retry is clicked
    fetchData()

    return () => {
      clearTimeout(forceExitTimeout)
    }
  }, [fetchData])

  if (loading) {
    console.log("Rendering loading state")
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading content... ({fetchStage})</p>
        <p className="text-sm text-muted-foreground mt-2">
          If this takes too long, we'll show fallback content shortly.
        </p>
      </div>
    )
  }

  console.log("Rendering content with data")
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4 mx-auto max-w-4xl mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {error} (Stage: {fetchStage})
            </span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {usingFallbackData && !error && (
        <Alert className="mb-4 mx-auto max-w-4xl mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Using demo content. Database connection unavailable.</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <HeroSlider slides={heroSlides} />
      <GamesGrid games={games} />
      <LatestTournaments tournaments={latestTournaments} />
      <TopEarners players={topPlayers} />
      <UpcomingTournaments tournaments={upcomingFreeTournaments} />
    </>
  )
}
