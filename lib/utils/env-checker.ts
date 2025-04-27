// Utility to check if required environment variables are set
export function checkRequiredEnvVars() {
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]

  const missing: string[] = []
  const available: string[] = []

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName)
    } else {
      available.push(varName)
    }
  })

  return {
    allAvailable: missing.length === 0,
    missing,
    available,
  }
}

// Check if Supabase environment variables are properly configured
export function checkSupabaseEnvVars() {
  const result = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlFormat: false,
    keyFormat: false,
  }

  // Check URL format
  if (result.hasUrl) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    result.urlFormat = url!.startsWith("https://") && url!.includes(".supabase.co")
  }

  // Check key format (should be a long string)
  if (result.hasAnonKey) {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    result.keyFormat = key!.length > 20 // Anon keys are typically long
  }

  return result
}

// Get a diagnostic report about the environment
export function getEnvironmentDiagnostics() {
  return {
    nodeEnv: process.env.NODE_ENV,
    nextRuntime: process.env.NEXT_RUNTIME,
    envVars: checkRequiredEnvVars(),
    supabaseConfig: checkSupabaseEnvVars(),
    timestamp: new Date().toISOString(),
  }
}
