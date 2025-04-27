"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function MatchesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Use a safer approach to navigation
    const redirectToMatchesClient = () => {
      try {
        router.push("/matches-client")
      } catch (error) {
        console.error("Error redirecting to matches-client:", error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    // Small timeout to ensure router is ready
    const timeoutId = setTimeout(redirectToMatchesClient, 100)

    return () => clearTimeout(timeoutId)
  }, [router])

  const handleCreateMatch = () => {
    router.push("/matches/schedule")
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Matches</h1>
        <Button onClick={handleCreateMatch} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Create Match
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      )}

      {hasError && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load matches. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      )}
    </div>
  )
}
