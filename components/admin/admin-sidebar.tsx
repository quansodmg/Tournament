"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Gamepad2,
  Trophy,
  Shield,
  BarChart3,
  Settings,
  Swords,
  AlertTriangle,
  UserCog,
  Home,
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      permission: "dashboard:view",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      permission: "users:read",
    },
    {
      name: "Games",
      href: "/admin/games",
      icon: Gamepad2,
      permission: "games:read",
    },
    {
      name: "Tournaments",
      href: "/admin/tournaments",
      icon: Trophy,
      permission: "tournaments:read",
    },
    {
      name: "Teams",
      href: "/admin/teams",
      icon: Shield,
      permission: "teams:read",
    },
    {
      name: "Matches",
      href: "/admin/matches",
      icon: Swords,
      permission: "matches:read",
    },
    {
      name: "Disputes",
      href: "/admin/disputes",
      icon: AlertTriangle,
      permission: "disputes:read",
    },
    {
      name: "Statistics",
      href: "/admin/statistics",
      icon: BarChart3,
      permission: "stats:read",
    },
    {
      name: "Roles",
      href: "/admin/roles",
      icon: UserCog,
      permission: "roles:read",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      permission: "settings:read",
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col bg-[#101113] p-4">
      <div className="mb-8 flex items-center px-2">
        <div className="mr-2 h-8 w-8 rounded-full bg-[#0bb5ff]"></div>
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
              pathname === item.href
                ? "bg-[#0bb5ff] text-white"
                : "text-gray-300 hover:bg-[#0bb5ff]/10 hover:text-white",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-md bg-[#0bb5ff]/10 p-4">
        <div className="mb-2 flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-[#0bb5ff]/20"></div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-2 block rounded-md bg-[#0bb5ff]/20 px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#0bb5ff]/30"
        >
          Back to Site
        </Link>
      </div>
    </div>
  )
}
