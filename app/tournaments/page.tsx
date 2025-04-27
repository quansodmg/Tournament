import { createServerClient } from "@/lib/supabase/server"
import TournamentsClient from "./tournaments-client"

// Force dynamic rendering and disable cache
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: { game?: string }
}) {
  try {
    // Create the Supabase client with proper error handling
    const supabase = await createServerClient()

    // Initialize empty data arrays for fallback
    let tournaments = []
    let games = []
    let error = null

    // Build query
    let query = supabase
      .from("tournaments")
      .select(`
        *,
        game:games(id, name, slug)
      `)
      .order("start_date", { ascending: true })

    // Filter by game if provided
    if (searchParams.game) {
      try {
        const { data: gameData } = await supabase.from("games").select("id").eq("slug", searchParams.game).single()

        if (gameData) {
          query = query.eq("game_id", gameData.id)
        }
      } catch (gameError) {
        console.error("Error fetching game for filter:", gameError)
        // Continue without filtering if game not found
      }
    }

    // Get tournaments
    const { data: tournamentsData, error: tournamentsError } = await query

    if (tournamentsError) {
      console.error("Error fetching tournaments:", tournamentsError)
      error = "Failed to load tournaments"
    } else {
      tournaments = tournamentsData || []
    }

    // Get all games for filter
    const { data: gamesData, error: gamesError } = await supabase.from("games").select("id, name, slug").order("name")

    if (gamesError) {
      console.error("Error fetching games for filter:", gamesError)
    } else {
      games = gamesData || []
    }

    // Pass the data to the client component
    return (
      <TournamentsClient tournaments={tournaments} games={games} error={error} selectedGame={searchParams.game || ""} />
    )
  } catch (e) {
    console.error("Tournaments page error:", e)
    // Return the client component with error state
    return (
      <TournamentsClient
        tournaments={[]}
        games={[]}
        error="An unexpected error occurred. Please try again later."
        selectedGame=""
      />
    )
  }
}
