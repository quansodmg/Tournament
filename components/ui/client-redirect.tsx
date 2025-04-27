"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ClientRedirectProps {
  to: string
  message?: string
}

export default function ClientRedirect({ to, message = "Redirecting..." }: ClientRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    router.push(to)
  }, [router, to])

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-center text-muted-foreground">{message}</p>
    </div>
  )
}
