import { createServerClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type Achievement = Database["public"]["Tables"]["achievements"]["Row"]
export type UserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"] & {
  achievement: Achievement
}

/**
 * Check if a user has completed an achievement
 */
export async function checkAchievement(
  userId: string,
  requirementType: string,
  currentValue: number,
  isServer = false,
) {
  try {
    const supabase = isServer ? await createServerClient() : createClient()

    // Get all achievements of this type that the user hasn't completed yet
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .eq("requirement_type", requirementType)
      .order("requirement_value", { ascending: true })

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError)
      return null
    }

    if (!achievements || achievements.length === 0) {
      return null
    }

    // Get user's progress on these achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)
      .in(
        "achievement_id",
        achievements.map((a) => a.id),
      )

    if (userAchievementsError) {
      console.error("Error fetching user achievements:", userAchievementsError)
      return null
    }

    const userAchievementsMap = new Map(
      (userAchievements || []).map((ua) => [ua.achievement_id, ua]),
    )

    const newlyCompletedAchievements: Achievement[] = []
    const updatedAchievements: { id: string; progress: number; completed: boolean; completed_at: string | null }[] = []

    // Check each achievement
    for (const achievement of achievements) {
      const userAchievement = userAchievementsMap.get(achievement.id)

      // Skip if already completed
      if (userAchievement?.completed) {
        continue
      }

      // Check if the current value meets or exceeds the requirement  {
        continue
      }

      // Check if the current value meets or exceeds the requirement
      if (currentValue >= achievement.requirement_value) {
        // Achievement completed
        const now = new Date().toISOString()
        
        if (userAchievement) {
          // Update existing record
          updatedAchievements.push({
            id: userAchievement.id,
            progress: currentValue,
            completed: true,
            completed_at: now,
          })
        } else {
          // Create new record
          const { data, error } = await supabase
            .from("user_achievements")
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              progress: currentValue,
              completed: true,
              completed_at: now,
            })
            .select("id")
            .single()

          if (error) {
            console.error("Error creating user achievement:", error)
          } else {
            newlyCompletedAchievements.push(achievement)
          }
        }
      } else if (userAchievement) {
        // Update progress
        if (currentValue > userAchievement.progress) {
          updatedAchievements.push({
            id: userAchievement.id,
            progress: currentValue,
            completed: false,
            completed_at: null,
          })
        }
      } else {
        // Create new record with progress
        const { error } = await supabase.from("user_achievements").insert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: currentValue,
          completed: false,
        })

        if (error) {
          console.error("Error creating user achievement progress:", error)
        }
      }
    }

  // Batch update achievements\
  if (updatedAchievements.length > 0) {
    for (const ua of updatedAchievements) {
      const { error } = await supabase
        .from("user_achievements")
        .update({
          progress: ua.progress,
          completed: ua.completed,
          completed_at: ua.completed_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ua.id)

      if (error) {
        console.error("Error updating user achievement:", error)
      } else if (ua.completed) {
        const achievement = achievements.find((a) => a.id === userAchievementsMap.get(ua.id)?.achievement_id)
        if (achievement) {
          newlyCompletedAchievements.push(achievement)
        }
      }
    }
  }

  return newlyCompletedAchievements.length > 0 ? newlyCompletedAchievements : null
}
catch (error)
{
  console.error("Error in checkAchievement:", error)
  return null
}
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string, isServer = false) {
  try {
    const supabase = isServer ? await createServerClient() : createClient()

    const { data, error } = await supabase
      .from("user_achievements")
      .select(
        `
        *,
        achievement:achievement_id (*)
      `,
      )
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Error fetching user achievements:", error)
      return []
    }

    return data as UserAchievement[]
  } catch (error) {
    console.error("Error in getUserAchievements:", error)
    return []
  }
}

/**
 * Get all available achievements
 */
export async function getAllAchievements(isServer = false) {
  try {
    const supabase = isServer ? await createServerClient() : createClient()

    const { data, error } = await supabase.from("achievements").select("*").order("points", { ascending: false })

    if (error) {
      console.error("Error fetching achievements:", error)
      return []
    }

    return data as Achievement[]
  } catch (error) {
    console.error("Error in getAllAchievements:", error)
    return []
  }
}

