"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Leaderboard
          </CardTitle>
          <CardDescription>Something went wrong while loading the leaderboard data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We encountered an error while trying to load the leaderboard. Please try again later.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
