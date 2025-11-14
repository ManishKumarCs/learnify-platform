import type React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
