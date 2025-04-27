import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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

    // Redirect to auth if not logged in
    if (!session) {
      redirect("/auth?redirect=/matches")
    }

    // Get user's teams
    const { data: userTeams } = await supabase
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

    // Get user's profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // Get all games for filtering
    const { data: games } = await supabase.from("games").select("id, name, slug, logo_url").order("name")

    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <MatchesOverview
          userId={session.user.id}
          userProfile={profile}
          userTeams={userTeams?.map((t) => t.team) || []}
          games={games || []}
        />
      </div>
    )
  } catch (error) {
    console.error("Error in matches page:", error)
    throw error // This will trigger the error boundary
  }
}
