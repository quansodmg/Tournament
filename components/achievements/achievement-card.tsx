"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lock, CheckCircle2, Trophy } from "lucide-react"
import type { UserAchievement } from "@/lib/utils/achievements"

interface AchievementCardProps {
  userAchievement?: UserAchievement
  achievement: any
  showProgress?: boolean
}

export function AchievementCard({ userAchievement, achievement, showProgress = true }: AchievementCardProps) {
  const [imageError, setImageError] = useState(false)

  const isCompleted = userAchievement?.completed || false
  const progress = userAchievement?.progress || 0
  const progressPercentage = Math.min(100, Math.round((progress / achievement.requirement_value) * 100) || 0)

  const rarityColors = {
    common: "bg-gray-500",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-orange-500",
  }

  const rarityColor = rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`relative overflow-hidden transition-all duration-300 ${isCompleted ? "bg-[#1a1c20] border-[#2a2d31]" : "bg-[#101113] border-[#1e2023] opacity-75"}`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${rarityColor}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  {imageError ? (
                    <div className="h-16 w-16 rounded-md bg-[#1e2023] flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-[#0bb5ff]" />
                    </div>
                  ) : (
                    <Image
                      src={achievement.icon_url || "/placeholder.svg"}
                      alt={achievement.name}
                      width={64}
                      height={64}
                      className="rounded-md"
                      onError={() => setImageError(true)}
                    />
                  )}
                  {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 bg-[#101113] rounded-full p-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {!isCompleted && !userAchievement && (
                    <div className="absolute -bottom-1 -right-1 bg-[#101113] rounded-full p-0.5">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-200">{achievement.name}</h3>
                    <Badge variant="outline" className={`${rarityColor} bg-opacity-20 text-xs capitalize`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                  {showProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {progress} / {achievement.requirement_value}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-center">
            <p className="font-bold">{achievement.name}</p>
            <p className="text-sm">{achievement.description}</p>
            <p className="text-xs mt-1 text-gray-400">
              {isCompleted
                ? `Completed on ${new Date(userAchievement?.completed_at || "").toLocaleDateString()}`
                : `${achievement.points} points`}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
