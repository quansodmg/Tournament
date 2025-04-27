"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Game {
  id: string
  name: string
  slug: string
}

interface Tournament {
  id: string
  name: string
  slug: string
  banner_image: string | null
  start_date: string
  format?: string
  entry_fee: number
  max_teams: number
  game: {
    id: string
    name: string
    slug: string
  }
}

interface TournamentsClientProps {
  tournaments: Tournament[]
  games: Game[]
  error: string | null
  selectedGame: string
}

export default function TournamentsClient({ tournaments, games, error, selectedGame }: TournamentsClientProps) {
  const router = useRouter()

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value) {
      router.push(`/tournaments?game=${value}`)
    } else {
      router.push("/tournaments")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Tournaments</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <select
              className="w-full sm:w-48 pl-3 pr-10 py-2 text-base border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedGame}
              onChange={handleGameChange}
            >
              <option value="">All Games</option>
              {games?.map((game) => (
                <option key={game.id} value={game.slug}>
                  {game.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <Button asChild>
            <Link href="/tournaments/create">Create Tournament</Link>
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {tournaments?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.slug}`}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={tournament.banner_image || "/placeholder.svg?height=192&width=384"}
                  alt={tournament.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h2 className="text-xl font-bold text-white">{tournament.name}</h2>
                  <p className="text-sm text-gray-200">{tournament.game?.name}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Starts: {new Date(tournament.start_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Format: {tournament.format || "Standard"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{tournament.entry_fee > 0 ? `$${tournament.entry_fee}` : "Free"}</p>
                    <p className="text-sm text-gray-600">{tournament.max_teams} teams</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No tournaments found</h2>
          <p className="text-gray-600 mb-6">
            {selectedGame
              ? "There are no tournaments for this game yet."
              : "There are no tournaments available at the moment."}
          </p>
          <Button asChild>
            <Link href="/tournaments/create">Create Tournament</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
