"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { deleteImage } from "@/lib/utils/image-upload"
import { toast } from "@/components/ui/use-toast"

interface EditGameFormProps {
  game: any
}

export default function EditGameForm({ game }: EditGameFormProps) {
  const [name, setName] = useState(game.name)
  const [slug, setSlug] = useState(game.slug)
  const [description, setDescription] = useState(game.description || "")
  const [coverImage, setCoverImage] = useState<string | null>(game.cover_image)
  const [bannerImage, setBannerImage] = useState<string | null>(game.banner_image)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
  }

  // Update slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    // Only auto-update slug if it hasn't been manually edited
    if (slug === generateSlug(game.name)) {
      setSlug(generateSlug(newName))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!name.trim()) {
      setError("Game name is required")
      setLoading(false)
      return
    }

    if (!slug.trim()) {
      setError("Game slug is required")
      setLoading(false)
      return
    }

    try {
      // Check if slug already exists (excluding current game)
      const { data: existingGame, error: slugCheckError } = await supabase
        .from("games")
        .select("id")
        .eq("slug", slug)
        .neq("id", game.id)
        .maybeSingle()

      if (slugCheckError) throw slugCheckError

      if (existingGame) {
        setError("A game with this slug already exists")
        setLoading(false)
        return
      }

      // Handle image changes
      if (game.cover_image && game.cover_image !== coverImage) {
        await deleteImage(game.cover_image)
      }

      if (game.banner_image && game.banner_image !== bannerImage) {
        await deleteImage(game.banner_image)
      }

      // Update the game
      const { error: updateError } = await supabase
        .from("games")
        .update({
          name,
          slug,
          description,
          cover_image: coverImage,
          banner_image: bannerImage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", game.id)

      if (updateError) throw updateError

      toast({
        title: "Game updated",
        description: "The game has been updated successfully.",
      })

      router.push("/admin/games")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating game:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="text-black">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Edit Game</CardTitle>
          <CardDescription>Update game details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="game-name">Game Name</Label>
            <Input id="game-name" type="text" value={name} onChange={handleNameChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="game-slug">Slug</Label>
            <Input
              id="game-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <p className="text-xs text-muted-foreground">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="game-description">Description</Label>
            <Textarea
              id="game-description"
              placeholder="Describe the game..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              label="Cover Image"
              aspectRatio="16/9"
              width={800}
              height={450}
              bucketName="game-images"
              folderPath="covers"
            />

            <ImageUpload
              value={bannerImage}
              onChange={setBannerImage}
              label="Banner Image"
              aspectRatio="21/9"
              width={1200}
              height={514}
              bucketName="game-images"
              folderPath="banners"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
