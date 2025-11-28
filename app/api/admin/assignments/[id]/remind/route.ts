import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Assignment from '@/models/assignment'
import User from '@/models/user'
import { sendMail } from '@/lib/mail'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })

    const id = params.id
    if (!id) return NextResponse.json({ ok: false, message: 'Missing assignment id' }, { status: 400 })

    const a = await Assignment.findById(id).lean()
    if (!a) return NextResponse.json({ ok: false, message: 'Assignment not found' }, { status: 404 })

    // fetch student emails
    const users = await User.find({ _id: { $in: a.assignedTo }, role: 'student' }).select('email firstName lastName').lean()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const due = a.dueAt ? new Date(a.dueAt).toLocaleString() : 'No due date'

    const failures: { email: string; error: string }[] = []
    for (const u of users) {
      const to = (u as any).email
      if (!to) continue
      try {
        const name = `${(u as any).firstName || ''} ${(u as any).lastName || ''}`.trim() || 'Student'
        const link = `${baseUrl}/student/assignments`
        const subject = `Reminder: ${a.title} (${String(a.domain).toUpperCase()} · ${a.topic})`
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${a.title} · Reminder</title>
  <style>
    .btn { background: #2563eb; color: #ffffff !important; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; }
    .muted { color: #64748b; }
    .chip { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
  </style>
</head>
<body style="background:#f6f7fb; font-family: Arial, Helvetica, sans-serif; margin:0; padding:24px;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:640px; margin:0 auto;">
    <tr>
      <td>
        <div style="text-align:center; margin-bottom:16px; color:#0f172a; font-weight:800; font-size:22px;">e-learnify</div>
        <div class="card" style="margin-bottom:16px;">
          <p style="margin:0 0 8px 0; font-size:14px;" class="muted">Hi ${name},</p>
          <h1 style="margin:4px 0 12px 0; font-size:20px; color:#0f172a;">You have a pending test assignment</h1>
          <div style="margin-bottom:12px;">
            <span class="chip">${String(a.domain).toUpperCase()}</span>
            <span class="chip" style="background:#fef3c7; color:#b45309; margin-left:6px;">${a.topic}</span>
          </div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size:14px;">
            <tr>
              <td style="padding:6px 0;">Assignment</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${a.title}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;">Questions</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${a.limit}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;">Due</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${due}</td>
            </tr>
          </table>
          <div style="text-align:center; margin:18px 0;">
            <a class="btn" href="${link}" target="_blank" rel="noopener noreferrer">Start Now</a>
          </div>
          <p class="muted" style="font-size:12px; margin:0;">Tip: Use a stable internet connection and a distraction-free environment. Once submitted, reattempts are not allowed.</p>
        </div>
        <div style="text-align:center; color:#94a3b8; font-size:12px;">
          If the button doesn't work, copy and paste this link in your browser:<br/>
          <a href="${link}" style="color:#2563eb; text-decoration:none;">${link}</a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
        await sendMail({ to, subject, html, text: `You have a test: ${a.title}. Topic: ${a.topic}. Due: ${due}. Open: ${link}` })
      } catch (e: any) {
        failures.push({ email: (u as any).email, error: e?.message || 'send failed' })
      }
    }

    return NextResponse.json({ ok: true, sent: users.length - failures.length, failed: failures })
  } catch (err: any) {
    const msg = err?.message || 'Failed to send reminders'
    return NextResponse.json({ ok: false, message: msg }, { status: 500 })
  }
}
