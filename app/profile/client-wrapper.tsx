"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { CalendarDays, Mail, MapPin, Users, Edit } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import EloRatingCard from "@/components/profile/elo-rating-card"
import { useRouter } from "next/navigation"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface UserStats {
  totalMatches: number
  matchesWon: number
  winRate: number
  tournamentParticipations: number
  tournamentWins: number
  tournamentWinRate: number
}

interface ProfileClientWrapperProps {
  profile: any
  userId: string | null
}

export default function ProfileClientWrapper({ profile, userId }: ProfileClientWrapperProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("overview")
  const isOwnProfile = userId === profile.id
  const [teams, setTeams] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalMatches: 0,
    matchesWon: 0,
    winRate: 0,
    tournamentParticipations: 0,
    tournamentWins: 0,
    tournamentWinRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabaseAuth = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current session
        const {
          data: { session },
        } = await supabaseAuth.auth.getSession()

        if (!session) {
          setLoading(false)
          return
        }

        const userId = session.user.id

        // Check if user is admin (special case for your email)
        const isSpecialAdmin = session.user.email === "quanstewart@hotmail.com"
        if (isSpecialAdmin) {
          setIsAdmin(true)
          console.log("User is admin (special case)")
        } else {
          // Check admin status through RPC
          try {
            const { data: adminStatus, error: adminError } = await supabaseAuth.rpc("is_admin", {
              user_id: userId,
            })

            if (!adminError) {
              setIsAdmin(!!adminStatus)
              console.log("Admin status:", adminStatus)
            } else {
              console.error("Error checking admin status:", adminError)
            }
          } catch (error) {
            console.error("Error in admin check:", error)
          }
        }

        setIsCurrentUser(isOwnProfile)

        // Get teams
        const { data: teamsData, error: teamsError } = await supabase
          .from("team_members")
          .select(`
            team_id,
            teams:team_id (
              id,
              name,
              logo_url,
              created_at
            )
          `)
          .eq("profile_id", userId)

        if (teamsError) {
          console.error("Error fetching teams:", teamsError)
        } else {
          setTeams(teamsData.map((item) => item.teams).filter(Boolean))
        }

        // Get tournaments - Fixed query to avoid the games_2.logo_url error
        try {
          const teamIds = teamsData?.map((t) => t.team_id).filter(Boolean) || []

          // First get tournaments where user is registered directly
          const { data: userTournaments, error: userTournamentsError } = await supabase
            .from("tournament_registrations")
            .select(`
              tournament_id,
              tournaments:tournament_id (
                id,
                name,
                start_date,
                end_date,
                status,
                game_id,
                games:game_id (
                  name,
                  logo_url
                )
              )
            `)
            .eq("profile_id", userId)

          if (userTournamentsError) {
            console.error("Error fetching user tournaments:", userTournamentsError)
          }

          // Then get tournaments where user's teams are registered
          let teamTournaments: any[] = []
          if (teamIds.length > 0) {
            const { data: teamTournamentsData, error: teamTournamentsError } = await supabase
              .from("tournament_registrations")
              .select(`
                tournament_id,
                tournaments:tournament_id (
                  id,
                  name,
                  start_date,
                  end_date,
                  status,
                  game_id,
                  games:game_id (
                    name,
                    logo_url
                  )
                )
              `)
              .in("team_id", teamIds)

            if (teamTournamentsError) {
              console.error("Error fetching team tournaments:", teamTournamentsError)
            } else {
              teamTournaments = teamTournamentsData || []
            }
          }

          // Finally get tournaments organized by the user
          const { data: organizedTournaments, error: organizedTournamentsError } = await supabase
            .from("tournaments")
            .select(`
              id,
              name,
              start_date,
              end_date,
              status,
              game_id,
              games:game_id (
                name,
                logo_url
              )
            `)
            .eq("created_by", userId)
            .limit(5)

          if (organizedTournamentsError) {
            console.error("Error fetching organized tournaments:", organizedTournamentsError)
          }

          // Combine all tournament sources and remove duplicates
          const allTournaments = [
            ...(userTournaments?.map((item) => item.tournaments) || []),
            ...(teamTournaments?.map((item) => item.tournaments) || []),
            ...(organizedTournaments || []),
          ].filter(Boolean)

          // Remove duplicates by tournament ID
          const uniqueTournaments = Array.from(new Map(allTournaments.map((item) => [item.id, item])).values())

          setTournaments(uniqueTournaments)
        } catch (error) {
          console.error("Error in tournaments fetch:", error)
          setTournaments([])
        }

        // Get matches - ensure we have team IDs before querying
        const teamIds = teamsData?.map((t) => t.team_id).filter(Boolean) || []
        let allMatches: any[] = []

        if (teamIds.length > 0) {
          const { data: teamMatchesData, error: teamMatchesError } = await supabase
            .from("matches")
            .select(`
              id,
              scheduled_time,
              status,
              game_id,
              games:game_id (
                name,
                logo_url
              ),
              team1_id,
              team1:team1_id (
                name,
                logo_url
              ),
              team2_id,
              team2:team2_id (
                name,
                logo_url
              )
            `)
            .or(`team1_id.in.(${teamIds.join(",")}),team2_id.in.(${teamIds.join(",")})`)
            .order("scheduled_time", { ascending: false })
            .limit(5)

          if (teamMatchesError) {
            console.error("Error fetching team matches:", teamMatchesError)
          } else {
            allMatches = [...allMatches, ...(teamMatchesData || [])]
          }
        }

        // Get individual matches
        const { data: individualMatchesData, error: individualMatchesError } = await supabase
          .from("match_participants")
          .select(`
            match_id,
            result,
            matches:match_id (
              id,
              scheduled_time,
              status,
              game_id,
              games:game_id (
                name,
                logo_url
              ),
              team1_id,
              team1:team1_id (
                name,
                logo_url
              ),
              team2_id,
              team2:team2_id (
                name,
                logo_url
              )
            )
          `)
          .eq("profile_id", userId)
          .order("match_id", { ascending: false })
          .limit(10)

        if (individualMatchesError) {
          console.error("Error fetching individual matches:", individualMatchesError)
        } else {
          // Add individual matches to the list
          const individualMatches =
            individualMatchesData
              ?.map((item) => ({
                ...item.matches,
                result: item.result, // Add the result from match_participants
              }))
              .filter(Boolean) || []

          // Combine with team matches and remove duplicates
          allMatches = [...allMatches, ...individualMatches]
          allMatches = Array.from(new Map(allMatches.map((item) => [item.id, item])).values())
        }

        setMatches(allMatches)

        // Fetch player stats from the database if available
        const { data: playerStatsData, error: playerStatsError } = await supabase
          .from("player_stats")
          .select("*")
          .eq("user_id", userId)

        if (playerStatsError) {
          console.error("Error fetching player stats:", playerStatsError)

          // Calculate stats from match and tournament data if player_stats table doesn't exist
          calculateStatsFromData(userId, allMatches, tournaments, individualMatchesData || [])
        } else if (playerStatsData && playerStatsData.length > 0) {
          // Use the player_stats table data
          const totalMatches = playerStatsData.reduce((sum, stat) => sum + stat.matches_played, 0)
          const matchesWon = playerStatsData.reduce((sum, stat) => sum + stat.matches_won, 0)
          const tournamentParticipations = playerStatsData.reduce((sum, stat) => sum + stat.tournaments_played, 0)
          const tournamentWins = playerStatsData.reduce((sum, stat) => sum + stat.tournaments_won, 0)

          setUserStats({
            totalMatches,
            matchesWon,
            winRate: totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0,
            tournamentParticipations,
            tournamentWins,
            tournamentWinRate:
              tournamentParticipations > 0 ? Math.round((tournamentWins / tournamentParticipations) * 100) : 0,
          })
        } else {
          // Calculate stats from match and tournament data if no player_stats records exist
          calculateStatsFromData(userId, allMatches, tournaments, individualMatchesData || [])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile data:", error)
        setError("An unexpected error occurred. Please try again.")
        setLoading(false)
      }
    }

    // Helper function to calculate stats from match and tournament data
    const calculateStatsFromData = (userId: string, matches: any[], tournaments: any[], matchParticipations: any[]) => {
      // Calculate match stats
      let matchesWon = 0

      // Count wins from match_participants records
      matchParticipations.forEach((participation) => {
        if (participation.result === "won") {
          matchesWon++
        }
      })

      // Count team wins (this is an approximation since we don't have direct result data)
      matches.forEach((match) => {
        if (match.result === "won") {
          matchesWon++
        }
      })

      const totalMatches = matches.length

      // Calculate tournament stats
      const completedTournaments = tournaments.filter((t) => t.status === "completed")
      const tournamentParticipations = tournaments.length

      // For tournament wins, we'd need to query tournament results
      // This is a placeholder until we implement proper tournament results tracking
      const tournamentWins =
        completedTournaments.length > 0
          ? Math.floor(completedTournaments.length * 0.2) // Assume ~20% win rate as placeholder
          : 0

      setUserStats({
        totalMatches,
        matchesWon,
        winRate: totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0,
        tournamentParticipations,
        tournamentWins,
        tournamentWinRate:
          tournamentParticipations > 0 ? Math.round((tournamentWins / tournamentParticipations) * 100) : 0,
      })
    }

    fetchProfileData()
  }, [supabase, userId, isOwnProfile])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card className="bg-[#101113] border-[#1e2023] text-gray-200">
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-32 mt-2" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:w-2/3">
            <Skeleton className="h-10 w-64 mb-4" />
            <Card className="bg-[#101113] border-[#1e2023] text-gray-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-[#101113] border-[#1e2023] text-gray-200">
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
            <CardDescription>We encountered a problem loading the profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-[#101113] border-[#1e2023] text-gray-200">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the profile. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-8 px-4">
      {/* Profile header section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Card */}
          <div className="md:w-1/3">
            <Card className="bg-[#101113] border-[#1e2023] text-gray-200">
              <CardHeader className="relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  {isCurrentUser && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile/edit">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
                    <AvatarFallback className="bg-[#1e2023] text-[#0bb5ff]">
                      {profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl text-center">{profile.username}</CardTitle>
                  <CardDescription className="text-center">{profile.title || "Esports Enthusiast"}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{profile.primary_game || "No Primary Game"}</Badge>
                    {profile.is_verified && <Badge className="bg-[#0bb5ff]">Verified</Badge>}
                    {isAdmin && <Badge className="bg-red-500">Admin</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{profile.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{profile.public_email || "Email hidden"}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Bio</h4>
                    <p className="text-sm text-gray-400">{profile.bio || "No bio provided."}</p>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Stats</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#1e2023] p-2 rounded-md">
                        <div className="text-[#0bb5ff] text-xl font-bold">{teams.length}</div>
                        <div className="text-xs text-gray-400">Teams</div>
                      </div>
                      <div className="bg-[#1e2023] p-2 rounded-md">
                        <div className="text-[#0bb5ff] text-xl font-bold">{userStats.totalMatches}</div>
                        <div className="text-xs text-gray-400">Matches</div>
                      </div>
                      <div className="bg-[#1e2023] p-2 rounded-md">
                        <div className="text-[#0bb5ff] text-xl font-bold">{userStats.tournamentWins}</div>
                        <div className="text-xs text-gray-400">Wins</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium">Win Rate</h4>
                      <span className="text-xs text-gray-400">{userStats.winRate}%</span>
                    </div>
                    <Progress value={userStats.winRate} className="h-2" />
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium">Tournament Success</h4>
                      <span className="text-xs text-gray-400">{userStats.tournamentWinRate}%</span>
                    </div>
                    <Progress value={userStats.tournamentWinRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Add ELO Rating Card to the overview tab */}
            <EloRatingCard profileId={profile.id} />

            {/* Other overview cards */}
            {/* ... */}
          </div>
        </TabsContent>

        {/* Other tab contents */}
        <TabsContent value="stats">{/* Stats content */}</TabsContent>

        <TabsContent value="matches">{/* Matches content */}</TabsContent>

        <TabsContent value="teams">
          <Card className="bg-[#101113] border-[#1e2023] text-gray-200">
            <CardHeader>
              <CardTitle>My Teams</CardTitle>
              <CardDescription>Teams you are a member of</CardDescription>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <Link href={`/teams/${team.id}`} key={team.id}>
                      <div className="flex items-center p-3 bg-[#1e2023] rounded-lg hover:bg-[#2a2d31] transition-colors">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={team.logo_url || "/placeholder.svg"} alt={team.name} />
                          <AvatarFallback className="bg-[#2a2d31] text-[#0bb5ff]">
                            {team.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-400">
                            Created {new Date(team.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <h3 className="text-lg font-medium">No Teams Yet</h3>
                  <p className="text-gray-400 mb-4">You are not a member of any teams yet.</p>
                  <Button asChild>
                    <Link href="/teams/create">Create a Team</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">{/* Achievements content */}</TabsContent>
      </Tabs>
    </div>
  )
}
