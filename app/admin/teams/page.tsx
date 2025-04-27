// Add these lines at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable cache completely

import { createServerClient } from "@/lib/supabase/server"
import TeamList from "@/components/admin/team-list"

export default async function AdminTeamsPage({
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

    // Get teams with pagination
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(`
        *,
        creator:created_by(username),
        members:team_members(count)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (teamsError) {
      console.error("Error fetching teams:", teamsError)
      throw new Error("Failed to fetch teams")
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase.from("teams").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching teams count:", countError)
      // Continue without count
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Team Management</h1>
        <TeamList teams={teams || []} currentPage={currentPage} totalPages={totalPages} />
      </div>
    )
  } catch (error) {
    console.error("Error in AdminTeamsPage:", error)
    throw error // This will be caught by the error boundary
  }
}
