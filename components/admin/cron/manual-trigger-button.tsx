"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Check, AlertCircle } from 'lucide-react'

export default function ManualTriggerButton() {
  const [isTriggering, setIsTriggering] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const triggerRecalculation = async () => {
    try {
      setIsTriggering(true)
      setStatus("loading")
      setError(null)
      setResult(null)

      const response = await fetch("/api/admin/trigger-elo-recalculation", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger recalculation")
      }

      setStatus("success")
      setResult(data)
    } catch (err) {
      console.error("Error triggering recalculation:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div>
      <Button 
        onClick={triggerRecalculation} 
        disabled={isTriggering} 
        className="mb-2"
        variant={status === "success" ? "outline" : "default"}
      >
        {status === "loading" && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
        {status === "success" && <Check className="w-4 h-4 mr-2" />}
        {status === "error" && <AlertCircle className="w-4 h-4 mr-2" />}
        {status === "idle" && "Trigger ELO Recalculation"}
        {status === "loading" && "Processing..."}
        {status === "success" && "Completed"}
        {status === "error" && "Failed"}
      </Button>

      {status === "success" && result && (
        <div className="text-green-600 text-sm mt-2">
          <p>Successfully processed {result.matchesProcessed || 0} matches.</p>
          {result.message && <p>{result.message}</p>}
        </div>
      )}

      {status === "error" && error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
