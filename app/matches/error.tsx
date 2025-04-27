"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

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
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || "An error occurred while loading the matches page."}
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
