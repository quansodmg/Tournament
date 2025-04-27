import { createClient } from "@/lib/supabase/client"

export async function setupStorage() {
  const supabase = createClient()

  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketName = "tournament-images"

    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make the bucket public
        fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error setting up storage:", error)
    return false
  }
}
