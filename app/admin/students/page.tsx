"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type StudentRow = {
  id: string
  name: string
  email: string
  joined: string
  examsCompleted: number
  avgScore: number
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rows, setRows] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [branch, setBranch] = useState("")
  const [course, setCourse] = useState("")
  const [section, setSection] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(50)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.set("q", searchTerm)
        if (branch) params.set("branch", branch)
        if (course) params.set("course", course)
        if (section) params.set("section", section)
        if (page) params.set("page", String(page))
        params.set("limit", String(limit))
        const url = `/api/admin/students${params.toString() ? `?${params.toString()}` : ""}`
        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load students")
        const list = (data.students || []) as StudentRow[]
        setRows(list)
        setTotal(Number(data.total || 0))
        setLimit(Number(data.limit || 50))
      } catch (e: any) {
        setError(e?.message || "Failed to load students")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchTerm, branch, course, section, page])

  const filtered = useMemo(() => rows, [rows])

  const handleViewStudent = (studentId: string) => {
    router.push(`/admin/students/${studentId}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor all registered students.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative flex-1 md:max-w-sm">
            <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200"
            />
          </div>
          <div className="flex gap-3">
            <Select value={branch} onValueChange={(v) => { setPage(1); setBranch(v) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="ECE">ECE</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
              </SelectContent>
            </Select>
            <Select value={course} onValueChange={(v) => { setPage(1); setCourse(v) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Courses</SelectItem>
                <SelectItem value="B.Tech">B.Tech</SelectItem>
                <SelectItem value="M.Tech">M.Tech</SelectItem>
                <SelectItem value="B.Sc">B.Sc</SelectItem>
                <SelectItem value="MCA">MCA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={section} onValueChange={(v) => { setPage(1); setSection(v) }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600" disabled>
            Add Student
          </Button>
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground mb-2">Loading...</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Exams</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Avg Score</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">{student.email}</td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">{new Date(student.joined).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-foreground font-medium">{student.examsCompleted}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      {student.avgScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewStudent(student.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Eye size={18} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors" disabled>
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} · Showing {rows.length} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page<=1} onClick={() => setPage((p)=>Math.max(1,p-1))}>Prev</Button>
            <Button variant="outline" disabled={page*limit>=total} onClick={() => setPage((p)=>p+1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
