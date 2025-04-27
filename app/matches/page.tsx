import { createServerClient } from "@/lib/supabase/server"
import MatchesOverview from "@/components/matches/matches-overview"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Matches | Esports Platform",
  description: "Browse, join, and manage your esports matches",
}

export default async function MatchesPage() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Instead of redirecting, we'll handle the unauthenticated state in the component
    // This prevents the redirect error

    // Get user's teams (if logged in)
    let userTeams = []
    let profile = null

    if (session?.user?.id) {
      const { data: teamsData } = await supabase
        .from("team_members")
        .select(`
          team_id,
          role,
          team:team_id(
            id,
            name,
            logo_url,
            created_at
          )
        `)
        .eq("profile_id", session.user.id)

      userTeams = teamsData?.map((t) => t.team).filter(Boolean) || []

      // Get user's profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      profile = profileData
    }

    // Get all games for filtering
    const { data: games } = await supabase.from("games").select("id, name, slug, logo_url").order("name")

    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <MatchesOverview
          userId={session?.user?.id}
          userProfile={profile}
          userTeams={userTeams || []}
          games={games || []}
          isAuthenticated={!!session}
        />
      </div>
    )
  } catch (error) {
    console.error("Error in matches page:", error)

    // If the error is a redirect, we'll handle it more gracefully
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-4">Matches</h1>
          <p>Loading matches...</p>
        </div>
      )
    }

    throw error // This will trigger the error boundary for other types of errors
  }
}
