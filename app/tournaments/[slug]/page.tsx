export const dynamic = "force-dynamic"
export const revalidate = 0

import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users, Clock, AlertCircle, Edit } from "lucide-react"
import TournamentRegistration from "@/components/tournaments/tournament-registration"
import TournamentBracket from "@/components/tournaments/tournament-bracket"
import BracketManager from "@/components/tournaments/bracket-manager"
import { ErrorBoundary } from "@/components/error-boundary"
import { createServerClient } from "@/lib/supabase/server" // Import directly from server.ts

export default async function TournamentPage({ params }: { params: { slug: string } }) {
  return (
    <ErrorBoundary>
      <TournamentContent params={params} />
    </ErrorBoundary>
  )
}

async function TournamentContent({ params }: { params: { slug: string } }) {
  // Make sure to await the client creation since it's an async function
  const supabase = await createServerClient()

  try {
    // Get tournament details
    const { data: tournament, error } = await supabase
      .from("tournaments")
      .select(`
        *,
        game:games(*),
        creator:profiles(username, avatar_url)
      `)
      .eq("slug", params.slug)
      .single()

    if (error || !tournament) {
      console.error("Error fetching tournament:", error)
      notFound()
    }

    // Get session for conditional rendering
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if user is the tournament creator
    const isCreator = session && tournament.created_by === session.user.id

    // Get all registrations for this tournament
    const { data: registrations } = await supabase
      .from("tournament_registrations")
      .select(`
        *,
        team:team_id(*),
        profile:profile_id(*)
      `)
      .eq("tournament_id", tournament.id)

    // Check if user is already registered
    let isRegistered = false
    let registration = null

    if (session) {
      const { data: registrationData } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", tournament.id)
        .eq("profile_id", session.user.id)
        .maybeSingle()

      if (registrationData) {
        isRegistered = true
        registration = registrationData
      } else {
        // Check if user's team is registered
        const { data: teamRegistrations } = await supabase
          .from("tournament_registrations")
          .select(`
            *,
            team:teams!inner(
              *,
              team_members!inner(*)
            )
          `)
          .eq("tournament_id", tournament.id)
          .eq("team.team_members.profile_id", session.user.id)

        if (teamRegistrations && teamRegistrations.length > 0) {
          isRegistered = true
          registration = teamRegistrations[0]
        }
      }
    }

    // Format dates
    const startDate = new Date(tournament.start_date)
    const endDate = new Date(tournament.end_date)
    const registrationCloseDate = new Date(tournament.registration_close_date)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    // Check if registration is still open
    const isRegistrationOpen = new Date() < registrationCloseDate

    // Check if tournament has started
    const hasStarted = new Date() >= startDate

    // Check if tournament has brackets
    const { data: matches } = await supabase.from("matches").select("id").eq("tournament_id", tournament.id).limit(1)

    const hasBrackets = matches && matches.length > 0

    return (
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
          {tournament.banner_image ? (
            <Image
              src={tournament.banner_image || "/placeholder.svg"}
              alt={tournament.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Trophy className="h-16 w-16 opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end p-6">
            <div className="flex-1">
              <Badge className="mb-2">{tournament.game.name}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{tournament.name}</h1>
            </div>
            {isCreator && (
              <Button asChild variant="secondary" className="mt-auto">
                <Link href={`/tournaments/${params.slug}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Tournament
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue={hasStarted ? "bracket" : "details"}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="bracket">Bracket</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Details</CardTitle>
                    <CardDescription>Everything you need to know about this tournament</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Description</h3>
                      <p>{tournament.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Start Date</h3>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{formatDate(startDate)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">End Date</h3>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{formatDate(endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Registration Closes</h3>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{formatDate(registrationCloseDate)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">Team Size</h3>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{tournament.team_size} players per team</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Entry Fee</h3>
                        <div className="flex items-center">
                          <span>{tournament.entry_fee > 0 ? `$${tournament.entry_fee}` : "Free"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">Prize Pool</h3>
                        <div className="flex items-center">
                          <Trophy className="mr-2 h-4 w-4" />
                          <span>${tournament.prize_pool}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Organized by</h3>
                      <div className="flex items-center">
                        <span>{tournament.creator.username}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rules" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tournament.rules ? (
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap">{tournament.rules}</pre>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No rules have been provided for this tournament.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="participants" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                    <CardDescription>
                      {registrations?.length || 0} {tournament.team_size > 1 ? "teams" : "players"} registered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {registrations && registrations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {registrations.map((reg) => {
                          const isTeam = !!reg.team_id
                          const name = isTeam ? reg.team?.name : reg.profile?.username
                          const image = isTeam ? reg.team?.logo_url : reg.profile?.avatar_url

                          return (
                            <div key={reg.id} className="flex items-center p-3 bg-muted/30 rounded-md">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                                {image ? (
                                  <Image
                                    src={image || "/placeholder.svg"}
                                    alt={name || ""}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-bold">{name?.[0]?.toUpperCase() || "?"}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Registered on {new Date(reg.registered_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No participants have registered yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="bracket" className="mt-6">
                {hasBrackets ? (
                  <TournamentBracket tournamentId={tournament.id} isOrganizer={isCreator} />
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {isRegistrationOpen
                        ? "The tournament bracket will be generated after registration closes."
                        : "The tournament bracket has not been generated yet."}
                    </p>
                    {isCreator && !isRegistrationOpen && (
                      <BracketManager tournament={tournament} registrations={registrations || []} />
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
                <CardDescription>
                  {isRegistrationOpen
                    ? `Registration closes on ${formatDate(registrationCloseDate)}`
                    : "Registration is closed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!session ? (
                  <div className="text-center py-4">
                    <p className="mb-4">Sign in to register for this tournament</p>
                    <Button asChild>
                      <Link href="/auth">Sign In</Link>
                    </Button>
                  </div>
                ) : isRegistered ? (
                  <div className="text-center py-4">
                    <Badge className="mb-4 bg-green-500">Registered</Badge>
                    <p>You are registered for this tournament.</p>
                  </div>
                ) : !isRegistrationOpen ? (
                  <div className="text-center py-4">
                    <Badge className="mb-4" variant="secondary">
                      Closed
                    </Badge>
                    <p>Registration for this tournament has closed.</p>
                  </div>
                ) : (
                  <TournamentRegistration tournament={tournament} userId={session.user.id} />
                )}
              </CardContent>
            </Card>

            {isCreator && tournament.status === "upcoming" && !isRegistrationOpen && !hasBrackets && (
              <div className="mt-6">
                <BracketManager tournament={tournament} registrations={registrations || []} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in tournament page:", error)
    throw error
  }
}