/**
 * Check for profile completion achievement
 */
export async function checkProfileCompletion(userId: string, isServer = false) {
  try {
    const supabase = isServer ? await createServerClient() : createClient()

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return null
    }

    // Check if profile is complete (has username, full_name, bio, and avatar_url)
    const isComplete = !!profile.username && !!profile.full_name && !!profile.bio && !!profile.avatar_url

    if (isComplete) {
      return checkAchievement(userId, "profile_completed", 1, isServer)
    }

    return null
  } catch (error) {
    console.error("Error in checkProfileCompletion:", error)
    return null
  }
}

/**
 * Create notification for achievement
 */
export async function createAchievementNotification(userId: string, achievement: Achievement, isServer = false) {
  try {
    const supabase = isServer ? await createServerClient() : createClient()

    const { error } = await supabase.from("notifications").insert({
      profile_id: userId,
      title: "Achievement Unlocked!",
      message: `You've earned the "${achievement.name}" achievement: ${achievement.description}`,
      type: "achievement",
      reference_id: achievement.id,
      reference_type: "achievement",
      action_url: `/profile?tab=achievements`,
      is_read: false,
    })

    if (error) {
      console.error("Error creating achievement notification:", error)
    }
  } catch (error) {
    console.error("Error in createAchievementNotification:", error)
  }
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(userId: string, achievementType: string, value = 1, isServer = false) {
  const newAchievements = await checkAchievement(userId, achievementType, value, isServer)

  if (newAchievements && newAchievements.length > 0) {
    // Create notifications for each new achievement
    for (const achievement of newAchievements) {
      await createAchievementNotification(userId, achievement, isServer)
    }
    return newAchievements
  }

  return null
}

/**
 * Get user achievement stats
 */
export async function getUserAchievementStats(userId: string, isServer = false) {
  try {
    const supabase = isServer ? await createServerClient() : createClient()

    // Get all achievements
    const { data: allAchievements, error: allAchievementsError } = await supabase
      .from("achievements")
      .select("id, points, category")

    if (allAchievementsError) {
      console.error("Error fetching all achievements:", allAchievementsError)
      return null
    }

    // Get user's completed achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("achievement_id, completed")
      .eq("user_id", userId)

    if (userAchievementsError) {
      console.error("Error fetching user achievements:", userAchievementsError)
      return null
    }

    const completedAchievements = userAchievements.filter((ua) => ua.completed)
    const completedAchievementIds = new Set(completedAchievements.map((ua) => ua.achievement_id))

    // Calculate stats
    const totalAchievements = allAchievements.length
    const completedCount = completedAchievements.length
    const completionPercentage = Math.round((completedCount / totalAchievements) * 100) || 0

    // Calculate total points
    const totalPoints = allAchievements.reduce((sum, a) => sum + a.points, 0)
    const earnedPoints = allAchievements
      .filter((a) => completedAchievementIds.has(a.id))
      .reduce((sum, a) => sum + a.points, 0)

    // Calculate category completion
    const categories = [...new Set(allAchievements.map((a) => a.category))]
    const categoryStats = categories.map((category) => {
      const categoryAchievements = allAchievements.filter((a) => a.category === category)
      const completedCategoryAchievements = categoryAchievements.filter((a) => completedAchievementIds.has(a.id))

      return {
        category,
        total: categoryAchievements.length,
        completed: completedCategoryAchievements.length,
        percentage: Math.round((completedCategoryAchievements.length / categoryAchievements.length) * 100) || 0,
      }
    })

    return {
      totalAchievements,
      completedCount,
      completionPercentage,
      totalPoints,
      earnedPoints,
      pointsPercentage: Math.round((earnedPoints / totalPoints) * 100) || 0,
      categoryStats,
    }
  } catch (error) {
    console.error("Error in getUserAchievementStats:", error)
    return null
  }
}
