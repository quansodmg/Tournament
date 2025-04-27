"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import ScheduleMatchForm from "@/components/matches/schedule-match-form"
import { createClient } from "@/lib/supabase/client"

export default function ScheduleMatchClientPage({
  initialUserId,
  initialTeams,
  initialGames,
}: {
  initialUserId: string
  initialTeams: any[]
  initialGames: any[]
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState(initialUserId)
  const [teams, setTeams] = useState(initialTeams)
  const [games, setGames] = useState(initialGames)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          router.push("/auth")
          return
        }

        setUserId(data.user.id)
        setIsLoading(false)
      } catch (err) {
        console.error("Auth check failed:", err)
        setError("Authentication failed. Please try logging in again.")
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <p className="text-red-700">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/auth")}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Schedule a Match</h1>

      <div className="max-w-2xl">
        <ScheduleMatchForm
          userId={userId}
          userTeams={teams}
          games={games}
          onSuccess={(matchId) => {
            console.log("Match scheduled successfully, redirecting to:", `/matches/${matchId}`)
            router.push(`/matches/${matchId}`)
          }}
        />
      </div>
    </div>
  )
}
