"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Team {
  id: string
  name: string
  logo_url: string | null
}

interface TeamMatch {
  team: Team
}

interface Match {
  id: string
  start_time: string
  match_type: string
  participants: TeamMatch[]
}

interface Game {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  cover_image?: string | null
  release_date: string
  publisher: string
  genre: string
  platform: string
  active_players: number
  total_tournaments: number
}

interface GameDetailProps {
  game: Game
  upcomingMatches: Match[]
}

export default function GameDetail({ game, upcomingMatches }: GameDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-800">
              {game.image_url || game.cover_image ? (
                <Image
                  src={game.image_url || game.cover_image || "/placeholder.svg"}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/placeholder.svg?height=300&width=500&text=GAME"
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-4 text-blue-400">{game.name}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-600 text-white border-none">{game.genre}</Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                {game.platform}
              </Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                {game.publisher}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-md">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span>Released: {formatDate(game.release_date)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-md">
                <Users className="h-5 w-5 text-blue-400" />
                <span>{game.active_players?.toLocaleString() || "N/A"} active players</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-md">
                <Trophy className="h-5 w-5 text-blue-400" />
                <span>{game.total_tournaments || "0"} tournaments</span>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-md mb-6">
              <p className="text-gray-300">{game.description || "No description available."}</p>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/tournaments?game=${game.slug}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                View Tournaments
              </Link>
              <Link
                href={`/teams?game=${game.slug}`}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Find Teams
              </Link>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-6 text-blue-400">Upcoming Matches</h2>

        {upcomingMatches && upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <Card key={match.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-blue-600 text-white border-none">{match.match_type}</Badge>
                    <span className="text-sm text-gray-400">{new Date(match.start_time).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    {match.participants && match.participants.length >= 2 ? (
                      <>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 relative mb-2">
                            {match.participants[0]?.team?.logo_url ? (
                              <Image
                                src={match.participants[0].team.logo_url || "/placeholder.svg"}
                                alt={match.participants[0].team.name}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-200">
                            {match.participants[0]?.team?.name || "TBD"}
                          </span>
                        </div>

                        <div className="text-xl font-bold text-blue-400">VS</div>

                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 relative mb-2">
                            {match.participants[1]?.team?.logo_url ? (
                              <Image
                                src={match.participants[1].team.logo_url || "/placeholder.svg"}
                                alt={match.participants[1].team.name}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-200">
                            {match.participants[1]?.team?.name || "TBD"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full text-center py-4 text-gray-400">Teams not yet confirmed</div>
                    )}
                  </div>

                  <Link
                    href={`/matches/${match.id}`}
                    className="block w-full text-center mt-4 text-sm text-blue-400 hover:text-blue-300"
                  >
                    View match details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No upcoming matches for this game</p>
            <Link href="/matches" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all matches
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
