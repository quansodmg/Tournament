"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default function ScheduleMatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Schedule match error:", error)
  }, [error])

  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-600">Schedule Match Error</CardTitle>
          </div>
          <CardDescription>We encountered an issue while loading the match scheduling page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-indigo-100 text-sm overflow-auto max-h-32 text-black">
            {error.message || "An unknown error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
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
