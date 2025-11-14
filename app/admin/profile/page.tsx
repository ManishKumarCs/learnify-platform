"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function AdminProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@edulearn.com",
    phone: "+1 (555) 123-4567",
    department: "Education Technology",
    bio: "Platform administrator managing exams and student progress.",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load user data from localStorage
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setFormData((prev) => ({
        ...prev,
        firstName: userData.firstName || prev.firstName,
        lastName: userData.lastName || prev.lastName,
        email: userData.email || prev.email,
      }))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      user.firstName = formData.firstName
      user.lastName = formData.lastName
      localStorage.setItem("user", JSON.stringify(user))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your admin account settings and information.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input id="email" name="email" type="email" value={formData.email} disabled className="border-blue-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              className="border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Department
            </Label>
            <Input
              id="department"
              name="department"
              placeholder="e.g., Education Technology"
              value={formData.department}
              onChange={handleChange}
              className="border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
