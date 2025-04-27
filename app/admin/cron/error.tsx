"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminCronError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cron Job Monitor</h1>
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Something went wrong!</h2>
        <p className="mb-4">{error.message || "Failed to load cron job data"}</p>
        <Button onClick={reset} variant="destructive">
          Try again
        </Button>
      </div>
    </div>
  )
}
