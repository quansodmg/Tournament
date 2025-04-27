"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AppearanceSettingsFormProps {
  profile: any
  onSaveSuccess: (message: string) => void
  onSaveError: (message: string) => void
}

export default function AppearanceSettingsForm({ profile, onSaveSuccess, onSaveError }: AppearanceSettingsFormProps) {
  const [theme, setTheme] = useState(profile?.theme_preference || "system")
  const [accentColor, setAccentColor] = useState(profile?.accent_color || "blue")
  const [fontSize, setFontSize] = useState(profile?.font_size || "medium")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!profile) throw new Error("Profile not found")

      const { error } = await supabase
        .from("profiles")
        .update({
          theme_preference: theme,
          accent_color: accentColor,
          font_size: fontSize,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      onSaveSuccess("Appearance settings updated successfully!")
    } catch (err) {
      console.error("Error updating appearance settings:", err)
      onSaveError("Failed to update appearance settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl text-white">Appearance Settings</CardTitle>
        <CardDescription className="text-gray-400">Customize how EsportsHub looks for you</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-white font-medium">Theme</h3>
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <RadioGroupItem value="light" id="theme-light" className="text-[#0bb5ff]" />
                <Label htmlFor="theme-light" className="text-gray-300 cursor-pointer">
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <RadioGroupItem value="dark" id="theme-dark" className="text-[#0bb5ff]" />
                <Label htmlFor="theme-dark" className="text-gray-300 cursor-pointer">
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <RadioGroupItem value="system" id="theme-system" className="text-[#0bb5ff]" />
                <Label htmlFor="theme-system" className="text-gray-300 cursor-pointer">
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Accent Color</h3>
            <RadioGroup
              value={accentColor}
              onValueChange={setAccentColor}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#0bb5ff]"></div>
                  <RadioGroupItem value="blue" id="color-blue" className="text-[#0bb5ff]" />
                  <Label htmlFor="color-blue" className="text-gray-300 cursor-pointer">
                    Blue
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
                  <RadioGroupItem value="green" id="color-green" className="text-[#0bb5ff]" />
                  <Label htmlFor="color-green" className="text-gray-300 cursor-pointer">
                    Green
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
                  <RadioGroupItem value="orange" id="color-orange" className="text-[#0bb5ff]" />
                  <Label htmlFor="color-orange" className="text-gray-300 cursor-pointer">
                    Orange
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                  <RadioGroupItem value="red" id="color-red" className="text-[#0bb5ff]" />
                  <Label htmlFor="color-red" className="text-gray-300 cursor-pointer">
                    Red
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Font Size</h3>
            <RadioGroup value={fontSize} onValueChange={setFontSize} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <RadioGroupItem value="small" id="font-small" className="text-[#0bb5ff]" />
                <Label htmlFor="font-small" className="text-gray-300 cursor-pointer">
                  Small
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <RadioGroupItem value="medium" id="font-medium" className="text-[#0bb5ff]" />
                <Label htmlFor="font-medium" className="text-gray-300 cursor-pointer">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-[#222] rounded-lg p-4 hover:border-[#0bb5ff] transition-colors">
                <RadioGroupItem value="large" id="font-large" className="text-[#0bb5ff]" />
                <Label htmlFor="font-large" className="text-gray-300 cursor-pointer">
                  Large
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Appearance"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
