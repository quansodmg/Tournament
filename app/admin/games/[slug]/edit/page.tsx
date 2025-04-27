import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import EditGameForm from "@/components/admin/edit-game-form"

// Force dynamic rendering and disable cache
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminEditGamePage({ params }: { params: { slug: string } }) {
  try {
    // Create the Supabase client with proper error handling
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Handle session error
    if (sessionError) {
      console.error("Session error:", sessionError)
      redirect("/auth?redirectedFrom=/admin/games")
    }

    // If no session, redirect to auth
    if (!session) {
      redirect("/auth?redirectedFrom=/admin/games")
    }

    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", session.user.id)
      .maybeSingle()

    if (adminError) {
      console.error("Admin check error:", adminError)
    }

    // If not an admin, redirect to home
    if (!adminData) {
      redirect("/")
    }

    // Get game details
    const { data: game, error: gameError } = await supabase.from("games").select("*").eq("slug", params.slug).single()

    if (gameError || !game) {
      console.error("Game fetch error:", gameError)
      notFound()
    }

    return (
      <div className="p-6">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/games">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Edit Game: {game.name}</h1>
        <div className="max-w-3xl">
          <EditGameForm game={game} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in AdminEditGamePage:", error)
    throw error // This will be caught by the error boundary
  }
}
