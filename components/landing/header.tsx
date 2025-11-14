"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
            <span className="text-sm font-bold text-white">EL</span>
          </div>
          <span className="text-xl font-bold text-foreground">EduLearn</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
