"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface Game {
  id: string
  name: string
  slug: string
  cover_image: string | null
}

interface GamesGridProps {
  games: Game[]
}

export function GamesGrid({ games = [] }: GamesGridProps) {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  // Update the fallback games to include proper placeholder images

  // Update the fallbackGames array to include better placeholder images
  const fallbackGames =
    games.length > 0
      ? games
      : [
          {
            id: "1",
            name: "Call of Duty",
            slug: "call-of-duty",
            cover_image: "/placeholder.svg?height=400&width=400&text=Call%20of%20Duty",
          },
          {
            id: "2",
            name: "Fortnite",
            slug: "fortnite",
            cover_image: "/placeholder.svg?height=400&width=400&text=Fortnite",
          },
          {
            id: "3",
            name: "Rocket League",
            slug: "rocket-league",
            cover_image: "/placeholder.svg?height=400&width=400&text=Rocket%20League",
          },
          {
            id: "4",
            name: "League of Legends",
            slug: "league-of-legends",
            cover_image: "/placeholder.svg?height=400&width=400&text=League%20of%20Legends",
          },
        ]

  return (
    <section className="py-16 px-6 bg-[#101113]">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Supported Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fallbackGames.map((game) => (
            <Link href={`/games/${game.slug}`} key={game.id} className="block">
              <div
                className="relative aspect-square overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                style={{
                  transform: hoveredGame === game.id ? "scale(1.05)" : "scale(1)",
                  zIndex: hoveredGame === game.id ? 10 : 1,
                }}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
              >
                {/* Game image with fallback */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
                  <Image
                    src={
                      game.cover_image || `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(game.name)}`
                    }
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                    priority
                  />
                </div>

                {/* Dark gradient overlay at bottom for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                  <h3 className="text-white text-xl font-bold">{game.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Also provide a default export
export default GamesGrid
