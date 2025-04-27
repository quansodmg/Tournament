// Add these lines at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EditTeamForm from "@/components/teams/edit-team-form"
import { createServerClient } from "@/lib/supabase/server"

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  try {
    // Create Supabase client
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      throw new Error("Authentication failed")
    }

    if (!session) {
      redirect("/auth?redirectedFrom=/teams/" + params.id + "/edit")
    }

    // Get team details
    const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", params.id).single()

    if (teamError) {
      console.error("Team fetch error:", teamError)
      throw teamError
    }

    if (!team) {
      notFound()
    }

    // Check if user is the team owner
    if (team.created_by !== session.user.id) {
      redirect(`/teams/${params.id}`)
    }

    return (
      <div className="container max-w-screen-md mx-auto py-16 px-4">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href={`/teams/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Link>
          </Button>
        </div>

        <EditTeamForm team={team} userId={session.user.id} />
      </div>
    )
  } catch (error) {
    console.error("Error in EditTeamPage:", error)
    throw error // This will be caught by the error boundary
  }
}
