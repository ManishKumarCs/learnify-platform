import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const isApi = pathname.startsWith("/api/")

  const needsAuth = pathname.startsWith("/admin") || pathname.startsWith("/student") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/student") || pathname.startsWith("/api/practice")

  if (pathname.startsWith("/auth")) {
    if (!token) return NextResponse.next()
    const payload = await verifyToken(token)
    if (!payload || !payload.role) return NextResponse.next()
    const dest = payload.role === "admin" ? "/admin/dashboard" : "/student/dashboard"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if (!needsAuth) return NextResponse.next()

  if (!token) {
    if (isApi) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const payload = await verifyToken(token)
  if (!payload || !payload.role) {
    if (isApi) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (payload.role !== "admin") {
      if (isApi) return NextResponse.json({ message: "Forbidden" }, { status: 403 })
      const dest = payload.role === "student" ? "/student/dashboard" : "/auth/login"
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  if (pathname.startsWith("/student") || pathname.startsWith("/api/student") || pathname.startsWith("/api/practice")) {
    if (payload.role !== "student") {
      if (isApi) return NextResponse.json({ message: "Forbidden" }, { status: 403 })
      const dest = payload.role === "admin" ? "/admin/dashboard" : "/auth/login"
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/api/admin/:path*", "/api/student/:path*", "/api/practice/:path*", "/auth/:path*"],
}
