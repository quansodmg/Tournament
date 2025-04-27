"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import Link from "next/link"

export default function TournamentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Tournament detail error:", error)
  }, [error])

  // Check if it's a not found error
  const isNotFoundError = error.message?.toLowerCase().includes("not found")
  // Check if it's a permission error
  const isPermissionError =
    error.message?.toLowerCase().includes("permission") ||
    error.message?.toLowerCase().includes("access") ||
    error.message?.toLowerCase().includes("forbidden")

  let errorTitle = "Tournament Error"
  let errorDescription = "We encountered an issue while loading this tournament."

  if (isNotFoundError) {
    errorTitle = "Tournament Not Found"
    errorDescription = "We couldn't find the tournament you're looking for."
  } else if (isPermissionError) {
    errorTitle = "Access Denied"
    errorDescription = "You don't have permission to view this tournament."
  }

  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-600">{errorTitle}</CardTitle>
          </div>
          <CardDescription>{errorDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-amber-100 text-sm overflow-auto max-h-32 text-black">
            {error.message || "An unknown error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          {!isNotFoundError && (
            <Button onClick={() => reset()} variant="default">
              Try again
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/tournaments">Browse All Tournaments</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Return to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
