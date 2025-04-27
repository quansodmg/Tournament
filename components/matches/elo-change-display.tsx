"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import Link from "next/link"

interface EloChangeDisplayProps {
  matchId: string
}

export default function EloChangeDisplay({ matchId }: EloChangeDisplayProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eloChange, setEloChange] = useState<any | null>(null)
  const [winnerData, setWinnerData] = useState<any | null>(null)
  const [loserData, setLoserData] = useState<any | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchEloChange() {
      try {
        setLoading(true)
        setError(null)

        // Fetch ELO change record
        const { data: eloData, error: eloError } = await supabase
          .from("elo_match_results")
          .select("*")
          .eq("match_id", matchId)
          .maybeSingle()

        if (eloError) throw eloError

        if (!eloData) {
          // No ELO change record found
          setEloChange(null)
          setLoading(false)
          return
        }

        setEloChange(eloData)

        // Fetch winner data
        if (eloData.winner_type === "team") {
          const { data: winner } = await supabase
            .from("teams")
            .select("id, name, logo_url")
            .eq("id", eloData.winner_id)
            .single()
          setWinnerData({ ...winner, type: "team" })
        } else {
          const { data: winner } = await supabase
            .from("profiles")
            .select("id, username as name, avatar_url as logo_url")
            .eq("id", eloData.winner_id)
            .single()
          setWinnerData({ ...winner, type: "player" })
        }

        // Fetch loser data
        if (eloData.loser_type === "team") {
          const { data: loser } = await supabase
            .from("teams")
            .select("id, name, logo_url")
            .eq("id", eloData.loser_id)
            .single()
          setLoserData({ ...loser, type: "team" })
        } else {
          const { data: loser } = await supabase
            .from("profiles")
            .select("id, username as name, avatar_url as logo_url")
            .eq("id", eloData.loser_id)
            .single()
          setLoserData({ ...loser, type: "player" })
        }
      } catch (err: any) {
        console.error("Error fetching ELO change:", err)
        setError(err.message || "Failed to load ELO change data")
      } finally {
        setLoading(false)
      }
    }

    fetchEloChange()
  }, [matchId, supabase])

  // Function to get rank tier based on ELO
  const getRankTier = (elo: number) => {
    if (elo >= 2400) return { name: "Grandmaster", color: "text-yellow-500" }
    if (elo >= 2200) return { name: "Master", color: "text-purple-500" }
    if (elo >= 2000) return { name: "Diamond", color: "text-blue-500" }
    if (elo >= 1800) return { name: "Platinum", color: "text-cyan-500" }
    if (elo >= 1600) return { name: "Gold", color: "text-yellow-400" }
    if (elo >= 1400) return { name: "Silver", color: "text-gray-400" }
    return { name: "Bronze", color: "text-amber-700" }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading ELO Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!eloChange) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ELO Ratings</CardTitle>
          <CardDescription>No ELO changes recorded for this match</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ELO ratings may not have been updated yet, or this match was not eligible for rating changes.
          </p>
        </CardContent>
      </Card>
    )
  }

  const winnerTierBefore = getRankTier(eloChange.winner_previous_elo)
  const winnerTierAfter = getRankTier(eloChange.winner_new_elo)
  const loserTierBefore = getRankTier(eloChange.loser_previous_elo)
  const loserTierAfter = getRankTier(eloChange.loser_new_elo)

  const winnerTierChanged = winnerTierBefore.name !== winnerTierAfter.name
  const loserTierChanged = loserTierBefore.name !== loserTierAfter.name

  return (
    <Card>
      <CardHeader>
        <CardTitle>ELO Rating Changes</CardTitle>
        <CardDescription>Rating adjustments based on match result</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Winner */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={winnerData?.logo_url || ""} alt={winnerData?.name} />
                <AvatarFallback>{winnerData?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/${winnerData?.type === "team" ? "teams" : "profile"}/${winnerData?.id}`}
                  className="font-medium hover:underline"
                >
                  {winnerData?.name}
                </Link>
                <p className="text-xs text-muted-foreground">Winner</p>
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
              <span className="text-green-500 font-bold">+{eloChange.winner_elo_change}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Previous Rating</p>
              <div className="flex items-center">
                <span className="font-medium">{eloChange.winner_previous_elo}</span>
                <Badge className={`ml-2 ${winnerTierBefore.color}`}>{winnerTierBefore.name}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">New Rating</p>
              <div className="flex items-center">
                <span className="font-medium">{eloChange.winner_new_elo}</span>
                <Badge className={`ml-2 ${winnerTierAfter.color}`}>{winnerTierAfter.name}</Badge>
              </div>
            </div>
          </div>

          {winnerTierChanged && (
            <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-300">
              Rank up! Advanced from {winnerTierBefore.name} to {winnerTierAfter.name}
            </div>
          )}
        </div>

        {/* Loser */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={loserData?.logo_url || ""} alt={loserData?.name} />
                <AvatarFallback>{loserData?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/${loserData?.type === "team" ? "teams" : "profile"}/${loserData?.id}`}
                  className="font-medium hover:underline"
                >
                  {loserData?.name}
                </Link>
                <p className="text-xs text-muted-foreground">Loser</p>
              </div>
            </div>
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
              <span className="text-red-500 font-bold">{eloChange.loser_elo_change}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Previous Rating</p>
              <div className="flex items-center">
                <span className="font-medium">{eloChange.loser_previous_elo}</span>
                <Badge className={`ml-2 ${loserTierBefore.color}`}>{loserTierBefore.name}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">New Rating</p>
              <div className="flex items-center">
                <span className="font-medium">{eloChange.loser_new_elo}</span>
                <Badge className={`ml-2 ${loserTierAfter.color}`}>{loserTierAfter.name}</Badge>
              </div>
            </div>
          </div>

          {loserTierChanged && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
              Rank down! Dropped from {loserTierBefore.name} to {loserTierAfter.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
