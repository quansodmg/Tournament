import { getSupabaseClient } from "./client"

/**
 * Returns the singleton Supabase client instance
 * This is just a wrapper around getSupabaseClient for backward compatibility
 */
export function createPagesClient() {
  return getSupabaseClient()
}
