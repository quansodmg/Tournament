// This file is for server components only
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

/**
 * Creates a Supabase client for server components
 * @returns Promise resolving to a Supabase client instance
 */
export const createServerSupabase = async () => {
  try {
    // Dynamically import cookies to prevent bundling with client code
    const { cookies } = await import("next/headers")

    // Pass the cookies function directly, not the result of calling it
    const client = createServerComponentClient<Database>({
      cookies,
      options: {
        // Add retries for transient network issues
        global: {
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              // Increase timeout for potentially slow connections
              signal: AbortSignal.timeout(15000), // 15 seconds timeout
            })
          },
        },
      },
    })

    // Verify that the client has the expected methods
    if (!client || typeof client.from !== "function") {
      throw new Error("Invalid Supabase client created")
    }

    return client
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    throw error
  }
}

// Export with multiple names for backward compatibility
export { createServerSupabase as getSupabaseServer }
export { createServerSupabase as createServerClient }
export { createServerSupabase as createClient }
