"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy } from "lucide-react"

type Achievement = {
  id: string
  name: string
  description: string
  icon_url?: string
  created_at: string
  user_id: string
  achievement_id: string
  achievement: {
    name: string
    description: string
    icon_url?: string
    rarity: string
  }
}

export function RecentAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchRecentAchievements() {
      try {
        const { data: user } = await supabase.auth.getUser()

        if (!user.user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("user_achievements")
          .select(`
            id,
            created_at,
            user_id,
            achievement_id,
            achievement:achievements(name, description, icon_url, rarity)
          `)
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching recent achievements:", error)
          return
        }

        setAchievements(data as Achievement[])
      } catch (error) {
        console.error("Error in fetchRecentAchievements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentAchievements()
  }, [supabase])

  function getRarityColor(rarity: string) {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "bg-slate-500"
      case "uncommon":
        return "bg-green-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-amber-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  {achievement.achievement.icon_url ? (
                    <img
                      src={achievement.achievement.icon_url || "/placeholder.svg"}
                      alt={achievement.achievement.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <Trophy className="h-5 w-5 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{achievement.achievement.name}</h4>
                    <Badge className={`${getRarityColor(achievement.achievement.rarity)} text-white`}>
                      {achievement.achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{achievement.achievement.description}</p>
                  <p className="text-xs text-slate-400">{new Date(achievement.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p>No achievements yet</p>
            <p className="text-sm mt-1">Complete tasks and win tournaments to earn achievements</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentAchievements
