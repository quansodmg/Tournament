"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TeamRosterProps {
  teamId: string
}

export default function TeamRoster({ teamId }: TeamRosterProps) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("team_members")
          .select(`
            role,
            profile:profile_id(
              id,
              username,
              avatar_url,
              player_stats:player_stats(*)
            )
          `)
          .eq("team_id", teamId)
          .order("role", { ascending: true })

        if (error) throw error

        if (data) {
          setMembers(data)
        }
      } catch (error) {
        console.error("Error fetching team members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [teamId, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No team members found</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Roster</CardTitle>
        <CardDescription>Team members and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <Avatar>
                <AvatarImage src={member.profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{member.profile?.username?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.profile?.username}</p>
                <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
              </div>
              {member.role === "captain" && (
                <Badge variant="outline" className="ml-auto">
                  <Shield className="h-3 w-3 mr-1" /> Captain
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
