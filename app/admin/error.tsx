"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-[#101113] border border-red-500/20 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
        <p className="text-white mb-6">{error?.message || "An unexpected error occurred in the admin panel."}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#0bb5ff] text-white rounded hover:bg-[#0bb5ff]/80 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 bg-transparent border border-[#0bb5ff] text-[#0bb5ff] rounded hover:bg-[#0bb5ff]/10 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
