"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

interface MarkAllAsReadButtonProps {
  onClick: () => Promise<void>
}

export default function MarkAllAsReadButton({ onClick }: MarkAllAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()
    } catch (error) {
      console.error("Error marking all as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleClick} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
      Mark all as read
    </Button>
  )
}
