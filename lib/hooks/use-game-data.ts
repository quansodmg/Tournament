"use client"

import { useState, useEffect } from "react"
import { apiClient, type ApiResponse } from "@/lib/api/core/api-client"
import type { SupportedGame } from "@/lib/api/game-api-factory"
import type { GameProfile, GameStats, GameMatch, GameLeaderboard, GameTournament } from "@/lib/api/types/game-data"

interface UseGameDataOptions {
  region?: string
  enabled?: boolean
}

export function useGameProfile(game: SupportedGame, playerId: string, options: UseGameDataOptions = {}) {
  const [data, setData] = useState<GameProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { region, enabled = true } = options

  useEffect(() => {
    if (!enabled || !playerId) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          action: "profile",
          playerId,
        })

        if (region) params.append("region", region)

        const response = await apiClient.get<ApiResponse<GameProfile>>(`/game-data/${game}?${params}`)

        if (response.error || !response.data) {
          setError(response.error || "Failed to fetch profile data")
          return
        }

        if (response.data.error) {
          setError(response.data.error)
          return
        }

        setData(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [game, playerId, region, enabled])

  return { data, error, isLoading }
}

export function useGameStats(game: SupportedGame, playerId: string, options: UseGameDataOptions = {}) {
  const [data, setData] = useState<GameStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { region, enabled = true } = options

  useEffect(() => {
    if (!enabled || !playerId) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          action: "stats",
          playerId,
        })

        if (region) params.append("region", region)

        const response = await apiClient.get<ApiResponse<GameStats>>(`/game-data/${game}?${params}`)

        if (response.error || !response.data) {
          setError(response.error || "Failed to fetch stats data")
          return
        }

        if (response.data.error) {
          setError(response.data.error)
          return
        }

        setData(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [game, playerId, region, enabled])

  return { data, error, isLoading }
}

export function useGameMatches(
  game: SupportedGame,
  playerId: string,
  limit?: number,
  options: UseGameDataOptions = {},
) {
  const [data, setData] = useState<GameMatch[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { region, enabled = true } = options

  useEffect(() => {
    if (!enabled || !playerId) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          action: "matches",
          playerId,
        })

        if (region) params.append("region", region)
        if (limit) params.append("limit", limit.toString())

        const response = await apiClient.get<ApiResponse<GameMatch[]>>(`/game-data/${game}?${params}`)

        if (response.error || !response.data) {
          setError(response.error || "Failed to fetch matches data")
          return
        }

        if (response.data.error) {
          setError(response.data.error)
          return
        }

        setData(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [game, playerId, limit, region, enabled])

  return { data, error, isLoading }
}

export function useGameLeaderboard(game: SupportedGame, limit?: number, options: UseGameDataOptions = {}) {
  const [data, setData] = useState<GameLeaderboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { region, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          action: "leaderboard",
        })

        if (region) params.append("region", region)
        if (limit) params.append("limit", limit.toString())

        const response = await apiClient.get<ApiResponse<GameLeaderboard>>(`/game-data/${game}?${params}`)

        if (response.error || !response.data) {
          setError(response.error || "Failed to fetch leaderboard data")
          return
        }

        if (response.data.error) {
          setError(response.data.error)
          return
        }

        setData(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [game, limit, region, enabled])

  return { data, error, isLoading }
}

export function useGameTournaments(game: SupportedGame, limit?: number, options: UseGameDataOptions = {}) {
  const [data, setData] = useState<GameTournament[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { region, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          action: "tournaments",
        })

        if (region) params.append("region", region)
        if (limit) params.append("limit", limit.toString())

        const response = await apiClient.get<ApiResponse<GameTournament[]>>(`/game-data/${game}?${params}`)

        if (response.error || !response.data) {
          setError(response.error || "Failed to fetch tournament data")
          return
        }

        if (response.data.error) {
          setError(response.data.error)
          return
        }

        setData(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [game, limit, region, enabled])

  return { data, error, isLoading }
}

export function useGameSearch(game: SupportedGame, username: string, options: UseGameDataOptions = {}) {
  const [data, setData] = useState<GameProfile[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { region, enabled = true } = options

  useEffect(() => {
    if (!enabled || !username) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          action: "search",
          username,
        })

        if (region) params.append("region", region)

        const response = await apiClient.get<ApiResponse<GameProfile[]>>(`/game-data/${game}?${params}`)

        if (response.error || !response.data) {
          setError(response.error || "Failed to fetch search results")
          return
        }

        if (response.data.error) {
          setError(response.data.error)
          return
        }

        setData(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [game, username, region, enabled])

  return { data, error, isLoading }
}
