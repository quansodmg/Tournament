import { notFound } from "next/navigation"
import GameDetail from "@/components/games/game-detail"
import { createServerClient } from "@/lib/supabase"

export default async function GamePage({ params }: { params: { slug: string } }) {
  const supabase = await createServerClient()

  try {
    // Fetch the game details
    const { data: game, error: gameError } = await supabase.from("games").select("*").eq("slug", params.slug).single()

    if (gameError || !game) {
      console.error("Game fetch error:", gameError)
      notFound()
    }

    // Fetch upcoming matches without filtering by game_id since that column doesn't exist
    // Instead, we'll fetch recent matches that we can display
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        start_time,
        match_type,
        participants:match_participants(
          team:team_id(id, name, logo_url)
        )
      `)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5)

    if (matchesError) {
      console.error("Matches fetch error:", matchesError)
      // Continue even if matches fetch fails
    }

    return <GameDetail game={game} upcomingMatches={matches || []} />
  } catch (error) {
    console.error("Error in game page:", error)
    notFound()
  }
}
