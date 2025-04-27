// Add these lines at the top of the file to prevent static rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { ArrowLeft, Edit, Calendar, Mail, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import InviteMemberDialog from "@/components/teams/invite-member-dialog"
import PendingInvitations from "@/components/teams/pending-invitations"
import { createServerClient } from "@/lib/supabase/server" // Import directly from server.ts

// Replace the existing function with this updated version
export default async function TeamPage({ params }: { params: { id: string } }) {
  try {
    // Properly await the Supabase client creation
    const supabase = await createServerClient()

    // Verify that the client has the expected methods
    if (!supabase || typeof supabase.from !== "function" || !supabase.auth) {
      throw new Error("Invalid Supabase client: required methods not available")
    }

    // Check authentication with error handling
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      throw new Error("Authentication failed")
    }

    if (!session) {
      redirect("/auth?redirectedFrom=/teams/" + params.id)
    }

    // Get team details with error handling
    const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", params.id).single()

    if (teamError) {
      console.error("Team fetch error:", teamError)
      throw teamError
    }

    if (!team) {
      notFound()
    }

    // Check if user is a member of the team with error handling
    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", team.id)
      .eq("profile_id", session.user.id)
      .maybeSingle()

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("Membership check error:", membershipError)
      throw membershipError
    }

    const isTeamMember = !!membership
    const isTeamOwner = team.created_by === session.user.id
    const userRole = membership?.role || null

    // If not a member, check if there's a pending invitation with error handling
    let hasPendingInvitation = false
    if (!isTeamMember) {
      const { data: invitation, error: invitationError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", team.id)
        .eq("profile_id", session.user.id)
        .eq("status", "pending")
        .maybeSingle()

      if (invitationError && invitationError.code !== "PGRST116") {
        console.error("Invitation check error:", invitationError)
        throw invitationError
      }

      hasPendingInvitation = !!invitation
    }

    // If not a member and no pending invitation, redirect to teams page
    if (!isTeamMember && !hasPendingInvitation && !isTeamOwner) {
      redirect("/teams")
    }

    // Get team members with error handling
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select(`
        *,
        profile:profile_id(id, username, avatar_url, full_name)
      `)
      .eq("team_id", team.id)
      .order("role", { ascending: true })

    if (membersError) {
      console.error("Team members fetch error:", membersError)
      throw membersError
    }

    // Check for pending match invitations with error handling
    const { count: matchInvitationsCount, error: invitationsCountError } = await supabase
      .from("match_invitations")
      .select("*", { count: "exact", head: true })
      .eq("team_id", team.id)
      .eq("status", "pending")

    if (invitationsCountError) {
      console.error("Match invitations count error:", invitationsCountError)
      // Continue without count if there's an error
    }

    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                      {team.logo_url ? (
                        <Image
                          src={team.logo_url || "/placeholder.svg"}
                          alt={team.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold">{team.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{team.name}</CardTitle>
                      <CardDescription>{isTeamOwner ? "You are the owner" : `You are a ${userRole}`}</CardDescription>
                    </div>
                  </div>
                  {isTeamOwner && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/teams/${team.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Team</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {team.description && <p className="text-muted-foreground mb-6">{team.description}</p>}

                <div className="flex flex-col space-y-2">
                  {isTeamOwner && <InviteMemberDialog teamId={team.id} teamName={team.name} />}

                  {isTeamMember && matchInvitationsCount > 0 && (
                    <Button asChild variant="secondary">
                      <Link href={`/teams/${team.id}/invitations`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Match Invitations
                        <Badge className="ml-2" variant="secondary">
                          {matchInvitationsCount}
                        </Badge>
                      </Link>
                    </Button>
                  )}

                  {isTeamMember && (
                    <Button asChild variant="outline">
                      <Link href="/matches/schedule">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Match
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue="members">
              <TabsList>
                <TabsTrigger value="members">Members</TabsTrigger>
                {isTeamOwner && <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>}
              </TabsList>
              <TabsContent value="members" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>{members?.length || 0} members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {members && members.length > 0 ? (
                      <div className="space-y-4">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={member.profile.avatar_url || ""} alt={member.profile.username} />
                                <AvatarFallback>{member.profile.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.profile.username}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{member.role}</Badge>
                                  {member.profile.full_name && (
                                    <p className="text-xs text-muted-foreground">{member.profile.full_name}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isTeamOwner && member.profile_id !== session.user.id && (
                              <Button variant="ghost" size="sm">
                                Manage
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No team members yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {isTeamOwner && (
                <TabsContent value="invitations" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Team Invitations</CardTitle>
                      <CardDescription>Players who have been invited to join your team</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PendingInvitations teamId={team.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in TeamPage:", error)
    throw error // This will be caught by the error boundary
  }
}
