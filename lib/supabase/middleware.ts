import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

// This function is specifically for middleware
export function createMiddlewareSupabase(req: NextRequest, res: NextResponse) {
  try {
    const client = createMiddlewareClient<Database>({ req, res })

    // Verify that the client has the expected methods
    if (!client || typeof client.from !== "function" || !client.auth) {
      console.error("Invalid Supabase client created in middleware")
      throw new Error("Invalid Supabase client")
    }

    return client
  } catch (error) {
    console.error("Error creating middleware Supabase client:", error)
    throw error
  }
}

// Export with multiple names for backward compatibility
export { createMiddlewareSupabase as createMiddlewareClient }
