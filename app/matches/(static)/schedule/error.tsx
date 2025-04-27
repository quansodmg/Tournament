"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function ScheduleMatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Schedule match error:", error)
  }, [error])

  // Handle reset safely
  const handleReset = () => {
    if (typeof reset === "function") {
      reset()
    } else {
      // Fallback if reset is not available
      window.location.reload()
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-destructive/50">
        <CardHeader className="bg-destructive/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Error Scheduling Match</CardTitle>
          </div>
          <CardDescription>There was a problem loading the match scheduling form.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md bg-destructive/10 p-4 mb-4">
            <p className="text-sm font-medium text-destructive">{error?.message || "An unexpected error occurred"}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            This could be due to a temporary server issue or a problem with your connection.
          </p>
          <p className="text-sm text-muted-foreground">
            You can try refreshing the page, going back to the matches page, or returning to the home page.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 flex-wrap">
          <Button onClick={handleReset} className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-1">
            <Link href="/matches">
              <ArrowLeft className="h-4 w-4" />
              Back to Matches
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-1">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
