"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Profile error:", error)
  }, [error])

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="container max-w-screen-xl mx-auto py-16 px-4">
        <div className="bg-[#101113] rounded-xl border border-[#222] shadow-lg p-6">
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-xl font-bold">Profile Error</h2>
          </div>
          <p className="mb-4 text-gray-300">We encountered an issue while loading your profile.</p>
          <div className="bg-[#151518] p-4 rounded-md border border-[#222] text-sm overflow-auto max-h-32 text-gray-300 mb-6">
            {error.message || "An unknown error occurred while loading your profile"}
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>This could be due to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>A temporary connection issue</li>
              <li>Your profile data may be incomplete</li>
              <li>You may need to sign in again</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={() => reset()} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
              Try again
            </Button>
            <Button asChild className="bg-transparent border border-[#0bb5ff] text-[#0bb5ff] hover:bg-[#0bb5ff]/10">
              <Link href="/auth">Sign in again</Link>
            </Button>
            <Button asChild className="bg-transparent text-gray-300 hover:bg-[#222]">
              <Link href="/">Return to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
