"use client"

import type React from "react"
import { StudentSidebar } from "@/components/student/sidebar"
import { StudentHeader } from "@/components/student/header"
import { useState } from "react"
import { usePathname } from "next/navigation"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const isExamFullscreen = pathname?.startsWith("/student/exam/") || pathname?.startsWith("/student/practice/section/")

  return (
    <div className="flex h-screen bg-background">
      {!isExamFullscreen && (
        <StudentSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isExamFullscreen && <StudentHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
