import { createClient } from "@/lib/supabase/client"

interface UploadImageParams {
  file: File
  bucketName?: string
  folderPath?: string
}

export async function uploadImage({ file, bucketName = "tournament-images", folderPath = "" }: UploadImageParams) {
  const supabase = createClient()

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
  return publicUrlData.publicUrl
}

export async function deleteImage(url: string) {
  const supabase = createClient()

  // Extract the path from the URL
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const bucketName = pathParts[1] // Assuming URL format is /storage/v1/object/public/bucket-name/path
    const filePath = pathParts.slice(2).join("/")

    const { error } = await supabase.storage.from(bucketName).remove([filePath])

    if (error) {
      console.error("Error deleting image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error parsing image URL:", error)
    return false
  }
}
