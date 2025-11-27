"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    universityRollNumber: "",
    section: "",
    classRollNumber: "",
    branch: "",
    course: "",
    leetcodeId: "",
    githubId: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("All fields are required")
      return
    }

    // Extended profile mandatory fields
    const required = [
      'collegeName','universityRollNumber','section','classRollNumber','branch','course'
    ] as const
    for (const key of required) {
      if (!(formData as any)[key]) {
        setError(`Field ${key} is required`)
        return
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    // Format validations
    const uniOk = /^[A-Za-z0-9\-_/]{4,20}$/.test(formData.universityRollNumber)
    const classOk = /^\d{1,4}$/.test(formData.classRollNumber)
    if (!uniOk) {
      setError("Invalid university roll number format")
      return
    }
    if (!classOk) {
      setError("Invalid class roll number format")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: "student",
          profile: {
            collegeName: formData.collegeName,
            universityRollNumber: formData.universityRollNumber,
            section: formData.section,
            classRollNumber: formData.classRollNumber,
            branch: formData.branch,
            course: formData.course,
            leetcodeId: formData.leetcodeId,
            githubId: formData.githubId,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Signup failed")
        return
      }

      setSuccess("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden px-4 sm:px-8 lg:px-12">
      <div className="mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 mb-4">
          <span className="text-lg font-bold text-white">EL</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-2">Join EduLearn and start your learning journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Row 1 */}
          <div className="space-y-2 min-w-0">
            <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
            <Input id="firstName" name="firstName" type="text" placeholder="Enter your first name" value={formData.firstName} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
            <Input id="lastName" name="lastName" type="text" placeholder="Enter your last name" value={formData.lastName} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>

          {/* Row 2 */}
          <div className="space-y-2 min-w-0">
            <Label htmlFor="collegeName" className="text-sm font-medium">College Name</Label>
            <Input id="collegeName" name="collegeName" type="text" placeholder="Enter your college name" value={formData.collegeName} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="universityRollNumber" className="text-sm font-medium">University Roll Number</Label>
            <Input id="universityRollNumber" name="universityRollNumber" type="text" placeholder="Enter your university roll number" value={formData.universityRollNumber} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="section" className="text-sm font-medium">Section</Label>
            <Input id="section" name="section" type="text" placeholder="Enter your section" value={formData.section} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>

          {/* Row 3 */}
          <div className="space-y-2 min-w-0">
            <Label htmlFor="classRollNumber" className="text-sm font-medium">Class Roll Number</Label>
            <Input id="classRollNumber" name="classRollNumber" type="text" placeholder="Enter your class roll number" value={formData.classRollNumber} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
            <Input id="branch" name="branch" type="text" placeholder="Enter your branch" value={formData.branch} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="course" className="text-sm font-medium">Course</Label>
            <Input id="course" name="course" type="text" placeholder="Enter your course" value={formData.course} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>

          {/* Row 4 */}
          <div className="space-y-2 min-w-0">
            <Label htmlFor="leetcodeId" className="text-sm font-medium">LeetCode ID (Optional)</Label>
            <Input id="leetcodeId" name="leetcodeId" type="text" placeholder="Enter your LeetCode ID" value={formData.leetcodeId} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="githubId" className="text-sm font-medium">GitHub ID (Optional)</Label>
            <Input id="githubId" name="githubId" type="text" placeholder="Enter your GitHub ID" value={formData.githubId} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
          </div>
          <div className="space-y-2 min-w-0 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} disabled={loading} className="w-full max-w-full border-blue-200 focus:border-blue-500" />
              </div>
            </div>
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
            <p className="text-sm text-green-600">{success}</p>
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
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Login here
        </Link>
      </p>
    </div>
  )
}
