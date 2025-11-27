"use client"
import type React from "react"
import { usePathname } from "next/navigation"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSignup = pathname === "/auth/signup"

  return (
    <div className="min-h-screen w-full overflow-x-hidden px-4 sm:px-8 lg:px-16 py-10 bg-gradient-to-br from-blue-50 to-cyan-50">
      {isSignup ? (
        <div className="w-full">{children}</div>
      ) : (
        <div className="mx-auto w-full max-w-md flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}
