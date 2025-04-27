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

interface Match {
  id: string
  match_type: string
  status: string
  start_time: string | null
  end_time: string | null
  is_private: boolean
  created_at: string
  scheduled_by: {
    username: string
  }
  participants: Array<{
    team?: {
      id: string
      name: string
      logo_url: string | null
    } | null
    profile?: {
      id: string
      username: string
      avatar_url: string | null
    } | null
  }>
}

export default function MatchList({
  matches,
  currentPage,
  totalPages,
}: {
  matches: Match[]
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handlePageChange = (page: number) => {
    router.push(`/admin/matches?page=${page}`)
  }

  const handleDeleteMatch = async () => {
    if (!selectedMatch) return

    setIsDeleting(true)
    try {
      // First check if there are any participants
      const { count: participantsCount } = await supabase
        .from("match_participants")
        .select("*", { count: "exact", head: true })
        .eq("match_id", selectedMatch.id)

      if (participantsCount && participantsCount > 0) {
        // Delete participants first
        const { error: participantsError } = await supabase
          .from("match_participants")
          .delete()
          .eq("match_id", selectedMatch.id)

        if (participantsError) throw participantsError
      }

      // Check if there are any invitations
      const { count: invitationsCount } = await supabase
        .from("match_invitations")
        .select("*", { count: "exact", head: true })
        .eq("match_id", selectedMatch.id)

      if (invitationsCount && invitationsCount > 0) {
        // Delete invitations
        const { error: invitationsError } = await supabase
          .from("match_invitations")
          .delete()
          .eq("match_id", selectedMatch.id)

        if (invitationsError) throw invitationsError
      }

      // Delete the match
      const { error } = await supabase.from("matches").delete().eq("id", selectedMatch.id)

      if (error) throw error

      toast({
        title: "Match deleted",
        description: `Match has been deleted.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting match:", error)
      toast({
        title: "Error",
        description: "Failed to delete match. It may be referenced by other records.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedMatch(null)
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="text-black border-blue-300">
            Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-600 text-white">
            In Progress
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

  const getMatchTitle = (match: Match) => {
    if (match.participants && match.participants.length >= 2) {
      const team1 = match.participants[0]?.team?.name || match.participants[0]?.profile?.username || "Team 1"
      const team2 = match.participants[1]?.team?.name || match.participants[1]?.profile?.username || "Team 2"
      return `${team1} vs ${team2}`
    }

    if (match.participants && match.participants.length === 1) {
      const team = match.participants[0]?.team?.name || match.participants[0]?.profile?.username || "Team"
      return `${team} - Waiting for opponent`
    }

    return "Open Match"
  }

  return (
    <>
      <div className="bg-white rounded-md border shadow-sm text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Match</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Scheduled For</th>
                <th className="text-left py-3 px-4">Created By</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">
                    No matches found
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{getMatchTitle(match)}</td>
                    <td className="py-3 px-4">{match.match_type}</td>
                    <td className="py-3 px-4">{getStatusBadge(match.status)}</td>
                    <td className="py-3 px-4">
                      {match.start_time ? format(new Date(match.start_time), "MMM d, yyyy h:mm a") : "Not scheduled"}
                    </td>
                    <td className="py-3 px-4">{match.scheduled_by?.username || "—"}</td>
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
                              router.push(`/matches/${match.id}`)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Match
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/admin/matches/${match.id}/edit`)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Match
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMatch(match)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Match
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

      {/* Delete Match Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Match</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this match? This action cannot be undone and will remove all match data,
              including participants and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteMatch()
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
