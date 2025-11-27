import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import User from "@/models/user"
import { signToken } from "@/lib/auth"
import type { IUser } from "@/models/user"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, role, profile } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }
    // For students, require extended profile fields
    const isStudent = !role || role === "student"
    const p = profile || {}
    const requiredStudentFields = [
      "collegeName",
      "universityRollNumber",
      "section",
      "classRollNumber",
      "branch",
      "course",
    ]
    if (isStudent) {
      for (const key of requiredStudentFields) {
        if (!p[key]) {
          return NextResponse.json({ message: `Missing required field: ${key}` }, { status: 400 })
        }
      }
      // Regex validations aligned with model
      const uniOk = /^[A-Za-z0-9\-_/]{4,20}$/.test(String(p.universityRollNumber))
      const classOk = /^\d{1,4}$/.test(String(p.classRollNumber))
      if (!uniOk) return NextResponse.json({ message: "Invalid universityRollNumber format" }, { status: 400 })
      if (!classOk) return NextResponse.json({ message: "Invalid classRollNumber format" }, { status: 400 })
    }

    await connectDB()

    // Check if user exists
    const existing = await User.findOne({ email }).lean()
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const created = (await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: role || "student",
      profile: isStudent
        ? {
            academicBackground: p.academicBackground || "",
            targetExams: p.targetExams || "",
            strengths: p.strengths || "",
            weaknesses: p.weaknesses || "",
            collegeName: p.collegeName,
            universityRollNumber: p.universityRollNumber,
            section: p.section,
            classRollNumber: p.classRollNumber,
            branch: p.branch,
            course: p.course,
            leetcodeId: p.leetcodeId,
            githubId: p.githubId,
            privacy: { showEmail: false, showSocialIds: false },
          }
        : {},
    })) as IUser

    const token = await signToken({ id: String(created._id), email: created.email, role: created.role })
    const res = NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: String(created._id),
          firstName: created.firstName,
          lastName: created.lastName,
          email: created.email,
          role: created.role,
        },
        token,
      },
      { status: 201 },
    )
    res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" })
    return res
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
