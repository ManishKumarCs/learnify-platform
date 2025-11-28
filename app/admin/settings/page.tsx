"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    platformName: "e-learnify",
    adminEmail: "admin@e-learnify.com",
    maxExamDuration: "120",
    passingScore: "70",
    enableNotifications: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform settings and preferences.</p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="platformName" className="text-sm font-medium">
              Platform Name
            </Label>
            <Input
              id="platformName"
              name="platformName"
              value={settings.platformName}
              onChange={handleChange}
              className="border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-sm font-medium">
              Admin Email
            </Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={handleChange}
              className="border-blue-200"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxExamDuration" className="text-sm font-medium">
                Max Exam Duration (minutes)
              </Label>
              <Input
                id="maxExamDuration"
                name="maxExamDuration"
                type="number"
                value={settings.maxExamDuration}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore" className="text-sm font-medium">
                Passing Score (%)
              </Label>
              <Input
                id="passingScore"
                name="passingScore"
                type="number"
                value={settings.passingScore}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <input
              id="enableNotifications"
              name="enableNotifications"
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={handleChange}
              className="w-4 h-4 rounded border-blue-200 cursor-pointer"
            />
            <Label htmlFor="enableNotifications" className="text-sm font-medium cursor-pointer">
              Enable Email Notifications
            </Label>
          </div>

          {saved && (
            <div className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">Settings saved successfully!</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium"
          >
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
