// Email Service Module
// Handles sending emails to students for registration, password reset, and notifications

export interface EmailOptions {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In production, integrate with email service like SendGrid, Mailgun, or AWS SES
    console.log("[v0] Email would be sent:", {
      to: options.to,
      subject: options.subject,
      template: options.template,
    })

    // Mock email sending
    return true
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    return false
  }
}

export async function sendRegistrationEmail(email: string, firstName: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to EduLearn!",
    template: "registration",
    data: { firstName, email },
  })
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Reset Your EduLearn Password",
    template: "password-reset",
    data: { email, resetLink },
  })
}

export async function sendExamResultEmail(email: string, examTitle: string, score: number): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Your ${examTitle} Results - Score: ${score}%`,
    template: "exam-result",
    data: { email, examTitle, score },
  })
}

export async function sendReportEmail(email: string, reportLink: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Your Detailed Exam Report is Ready",
    template: "report",
    data: { email, reportLink },
  })
}

export async function sendExamReminderEmail(email: string, examTitle: string, deadline: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Reminder: ${examTitle} Exam Deadline Approaching`,
    template: "exam-reminder",
    data: { email, examTitle, deadline },
  })
}

export async function sendExamAssignmentEmail(
  email: string,
  examTitle: string,
  deadline: string,
  duration: number,
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `New Exam Assigned: ${examTitle}`,
    template: "exam-assignment",
    data: { email, examTitle, deadline, duration },
  })
}
