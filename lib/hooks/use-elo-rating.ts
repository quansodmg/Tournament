"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseEloRatingOptions {
  gameId?: string | null
}

export function useEloRating(entityId: string, entityType: "player" | "team", options: UseEloRatingOptions = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [matches, setMatches] = useState<number>(0)
  const [highestRating, setHighestRating] = useState<number | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchRating() {
      try {
        setLoading(true)
        setError(null)

        const { gameId } = options

        if (gameId) {
          // Fetch game-specific rating
          const tableName = entityType === "player" ? "player_elo_ratings" : "team_elo_ratings"
          const idField = entityType === "player" ? "profile_id" : "team_id"

          const { data, error } = await supabase
            .from(tableName)
            .select("elo_rating, elo_matches, highest_elo, elo_history")
            .eq(idField, entityId)
            .eq("game_id", gameId)
            .maybeSingle()

          if (error) throw error

          if (data) {
            setRating(data.elo_rating)
            setMatches(data.elo_matches)
            setHighestRating(data.highest_elo)
            setHistory(data.elo_history || [])
          } else {
            // No game-specific rating found, use default
            setRating(1200)
            setMatches(0)
            setHighestRating(1200)
            setHistory([])
          }
        } else {
          // Fetch general rating
          const tableName = entityType === "player" ? "profiles" : "teams"

          const { data, error } = await supabase
            .from(tableName)
            .select("elo_rating, elo_matches, highest_elo, elo_history")
            .eq("id", entityId)
            .single()

          if (error) throw error

          setRating(data.elo_rating)
          setMatches(data.elo_matches)
          setHighestRating(data.highest_elo)
          setHistory(data.elo_history || [])
        }
      } catch (err) {
        console.error("Error fetching ELO rating:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch ELO rating"))
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [entityId, entityType, options, supabase])

  return {
    loading,
    error,
    rating,
    matches,
    highestRating,
    history,
  }
}
