"use client"

import { useEffect, useState, useRef } from "react"
import ClientFallback from "@/components/home/client-fallback"
import StaticFallback from "@/components/home/static-fallback"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomeClientWrapper() {
  console.log("HomeClientWrapper rendering")
  const [error, setError] = useState<Error | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  // Use a ref to track if we've already handled an error
  const errorHandled = useRef(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      // Only handle errors once to prevent continuous reloading
      if (errorHandled.current) return

      console.error("Caught error in HomeClientWrapper:", error)
      setError(error.error || new Error("An unknown error occurred"))
      setUseFallback(true)
      errorHandled.current = true
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  // Function to retry loading the client component
  const handleRetry = () => {
    errorHandled.current = false
    setUseFallback(false)
    setError(null)
  }

  if (useFallback) {
    console.log("Using static fallback due to error")
    return (
      <>
        <Alert variant="destructive" className="mb-4 mx-auto max-w-4xl mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error ? error.message : "An error occurred loading dynamic content."}</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
        <StaticFallback />
      </>
    )
  }

  try {
    return <ClientFallback />
  } catch (err) {
    // Only handle errors once to prevent continuous reloading
    if (!errorHandled.current) {
      console.error("Error rendering ClientFallback:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      setUseFallback(true)
      errorHandled.current = true
    }
    return <StaticFallback />
  }
}
