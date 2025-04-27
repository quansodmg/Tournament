"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserX,
  Trash2,
  Edit,
  UserPlus,
  Search,
  X,
  RefreshCw,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  isAdmin: boolean
  isSuperAdmin: boolean
}

export default function UserList({
  users,
  currentPage,
  totalPages,
}: {
  users: Profile[]
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: "",
  })
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
  })

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handlePageChange = (page: number) => {
    router.push(`/admin/users?page=${page}`)
  }

  const handlePromoteToAdmin = async () => {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const { error } = await supabase.from("admins").insert({
        id: selectedUser.id,
        email: selectedUser.username, // Using username as email for demo
        is_super_admin: false,
      })

      if (error) throw error

      toast({
        title: "User promoted",
        description: `${selectedUser.username} has been promoted to admin.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error promoting user:", error)
      toast({
        title: "Error",
        description: "Failed to promote user to admin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsPromoteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleDemoteFromAdmin = async () => {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const { error } = await supabase.from("admins").delete().eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "User demoted",
        description: `${selectedUser.username} has been demoted from admin.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error demoting user:", error)
      toast({
        title: "Error",
        description: "Failed to demote user from admin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDemoteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      // First delete from admins table if they're an admin
      if (selectedUser.isAdmin) {
        await supabase.from("admins").delete().eq("id", selectedUser.id)
      }

      // Delete from profiles table
      const { error } = await supabase.from("profiles").delete().eq("id", selectedUser.id)

      if (error) throw error

      // In a real app, you might also want to delete the auth user
      // This would require admin privileges and a server action

      toast({
        title: "User deleted",
        description: `${selectedUser.username} has been deleted.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. They may have related records.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editFormData.username,
          full_name: editFormData.full_name || null,
          bio: editFormData.bio || null,
          avatar_url: editFormData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "User updated",
        description: `${editFormData.username} has been updated.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleCreateUser = async () => {
    setIsLoading(true)

    try {
      // In a real app, you would use a server action to create a user with auth
      // For this demo, we'll just create a profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: `demo-${Date.now()}`, // In a real app, this would be the auth user ID
          username: createFormData.username,
          full_name: createFormData.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "User created",
        description: `${createFormData.username} has been created.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsCreateDialogOpen(false)
      setCreateFormData({
        email: "",
        password: "",
        username: "",
        full_name: "",
      })
    }
  }

  const openEditDialog = (user: Profile) => {
    setSelectedUser(user)
    setEditFormData({
      username: user.username,
      full_name: user.full_name || "",
      bio: user.bio || "",
      avatar_url: user.avatar_url || "",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (user: Profile) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#101113] border-[#67b7ff]/20 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="bg-[#101113] rounded-md border border-[#67b7ff]/20 shadow-sm text-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#67b7ff]/20">
                  <th className="text-left py-3 px-4">Username</th>
                  <th className="text-left py-3 px-4">Full Name</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#67b7ff]/20 hover:bg-[#67b7ff]/5">
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">{user.full_name || "—"}</td>
                      <td className="py-3 px-4">
                        {user.isSuperAdmin ? (
                          <Badge className="bg-[#0bb5ff] text-white">Super Admin</Badge>
                        ) : user.isAdmin ? (
                          <Badge className="bg-[#67b7ff] text-white">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-white border-[#67b7ff]/40">
                            User
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-[#67b7ff]/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#101113] border-[#67b7ff]/20 text-white">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#67b7ff]/20" />
                            <DropdownMenuItem
                              onClick={() => openViewDialog(user)}
                              className="hover:bg-[#67b7ff]/10 cursor-pointer"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(user)}
                              className="hover:bg-[#67b7ff]/10 cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>

                            {!user.isAdmin && !user.isSuperAdmin && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsPromoteDialogOpen(true)
                                }}
                                className="hover:bg-[#67b7ff]/10 cursor-pointer"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}

                            {user.isAdmin && !user.isSuperAdmin && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDemoteDialogOpen(true)
                                }}
                                className="hover:bg-[#67b7ff]/10 cursor-pointer"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Remove Admin
                              </DropdownMenuItem>
                            )}

                            {!user.isSuperAdmin && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#67b7ff]/20">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Promote to Admin Dialog */}
      <AlertDialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <AlertDialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to promote {selectedUser?.username} to admin? They will have access to the admin
              dashboard and management features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromoteToAdmin}
              className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Promote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demote from Admin Dialog */}
      <AlertDialog open={isDemoteDialogOpen} onOpenChange={setIsDemoteDialogOpen}>
        <AlertDialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove admin privileges from {selectedUser?.username}? They will no longer have
              access to the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDemoteFromAdmin}
              className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar_url" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatar_url"
                value={editFormData.avatar_url}
                onChange={(e) => setEditFormData({ ...editFormData, avatar_url: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditUser}
              className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new user to the platform. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create_email" className="text-right">
                Email
              </Label>
              <Input
                id="create_email"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create_password" className="text-right">
                Password
              </Label>
              <Input
                id="create_password"
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create_username" className="text-right">
                Username
              </Label>
              <Input
                id="create_username"
                value={createFormData.username}
                onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create_full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="create_full_name"
                value={createFormData.full_name}
                onChange={(e) => setCreateFormData({ ...createFormData, full_name: e.target.value })}
                className="col-span-3 bg-[#101113] border-[#67b7ff]/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateUser}
              className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[#101113] border-[#67b7ff]/20 text-white sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-[#67b7ff]/20 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url || "/placeholder.svg"}
                      alt={selectedUser.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[#0bb5ff]">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                  <p className="text-gray-400">{selectedUser.full_name || "No name provided"}</p>
                  <div className="mt-1">
                    {selectedUser.isSuperAdmin ? (
                      <Badge className="bg-[#0bb5ff] text-white">Super Admin</Badge>
                    ) : selectedUser.isAdmin ? (
                      <Badge className="bg-[#67b7ff] text-white">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-white border-[#67b7ff]/40">
                        User
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">User ID</h4>
                  <p className="mt-1 text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Joined</h4>
                  <p className="mt-1 text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Last Updated</h4>
                  <p className="mt-1 text-sm">{new Date(selectedUser.updated_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Status</h4>
                  <p className="mt-1 text-sm flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Active
                  </p>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-400">Bio</h4>
                  <p className="mt-1 text-sm">{selectedUser.bio}</p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => openEditDialog(selectedUser)}
                  className="border-[#67b7ff]/20 text-white hover:bg-[#67b7ff]/10"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                {!selectedUser.isSuperAdmin && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
