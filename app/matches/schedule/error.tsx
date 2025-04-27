"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function ScheduleMatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Schedule match error:", error)
  }, [error])

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

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Something went wrong</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We encountered an error while trying to load the match scheduling page.
        </p>
        <div className="flex space-x-4">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Button asChild>
            <Link href="/matches">Return to Matches</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
