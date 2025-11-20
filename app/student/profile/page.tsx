"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function StudentProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    academicBackground: "",
    targetExams: "",
    strengths: "",
    weaknesses: "",
    collegeName: "",
    universityRollNumber: "",
    section: "",
    classRollNumber: "",
    branch: "",
    course: "",
    leetcodeId: "",
    githubId: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [privacyShowEmail, setPrivacyShowEmail] = useState(false)
  const [privacyShowSocial, setPrivacyShowSocial] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          academicBackground: data.profile?.academicBackground || "",
          targetExams: data.profile?.targetExams || "",
          strengths: data.profile?.strengths || "",
          weaknesses: data.profile?.weaknesses || "",
          collegeName: data.profile?.collegeName || "",
          universityRollNumber: data.profile?.universityRollNumber || "",
          section: data.profile?.section || "",
          classRollNumber: data.profile?.classRollNumber || "",
          branch: data.profile?.branch || "",
          course: data.profile?.course || "",
          leetcodeId: data.profile?.leetcodeId || "",
          githubId: data.profile?.githubId || "",
        })
        setPrivacyShowEmail(!!data.profile?.privacy?.showEmail)
        setPrivacyShowSocial(!!data.profile?.privacy?.showSocialIds)
      } catch (e) {
        // ignore
      }
    }
    load()
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
      // Client-side validation
      if (formData.universityRollNumber && !/^[A-Za-z0-9\-_/]{4,20}$/.test(formData.universityRollNumber)) {
        throw new Error("Invalid university roll number format")
      }
      if (formData.classRollNumber && !/^\d{1,4}$/.test(formData.classRollNumber)) {
        throw new Error("Invalid class roll number format")
      }
      const isUrl = (s: string) => /^https?:\/\//i.test(s)
      if (formData.githubId && !(isUrl(formData.githubId) || /^[A-Za-z0-9-]{1,39}$/.test(formData.githubId))) {
        throw new Error("Invalid GitHub handle or URL")
      }
      if (formData.leetcodeId && !(isUrl(formData.leetcodeId) || /^[A-Za-z0-9_-]{1,30}$/.test(formData.leetcodeId))) {
        throw new Error("Invalid LeetCode handle or URL")
      }
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          academicBackground: formData.academicBackground,
          targetExams: formData.targetExams,
          strengths: formData.strengths,
          weaknesses: formData.weaknesses,
          collegeName: formData.collegeName,
          universityRollNumber: formData.universityRollNumber,
          section: formData.section,
          classRollNumber: formData.classRollNumber,
          branch: formData.branch,
          course: formData.course,
          leetcodeId: formData.leetcodeId,
          githubId: formData.githubId,
          privacy: {
            showEmail: privacyShowEmail,
            showSocialIds: privacyShowSocial,
          },
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setSuccess(true)
      toast({ title: "Profile updated", description: "Your changes have been saved." })
      // Refetch profile to confirm persistence and refresh UI
      try {
        const r = await fetch("/api/profile", { cache: "no-store" })
        if (r.ok) {
          const d = await r.json()
          setFormData({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || "",
            academicBackground: d.profile?.academicBackground || "",
            targetExams: d.profile?.targetExams || "",
            strengths: d.profile?.strengths || "",
            weaknesses: d.profile?.weaknesses || "",
            collegeName: d.profile?.collegeName || "",
            universityRollNumber: d.profile?.universityRollNumber || "",
            section: d.profile?.section || "",
            classRollNumber: d.profile?.classRollNumber || "",
            branch: d.profile?.branch || "",
            course: d.profile?.course || "",
            leetcodeId: d.profile?.leetcodeId || "",
            githubId: d.profile?.githubId || "",
          })
          setPrivacyShowEmail(!!d.profile?.privacy?.showEmail)
          setPrivacyShowSocial(!!d.profile?.privacy?.showSocialIds)
        }
      } catch {}
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError("Failed to update profile")
      toast({ title: "Update failed", description: err?.message || "Failed to update profile", variant: 'destructive' as any })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Complete your profile to get personalized exam recommendations.</p>
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
                placeholder="Enter your first name"
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
                placeholder="Enter your last name"
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
            <Input id="email" name="email" type="email" placeholder="Your registered email" value={formData.email} disabled className="border-blue-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicBackground" className="text-sm font-medium">
              Academic Background
            </Label>
            <Input
              id="academicBackground"
              name="academicBackground"
              placeholder="e.g., B.Tech Computer Science"
              value={formData.academicBackground}
              onChange={handleChange}
              className="border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetExams" className="text-sm font-medium">
              Target Exams
            </Label>
            <Input
              id="targetExams"
              name="targetExams"
              placeholder="e.g., Aptitude, Programming"
              value={formData.targetExams}
              onChange={handleChange}
              className="border-blue-200"
            />
          </div>

          {/* Academic Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="collegeName" className="text-sm font-medium">
                College Name
              </Label>
              <Input
                id="collegeName"
                name="collegeName"
                placeholder="e.g., ABC Institute of Technology"
                value={formData.collegeName}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="universityRollNumber" className="text-sm font-medium">
                University Roll Number
              </Label>
              <Input
                id="universityRollNumber"
                name="universityRollNumber"
                placeholder="e.g., 21UCS1234"
                value={formData.universityRollNumber}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section" className="text-sm font-medium">
                Section
              </Label>
              <Input
                id="section"
                name="section"
                placeholder="e.g., A"
                value={formData.section}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classRollNumber" className="text-sm font-medium">
                Class Roll Number
              </Label>
              <Input
                id="classRollNumber"
                name="classRollNumber"
                placeholder="e.g., 32"
                value={formData.classRollNumber}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-sm font-medium">
                Branch
              </Label>
              <Input
                id="branch"
                name="branch"
                placeholder="e.g., CSE"
                value={formData.branch}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium">
                Course
              </Label>
              <Input
                id="course"
                name="course"
                placeholder="e.g., B.Tech"
                value={formData.course}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
          </div>

          {/* Coding Profiles */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leetcodeId" className="text-sm font-medium">
                LeetCode ID
              </Label>
              <Input
                id="leetcodeId"
                name="leetcodeId"
                placeholder="Enter your LeetCode ID"
                value={formData.leetcodeId}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubId" className="text-sm font-medium">
                GitHub ID
              </Label>
              <Input
                id="githubId"
                name="githubId"
                placeholder="Enter your GitHub ID"
                value={formData.githubId}
                onChange={handleChange}
                className="border-blue-200"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="privacyShowEmail" className="text-sm font-medium">Show Email to Admins</Label>
              <div className="flex items-center gap-2">
                <input id="privacyShowEmail" type="checkbox" checked={privacyShowEmail} onChange={(e)=>setPrivacyShowEmail(e.target.checked)} />
                <span className="text-sm text-muted-foreground">Allow admin to view my email</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacyShowSocial" className="text-sm font-medium">Show Social IDs to Admins</Label>
              <div className="flex items-center gap-2">
                <input id="privacyShowSocial" type="checkbox" checked={privacyShowSocial} onChange={(e)=>setPrivacyShowSocial(e.target.checked)} />
                <span className="text-sm text-muted-foreground">Allow admin to view my LeetCode/GitHub</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="strengths" className="text-sm font-medium">
                Your Strengths (optional)
              </Label>
              <textarea
                id="strengths"
                name="strengths"
                placeholder="What are you good at?"
                value={formData.strengths}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weaknesses" className="text-sm font-medium">
                Areas to Improve (optional)
              </Label>
              <textarea
                id="weaknesses"
                name="weaknesses"
                placeholder="What do you want to improve?"
                value={formData.weaknesses}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>
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
