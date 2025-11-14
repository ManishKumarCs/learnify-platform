// Security utilities

import crypto from "crypto"

// Rate limiting
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (record.count < this.maxAttempts) {
      record.count++
      return true
    }

    return false
  }

  reset(identifier: string) {
    this.attempts.delete(identifier)
  }
}

// Input validation
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "").substring(0, 1000)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) errors.push("Password must be at least 8 characters")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain lowercase letter")
  if (!/[0-9]/.test(password)) errors.push("Password must contain number")

  return { valid: errors.length === 0, errors }
}

// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Encryption utilities
export function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key.padEnd(32, "0").substring(0, 32)), iv)
  let encrypted = cipher.update(data, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decryptData(encryptedData: string, key: string): string {
  const [ivHex, encrypted] = encryptedData.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key.padEnd(32, "0").substring(0, 32)), iv)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
