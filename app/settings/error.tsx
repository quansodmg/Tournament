"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
      <div className="bg-[#101113] border border-[#222] rounded-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-900/20 p-3 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">We couldn't load your settings. Please try again.</p>
        <div className="flex justify-center">
          <Button onClick={reset} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
