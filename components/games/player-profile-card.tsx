"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Trophy, Activity, Clock } from "lucide-react"
import type { SupportedGame } from "@/lib/api/game-api-factory"
import { useGameProfile, useGameStats, useGameMatches } from "@/lib/hooks/use-game-data"
import Image from "next/image"

interface PlayerProfileCardProps {
  game: SupportedGame
  playerId: string
  region?: string
}

export function PlayerProfileCard({ game, playerId, region }: PlayerProfileCardProps) {
  const { data: profile, error: profileError, isLoading: profileLoading } = useGameProfile(game, playerId, { region })
  const { data: stats, error: statsError, isLoading: statsLoading } = useGameStats(game, playerId, { region })
  const {
    data: matches,
    error: matchesError,
    isLoading: matchesLoading,
  } = useGameMatches(game, playerId, 5, { region })

  const isLoading = profileLoading || statsLoading
  const hasError = profileError || statsError

  const getGameIcon = (game: SupportedGame) => {
    switch (game) {
      case "league-of-legends":
        return "/placeholder.svg?key=xk9tf"
      case "csgo":
        return "/placeholder.svg?key=6s7vu"
      case "valorant":
        return "/placeholder.svg?key=s0shj"
      case "dota2":
        return "/placeholder.svg?key=kqmcf"
      case "overwatch":
        return "/placeholder.svg?key=bjyv0"
      default:
        return "/placeholder.svg?key=yp18m"
    }
  }

  const getGameName = (game: SupportedGame) => {
    switch (game) {
      case "league-of-legends":
        return "League of Legends"
      case "csgo":
        return "CS:GO"
      case "valorant":
        return "VALORANT"
      case "dota2":
        return "Dota 2"
      case "overwatch":
        return "Overwatch"
      default:
        return game
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{profileError || statsError}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Player Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Could not find player profile for the given ID.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={profile.avatarUrl || ""} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{profile.displayName}</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Image
                  src={getGameIcon(game) || "/placeholder.svg"}
                  width={16}
                  height={16}
                  alt={game}
                  className="rounded-sm"
                />
                {getGameName(game)}
              </Badge>
            </div>
            <CardDescription>
              {profile.region && `Region: ${profile.region.toUpperCase()}`}
              {profile.level && ` • Level ${profile.level}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="matches">Recent Matches</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 pt-4">
            {stats ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Win Rate</div>
                    <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.wins}W - {stats.losses}L ({stats.totalMatches} games)
                    </div>
                  </div>

                  {stats.rank && (
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3">
                      {stats.rankIconUrl && (
                        <Image
                          src={stats.rankIconUrl || "/placeholder.svg"}
                          width={48}
                          height={48}
                          alt={stats.rank}
                          className="object-contain"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Rank</div>
                        <div className="text-xl font-bold">
                          {stats.rank} {stats.rankDivision || ""}
                        </div>
                        {stats.eloRating !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">{stats.eloRating} LP</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Game-specific stats */}
                {game === "league-of-legends" && stats.gameSpecificStats && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">Queue Information</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Queue Type: {stats.gameSpecificStats.queueType.replace("_", " ")}</div>
                      <div>League Points: {stats.gameSpecificStats.leaguePoints}</div>
                      <div>Hot Streak: {stats.gameSpecificStats.hotStreak ? "Yes" : "No"}</div>
                      <div>Veteran: {stats.gameSpecificStats.veteran ? "Yes" : "No"}</div>
                      <div>Fresh Blood: {stats.gameSpecificStats.freshBlood ? "Yes" : "No"}</div>
                      <div>Inactive: {stats.gameSpecificStats.inactive ? "Yes" : "No"}</div>
                    </div>
                  </div>
                )}

                {game === "csgo" && stats.gameSpecificStats && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">Performance Stats</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        K/D Ratio: {(stats.gameSpecificStats.kills / stats.gameSpecificStats.deaths).toFixed(2)}
                      </div>
                      <div>Accuracy: {stats.gameSpecificStats.accuracy}%</div>
                      <div>
                        Headshot %:{" "}
                        {((stats.gameSpecificStats.headshots / stats.gameSpecificStats.kills) * 100).toFixed(1)}%
                      </div>
                      <div>MVPs: {stats.gameSpecificStats.mvps}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No stats available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches" className="pt-4">
            {matchesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : matchesError ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Error loading matches.</p>
              </div>
            ) : matches && matches.length > 0 ? (
              <div>
                {/* Match history component will go here */}
                <p>Match history component</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No recent matches found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No achievements available yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
