"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ResourceType, ActionType, AdminPermission } from "@/lib/types/admin"

export function useAdminPermissions() {
  const [permissions, setPermissions] = useState<AdminPermission[]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const { data: session } = await supabase.auth.getSession()

        if (!session.session) {
          setLoading(false)
          return
        }

        const userId = session.session.user.id

        // First check if user is in the admins table (legacy check)
        const { data: adminData } = await supabase.from("admins").select("is_super_admin").eq("id", userId).single()

        // If user is a super admin in the legacy table, grant all permissions
        if (adminData?.is_super_admin) {
          setIsSuperAdmin(true)
        }

        // Try to fetch from the new permissions table if it exists
        try {
          const { data: roleData } = await supabase.from("admin_user_roles").select("role_id").eq("user_id", userId)

          if (roleData && roleData.length > 0) {
            // Get all permissions for the user's roles
            const roleIds = roleData.map((r) => r.role_id)

            const { data: permissionsData } = await supabase
              .from("admin_role_permissions")
              .select(`
                permission_id,
                admin_permissions (
                  id,
                  resource,
                  action
                )
              `)
              .in("role_id", roleIds)

            if (permissionsData) {
              const formattedPermissions = permissionsData.map((p) => ({
                id: p.admin_permissions.id,
                resource: p.admin_permissions.resource,
                action: p.admin_permissions.action,
              }))

              setPermissions(formattedPermissions)
            }
          }
        } catch (err) {
          // If the new tables don't exist yet, we'll just use the legacy super admin check
          console.log("New permissions tables may not exist yet:", err)
        }
      } catch (err) {
        console.error("Error fetching admin permissions:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch permissions"))
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const hasPermission = (resource: ResourceType, action: ActionType): boolean => {
    // If still loading, be conservative and return false
    if (loading) return false

    // Super admins have all permissions
    if (isSuperAdmin) return true

    // Check if the admin has the specific permission
    return permissions.some((permission) => permission.resource === resource && permission.action === action)
  }

  const getPermittedResources = (): ResourceType[] => {
    // Super admins have access to all resources
    if (isSuperAdmin) {
      return [
        "users",
        "teams",
        "tournaments",
        "games",
        "matches",
        "disputes",
        "statistics",
        "settings",
        "roles",
      ] as ResourceType[]
    }

    const uniqueResources = new Set<ResourceType>()
    permissions.forEach((permission) => {
      uniqueResources.add(permission.resource as ResourceType)
    })
    return Array.from(uniqueResources)
  }

  const getPermittedActions = (resource: ResourceType): ActionType[] => {
    // Super admins have all actions
    if (isSuperAdmin) {
      return ["view", "create", "edit", "delete", "manage", "resolve"] as ActionType[]
    }

    const actions = permissions
      .filter((permission) => permission.resource === resource)
      .map((permission) => permission.action as ActionType)

    return [...new Set(actions)]
  }

  return {
    permissions,
    loading,
    error,
    hasPermission,
    getPermittedResources,
    getPermittedActions,
    isSuperAdmin,
  }
}
