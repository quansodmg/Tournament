"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AchievementCard } from "./achievement-card"
import { getUserAchievements, getAllAchievements, getUserAchievementStats } from "@/lib/utils/achievements"
import { Progress } from "@/components/ui/progress"
import { Award, Search } from "lucide-react"

interface AchievementsGridProps {
  userId: string
}

export function AchievementsGrid({ userId }: AchievementsGridProps) {
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [allAchievements, setAllAchievements] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [rarityFilter, setRarityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch user achievements
      const userAchievementsData = await getUserAchievements(userId)

      // Create a map for quick lookup
      const userAchievementsMap = new Map(userAchievementsData.map((ua) => [ua.achievement_id, ua]))

      // Fetch all achievements
      const allAchievementsData = await getAllAchievements()

      // Fetch stats
      const statsData = await getUserAchievementStats(userId)

      setUserAchievements(userAchievementsData)
      setAllAchievements(allAchievementsData)
      setStats(statsData)
      setLoading(false)
    }

    fetchData()
  }, [userId])

  // Filter and sort achievements
  const filteredAchievements = allAchievements
    .filter((achievement) => {
      // Filter by search query
      if (
        searchQuery &&
        !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filter by category
      if (categoryFilter !== "all" && achievement.category !== categoryFilter) {
        return false
      }

      // Filter by rarity
      if (rarityFilter !== "all" && achievement.rarity !== rarityFilter) {
        return false
      }

      // Filter by tab
      if (activeTab === "completed") {
        const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id)
        return userAchievement?.completed
      } else if (activeTab === "in-progress") {
        const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id)
        return userAchievement && !userAchievement.completed
      } else if (activeTab === "locked") {
        return !userAchievements.some((ua) => ua.achievement_id === achievement.id)
      }

      return true
    })
    .sort((a, b) => {
      const userAchievementA = userAchievements.find((ua) => ua.achievement_id === a.id)
      const userAchievementB = userAchievements.find((ua) => ua.achievement_id === b.id)

      if (sortBy === "newest") {
        const dateA = userAchievementA?.completed_at ? new Date(userAchievementA.completed_at) : new Date(0)
        const dateB = userAchievementB?.completed_at ? new Date(userAchievementB.completed_at) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      } else if (sortBy === "oldest") {
        const dateA = userAchievementA?.completed_at ? new Date(userAchievementA.completed_at) : new Date(0)
        const dateB = userAchievementB?.completed_at ? new Date(userAchievementB.completed_at) : new Date(0)
        return dateA.getTime() - dateB.getTime()
      } else if (sortBy === "points-high") {
        return b.points - a.points
      } else if (sortBy === "points-low") {
        return a.points - b.points
      } else if (sortBy === "progress") {
        const progressA = userAchievementA ? userAchievementA.progress / a.requirement_value : 0
        const progressB = userAchievementB ? userAchievementB.progress / b.requirement_value : 0
        return progressB - progressA
      } else if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name)
      }

      return 0
    })

  // Get unique categories
  const categories = ["all", ...new Set(allAchievements.map((a) => a.category))]

  // Get unique rarities
  const rarities = ["all", ...new Set(allAchievements.map((a) => a.rarity))]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-[#1a1c20] rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[#1a1c20] rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="bg-[#1a1c20] border border-[#2a2d31] rounded-lg p-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <Award className="h-8 w-8 text-[#0bb5ff] mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-200">Achievement Progress</h3>
                <p className="text-sm text-gray-400">
                  {stats.completedCount} of {stats.totalAchievements} achievements unlocked (
                  {stats.completionPercentage}%)
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-right mr-3">
                <p className="text-sm text-gray-400">Points Earned</p>
                <p className="text-lg font-medium text-[#0bb5ff]">
                  {stats.earnedPoints} / {stats.totalPoints}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-[#0bb5ff] flex items-center justify-center">
                <span className="text-sm font-bold">{stats.pointsPercentage}%</span>
              </div>
            </div>
          </div>

          <Progress value={stats.completionPercentage} className="h-2 mb-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stats.categoryStats.map((categoryStat: any) => (
              <div key={categoryStat.category} className="bg-[#101113] rounded-md p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 capitalize">{categoryStat.category}</span>
                  <span className="text-xs font-medium">{categoryStat.percentage}%</span>
                </div>
                <Progress value={categoryStat.percentage} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search achievements..."
            className="pl-9 bg-[#1a1c20] border-[#2a2d31]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-[#1a1c20] border-[#2a2d31]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="w-[140px] bg-[#1a1c20] border-[#2a2d31]">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity === "all" ? "All Rarities" : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-[#1a1c20] border-[#2a2d31]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="points-high">Highest Points</SelectItem>
              <SelectItem value="points-low">Lowest Points</SelectItem>
              <SelectItem value="progress">Most Progress</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1a1c20] mb-4">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#101113]">
            All
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-[#101113]">
            Completed
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-[#101113]">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="locked" className="data-[state=active]:bg-[#101113]">
            Locked
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id)
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={
                    userAchievement
                      ? {
                          ...userAchievement,
                          achievement,
                        }
                      : undefined
                  }
                />
              )
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              <h3 className="text-lg font-medium">No achievements found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </TabsContent>

        {/* The other tab contents use the same grid, but the filtering is handled above */}
        <TabsContent value="completed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id)
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={
                    userAchievement
                      ? {
                          ...userAchievement,
                          achievement,
                        }
                      : undefined
                  }
                />
              )
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              <h3 className="text-lg font-medium">No completed achievements</h3>
              <p className="text-gray-400">Keep playing to earn achievements</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id)
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={
                    userAchievement
                      ? {
                          ...userAchievement,
                          achievement,
                        }
                      : undefined
                  }
                />
              )
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              <h3 className="text-lg font-medium">No achievements in progress</h3>
              <p className="text-gray-400">Start playing to make progress</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="locked" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              <h3 className="text-lg font-medium">No locked achievements</h3>
              <p className="text-gray-400">You've started all available achievements</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
