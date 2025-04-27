import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { ConnectionRecovery } from "@/components/ui/connection-recovery"

// Force dynamic rendering and disable cache
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TeamsPage() {
  try {
    // Dynamically import the createServerClient function
    const { createServerClient } = await import("@/lib/supabase/server")

    // Create the Supabase client with proper error handling
    const supabase = await createServerClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Get all teams with error handling - removed the timeout method
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(`
        *,
        members:team_members(
          profile:profiles(id, username, avatar_url)
        )
      `)
      .order("created_at", { ascending: false })

    if (teamsError) {
      console.error("Error fetching teams:", teamsError)
      throw new Error(`Failed to fetch teams: ${teamsError.message}`)
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Teams</h1>

          <Button asChild>
            <Link href="/teams/create">Create Team</Link>
          </Button>
        </div>

        {/* Add connection recovery component */}
        <ConnectionRecovery />

        {teams?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {team.logo_url && (
                    <div className="absolute top-0 left-0 w-full h-full">
                      <Image
                        src={team.logo_url || "/placeholder.svg"}
                        alt={team.name}
                        fill
                        className="object-cover opacity-30"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{team.description}</p>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Members</h3>
                    <div className="flex -space-x-2 overflow-hidden">
                      {team.members.slice(0, 5).map((member: any) => (
                        <div key={member.profile.id} className="relative w-8 h-8 rounded-full border-2 border-white">
                          <Image
                            src={member.profile.avatar_url || "/placeholder.svg?height=32&width=32"}
                            alt={member.profile.username}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="relative w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-white rounded-lg shadow p-8 text-center">
            <CardContent className="pt-6">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No teams found</h2>
              <p className="text-gray-600 mb-6">Create a team to start competing in tournaments.</p>
              <Button asChild>
                <Link href="/teams/create">Create Team</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    // Log the error and re-throw it to be caught by the error boundary
    console.error("Teams page error:", error)
    throw error
  }
}
