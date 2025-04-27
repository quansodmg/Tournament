import { uploadImage, deleteImage } from "@/lib/utils/image-upload"
import { createClient } from "@/lib/supabase/client"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock the createClient function
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}))

describe("Image Upload Utilities", () => {
  let mockSupabase: any

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({ data: { path: "test-path" }, error: null }),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/test-image.jpg" } }),
          remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      },
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe("uploadImage", () => {
    it("uploads an image successfully", async () => {
      const mockFile = new File(["test"], "test-image.jpg", { type: "image/jpeg" })

      const result = await uploadImage({
        file: mockFile,
        bucketName: "test-bucket",
        folderPath: "test-folder",
      })

      expect(mockSupabase.storage.from).toHaveBeenCalledWith("test-bucket")
      expect(mockSupabase.storage.from().upload).toHaveBeenCalled()
      expect(mockSupabase.storage.from().getPublicUrl).toHaveBeenCalledWith("test-path")
      expect(result).toBe("https://example.com/test-image.jpg")
    })

    it("uses default bucket name when not provided", async () => {
      const mockFile = new File(["test"], "test-image.jpg", { type: "image/jpeg" })

      await uploadImage({
        file: mockFile,
      })

      expect(mockSupabase.storage.from).toHaveBeenCalledWith("tournament-images")
    })

    it("throws an error when upload fails", async () => {
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: new Error("Upload failed") }),
      })

      const mockFile = new File(["test"], "test-image.jpg", { type: "image/jpeg" })

      await expect(uploadImage({ file: mockFile })).rejects.toThrow("Upload failed")
    })
  })

  describe("deleteImage", () => {
    it("deletes an image successfully", async () => {
      const result = await deleteImage("https://example.com/storage/v1/object/public/test-bucket/test-image.jpg")

      expect(mockSupabase.storage.from).toHaveBeenCalledWith("test-bucket")
      expect(mockSupabase.storage.from().remove).toHaveBeenCalledWith(["test-image.jpg"])
      expect(result).toBe(true)
    })

    it("returns false when deletion fails", async () => {
      mockSupabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ data: null, error: new Error("Deletion failed") }),
      })

      const result = await deleteImage("https://example.com/storage/v1/object/public/test-bucket/test-image.jpg")

      expect(result).toBe(false)
    })

    it("returns false when URL parsing fails", async () => {
      const result = await deleteImage("invalid-url")

      expect(result).toBe(false)
    })
  })
})
