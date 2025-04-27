"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { differenceInSeconds } from "date-fns"

interface MatchAcceptanceTimerProps {
  deadline: string
  onExpire?: () => void
}

export default function MatchAcceptanceTimer({ deadline, onExpire }: MatchAcceptanceTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [progress, setProgress] = useState<number>(100)

  useEffect(() => {
    const deadlineDate = new Date(deadline)
    const now = new Date()

    // Calculate total time (15 minutes = 900 seconds)
    const total = 900 // 15 minutes in seconds
    setTotalTime(total)

    // Calculate time left
    const secondsLeft = Math.max(0, differenceInSeconds(deadlineDate, now))
    setTimeLeft(secondsLeft)

    // Calculate progress
    const progressValue = Math.max(0, Math.min(100, (secondsLeft / total) * 100))
    setProgress(progressValue)

    // Set up interval to update timer
    const interval = setInterval(() => {
      const now = new Date()
      const secondsLeft = Math.max(0, differenceInSeconds(deadlineDate, now))

      setTimeLeft(secondsLeft)
      setProgress(Math.max(0, Math.min(100, (secondsLeft / total) * 100)))

      if (secondsLeft <= 0) {
        clearInterval(interval)
        if (onExpire) onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline, onExpire])

  // Format time left
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Time to respond:</span>
        <span className={timeLeft < 60 ? "text-destructive font-medium" : ""}>{formatTimeLeft()}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
