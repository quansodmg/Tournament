"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateCronTableButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createTable = async () => {
    try {
      setIsCreating(true)
      setStatus("loading")
      setError(null)

      const response = await fetch("/api/admin/create-cron-table", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create table")
      }

      setStatus("success")

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error("Error creating table:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <Button onClick={createTable} disabled={isCreating || status === "success"} className="mb-2">
        {status === "loading" && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
        {status === "success" && <Check className="w-4 h-4 mr-2" />}
        {status === "error" && <AlertCircle className="w-4 h-4 mr-2" />}
        {status === "idle" && "Create Table"}
        {status === "loading" && "Creating..."}
        {status === "success" && "Table Created"}
        {status === "error" && "Failed"}
      </Button>

      {status === "success" && (
        <p className="text-green-600 text-sm mt-2">Table created successfully! Refreshing page...</p>
      )}

      {status === "error" && error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
