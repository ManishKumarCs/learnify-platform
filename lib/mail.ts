import nodemailer from 'nodemailer'

export type MailResult = { ok: boolean; messageId?: string; error?: string }

export function getTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return transporter
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) : Promise<MailResult> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  const transporter = getTransport()
  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  })
  return { ok: true, messageId: info.messageId }
}
