"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Mail, AlertCircle, Copy } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface ExamReport {
  id: number
  examName: string
  date: string
  score: number
  totalQuestions: number
  correctAnswers: number
  duration: string
  status: string
  categoryScores: { category: string; score: number }[]
}

interface StudentData {
  id: string
  name: string
  email: string
  phone: string
  joined: string
  academicBackground: string
  targetExams: string
  totalExams: number
  averageScore: number
  lastExamDate: string
  profile?: {
    collegeName?: string
    universityRollNumber?: string
    section?: string
    classRollNumber?: string
    branch?: string
    course?: string
    leetcodeId?: string
    githubId?: string
    strengths?: string
    weaknesses?: string
    privacy?: { showEmail?: boolean; showSocialIds?: boolean }
  }
}

export default function StudentDetailsPage() {
  const params = useParams()
  const studentId = params.id as string

  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [examReports, setExamReports] = useState<ExamReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ExamReport | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}`, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load student")

        // Set profile
        const s = data.student
        const sum = data.summary || {}
        const categories = (data.categoryScores || []) as { category: string; score: number }[]

        setStudentData({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone || "-",
          joined: new Date(s.joined).toLocaleDateString(),
          academicBackground: s.profile?.academicBackground || "",
          targetExams: s.profile?.targetExams || "",
          totalExams: Number(sum.totalExams || 0),
          averageScore: Number(sum.averageScore || 0),
          lastExamDate: sum.lastExamDate ? new Date(sum.lastExamDate).toLocaleDateString() : "",
          profile: {
            collegeName: s.profile?.collegeName || "",
            universityRollNumber: s.profile?.universityRollNumber || "",
            section: s.profile?.section || "",
            classRollNumber: s.profile?.classRollNumber || "",
            branch: s.profile?.branch || "",
            course: s.profile?.course || "",
            leetcodeId: s.profile?.leetcodeId || "",
            githubId: s.profile?.githubId || "",
            strengths: s.profile?.strengths || "",
            weaknesses: s.profile?.weaknesses || "",
            privacy: s.profile?.privacy || { showEmail: false, showSocialIds: false },
          },
        })

        // Map recent attempts to ExamReport-like objects
        const reports: ExamReport[] = (data.recent || []).map((r: any, idx: number) => ({
          id: idx + 1,
          examName: `${String(r.kind).toUpperCase()} - ${r.topic}`,
          date: new Date(r.date).toLocaleDateString(),
          score: r.total > 0 ? Math.round((Number(r.score || 0) / Number(r.total || 0)) * 100) : 0,
          totalQuestions: Number(r.total || 0),
          correctAnswers: Number(r.score || 0),
          duration: "-",
          status: "Completed",
          categoryScores: categories,
        }))

        setExamReports(reports)
        setSelectedReport(reports[0] || null)
      } catch (e) {
        // ignore, fallback will show not found
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  useEffect(() => {
    if (studentData) {
      setForm({
        phone: studentData.phone === '-' ? '' : studentData.phone,
        academicBackground: studentData.academicBackground || '',
        targetExams: studentData.targetExams || '',
        strengths: studentData.profile?.strengths || '',
        weaknesses: studentData.profile?.weaknesses || '',
        collegeName: studentData.profile?.collegeName || '',
        universityRollNumber: studentData.profile?.universityRollNumber || '',
        classRollNumber: studentData.profile?.classRollNumber || '',
        section: studentData.profile?.section || '',
        branch: studentData.profile?.branch || '',
        course: studentData.profile?.course || '',
        leetcodeId: studentData.profile?.leetcodeId || '',
        githubId: studentData.profile?.githubId || '',
        privacy: studentData.profile?.privacy || { showEmail: false, showSocialIds: false },
      })
    }
  }, [studentData])

  const handleSave = async () => {
    if (!studentId) return
    setSaving(true)
    try {
      // Client-side validation mirrors API
      if (form.universityRollNumber && !/^[A-Za-z0-9\-_/]{4,20}$/.test(form.universityRollNumber)) {
        throw new Error('Invalid university roll number format')
      }
      if (form.classRollNumber && !/^\d{1,4}$/.test(form.classRollNumber)) {
        throw new Error('Invalid class roll number format')
      }
      const isUrl = (s:string)=>/^https?:\/\//i.test(s)
      if (form.githubId && !(isUrl(form.githubId) || /^[A-Za-z0-9-]{1,39}$/.test(form.githubId))) {
        throw new Error('Invalid GitHub handle or URL')
      }
      if (form.leetcodeId && !(isUrl(form.leetcodeId) || /^[A-Za-z0-9_-]{1,30}$/.test(form.leetcodeId))) {
        throw new Error('Invalid LeetCode handle or URL')
      }
      const res = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to update profile')
      // Refresh view
      setEditing(false)
      // simple reload of data
      setLoading(true)
      const r = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}`, { cache: 'no-store' })
      const d = await r.json()
      if (r.ok && d.ok) {
        const s = d.student
        const sum = d.summary || {}
        setStudentData({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone || '-',
          joined: new Date(s.joined).toLocaleDateString(),
          academicBackground: s.profile?.academicBackground || '',
          targetExams: s.profile?.targetExams || '',
          totalExams: Number(sum.totalExams || 0),
          averageScore: Number(sum.averageScore || 0),
          lastExamDate: sum.lastExamDate ? new Date(sum.lastExamDate).toLocaleDateString() : '',
          profile: {
            collegeName: s.profile?.collegeName || '',
            universityRollNumber: s.profile?.universityRollNumber || '',
            section: s.profile?.section || '',
            classRollNumber: s.profile?.classRollNumber || '',
            branch: s.profile?.branch || '',
            course: s.profile?.course || '',
            leetcodeId: s.profile?.leetcodeId || '',
            githubId: s.profile?.githubId || '',
            strengths: s.profile?.strengths || '',
            weaknesses: s.profile?.weaknesses || '',
            privacy: s.profile?.privacy || { showEmail: false, showSocialIds: false },
          },
        })
        toast({ title: 'Profile updated', description: 'Student profile saved successfully.' })
      }
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Failed to update profile', variant: 'destructive' as any })
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading student details...</p>
        </Card>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Student Not Found</h2>
          <Link href="/admin/students">
            <Button className="mt-4 bg-blue-600">Back to Students</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="outline" size="sm" className="border-blue-200 bg-transparent">
            <ArrowLeft size={18} className="mr-2" />
            Back to Students
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{studentData.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Student ID: {studentData.id}</p>
            <button
              onClick={() => navigator.clipboard?.writeText?.(studentData.id)}
              className="text-xs inline-flex items-center px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
              title="Copy Student ID"
            >
              <Copy size={14} className="mr-1" /> Copy
            </button>
            <Button size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700" onClick={() => setEditing((e)=>!e)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-blue-200">
          <p className="text-sm text-muted-foreground">Email</p>
          {studentData.profile?.privacy?.showEmail ? (
            <div className="flex items-center gap-2 mt-1">
              <a href={`mailto:${studentData.email}`} className="text-lg font-semibold text-blue-600 hover:underline">{studentData.email}</a>
              <button
                onClick={() => navigator.clipboard?.writeText?.(studentData.email)}
                className="text-xs inline-flex items-center px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                title="Copy Email"
              >
                <Copy size={14} className="mr-1" /> Copy
              </button>
            </div>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground mt-1">Hidden (privacy)</p>
          )}
        </Card>
        <Card className="p-4 border-blue-200">
          <p className="text-sm text-muted-foreground">Joined</p>
          <p className="text-lg font-semibold text-foreground mt-1">{studentData.joined}</p>
        </Card>
        <Card className="p-4 border-blue-200">
          <p className="text-sm text-muted-foreground">Total Exams</p>
          <p className="text-lg font-semibold text-foreground mt-1">{examReports.length}</p>
        </Card>
        <Card className="p-4 border-blue-200">
          <p className="text-sm text-muted-foreground">Average Score</p>
          <p className="text-lg font-semibold text-cyan-600 mt-1">
            {examReports.length > 0
              ? Math.round(examReports.reduce((sum, r) => sum + r.score, 0) / examReports.length)
              : 0}
            %
          </p>
        </Card>
      </div>

      {/* Student Details */}
      <Card className="p-6 border-blue-200">
        <h2 className="text-xl font-bold text-foreground mb-4">Student Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-foreground font-medium">{studentData.phone || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Academic Background</p>
            <p className="text-foreground font-medium">{studentData.academicBackground || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Exams</p>
            <p className="text-foreground font-medium">{studentData.targetExams || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Exam</p>
            <p className="text-foreground font-medium">{studentData.lastExamDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Strengths</p>
            <p className="text-foreground font-medium">{studentData.profile?.strengths || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weaknesses</p>
            <p className="text-foreground font-medium">{studentData.profile?.weaknesses || 'No data provided'}</p>
          </div>
        </div>
      </Card>

      {/* Academic & IDs */}
      <Card className="p-6 border-blue-200">
        <h2 className="text-xl font-bold text-foreground mb-4">Academic & IDs</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">College</p>
            <p className="text-foreground font-medium">{studentData.profile?.collegeName || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">University Roll No.</p>
            <div className="flex items-center gap-2">
              <p className="text-foreground font-medium">{studentData.profile?.universityRollNumber || 'No data provided'}</p>
              {studentData.profile?.universityRollNumber && (
                <button
                  onClick={() => navigator.clipboard?.writeText?.(studentData.profile!.universityRollNumber!)}
                  className="text-xs inline-flex items-center px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                  title="Copy University Roll No."
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Class Roll No.</p>
            <div className="flex items-center gap-2">
              <p className="text-foreground font-medium">{studentData.profile?.classRollNumber || 'No data provided'}</p>
              {studentData.profile?.classRollNumber && (
                <button
                  onClick={() => navigator.clipboard?.writeText?.(studentData.profile!.classRollNumber!)}
                  className="text-xs inline-flex items-center px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                  title="Copy Class Roll No."
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Section</p>
            <p className="text-foreground font-medium">{studentData.profile?.section || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Branch</p>
            <p className="text-foreground font-medium">{studentData.profile?.branch || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course</p>
            <p className="text-foreground font-medium">{studentData.profile?.course || 'No data provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">LeetCode</p>
            {studentData.profile?.leetcodeId && studentData.profile?.privacy?.showSocialIds ? (
              <a
                href={/^https?:\/\//.test(studentData.profile.leetcodeId) ? studentData.profile.leetcodeId : `https://leetcode.com/${studentData.profile.leetcodeId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {studentData.profile.leetcodeId}
              </a>
            ) : (
              <p className="text-foreground font-medium">{studentData.profile?.leetcodeId ? 'Hidden (privacy)' : 'No data provided'}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">GitHub</p>
            {studentData.profile?.githubId && studentData.profile?.privacy?.showSocialIds ? (
              <a
                href={/^https?:\/\//.test(studentData.profile.githubId) ? studentData.profile.githubId : `https://github.com/${studentData.profile.githubId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {studentData.profile.githubId}
              </a>
            ) : (
              <p className="text-foreground font-medium">{studentData.profile?.githubId ? 'Hidden (privacy)' : 'No data provided'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Inline Edit Form */}
      {editing && (
        <Card className="p-6 border-blue-200">
          <h2 className="text-xl font-bold text-foreground mb-4">Edit Profile (Admin)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.phone || ''} onChange={(e)=>setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Academic Background</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.academicBackground || ''} onChange={(e)=>setForm({ ...form, academicBackground: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Exams</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.targetExams || ''} onChange={(e)=>setForm({ ...form, targetExams: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-muted-foreground">Strengths</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.strengths || ''} onChange={(e)=>setForm({ ...form, strengths: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-muted-foreground">Weaknesses</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.weaknesses || ''} onChange={(e)=>setForm({ ...form, weaknesses: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">College</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.collegeName || ''} onChange={(e)=>setForm({ ...form, collegeName: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">University Roll No.</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.universityRollNumber || ''} onChange={(e)=>setForm({ ...form, universityRollNumber: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class Roll No.</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.classRollNumber || ''} onChange={(e)=>setForm({ ...form, classRollNumber: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Section</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.section || ''} onChange={(e)=>setForm({ ...form, section: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.branch || ''} onChange={(e)=>setForm({ ...form, branch: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.course || ''} onChange={(e)=>setForm({ ...form, course: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">LeetCode</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.leetcodeId || ''} onChange={(e)=>setForm({ ...form, leetcodeId: e.target.value })} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GitHub</p>
              <input className="w-full border border-border rounded px-3 py-2" value={form.githubId || ''} onChange={(e)=>setForm({ ...form, githubId: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={()=>setEditing(false)} variant="outline" className="bg-transparent">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Exam Reports */}
      {examReports.length > 0 && (
        <Card className="p-6 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Exam Reports ({examReports.length})</h2>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
              <Download size={18} className="mr-2" />
              Export All Reports
            </Button>
          </div>

          <div className="space-y-4">
            {examReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedReport?.id === report.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-blue-200 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{report.examName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-600">{report.score}%</p>
                    <p className="text-sm text-muted-foreground">
                      {report.correctAnswers}/{report.totalQuestions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Selected Report Details */}
      {selectedReport && (
        <Card className="p-6 border-blue-200">
          <h2 className="text-xl font-bold text-foreground mb-6">{selectedReport.examName} - Detailed Analysis</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Category-wise Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={selectedReport.categoryScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Performance Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={selectedReport.categoryScores}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#06b6d4" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exam Stats */}
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold text-foreground mt-2">{selectedReport.totalQuestions}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-muted-foreground">Correct Answers</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{selectedReport.correctAnswers}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-muted-foreground">Wrong Answers</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {selectedReport.totalQuestions - selectedReport.correctAnswers}
              </p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold text-cyan-600 mt-2">{selectedReport.duration}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
              <Download size={18} className="mr-2" />
              Download Report
            </Button>
            <Button variant="outline" className="border-blue-200 bg-transparent">
              <Mail size={18} className="mr-2" />
              Send to Student
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
