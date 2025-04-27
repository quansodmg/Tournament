"use client"

import { TabsContent } from "@/components/ui/tabs"
import { TabsTrigger } from "@/components/ui/tabs"
import { TabsList } from "@/components/ui/tabs"
import { Tabs } from "@/components/ui/tabs"
import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Plus, Trash2, Upload, X, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { uploadImage } from "@/lib/utils/image-upload"

// Define the HeroSlider type
interface HeroSlider {
  id: string
  name: string
  slug: string
  description: string | null
  banner_image: string | null
  active: boolean
  order: number
  created_at: string
  updated_at: string
}

// Update the component to include color settings
export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)
  const [clientInitialized, setClientInitialized] = useState(false)

  // General settings
  const [siteName, setSiteName] = useState("EsportsHub")
  const [siteDescription, setSiteDescription] = useState("Competitive Gaming Platform")

  // Promo banner settings
  const [showPromoBanner, setShowPromoBanner] = useState(false)
  const [promoText, setPromoText] = useState("ESPORTSHUB WEEKLY CHALLENGERS")
  const [promoTag, setPromoTag] = useState("SUPER PROMO")

  // API keys
  const [openaiApiKey, setOpenaiApiKey] = useState("")

  // Color settings
  const [primaryColor, setPrimaryColor] = useState("#1e90ff") // Default blue
  const [secondaryColor, setSecondaryColor] = useState("#141824") // Default secondary
  const [accentColor, setAccentColor] = useState("#1e90ff") // Default accent
  const [backgroundColor, setBackgroundColor] = useState("#0a0a0a") // Default background
  const [textColor, setTextColor] = useState("#ffffff") // Default text color

  // Preview mode settings
  const [previewMode, setPreviewMode] = useState(false)
  const [previewDuration, setPreviewDuration] = useState(30) // Duration in minutes

  // Hero slider settings
  const [heroSliders, setHeroSliders] = useState<HeroSlider[]>([])
  const [isAddSliderOpen, setIsAddSliderOpen] = useState(false)
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false)
  const [currentSlider, setCurrentSlider] = useState<HeroSlider | null>(null)

  // New slider form
  const [newSliderName, setNewSliderName] = useState("")
  const [newSliderDescription, setNewSliderDescription] = useState("")
  const [newSliderImage, setNewSliderImage] = useState<File | null>(null)
  const [newSliderImagePreview, setNewSliderImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Initialize Supabase
  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await createClient()
        setSupabase(client)
        setClientInitialized(true)
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error)
        setError("Failed to initialize database connection. Please try refreshing the page.")
      }
    }

    initClient()
  }, [])

  // Load settings on component mount
  useEffect(() => {
    if (!clientInitialized || !supabase) return

    const loadSettings = async () => {
      setLoading(true)
      try {
        // Fetch general settings
        const { data: siteNameData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "site_name")
          .maybeSingle()

        const { data: siteDescriptionData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "site_description")
          .maybeSingle()

        // Fetch promo banner settings
        const { data: showPromoData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "show_promo_banner")
          .maybeSingle()

        const { data: promoTextData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "promo_text")
          .maybeSingle()

        const { data: promoTagData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "promo_tag")
          .maybeSingle()

        // Fetch API keys
        const { data: openaiApiKeyData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "openai_api_key")
          .maybeSingle()

        // Fetch preview mode settings
        const { data: previewModeData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "preview_mode")
          .maybeSingle()

        const { data: previewDurationData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "preview_duration")
          .maybeSingle()

        // Set state from database values
        if (siteNameData) {
          setSiteName(siteNameData.value || "EsportsHub")
        }

        if (siteDescriptionData) {
          setSiteDescription(siteDescriptionData.value || "Competitive Gaming Platform")
        }

        if (showPromoData) {
          const value = showPromoData.value
          setShowPromoBanner(value === true || value === "true")
        }

        if (promoTextData) {
          setPromoText(promoTextData.value || "ESPORTSHUB WEEKLY CHALLENGERS")
        }

        if (promoTagData) {
          setPromoTag(promoTagData.value || "SUPER PROMO")
        }

        if (openaiApiKeyData) {
          setOpenaiApiKey(openaiApiKeyData.value || "")
        }

        if (previewModeData) {
          const value = previewModeData.value
          setPreviewMode(value === true || value === "true")
        }

        if (previewDurationData) {
          setPreviewDuration(Number.parseInt(previewDurationData.value) || 30)
        }

        // Fetch color settings
        const { data: primaryColorData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "primary_color")
          .maybeSingle()

        const { data: secondaryColorData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "secondary_color")
          .maybeSingle()

        const { data: accentColorData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "accent_color")
          .maybeSingle()

        const { data: backgroundColorData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "background_color")
          .maybeSingle()

        const { data: textColorData } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "text_color")
          .maybeSingle()

        // Set color states from database values
        if (primaryColorData) setPrimaryColor(primaryColorData.value || "#1e90ff")
        if (secondaryColorData) setSecondaryColor(secondaryColorData.value || "#141824")
        if (accentColorData) setAccentColor(accentColorData.value || "#1e90ff")
        if (backgroundColorData) setBackgroundColor(backgroundColorData.value || "#0a0a0a")
        if (textColorData) setTextColor(textColorData.value || "#ffffff")

        // Fetch hero sliders
        const { data: heroSlidersData, error: heroSlidersError } = await supabase
          .from("hero_sliders")
          .select("*")
          .order("order", { ascending: true })

        if (heroSlidersError) {
          console.error("Error fetching hero sliders:", heroSlidersError)
        } else {
          setHeroSliders(heroSlidersData || [])
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        setError("Failed to load settings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [supabase, clientInitialized])

  // Helper function to save a single setting
  const saveSetting = async (key: string, value: any): Promise<boolean> => {
    try {
      // Convert value to string if it's not already
      const stringValue = typeof value === "string" ? value : JSON.stringify(value)

      const { error } = await supabase.from("site_settings").upsert({ key, value: stringValue })

      if (error) {
        console.error(`Error saving setting ${key}:`, error)
        return false
      }
      return true
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error)
      return false
    }
  }

  // Save settings
  const handleSaveSettings = async () => {
    if (!supabase) {
      setError("Database connection not available")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Save all settings and track failures
      const results = await Promise.all([
        saveSetting("site_name", siteName),
        saveSetting("site_description", siteDescription),
        saveSetting("show_promo_banner", showPromoBanner),
        saveSetting("promo_text", promoText),
        saveSetting("promo_tag", promoTag),
        saveSetting("openai_api_key", openaiApiKey),
        saveSetting("primary_color", primaryColor),
        saveSetting("secondary_color", secondaryColor),
        saveSetting("accent_color", accentColor),
        saveSetting("background_color", backgroundColor),
        saveSetting("text_color", textColor),
        saveSetting("preview_mode", previewMode),
        saveSetting("preview_duration", previewDuration),
      ])

      // Check if any settings failed to save
      const failedCount = results.filter((result) => !result).length

      if (failedCount > 0) {
        setError(`Failed to save ${failedCount} setting(s). Please try again.`)
        toast({
          title: "Settings Error",
          description: `Failed to save ${failedCount} setting(s).`,
          variant: "destructive",
        })
      } else {
        setSuccess(true)
        toast({
          title: "Settings Saved",
          description: "All settings were saved successfully.",
          variant: "default",
        })

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error in handleSaveSettings:", error)
      setError("An unexpected error occurred while saving settings.")
      toast({
        title: "Settings Error",
        description: "An unexpected error occurred while saving settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle file input change for slider image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewSliderImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewSliderImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add new slider
  const handleAddSlider = async () => {
    if (!newSliderName) {
      toast({
        title: "Validation Error",
        description: "Slider name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Generate slug from name
      const slug = newSliderName
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")

      // Upload image if provided
      let imageUrl = null
      if (newSliderImage) {
        imageUrl = await uploadImage(newSliderImage)
        if (!imageUrl) return
      }

      // Get the highest order value
      const { data: maxOrderData } = await supabase
        .from("hero_sliders")
        .select("order")
        .order("order", { ascending: false })
        .limit(1)
        .single()

      const nextOrder = maxOrderData ? maxOrderData.order + 1 : 1

      // Insert new slider
      const { error } = await supabase.from("hero_sliders").insert({
        name: newSliderName,
        slug,
        description: newSliderDescription || null,
        banner_image: imageUrl,
        active: true,
        order: nextOrder,
      })

      if (error) throw error

      // Refresh sliders
      const { data: updatedSliders } = await supabase
        .from("hero_sliders")
        .select("*")
        .order("order", { ascending: true })

      setHeroSliders(updatedSliders || [])

      // Reset form
      setNewSliderName("")
      setNewSliderDescription("")
      setNewSliderImage(null)
      setNewSliderImagePreview(null)
      setIsAddSliderOpen(false)

      toast({
        title: "Success",
        description: "Hero slider added successfully.",
      })
    } catch (error) {
      console.error("Error adding slider:", error)
      toast({
        title: "Error",
        description: "Failed to add hero slider. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete slider
  const handleDeleteSlider = async (id: string) => {
    try {
      const { error } = await supabase.from("hero_sliders").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setHeroSliders(heroSliders.filter((slider) => slider.id !== id))

      toast({
        title: "Success",
        description: "Hero slider deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting slider:", error)
      toast({
        title: "Error",
        description: "Failed to delete hero slider. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle slider active state
  const toggleSliderActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase.from("hero_sliders").update({ active: !currentActive }).eq("id", id)

      if (error) throw error

      // Update local state
      setHeroSliders(heroSliders.map((slider) => (slider.id === id ? { ...slider, active: !currentActive } : slider)))
    } catch (error) {
      console.error("Error toggling slider active state:", error)
      toast({
        title: "Error",
        description: "Failed to update slider. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle drag and drop reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(heroSliders)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update local state immediately for responsive UI
    setHeroSliders(items)

    // Update order in database
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }))

      for (const update of updates) {
        await supabase.from("hero_sliders").update({ order: update.order }).eq("id", update.id)
      }
    } catch (error) {
      console.error("Error updating slider order:", error)
      toast({
        title: "Error",
        description: "Failed to update slider order. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle preview mode
  const handleTogglePreviewMode = async (checked: boolean) => {
    setPreviewMode(checked)

    // If enabling preview mode, set a cookie to enable it for the specified duration
    if (checked) {
      // This would typically be handled by a server action or API route
      // For now, we'll just update the database setting
      await saveSetting("preview_mode", true)

      toast({
        title: "Preview Mode Enabled",
        description: `Preview mode will be active for ${previewDuration} minutes.`,
      })
    } else {
      await saveSetting("preview_mode", false)

      toast({
        title: "Preview Mode Disabled",
        description: "Preview mode has been turned off.",
      })
    }
  }

  // Color picker component
  const ColorPicker = ({
    color,
    onChange,
    label,
  }: { color: string; onChange: (color: string) => void; label: string }) => (
    <div className="flex items-center space-x-4">
      <Label className="w-32">{label}</Label>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-10 h-10 p-0 border-2" style={{ backgroundColor: color }}>
              <span className="sr-only">Pick a color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid gap-2">
              <div className="grid grid-cols-6 gap-2">
                {["#1e90ff", "#ff4500", "#32cd32", "#9932cc", "#ff8c00", "#ff1493", "#00ced1", "#8b0000"].map(
                  (presetColor) => (
                    <Button
                      key={presetColor}
                      variant="outline"
                      className="w-8 h-8 p-0 border-2"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => onChange(presetColor)}
                    >
                      <span className="sr-only">{presetColor}</span>
                    </Button>
                  ),
                )}
              </div>
              <Input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="w-full h-10" />
              <Input type="text" value={color} onChange={(e) => onChange(e.target.value)} className="w-full" />
            </div>
          </PopoverContent>
        </Popover>
        <Input type="text" value={color} onChange={(e) => onChange(e.target.value)} className="w-24" />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="hero-slider">Hero Slider</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preview">Preview Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage general site settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Site Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="EsportsHub"
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Competitive Gaming Platform"
                    className="max-w-xs"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Promo Banner</h3>

                <div className="flex items-center space-x-2">
                  <Switch id="show-promo" checked={showPromoBanner} onCheckedChange={setShowPromoBanner} />
                  <Label htmlFor="show-promo">Show promo banner</Label>
                </div>

                {showPromoBanner && (
                  <div className="space-y-4 pl-6 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="promo-tag">Promo Tag</Label>
                      <Input
                        id="promo-tag"
                        value={promoTag}
                        onChange={(e) => setPromoTag(e.target.value)}
                        placeholder="SUPER PROMO"
                        className="max-w-xs"
                      />
                      <p className="text-sm text-muted-foreground">
                        This is the highlighted tag at the beginning of the promo banner
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promo-text">Promo Text</Label>
                      <Input
                        id="promo-text"
                        value={promoText}
                        onChange={(e) => setPromoText(e.target.value)}
                        placeholder="ESPORTSHUB WEEKLY CHALLENGERS"
                        className="max-w-xs"
                      />
                      <p className="text-sm text-muted-foreground">
                        This is the main text displayed in the promo banner
                      </p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#222] p-2 rounded-md mt-4">
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-xs font-bold px-2 py-0.5 rounded mr-2">
                          {promoTag || "SUPER PROMO"}
                        </div>
                        <div className="text-blue-400 font-bold tracking-wider">
                          {promoText || "ESPORTSHUB WEEKLY CHALLENGERS"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your OpenAI API key to enable AI-powered features.
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Color Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the colors used throughout the site. Changes will be applied after saving.
                  </p>

                  <div className="space-y-4 pt-2">
                    <ColorPicker color={primaryColor} onChange={setPrimaryColor} label="Primary Color" />
                    <ColorPicker color={secondaryColor} onChange={setSecondaryColor} label="Secondary Color" />
                    <ColorPicker color={accentColor} onChange={setAccentColor} label="Accent Color" />
                    <ColorPicker color={backgroundColor} onChange={setBackgroundColor} label="Background Color" />
                    <ColorPicker color={textColor} onChange={setTextColor} label="Text Color" />
                  </div>

                  <div className="mt-6 p-4 rounded-md" style={{ backgroundColor }}>
                    <h4 className="text-lg font-medium mb-4" style={{ color: textColor }}>
                      Preview
                    </h4>
                    <div className="flex space-x-4">
                      <div className="p-4 rounded-md" style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                        Primary
                      </div>
                      <div className="p-4 rounded-md" style={{ backgroundColor: secondaryColor, color: "#ffffff" }}>
                        Secondary
                      </div>
                      <div className="p-4 rounded-md" style={{ backgroundColor: accentColor, color: "#ffffff" }}>
                        Accent
                      </div>
                    </div>
                    <p className="mt-4" style={{ color: textColor }}>
                      This is a preview of how your text will look with the selected colors.
                    </p>
                  </div>
                </div>

                <Separator />

                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Appearance Settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero-slider">
          <Card>
            <CardHeader>
              <CardTitle>Hero Slider Settings</CardTitle>
              <CardDescription>Manage the hero slider on the homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Hero Slides</h3>
                  <Button onClick={() => setIsAddSliderOpen(true)} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Slide
                  </Button>
                </div>

                {heroSliders.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No slides added yet. Add your first slide to get started.</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="hero-sliders">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {heroSliders.map((slider, index) => (
                            <Draggable key={slider.id} draggableId={slider.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="border rounded-md p-4 bg-card"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="relative h-16 w-28 rounded overflow-hidden bg-muted">
                                        {slider.banner_image ? (
                                          <Image
                                            src={slider.banner_image || "/placeholder.svg"}
                                            alt={slider.name}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No image
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="font-medium">{slider.name}</h4>
                                        <p className="text-sm text-muted-foreground truncate max-w-md">
                                          {slider.description || "No description"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-2 mr-4">
                                        <Switch
                                          checked={slider.active}
                                          onCheckedChange={() => toggleSliderActive(slider.id, slider.active)}
                                        />
                                        <span className="text-sm">{slider.active ? "Active" : "Inactive"}</span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setCurrentSlider(slider)
                                          setIsEditSliderOpen(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="h-4 w-4"
                                        >
                                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                          <path d="m15 5 4 4"></path>
                                        </svg>
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteSlider(slider.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop slides to reorder them. Toggle the switch to activate or deactivate slides.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure site-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Mode</CardTitle>
              <CardDescription>
                Enable preview mode to test changes before making them live to all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="preview-mode" checked={previewMode} onCheckedChange={handleTogglePreviewMode} />
                  <Label htmlFor="preview-mode">Enable Preview Mode</Label>
                </div>

                <p className="text-sm text-muted-foreground pl-6">
                  When preview mode is enabled, only administrators can see changes before they go live.
                </p>

                {previewMode && (
                  <div className="space-y-4 pl-6 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="preview-duration">Preview Duration (minutes)</Label>
                      <Input
                        id="preview-duration"
                        type="number"
                        min="5"
                        max="1440"
                        value={previewDuration}
                        onChange={(e) => setPreviewDuration(Number.parseInt(e.target.value) || 30)}
                        className="max-w-xs"
                      />
                      <p className="text-sm text-muted-foreground">
                        Preview mode will automatically disable after this duration
                      </p>
                    </div>

                    <div className="flex items-center mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <Eye className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="text-blue-700 font-medium">Preview Mode Active</p>
                        <p className="text-sm text-blue-600">
                          You are currently viewing the site in preview mode. Changes will only be visible to
                          administrators.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preview Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Slider Dialog */}
      <Dialog open={isAddSliderOpen} onOpenChange={setIsAddSliderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Slide</DialogTitle>
            <DialogDescription>Create a new slide for the homepage hero slider.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slider-name">Slide Name</Label>
              <Input
                id="slider-name"
                value={newSliderName}
                onChange={(e) => setNewSliderName(e.target.value)}
                placeholder="Enter slide name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slider-description">Description</Label>
              <Textarea
                id="slider-description"
                value={newSliderDescription}
                onChange={(e) => setNewSliderDescription(e.target.value)}
                placeholder="Enter slide description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slider-image">Banner Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("slider-image")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <Input id="slider-image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {newSliderImagePreview && (
                  <div className="relative h-16 w-28">
                    <Image
                      src={newSliderImagePreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setNewSliderImage(null)
                        setNewSliderImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSliderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSlider} disabled={saving || uploadingImage}>
              {saving || uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadingImage ? "Uploading..." : "Adding..."}
                </>
              ) : (
                "Add Slide"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Slider Dialog - Similar to Add but with pre-filled values */}
      <Dialog open={isEditSliderOpen} onOpenChange={setIsEditSliderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Slide</DialogTitle>
            <DialogDescription>Update the slide information.</DialogDescription>
          </DialogHeader>
          {/* Edit form would go here, similar to the add form but with pre-filled values */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSliderOpen(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
