"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Email is required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to send reset email")
        return
      }

      setSuccess("Password reset link sent to your email!")
      setSubmitted(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 border-blue-200 shadow-lg">
      <div className="mb-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 mb-4">
          <span className="text-lg font-bold text-white">EL</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground mt-2">Enter your email to receive a reset link</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="border-blue-200 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
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
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-600">Email sent successfully!</p>
              <p className="text-xs text-green-600 mt-1">Check your email for the password reset link.</p>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/auth/login"
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-6 justify-center"
      >
        <ArrowLeft size={16} />
        Back to Login
      </Link>
    </Card>
  )
}
