"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type CronJobLog = {
  id: string
  job_name: string
  status: string
  started_at: string
  completed_at?: string
  duration_ms?: number
  items_processed?: number
  details?: any
  error?: string | null
}

interface AdminCronMonitorProps {
  initialLogs: CronJobLog[]
  error: string | null
  isSampleData?: boolean
}

export default function AdminCronMonitor({ initialLogs, error, isSampleData = false }: AdminCronMonitorProps) {
  const [logs, setLogs] = useState<CronJobLog[]>(initialLogs || [])
  const [loading, setLoading] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(error)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (autoRefresh && !isSampleData) {
      interval = setInterval(() => {
        refreshLogs()
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, isSampleData])

  const refreshLogs = async () => {
    if (isSampleData) return

    try {
      setLoading(true)
      setRefreshError(null)

      const response = await fetch("/api/admin/cron-logs")
      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      console.error("Error refreshing logs:", err)
      setRefreshError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return `${date.toLocaleString()} (${formatDistanceToNow(date, { addSuffix: true })})`
    } catch (e) {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        )
      case "running":
        return (
          <Badge className="bg-blue-500">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-2">Cron Job Logs</h2>
          {isSampleData && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Sample Data
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isSampleData && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-blue-50" : ""}
              >
                <Clock className="w-4 h-4 mr-1" />
                {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
              </Button>

              <Button variant="outline" size="sm" onClick={refreshLogs} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {refreshError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error: {refreshError}</span>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No cron job logs found</p>
              <p className="text-sm">Logs will appear here after cron jobs have run</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{log.job_name}</CardTitle>
                    <div className="text-sm text-gray-500">ID: {log.id}</div>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2">
                      <span className="text-sm font-medium">Started:</span>{" "}
                      <span className="text-sm">{formatDate(log.started_at)}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium">Completed:</span>{" "}
                      <span className="text-sm">{formatDate(log.completed_at)}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium">Duration:</span>{" "}
                      <span className="text-sm">
                        {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(2)}s` : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <span className="text-sm font-medium">Items Processed:</span>{" "}
                      <span className="text-sm">{log.items_processed || 0}</span>
                    </div>
                    {log.error && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-red-600">Error:</span>{" "}
                        <span className="text-sm text-red-600">{log.error}</span>
                      </div>
                    )}
                  </div>
                </div>

                {log.details && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Details:</span>
                    <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
