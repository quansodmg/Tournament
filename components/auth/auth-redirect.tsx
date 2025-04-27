"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthRedirect({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(redirectTo)
  }, [router, redirectTo])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Redirecting...</p>
      </div>
    </div>
  )
}
