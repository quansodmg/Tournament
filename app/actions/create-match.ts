"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMatch(formData: FormData) {
  const supabase = createClient()

  const userId = formData.get("userId") as string
  const teamId = formData.get("teamId") as string
  const startTime = formData.get("startTime") as string
  const matchType = formData.get("matchType") as string
  const location = formData.get("location") as string
  const isPrivate = formData.get("isPrivate") === "true"
  const streamUrl = formData.get("streamUrl") as string
  const matchNotes = formData.get("matchNotes") as string
  const gameId = formData.get("gameId") as string

  try {
    // Create the match
    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        scheduled_by: userId,
        start_time: startTime,
        status: "scheduled",
        location: location || null,
        match_type: matchType,
        is_private: isPrivate,
        stream_url: streamUrl || null,
        match_notes: matchNotes || null,
        game_id: gameId || null,
      })
      .select()
      .single()

    if (error) throw error

    // Add the team as a participant
    const { error: participantError } = await supabase.from("match_participants").insert({
      match_id: match.id,
      team_id: teamId,
    })

    if (participantError) throw participantError

    revalidatePath("/matches")
    return { success: true, matchId: match.id }
  } catch (error: any) {
    console.error("Error creating match:", error)
    return { success: false, error: error.message }
  }
}
