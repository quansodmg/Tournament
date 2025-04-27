"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"
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
import { MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

type Game = Database["public"]["Tables"]["games"]["Row"]

export default function GameList({
  games,
  currentPage,
  totalPages,
}: {
  games: Game[]
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const handlePageChange = (page: number) => {
    router.push(`/admin/games?page=${page}`)
  }

  const handleDeleteGame = async () => {
    if (!selectedGame) return

    try {
      const { error } = await supabase.from("games").delete().eq("id", selectedGame.id)

      if (error) throw error

      toast({
        title: "Game deleted",
        description: `${selectedGame.name} has been deleted.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting game:", error)
      toast({
        title: "Error",
        description: "Failed to delete game. It may be referenced by tournaments or other records.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedGame(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-md border shadow-sm text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Game</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                    No games found
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {game.cover_image ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden">
                            <Image
                              src={game.cover_image || "/placeholder.svg"}
                              alt={game.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                            No img
                          </div>
                        )}
                        <span className="font-medium">{game.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="line-clamp-2 max-w-md">{game.description || "No description"}</div>
                    </td>
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
                              router.push(`/games/${game.slug}`)
                            }}
                          >
                            View Game
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/admin/games/${game.slug}/edit`)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Game
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedGame(game)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Game
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

      {/* Delete Game Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedGame?.name}? This action cannot be undone and may affect
              tournaments and other related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
