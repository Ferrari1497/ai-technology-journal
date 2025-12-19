import { logger } from './logger'
import { config } from './config'

export interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  url?: string
  userAgent?: string
  timestamp: string
}

export interface PerformanceMetrics {
  pageLoadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

class Monitoring {
  private errorCount = 0
  private performanceData: Partial<PerformanceMetrics> = {}

  constructor() {
    this.setupErrorHandling()
    this.setupPerformanceMonitoring()
  }

  private setupErrorHandling() {
    if (typeof window === 'undefined') return

    // グローバルエラーハンドリング
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        timestamp: new Date().toISOString()
      })
    })

    // Promise拒否エラー
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString()
      })
    })
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // ページロード完了時にメトリクス収集
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectPerformanceMetrics()
      }, 1000)
    })
  }

  logError(errorInfo: ErrorInfo) {
    this.errorCount++
    
    logger.error('Application Error', {
      ...errorInfo,
      errorCount: this.errorCount,
      sessionId: this.getSessionId()
    })

    // 本番環境では外部監視サービスに送信
    if (config.isProduction) {
      this.sendErrorToMonitoring(errorInfo)
    }
  }

  private async sendErrorToMonitoring(errorInfo: ErrorInfo) {
    try {
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      })
    } catch (error) {
      console.error('Failed to send error to monitoring:', error)
    }
  }

  private collectPerformanceMetrics() {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      this.performanceData = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      }
    }

    // Core Web Vitals
    this.measureWebVitals()

    logger.info('Performance Metrics', this.performanceData)

    // 本番環境では監視サービスに送信
    if (config.isProduction) {
      this.sendPerformanceData()
    }
  }

  private measureWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        this.performanceData.firstContentfulPaint = fcp.startTime
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      if (lcp) {
        this.performanceData.largestContentfulPaint = lcp.startTime
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.performanceData.cumulativeLayoutShift = clsValue
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          this.performanceData.firstInputDelay = entry.processingStart - entry.startTime
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
  }

  private async sendPerformanceData() {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.performanceData)
      })
    } catch (error) {
      console.error('Failed to send performance data:', error)
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('monitoring-session-id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('monitoring-session-id', sessionId)
    }
    return sessionId
  }

  // カスタムメトリクス
  trackEvent(eventName: string, properties?: Record<string, any>) {
    logger.info(`Event: ${eventName}`, properties)
    
    if (config.isProduction) {
      this.sendCustomEvent(eventName, properties)
    }
  }

  private async sendCustomEvent(eventName: string, properties?: Record<string, any>) {
    try {
      await fetch('/api/monitoring/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, properties, timestamp: new Date().toISOString() })
      })
    } catch (error) {
      console.error('Failed to send custom event:', error)
    }
  }

  // ヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/health')
      return response.ok
    } catch (error) {
      logger.error('Health check failed', error)
      return false
    }
  }
}

export const monitoring = new Monitoring()