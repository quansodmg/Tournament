"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import Link from "next/link"

export default function TournamentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Tournaments error:", error)
  }, [error])

  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-600">Tournaments Error</CardTitle>
          </div>
          <CardDescription>We encountered an issue while loading tournament information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-yellow-100 text-sm overflow-auto max-h-32 text-black">
            {error.message || "An unknown error occurred while loading tournaments"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/tournaments">All Tournaments</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Return to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
