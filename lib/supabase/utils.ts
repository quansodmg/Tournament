// This file doesn't import next/headers and is safe to use anywhere

// Check if we're in the app directory
export const isAppDirectory = () => {
  // This is a simple heuristic - in a real app you might want to use
  // a more reliable method
  return typeof window === "undefined" && process.env.NEXT_RUNTIME === "nodejs"
}

// Check if we're on the client
export const isClient = () => {
  return typeof window !== "undefined"
}

// Check if we're in the pages directory
export const isPagesDirectory = () => {
  return typeof window === "undefined" && process.env.NEXT_RUNTIME !== "nodejs"
}

// Add any Supabase-specific utility functions here
export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
}

// Helper function to safely parse JSON
export const safeJsonParse = (json: string | null) => {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error("Failed to parse JSON:", e)
    return null
  }
}
