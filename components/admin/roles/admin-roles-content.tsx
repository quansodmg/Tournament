"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useAdminPermissions } from "@/lib/hooks/use-admin-permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, MoreHorizontal, RefreshCw, Shield, UserCog } from "lucide-react"
import type { AdminRole, Permission, AdminWithRole } from "@/lib/types/admin"

export default function AdminRolesContent() {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [admins, setAdmins] = useState<AdminWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false)
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false)
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithRole | null>(null)
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const { hasPermission } = useAdminPermissions()

  const canCreateRoles = hasPermission("admins", "create")
  const canEditRoles = hasPermission("admins", "edit")
  const canDeleteRoles = hasPermission("admins", "delete")
  const canAssignRoles = hasPermission("admins", "assign_roles")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase.from("admin_roles").select("*").order("name")

      if (rolesError) throw rolesError
      setRoles(rolesData || [])

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions")
        .select("*")
        .order("resource", { ascending: true })
        .order("action", { ascending: true })

      if (permissionsError) throw permissionsError
      setPermissions(permissionsData || [])

      // Fetch admins with roles
      const { data: adminsData, error: adminsError } = await supabase
        .from("admins")
        .select(`
          *,
          admin_roles (
            name,
            description
          )
        `)
        .order("email")

      if (adminsError) throw adminsError

      // Transform the data to include role_name and role_description
      const transformedAdmins = adminsData.map((admin) => ({
        ...admin,
        role_name: admin.admin_roles?.name || null,
        role_description: admin.admin_roles?.description || null,
      }))

      setAdmins(transformedAdmins || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load roles and permissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRole() {
    try {
      // First create the role
      const { data: roleData, error: roleError } = await supabase
        .from("admin_roles")
        .insert({
          name: roleFormData.name.toLowerCase().replace(/\s+/g, "_"),
          description: roleFormData.description || null,
        })
        .select()
        .single()

      if (roleError) throw roleError

      // Then assign permissions
      if (selectedPermissions.length > 0) {
        const rolePermissions = selectedPermissions.map((permissionId) => ({
          role_id: roleData.id,
          permission_id: permissionId,
        }))

        const { error: permissionsError } = await supabase.from("role_permissions").insert(rolePermissions)

        if (permissionsError) throw permissionsError
      }

      toast({
        title: "Role created",
        description: `${roleFormData.name} role has been created successfully.`,
      })

      // Reset form and refresh data
      setRoleFormData({ name: "", description: "" })
      setSelectedPermissions([])
      setIsCreateRoleDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error creating role:", error)
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      })
    }
  }

  async function handleEditRole() {
    if (!selectedRole) return

    try {
      // Update the role
      const { error: roleError } = await supabase
        .from("admin_roles")
        .update({
          name: roleFormData.name.toLowerCase().replace(/\s+/g, "_"),
          description: roleFormData.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRole.id)

      if (roleError) throw roleError

      // Delete existing permissions
      const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", selectedRole.id)

      if (deleteError) throw deleteError

      // Add new permissions
      if (selectedPermissions.length > 0) {
        const rolePermissions = selectedPermissions.map((permissionId) => ({
          role_id: selectedRole.id,
          permission_id: permissionId,
        }))

        const { error: permissionsError } = await supabase.from("role_permissions").insert(rolePermissions)

        if (permissionsError) throw permissionsError
      }

      toast({
        title: "Role updated",
        description: `${roleFormData.name} role has been updated successfully.`,
      })

      // Reset form and refresh data
      setRoleFormData({ name: "", description: "" })
      setSelectedPermissions([])
      setIsEditRoleDialogOpen(false)
      setSelectedRole(null)
      fetchData()
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteRole() {
    if (!selectedRole) return

    try {
      // Check if any admins are using this role
      const { data: adminsWithRole, error: checkError } = await supabase
        .from("admins")
        .select("id")
        .eq("role_id", selectedRole.id)

      if (checkError) throw checkError

      if (adminsWithRole && adminsWithRole.length > 0) {
        toast({
          title: "Cannot delete role",
          description: `This role is assigned to ${adminsWithRole.length} admin(s). Please reassign them first.`,
          variant: "destructive",
        })
        return
      }

      // Delete the role
      const { error: deleteError } = await supabase.from("admin_roles").delete().eq("id", selectedRole.id)

      if (deleteError) throw deleteError

      toast({
        title: "Role deleted",
        description: `${selectedRole.name} role has been deleted successfully.`,
      })

      setIsDeleteRoleDialogOpen(false)
      setSelectedRole(null)
      fetchData()
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  async function handleAssignRole() {
    if (!selectedAdmin || !selectedRoleId) return

    try {
      const { error } = await supabase
        .from("admins")
        .update({
          role_id: selectedRoleId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAdmin.id)

      if (error) throw error

      toast({
        title: "Role assigned",
        description: `Role has been assigned to ${selectedAdmin.email} successfully.`,
      })

      setIsAssignRoleDialogOpen(false)
      setSelectedAdmin(null)
      setSelectedRoleId(null)
      fetchData()
    } catch (error) {
      console.error("Error assigning role:", error)
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      })
    }
  }

  async function fetchRolePermissions(roleId: string) {
    try {
      const { data, error } = await supabase.from("role_permissions").select("permission_id").eq("role_id", roleId)

      if (error) throw error

      setSelectedPermissions(data.map((item) => item.permission_id))
    } catch (error) {
      console.error("Error fetching role permissions:", error)
      toast({
        title: "Error",
        description: "Failed to load role permissions",
        variant: "destructive",
      })
    }
  }

  function openEditRoleDialog(role: AdminRole) {
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description || "",
    })
    fetchRolePermissions(role.id)
    setIsEditRoleDialogOpen(true)
  }

  function openDeleteRoleDialog(role: AdminRole) {
    setSelectedRole(role)
    setIsDeleteRoleDialogOpen(true)
  }

  function openAssignRoleDialog(admin: AdminWithRole) {
    setSelectedAdmin(admin)
    setSelectedRoleId(admin.role_id || null)
    setIsAssignRoleDialogOpen(true)
  }

  // Group permissions by resource
  const permissionsByResource = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles">
        <TabsList className="bg-[#101113] border border-[#67b7ff]/20">
          <TabsTrigger value="roles" className="data-[state=active]:bg-[#0bb5ff] data-[state=active]:text-white">
            <Shield className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-[#0bb5ff] data-[state=active]:text-white">
            <UserCog className="mr-2 h-4 w-4" />
            Admin Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Admin Roles</h2>
            {canCreateRoles && (
              <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
                    <Shield className="mr-2 h-4 w-4" />
                    Create New Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Create New Admin Role</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Define a new role with specific permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Role Name
                      </Label>
                      <Input
                        id="name"
                        value={roleFormData.name}
                        onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                        className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
                        placeholder="e.g., Content Manager"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={roleFormData.description}
                        onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                        className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
                        placeholder="Describe the role's responsibilities"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Permissions</Label>
                      <div className="col-span-3 space-y-4">
                        {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
                          <div key={resource} className="border border-[#67b7ff]/20 rounded-md p-4">
                            <h4 className="font-medium mb-2 capitalize">{resource}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {resourcePermissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedPermissions([...selectedPermissions, permission.id])
                                      } else {
                                        setSelectedPermissions(selectedPermissions.filter((id) => id !== permission.id))
                                      }
                                    }}
                                    className="border-[#67b7ff]/40 data-[state=checked]:bg-[#0bb5ff]"
                                  />
                                  <Label htmlFor={permission.id} className="capitalize">
                                    {permission.action} {resource}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleCreateRole}
                      className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
                      disabled={!roleFormData.name}
                    >
                      Create Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? // Loading skeletons
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="bg-[#101113] border-[#67b7ff]/20 text-white">
                      <CardHeader>
                        <div className="h-6 w-32 bg-[#67b7ff]/20 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-[#67b7ff]/20 rounded animate-pulse"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Array(4)
                            .fill(0)
                            .map((_, j) => (
                              <div key={j} className="h-4 w-full bg-[#67b7ff]/20 rounded animate-pulse"></div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              : roles.map((role) => (
                  <Card key={role.id} className="bg-[#101113] border-[#67b7ff]/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span className="capitalize">{role.name.replace(/_/g, " ")}</span>
                        {(canEditRoles || canDeleteRoles) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#101113] border-[#67b7ff]/20 text-white">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#67b7ff]/20" />
                              {canEditRoles && (
                                <DropdownMenuItem
                                  onClick={() => openEditRoleDialog(role)}
                                  className="hover:bg-[#67b7ff]/10 cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Role
                                </DropdownMenuItem>
                              )}
                              {canDeleteRoles && role.name !== "super_admin" && (
                                <DropdownMenuItem
                                  onClick={() => openDeleteRoleDialog(role)}
                                  className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Role
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {role.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {/* We'll show badges for permissions this role has */}
                        {loading ? (
                          <div className="h-6 w-20 bg-[#67b7ff]/20 rounded animate-pulse"></div>
                        ) : (
                          <Badge variant="outline" className="bg-[#0bb5ff]/10 text-[#0bb5ff] border-[#0bb5ff]/30">
                            Loading permissions...
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Admin Role Assignments</h2>
            <Button
              onClick={fetchData}
              variant="outline"
              className="border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="bg-[#101113] rounded-md border border-[#67b7ff]/20 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#67b7ff]/20 hover:bg-transparent">
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Current Role</TableHead>
                  <TableHead className="text-white">Super Admin</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i} className="border-b border-[#67b7ff]/20">
                          <TableCell>
                            <div className="h-4 w-48 bg-[#67b7ff]/20 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-32 bg-[#67b7ff]/20 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-8 bg-[#67b7ff]/20 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 w-8 bg-[#67b7ff]/20 rounded animate-pulse ml-auto"></div>
                          </TableCell>
                        </TableRow>
                      ))
                  : admins.map((admin) => (
                      <TableRow key={admin.id} className="border-b border-[#67b7ff]/20 hover:bg-[#67b7ff]/5">
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          {admin.role_name ? (
                            <Badge className="bg-[#0bb5ff]/10 text-[#0bb5ff] border-[#0bb5ff]/30">
                              {admin.role_name.replace(/_/g, " ")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-500/30">
                              No role assigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {admin.is_super_admin ? (
                            <Badge className="bg-[#0bb5ff] text-white">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-500/30">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canAssignRoles && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAssignRoleDialog(admin)}
                              className="text-white hover:bg-[#67b7ff]/10"
                            >
                              <UserCog className="h-4 w-4" />
                              <span className="sr-only">Assign Role</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription className="text-gray-400">Update role details and permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Role Name
              </Label>
              <Input
                id="edit-name"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Permissions</Label>
              <div className="col-span-3 space-y-4">
                {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="border border-[#67b7ff]/20 rounded-md p-4">
                    <h4 className="font-medium mb-2 capitalize">{resource}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, permission.id])
                              } else {
                                setSelectedPermissions(selectedPermissions.filter((id) => id !== permission.id))
                              }
                            }}
                            className="border-[#67b7ff]/40 data-[state=checked]:bg-[#0bb5ff]"
                          />
                          <Label htmlFor={`edit-${permission.id}`} className="capitalize">
                            {permission.action} {resource}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditRole}
              className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
              disabled={!roleFormData.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteRoleDialogOpen} onOpenChange={setIsDeleteRoleDialogOpen}>
        <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteRoleDialogOpen(false)}
              className="border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
        <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription className="text-gray-400">Assign a role to {selectedAdmin?.email}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="role-select" className="block mb-2">
              Select Role
            </Label>
            <select
              id="role-select"
              value={selectedRoleId || ""}
              onChange={(e) => setSelectedRoleId(e.target.value || null)}
              className="w-full p-2 rounded-md bg-[#101113] border border-[#67b7ff]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#0bb5ff]"
            >
              <option value="">No Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.replace(/_/g, " ")} {role.description ? `- ${role.description}` : ""}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignRoleDialogOpen(false)}
              className="border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
            >
              Cancel
            </Button>
            <Button onClick={handleAssignRole} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
