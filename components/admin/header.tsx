"use client"

import React from "react"

import { Menu, Bell } from "lucide-react"
import { useState } from "react"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [now, setNow] = useState<string>("")

  React.useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    const updateTime = () => {
      const d = new Date()
      const formatted = d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      setNow(formatted)
    }
    updateTime()
    const id = setInterval(updateTime, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="bg-white/95 backdrop-blur border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden">
          <Menu size={22} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-semibold text-foreground leading-tight">Admin Dashboard</h1>
          <p className="text-[11px] md:text-xs text-muted-foreground leading-tight">Monitor platform usage, exams, and anomalies.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end text-[11px] text-muted-foreground leading-tight">
          <span className="font-medium text-foreground">{now}</span>
          <span>Admin Panel</span>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.firstName || "Admin"}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
            {user?.firstName?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  )
}
