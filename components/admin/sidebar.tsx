"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, FileText, Settings, User, LogOut, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  open: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
  { icon: BarChart3, label: "Leaderboard", href: "/admin/leaderboard" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: FileText, label: "Exams", href: "/admin/exams" },
  { icon: Clock, label: "Exam Status", href: "/admin/exams/status" },
  { icon: FileText, label: "Questions", href: "/admin/questions" },
  { icon: User, label: "Profile", href: "/admin/profile" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col border-r border-blue-700`}
    >
      <div className="p-4 flex items-center justify-between">
        {open && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-300">
              <span className="text-sm font-bold text-blue-900">EL</span>
            </div>
            <span className="font-bold text-lg">EduLearn</span>
          </div>
        )}
        <button onClick={onToggle} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-blue-100 hover:bg-blue-700"
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
