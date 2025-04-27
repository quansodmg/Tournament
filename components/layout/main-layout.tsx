"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import FriendsSidebar from "@/components/friends/friends-sidebar"
import { Home, Gamepad2, Trophy, Users2, Search, BarChart3, Settings, MessageSquare, CalendarRange } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
  showFriendsSidebar?: boolean
}

export default function MainLayout({ children, showFriendsSidebar = false }: MainLayoutProps) {
  console.log("MainLayout rendering, showFriendsSidebar:", showFriendsSidebar)
  const pathname = usePathname()
  console.log("MainLayout pathname:", pathname)
  const [isMounted, setIsMounted] = useState(false)

  // Determine if we're on the messages page
  const isMessagesPage = pathname === "/messages" || pathname?.startsWith("/messages/")
  console.log("isMessagesPage:", isMessagesPage)

  useEffect(() => {
    console.log("MainLayout useEffect running")
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    console.log("MainLayout not mounted yet, returning null")
    return null
  }

  console.log("MainLayout fully mounted, rendering content")

  const navItems = [
    { icon: Home, href: "/", label: "Home" },
    { icon: Gamepad2, href: "/games", label: "Games" },
    { icon: Trophy, href: "/tournaments", label: "Tournaments" },
    { icon: Users2, href: "/teams", label: "Teams" },
    { icon: Search, href: "/match-finder", label: "Match Finder" },
    { icon: CalendarRange, href: "/matches", label: "Matches" },
    { icon: MessageSquare, href: "/messages", label: "Messages" },
    { icon: BarChart3, href: "/stats", label: "Statistics" },
    { icon: Settings, href: "/settings", label: "Settings" },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar */}
      <div className="bg-[#0a0a0a] border-r border-[#222] w-16 flex flex-col items-center py-4 space-y-4 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-[#1e2023] hover:text-[#0bb5ff]",
                isActive && "bg-[#1e2023] text-[#0bb5ff]",
              )}
              title={item.label}
            >
              <Icon className="h-6 w-6" />
              <span className="sr-only">{item.label}</span>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e2023] border border-[#333] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {item.label}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Friends Sidebar (conditionally rendered) - Only show if not on messages page */}
      {showFriendsSidebar && !isMessagesPage && (
        <div className="bg-[#0a0a0a] border-l border-[#222]">
          <FriendsSidebar />
        </div>
      )}
    </div>
  )
}
