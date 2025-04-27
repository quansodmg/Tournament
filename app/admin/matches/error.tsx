"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminMatchesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin matches error:", error)
  }, [error])

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto border-red-200 bg-red-50 text-black">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Error Loading Matches</CardTitle>
          </div>
          <CardDescription className="text-red-700">We encountered an issue while loading the matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-red-100 text-sm overflow-auto max-h-32">
            {error.message || "An unknown error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
