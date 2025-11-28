"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Map,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentSidebarProps {
  open: boolean
  onToggle: () => void
  unreadNotifications?: number
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: BookOpen, label: "Available Exams", href: "/student/exams" },
  { icon: FileText, label: "My Reports", href: "/student/reports" },
  { icon: Zap, label: "AI Practice", href: "/student/practice" },
  { icon: Map, label: "Learning Paths", href: "/student/learning-path" },
  { icon: TrendingUp, label: "Analytics", href: "/student/analytics" },
  { icon: TrendingUp, label: "Leaderboard", href: "/student/leaderboard" },
  { icon: User, label: "Profile", href: "/student/profile" },
]

export function StudentSidebar({ open, onToggle, unreadNotifications = 0 }: StudentSidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <aside
      className={`${
        open ? "w-72" : "w-24"
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col border-r border-blue-700`}
    >
      <div className="p-4 flex items-center justify-between">
        {open && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <span className="text-sm font-bold text-white">EL</span>
            </div>
            <span className="font-semibold text-lg tracking-wide">e-learnify</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link href="/student/notifications">
            <button className="relative p-2 hover:bg-blue-700 rounded-lg transition-colors">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>
          </Link>
          <button onClick={onToggle} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-blue-900 font-bold">
              {(user?.firstName?.[0] || "S").toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">{user?.firstName || "Student"}</span>
              <span className="text-[11px] text-blue-100 leading-tight">Practice & Exam Dashboard</span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-4 ${
                  isActive
                    ? "bg-white/10 text-white border-l-emerald-400 shadow-sm"
                    : "text-blue-100 border-l-transparent hover:bg-white/5"
                }`}
              >
                <Icon size={20} />
                {open && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 text-blue-100 border-blue-600 hover:bg-blue-700 bg-transparent"
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              window.location.href = "/auth/login"
            })
          }}
        >
          <LogOut size={18} />
          {open && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
