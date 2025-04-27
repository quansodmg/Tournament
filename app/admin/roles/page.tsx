import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

export default function AdminRolesPage() {
  // Static data for preview
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full access to all features and settings",
      permissions: ["all"],
      users: 2,
    },
    {
      id: 2,
      name: "Content Manager",
      description: "Can manage games, tournaments, and content",
      permissions: ["games:read", "games:write", "tournaments:read", "tournaments:write"],
      users: 5,
    },
    {
      id: 3,
      name: "Support Staff",
      description: "Can handle user support and disputes",
      permissions: ["users:read", "disputes:read", "disputes:write"],
      users: 8,
    },
    {
      id: 4,
      name: "Analytics Viewer",
      description: "Can view statistics and reports",
      permissions: ["stats:read"],
      users: 3,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Roles</h1>
        <Button className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card className="bg-[#1a1b1e] border-[#2a2b30]">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Manage admin roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center rounded-full bg-[#0bb5ff]/10 px-2 py-1 text-xs font-medium text-[#0bb5ff]"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{role.users}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1b1e] border-[#2a2b30]">
        <CardHeader>
          <CardTitle>Available Permissions</CardTitle>
          <CardDescription>List of all available permissions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-[#2a2b30] p-4">
              <h3 className="mb-2 font-medium text-[#0bb5ff]">Users</h3>
              <ul className="space-y-1 text-sm">
                <li>users:read - View user information</li>
                <li>users:write - Modify user information</li>
                <li>users:delete - Delete users</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#2a2b30] p-4">
              <h3 className="mb-2 font-medium text-[#0bb5ff]">Games</h3>
              <ul className="space-y-1 text-sm">
                <li>games:read - View games</li>
                <li>games:write - Add/edit games</li>
                <li>games:delete - Remove games</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#2a2b30] p-4">
              <h3 className="mb-2 font-medium text-[#0bb5ff]">Tournaments</h3>
              <ul className="space-y-1 text-sm">
                <li>tournaments:read - View tournaments</li>
                <li>tournaments:write - Create/edit tournaments</li>
                <li>tournaments:delete - Cancel tournaments</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#2a2b30] p-4">
              <h3 className="mb-2 font-medium text-[#0bb5ff]">Teams</h3>
              <ul className="space-y-1 text-sm">
                <li>teams:read - View teams</li>
                <li>teams:write - Modify teams</li>
                <li>teams:delete - Delete teams</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#2a2b30] p-4">
              <h3 className="mb-2 font-medium text-[#0bb5ff]">Disputes</h3>
              <ul className="space-y-1 text-sm">
                <li>disputes:read - View disputes</li>
                <li>disputes:write - Handle disputes</li>
                <li>disputes:delete - Remove disputes</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#2a2b30] p-4">
              <h3 className="mb-2 font-medium text-[#0bb5ff]">Statistics</h3>
              <ul className="space-y-1 text-sm">
                <li>stats:read - View statistics</li>
                <li>stats:export - Export statistics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
