"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface Team {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  created_by: string
}

interface EditTeamFormProps {
  team: Team
  userId: string
}

export default function EditTeamForm({ team, userId }: EditTeamFormProps) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || "")
  const [logoUrl, setLogoUrl] = useState(team.logo_url || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const router = useRouter()
  const supabase = createClient()

  // Check database connection on mount
  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  // Function to check database connection
  const checkDatabaseConnection = async () => {
    setConnectionStatus("checking")
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        console.error("Database connection check failed:", error)
        setConnectionStatus("disconnected")
        setError("Database connection unavailable. Please try again later.")
      } else {
        setConnectionStatus("connected")
        setError(null)
      }
    } catch (err) {
      console.error("Error checking database connection:", err)
      setConnectionStatus("disconnected")
      setError("Unable to connect to the database. Please refresh the page and try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError("Request timed out. Please try again.")
      }
    }, 10000) // 10 second timeout

    try {
      // Verify user is the team owner
      if (team.created_by !== userId) {
        setError("You don't have permission to edit this team.")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      // Validate logo URL if provided
      if (logoUrl && !isValidUrl(logoUrl)) {
        setError("Please enter a valid URL for the team logo")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      // Use the API route instead of direct Supabase call
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          logo_url: logoUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update team")
      }

      // Clear timeout since we're done
      clearTimeout(timeoutId)

      // Success - redirect to the team page
      setLoading(false)
      router.push(`/teams/${team.id}`)
      router.refresh()
    } catch (error) {
      console.error("Unexpected error in team update:", error)
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`)
      setLoading(false)
      clearTimeout(timeoutId)
    }
  }

  // Helper function to validate URLs
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Edit Team</CardTitle>
          <CardDescription>Update your team's information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus === "disconnected" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Database connection unavailable</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkDatabaseConnection}
                  disabled={connectionStatus === "checking"}
                >
                  {connectionStatus === "checking" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input id="team-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              placeholder="Tell us about your team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-url">Team Logo URL</Label>
            <Input
              id="logo-url"
              type="text"
              placeholder="https://example.com/logo.jpg"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push(`/teams/${team.id}`)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || connectionStatus === "disconnected" || connectionStatus === "checking"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
