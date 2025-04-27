"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  className?: string
  bucketName?: string
  folderPath?: string
  maxSizeMB?: number
  aspectRatio?: string
  width?: number
  height?: number
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  className,
  bucketName = "tournament-images",
  folderPath = "banners",
  maxSizeMB = 5,
  aspectRatio = "16/9",
  width = 1200,
  height = 675,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      setIsUploading(false)
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed")
      setIsUploading(false)
      return
    }

    try {
      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path)
      onChange(publicUrlData.publicUrl)
      setUploadProgress(100)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Error uploading image")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    // If there's a current image, we could delete it from storage here
    // For simplicity, we'll just clear the value
    onChange(null)
    setError(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="image-upload">{label}</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-4",
          error ? "border-destructive" : "border-muted-foreground/25",
          { "bg-muted/50": isUploading },
        )}
        style={{ aspectRatio }}
      >
        {value ? (
          <div className="relative w-full h-full">
            <Image
              src={value || "/placeholder.svg"}
              alt="Uploaded image"
              fill
              className="object-cover rounded-md"
              sizes={`(max-width: 768px) 100vw, ${width}px`}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ) : (
          <>
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Recommended size: {width}x{height}px. Max size: {maxSizeMB}MB
                  </p>
                </div>
                <Input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Select Image
                </Button>
              </>
            )}
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
