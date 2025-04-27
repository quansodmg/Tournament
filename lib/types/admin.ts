export interface AdminRole {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
  created_at: string
  updated_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  created_at: string
}

export interface AdminWithRole {
  id: string
  email: string
  is_super_admin: boolean
  created_at: string
  updated_at: string
  role_id: string | null
  role_name?: string
  role_description?: string
}

export interface AdminPermission {
  admin_id: string
  admin_email: string
  role_name: string
  role_description: string | null
  resource: string
  action: string
  permission_name: string
  permission_description: string | null
}

// Define the resource types that can be managed
export type ResourceType =
  | "users"
  | "teams"
  | "tournaments"
  | "games"
  | "matches"
  | "disputes"
  | "statistics"
  | "settings"
  | "roles"

// Define the actions that can be performed on resources
export type ActionType = "view" | "create" | "edit" | "delete" | "manage" | "resolve"

// Define the admin permission structure
export interface AdminPermission {
  id: string
  resource: string
  action: string
}

// Define the admin role structure
export interface AdminRole {
  id: string
  name: string
  description: string | null
  is_system: boolean
  permissions?: AdminPermission[]
}

// Define the admin user role assignment
export interface AdminUserRole {
  user_id: string
  role_id: string
  role?: AdminRole
}
