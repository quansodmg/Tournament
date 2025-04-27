"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"

export default function AcceptMatchError({
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
    <MainLayout>
      <div className="container max-w-screen-xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Link>
          </Button>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || "An error occurred while loading the match acceptance page."}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
