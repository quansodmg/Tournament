export async function ensureProfile(userId: string, username?: string, fullName?: string | null) {
  try {
    // Dynamically import the createClient function to avoid issues during build
    const { createClient } = await import("@/lib/supabase/client")

    const supabase = await createClient()

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking profile:", fetchError)
      throw new Error("Failed to check user profile")
    }

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        username: username || `user_${userId.substring(0, 8)}`,
        full_name: fullName || null,
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        throw new Error(`Failed to create user profile: ${insertError.message}`)
      }
    }

    return true
  } catch (error) {
    console.error("ensureProfile error:", error)
    throw error
  }
}
