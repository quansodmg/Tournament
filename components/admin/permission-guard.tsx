"use client"

import type React from "react"

import { useAdminPermissions } from "@/lib/hooks/use-admin-permissions"
import type { ResourceType, ActionType } from "@/lib/types/admin"
import { Skeleton } from "@/components/ui/skeleton"

interface PermissionGuardProps {
  resource: ResourceType
  action: ActionType
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ resource, action, children, fallback = <AccessDenied /> }: PermissionGuardProps) {
  const { hasPermission, loading } = useAdminPermissions()

  if (loading) {
    return <PermissionSkeleton />
  }

  if (!hasPermission(resource, action)) {
    return fallback
  }

  return <>{children}</>
}

function PermissionSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="p-8 text-center">
      <h3 className="text-xl font-semibold text-red-500 mb-2">Access Denied</h3>
      <p className="text-gray-400">You don't have permission to access this resource.</p>
    </div>
  )
}
