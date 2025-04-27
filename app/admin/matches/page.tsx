// Add these lines at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable cache completely

import { createServerClient } from "@/lib/supabase/server"
import MatchList from "@/components/admin/match-list"

export default async function AdminMatchesPage({
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

    // Get matches with pagination
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        *,
        scheduled_by:profiles(username),
        participants:match_participants(
          team:team_id(id, name, logo_url),
          profile:profile_id(id, username, avatar_url)
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      throw new Error("Failed to fetch matches")
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase.from("matches").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching matches count:", countError)
      // Continue without count
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Match Management</h1>
        <MatchList matches={matches || []} currentPage={currentPage} totalPages={totalPages} />
      </div>
    )
  } catch (error) {
    console.error("Error in AdminMatchesPage:", error)
    throw error // This will be caught by the error boundary
  }
}
