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

interface CreateTeamFormProps {
  userId: string
}

export default function CreateTeamForm({ userId }: CreateTeamFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
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
      // Simple query to check if database is accessible - removed timeout
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

    // Check connection before attempting submission
    if (connectionStatus !== "connected") {
      await checkDatabaseConnection()
      if (connectionStatus !== "connected") {
        setError("Cannot create team while database is unavailable. Please try again later.")
        setLoading(false)
        return
      }
    }

    try {
      // Insert the team - removed timeout
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name,
          description,
          logo_url: logoUrl,
          created_by: userId,
        })
        .select()
        .single()

      if (teamError) {
        console.error("Team creation error:", teamError)
        setError(`Failed to create team: ${teamError.message}`)
        return
      }

      if (!team || !team.id) {
        setError("Team was created but no ID was returned. Please check your teams page.")
        setLoading(false)
        router.push("/teams")
        return
      }

      // Add the creator as a team member with 'owner' role - removed timeout
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: team.id,
        profile_id: userId,
        role: "owner",
      })

      if (memberError) {
        console.error("Team member creation error:", memberError)
        setError(`Team created but failed to add you as owner: ${memberError.message}`)
        // Still redirect to the team page since the team was created
        router.push(`/teams/${team.id}`)
        return
      }

      // Success - redirect to the team page
      router.push(`/teams/${team.id}`)
    } catch (error) {
      console.error("Unexpected error in team creation:", error)
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>Create a new team to compete in tournaments</CardDescription>
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
        <CardFooter>
          <Button
            type="submit"
            disabled={loading || connectionStatus === "disconnected" || connectionStatus === "checking"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Team"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
