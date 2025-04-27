import type { Metadata } from "next"
import EloLeaderboard from "@/components/leaderboard/elo-leaderboard"
import { createServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Leaderboard | Esports Gaming Platform",
  description: "View the top players and teams ranked by ELO rating",
}

export default async function LeaderboardPage() {
  const supabase = await createServerClient()

  // Get featured game (most popular)
  const { data: featuredGame } = await supabase
    .from("games")
    .select("id")
    .order("player_count", { ascending: false })
    .limit(1)
    .single()

  const featuredGameId = featuredGame?.id

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

      <div className="grid grid-cols-1 gap-8">
        <EloLeaderboard limit={20} />
      </div>
    </div>
  )
}
