// Comprehensive logging system for production

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  stackTrace?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      sessionId: this.getSessionId(),
    }

    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[${level}] ${message}`, context)
    }

    // Send critical logs to monitoring service
    if (level === LogLevel.CRITICAL || level === LogLevel.ERROR) {
      this.sendToMonitoring(entry)
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, { ...context, errorMessage: error?.message }, undefined)
  }

  critical(message: string, error?: Error, context?: Record<string, any>) {
    this.log(
      LogLevel.CRITICAL,
      message,
      { ...context, errorMessage: error?.message, stackTrace: error?.stack },
      undefined,
    )
  }

  private getSessionId(): string {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("sessionId")
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem("sessionId", sessionId)
      }
      return sessionId
    }
    return "server-session"
  }

  private sendToMonitoring(entry: LogEntry) {
    // Send to monitoring service (e.g., Sentry, LogRocket)
    if (process.env.NEXT_PUBLIC_MONITORING_URL) {
      fetch(process.env.NEXT_PUBLIC_MONITORING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail if monitoring service is unavailable
      })
    }
  }

  getLogs(): LogEntry[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
