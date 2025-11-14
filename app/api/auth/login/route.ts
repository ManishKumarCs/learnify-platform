import { type NextRequest, NextResponse } from "next/server"
import { signToken } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import User from "@/models/user"
import bcrypt from "bcryptjs"
import type { IUser } from "@/models/user"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 })
    }

    await connectDB()
    const userDoc = (await User.findOne({ email })) as IUser | null

    if (!userDoc) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, userDoc.password)
    if (!valid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const token = await signToken({ id: userDoc._id.toString(), email: userDoc.email, role: userDoc.role })

    const res = NextResponse.json(
      {
        user: {
          id: userDoc._id.toString(),
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          email: userDoc.email,
          role: userDoc.role,
        },
        token,
      },
      { status: 200 },
    )
    res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" })
    return res
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
