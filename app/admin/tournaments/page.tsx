// Add these lines at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable cache completely

import { createServerClient } from "@/lib/supabase/server"
import TournamentList from "@/components/admin/tournament-list"

export default async function AdminTournamentsPage({
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

    // Get tournaments with pagination
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("tournaments")
      .select(`
        *,
        game:games(name),
        creator:profiles(username)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (tournamentsError) {
      console.error("Error fetching tournaments:", tournamentsError)
      throw new Error("Failed to fetch tournaments")
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase.from("tournaments").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching tournaments count:", countError)
      // Continue without count
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Tournament Management</h1>
        <TournamentList tournaments={tournaments || []} currentPage={currentPage} totalPages={totalPages} />
      </div>
    )
  } catch (error) {
    console.error("Error in AdminTournamentsPage:", error)
    throw error // This will be caught by the error boundary
  }
}
