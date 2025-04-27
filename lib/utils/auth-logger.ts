// Define log levels
type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

// Maximum number of logs to keep
const MAX_LOGS = 100

class AuthLogger {
  private logs: LogEntry[] = []
  private isClient = typeof window !== "undefined"

  constructor() {
    // Load logs from localStorage if available
    this.loadLogs()
  }

  private loadLogs() {
    if (!this.isClient) return

    try {
      const savedLogs = localStorage.getItem("auth_logs")
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs)
      }
    } catch (error) {
      console.error("Failed to load auth logs:", error)
      this.logs = []
    }
  }

  private saveLogs() {
    if (!this.isClient) return

    try {
      localStorage.setItem("auth_logs", JSON.stringify(this.logs))
    } catch (error) {
      console.error("Failed to save auth logs:", error)
    }
  }

  private log(level: LogLevel, message: string, data?: any) {
    // Redact sensitive information
    const safeData = data ? this.redactSensitiveInfo(data) : undefined

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: safeData,
    }

    // Add to logs
    this.logs.push(entry)

    // Trim logs if needed
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS)
    }

    // Save logs
    this.saveLogs()

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console[level === "debug" ? "log" : level](`[Auth] ${message}`, safeData !== undefined ? safeData : "")
    }
  }

  private redactSensitiveInfo(data: any): any {
    if (!data) return data

    // Clone the data to avoid modifying the original
    const clonedData = JSON.parse(JSON.stringify(data))

    // List of keys that might contain sensitive information
    const sensitiveKeys = ["password", "token", "secret", "apiKey", "api_key", "key", "authorization", "auth"]

    // Function to recursively redact sensitive information
    const redact = (obj: any) => {
      if (typeof obj !== "object" || obj === null) return

      Object.keys(obj).forEach((key) => {
        const lowerKey = key.toLowerCase()
        if (sensitiveKeys.some((k) => lowerKey.includes(k))) {
          obj[key] = "[REDACTED]"
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          redact(obj[key])
        }
      })
    }

    redact(clonedData)
    return clonedData
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data)
  }

  info(message: string, data?: any) {
    this.log("info", message, data)
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data)
  }

  error(message: string, data?: any) {
    this.log("error", message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    this.saveLogs()
  }
}

// Export a singleton instance
export const authLogger = new AuthLogger()
