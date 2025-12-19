import { config } from './config'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
}

class Logger {
  private logLevel: LogLevel
  private sessionId: string

  constructor() {
    this.logLevel = config.isProduction ? LogLevel.WARN : LogLevel.DEBUG
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      sessionId: this.sessionId,
    }

    if (data) entry.data = data
    
    if (typeof window !== 'undefined') {
      entry.url = window.location.href
      entry.userAgent = navigator.userAgent
    }

    return entry
  }

  private output(entry: LogEntry) {
    const logString = `[${entry.timestamp}] ${entry.level}: ${entry.message}`
    
    switch (entry.level) {
      case 'DEBUG':
        console.debug(logString, entry.data || '')
        break
      case 'INFO':
        console.info(logString, entry.data || '')
        break
      case 'WARN':
        console.warn(logString, entry.data || '')
        break
      case 'ERROR':
        console.error(logString, entry.data || '')
        break
    }

    // 本番環境では外部ログサービスに送信
    if (config.isProduction) {
      this.sendToLogService(entry)
    }
  }

  private async sendToLogService(entry: LogEntry) {
    try {
      // CloudWatch Logs、Datadog、Sentryなどに送信
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.error('Failed to send log to service:', error)
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.formatLog(LogLevel.DEBUG, message, data)
      this.output(entry)
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.formatLog(LogLevel.INFO, message, data)
      this.output(entry)
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.formatLog(LogLevel.WARN, message, data)
      this.output(entry)
    }
  }

  error(message: string, data?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.formatLog(LogLevel.ERROR, message, data)
      this.output(entry)
    }
  }

  // パフォーマンス測定
  time(label: string) {
    if (typeof window !== 'undefined') {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (typeof window !== 'undefined') {
      console.timeEnd(label)
    }
  }
}

export const logger = new Logger()