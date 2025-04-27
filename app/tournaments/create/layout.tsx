"use client"

import type React from "react"

import { useEffect } from "react"
import { setupStorage } from "@/lib/utils/setup-storage"

export default function TournamentCreateLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up storage bucket when the component mounts
    setupStorage()
  }, [])

  return <>{children}</>
}
