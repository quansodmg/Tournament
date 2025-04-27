import { createServerClient } from "@/lib/supabase/server"
import GameList from "@/components/admin/game-list"

// Mark this page as dynamic to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable cache completely

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  try {
    // Create the Supabase client with proper error handling
    const supabase = await createServerClient()

    if (!supabase || typeof supabase.from !== "function") {
      throw new Error("Invalid Supabase client: 'from' method is not available")
    }

    // Get pagination parameters
    const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const pageSize = 10
    const offset = (currentPage - 1) * pageSize

    // Get games with pagination
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .order("name")
      .range(offset, offset + pageSize - 1)

    if (gamesError) {
      console.error("Error fetching games:", gamesError)
      throw new Error("Failed to fetch games")
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase.from("games").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching games count:", countError)
      // Continue without count
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Game Management</h1>
        <GameList games={games || []} currentPage={currentPage} totalPages={totalPages} />
      </div>
    )
  } catch (error) {
    console.error("Error in AdminGamesPage:", error)
    throw error // This will be caught by the error boundary
  }
}
