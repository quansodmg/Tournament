"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2, Eye, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface Team {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  created_at: string
  creator: {
    username: string
  }
  members: {
    count: number
  }[]
}

export default function TeamList({
  teams,
  currentPage,
  totalPages,
}: {
  teams: Team[]
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handlePageChange = (page: number) => {
    router.push(`/admin/teams?page=${page}`)
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return

    setIsDeleting(true)
    try {
      // First check if there are any team members
      const { count: membersCount } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", selectedTeam.id)

      if (membersCount && membersCount > 0) {
        toast({
          title: "Cannot delete team",
          description: "This team has members. Please remove all members first.",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setIsDeleting(false)
        return
      }

      // Check if there are any tournament registrations
      const { count: registrationsCount } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("team_id", selectedTeam.id)

      if (registrationsCount && registrationsCount > 0) {
        toast({
          title: "Cannot delete team",
          description: "This team has tournament registrations. Please remove all registrations first.",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setIsDeleting(false)
        return
      }

      // Delete the team
      const { error } = await supabase.from("teams").delete().eq("id", selectedTeam.id)

      if (error) throw error

      toast({
        title: "Team deleted",
        description: `${selectedTeam.name} has been deleted.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting team:", error)
      toast({
        title: "Error",
        description: "Failed to delete team. It may be referenced by other records.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedTeam(null)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-md border shadow-sm text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Team</th>
                <th className="text-left py-3 px-4">Members</th>
                <th className="text-left py-3 px-4">Created By</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No teams found
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={team.logo_url || ""} alt={team.name} />
                          <AvatarFallback>{team.name[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">{team.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-black">
                        {team.members[0]?.count || 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{team.creator?.username || "—"}</td>
                    <td className="py-3 px-4">{formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="border-gray-200">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/teams/${team.id}`)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Team
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/admin/teams/${team.id}/members`)
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Manage Members
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/admin/teams/${team.id}/edit`)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTeam(team)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Team
                          </DropdownMenuItem>
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
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
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

      {/* Delete Team Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTeam?.name}? This action cannot be undone and may affect related
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteTeam()
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
