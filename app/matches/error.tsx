"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function MatchesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Matches error:", error)
  }, [error])

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>An error occurred while loading the matches page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-32">
            {error.message || "Unknown error"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
