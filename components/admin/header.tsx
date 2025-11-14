"use client"

import React from "react"

import { Menu, Bell } from "lucide-react"
import { useState } from "react"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [user, setUser] = useState<any>(null)

  React.useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden">
        <Menu size={24} />
      </button>

      <h1 className="text-2xl font-bold text-foreground hidden md:block">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
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
