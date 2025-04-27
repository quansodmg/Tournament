"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, Database, Key } from "lucide-react"
import { testSupabaseConnection } from "@/lib/supabase/client"
import { getEnvironmentDiagnostics } from "@/lib/utils/env-checker"

export default function DatabaseDebugPage() {
  const [loading, setLoading] = useState(true)
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean
    error?: string
    data?: any
  }>({ success: false })
  const [envDiagnostics, setEnvDiagnostics] = useState<any>(null)
  const [testCount, setTestCount] = useState(0)

  async function runTests() {
    setLoading(true)
    setTestCount((prev) => prev + 1)

    try {
      // Get environment diagnostics
      const diagnostics = getEnvironmentDiagnostics()
      setEnvDiagnostics(diagnostics)

      // Test database connection
      const result = await testSupabaseConnection()
      setConnectionResult(result)
    } catch (err) {
      console.error("Error running database tests:", err)
      setConnectionResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Diagnostics</h1>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Tests if the application can connect to the Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Testing connection...</span>
              </div>
            ) : connectionResult.success ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully connected to the Supabase database.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>{connectionResult.error || "Could not connect to the database."}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={runTests} disabled={loading} className="flex items-center">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Testing..." : "Test Connection Again"}
            </Button>
            <span className="ml-4 text-sm text-muted-foreground">Test count: {testCount}</span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>Checks if all required environment variables are properly set</CardDescription>
          </CardHeader>
          <CardContent>
            {!envDiagnostics ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Checking environment...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Required Variables:</h3>
                  {envDiagnostics.envVars.allAvailable ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        All required environment variables are available.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Missing required environment variables: {envDiagnostics.envVars.missing.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Supabase Configuration:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="mr-2">URL:</span>
                      {envDiagnostics.supabaseConfig.hasUrl ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Available
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" /> Missing
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2">Anon Key:</span>
                      {envDiagnostics.supabaseConfig.hasAnonKey ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Available
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" /> Missing
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Environment:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Node Environment:</div>
                    <div className="font-mono">{envDiagnostics.nodeEnv}</div>
                    <div>Next Runtime:</div>
                    <div className="font-mono">{envDiagnostics.nextRuntime || "Not set"}</div>
                    <div>Timestamp:</div>
                    <div className="font-mono">{new Date(envDiagnostics.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Verify that all environment variables are correctly set in your .env.local file or Vercel project settings.
          </li>
          <li>Check that your Supabase project is active and not paused.</li>
          <li>Ensure your IP address is not blocked by Supabase.</li>
          <li>Verify that the database tables exist and have the correct structure.</li>
          <li>Check if your Supabase project has reached its connection limits.</li>
          <li>Try restarting the development server or redeploying the application.</li>
        </ol>
      </div>
    </div>
  )
}
