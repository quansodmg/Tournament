"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react"
import Link from "next/link"

export default function FixDatabasePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const runMigration = async () => {
    setStatus("loading")
    setMessage("Fixing database schema...")

    try {
      const response = await fetch(`/api/system/run-essential-migration`)
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.error || "An unknown error occurred")
      }
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Fix Database Schema
          </CardTitle>
          <CardDescription>Add missing game_id column to matches table</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
                <div className="mt-2">
                  <Link href="/matches/create" className="text-green-800 underline">
                    Try creating a match now
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{message}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-gray-600 mb-4">
            This will fix the database schema by adding the missing game_id column to the matches table. This operation
            is safe to run and will resolve the "Could not find the 'game_id' column" error.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={runMigration} disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Database...
              </>
            ) : (
              "Fix Database Schema"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
