"use client"

import { useState } from "react"
import Image from "next/image"

const games = [
  { id: 1, name: "Call of Duty", image: "/cod.jpg" },
  { id: 2, name: "Gears of War", image: "/gow.jpg" },
  { id: 3, name: "Fortnite", image: "/fortnite.jpg" },
  { id: 4, name: "Marvel Rivals", image: "/marvel-rivals.jpg" },
  { id: 5, name: "NBA 2K", image: "/nba2k.jpg" },
  { id: 6, name: "Madden", image: "/madden.jpg" },
  { id: 7, name: "Rocket League", image: "/rocket-league.jpg" },
]

export default function GamesGrid() {
  const [hoveredGame, setHoveredGame] = useState<number | null>(null)

  return (
    <section className="py-16 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Supported Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="relative aspect-square overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out"
              style={{
                transform: hoveredGame === game.id ? "scale(1.1)" : "scale(1)",
                zIndex: hoveredGame === game.id ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <Image src={game.image || "/placeholder.svg"} alt={game.name} layout="fill" objectFit="cover" />
              <div className="absolute inset-0 bg-primary bg-opacity-50 flex items-center justify-center">
                <h3 className="text-primary-foreground text-xl font-bold">{game.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
