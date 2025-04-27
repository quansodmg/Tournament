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
import { MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Tournament {
  id: string
  name: string
  slug: string
  status: string
  start_date: string
  entry_fee: number
  prize_pool: number
  created_at: string
  game: {
    name: string
  }
  creator: {
    username: string
  }
}

export default function TournamentList({
  tournaments,
  currentPage,
  totalPages,
}: {
  tournaments: Tournament[]
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handlePageChange = (page: number) => {
    router.push(`/admin/tournaments?page=${page}`)
  }

  const handleDeleteTournament = async () => {
    if (!selectedTournament) return

    setIsDeleting(true)
    try {
      const supabase = createClient()

      // First check if there are any registrations
      const { count: registrationsCount } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("tournament_id", selectedTournament.id)

      if (registrationsCount && registrationsCount > 0) {
        toast({
          title: "Cannot delete tournament",
          description: "This tournament has registrations. Please remove all registrations first.",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setIsDeleting(false)
        return
      }

      // Check if there are any matches
      const { count: matchesCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("tournament_id", selectedTournament.id)

      if (matchesCount && matchesCount > 0) {
        toast({
          title: "Cannot delete tournament",
          description: "This tournament has matches. Please remove all matches first.",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setIsDeleting(false)
        return
      }

      // Delete the tournament
      const { error } = await supabase.from("tournaments").delete().eq("id", selectedTournament.id)

      if (error) throw error

      toast({
        title: "Tournament deleted",
        description: `${selectedTournament.name} has been deleted.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting tournament:", error)
      toast({
        title: "Error",
        description: "Failed to delete tournament. It may be referenced by other records.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedTournament(null)
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="text-black border-blue-300">
            Upcoming
          </Badge>
        )
      case "active":
        return (
          <Badge variant="default" className="bg-blue-600 text-white">
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-gray-200 text-black">
            Completed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-black border-gray-300">
            {status}
          </Badge>
        )
    }
  }

  return (
    <>
      <div className="bg-white rounded-md border shadow-sm text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tournament</th>
                <th className="text-left py-3 px-4">Game</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Start Date</th>
                <th className="text-left py-3 px-4">Entry Fee</th>
                <th className="text-left py-3 px-4">Prize Pool</th>
                <th className="text-left py-3 px-4">Organizer</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-muted-foreground">
                    No tournaments found
                  </td>
                </tr>
              ) : (
                tournaments.map((tournament) => (
                  <tr key={tournament.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{tournament.name}</td>
                    <td className="py-3 px-4">{tournament.game?.name || "—"}</td>
                    <td className="py-3 px-4">{getStatusBadge(tournament.status)}</td>
                    <td className="py-3 px-4">{format(new Date(tournament.start_date), "MMM d, yyyy")}</td>
                    <td className="py-3 px-4">{tournament.entry_fee > 0 ? `$${tournament.entry_fee}` : "Free"}</td>
                    <td className="py-3 px-4">${tournament.prize_pool}</td>
                    <td className="py-3 px-4">{tournament.creator?.username || "—"}</td>
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
                              router.push(`/tournaments/${tournament.slug}`)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Tournament
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/tournaments/${tournament.slug}/edit`)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Tournament
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTournament(tournament)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Tournament
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
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Tournament Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTournament?.name}? This action cannot be undone and may affect
              related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteTournament()
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
