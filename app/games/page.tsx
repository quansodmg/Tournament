import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import Image from "next/image"

// Mark this page as dynamic to prevent static rendering
export const dynamic = "force-dynamic"

export default async function GamesPage() {
  try {
    // Create Supabase client directly using environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Games</h1>
          <p className="text-red-500">Database configuration error. Please contact support.</p>
        </div>
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    // Get all games with error handling
    const { data: games, error } = await supabase.from("games").select("*").order("name")

    // Handle potential error
    if (error) {
      console.error("Error fetching games:", error)
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Games</h1>
          <p className="text-red-500">Failed to load games. Please try again later.</p>
        </div>
      )
    }

    // Ensure games is an array
    const safeGames = Array.isArray(games) ? games : []

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Games</h1>

        {safeGames.length === 0 ? (
          <p>No games found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {safeGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={game.cover_image || "/placeholder.svg?height=192&width=384"}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold">{game.name}</h2>
                  <p className="text-gray-600 mt-2 line-clamp-2">{game.description || "No description available."}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in GamesPage:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Games</h1>
        <p className="text-red-500">An unexpected error occurred. Please try again later.</p>
      </div>
    )
  }
}
