 import { type NextRequest, NextResponse } from "next/server"
 import { connectDB } from "@/lib/db"
 import { verifyToken } from "@/lib/auth"
 import Report from "@/models/report"

 export async function GET(request: NextRequest) {
   try {
     await connectDB()
     const token = request.cookies.get("token")?.value
     const payload = token ? await verifyToken(token) : null
     const queryStudentId = request.nextUrl.searchParams.get("studentId")

     const studentId = queryStudentId || (payload?.id ? String(payload.id) : null)
     if (!studentId) {
       return NextResponse.json({ message: "Student ID required" }, { status: 400 })
     }

     const reports = await Report.find({ studentId }).sort({ createdAt: -1 }).lean()
     return NextResponse.json({ reports: reports.map(r => ({
       id: String(r._id),
       studentId: r.studentId,
       assignmentId: r.assignmentId,
       score: r.score,
       totalQuestions: r.totalQuestions,
       correctAnswers: r.correctAnswers,
       category: r.category || null,
       createdAt: r.createdAt,
     })) }, { status: 200 })
   } catch (error) {
     console.error("[reports] Error fetching reports:", error)
     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
   }
 }
