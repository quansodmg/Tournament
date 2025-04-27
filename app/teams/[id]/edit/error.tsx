"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function EditTeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Edit team error:", error)
  }, [error])

  return (
    <div className="container max-w-screen-md mx-auto py-16 px-4">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Error Editing Team</CardTitle>
          </div>
          <CardDescription>We encountered an issue while trying to edit this team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-red-100 text-sm overflow-auto max-h-32 text-black">
            {error.message || "An unknown error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/teams">Back to Teams</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
