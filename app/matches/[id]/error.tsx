"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords } from "lucide-react"
import Link from "next/link"

export default function MatchDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Match detail error:", error)
  }, [error])

  // Check if it's a not found error
  const isNotFoundError = error.message?.toLowerCase().includes("not found")
  // Check if it's a permission error
  const isPermissionError =
    error.message?.toLowerCase().includes("permission") ||
    error.message?.toLowerCase().includes("access") ||
    error.message?.toLowerCase().includes("private match")

  let errorTitle = "Match Error"
  let errorDescription = "We encountered an issue while loading this match."

  if (isNotFoundError) {
    errorTitle = "Match Not Found"
    errorDescription = "We couldn't find the match you're looking for."
  } else if (isPermissionError) {
    errorTitle = "Private Match"
    errorDescription = "You don't have permission to view this private match."
  }

  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-600">{errorTitle}</CardTitle>
          </div>
          <CardDescription>{errorDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-indigo-100 text-sm overflow-auto max-h-32 text-black">
            {error.message || "An unknown error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          {!isNotFoundError && !isPermissionError && (
            <Button onClick={() => reset()} variant="default">
              Try again
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/matches">Browse All Matches</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Return to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
