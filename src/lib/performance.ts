// パフォーマンス監視とCore Web Vitals測定
export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
}

export interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  loadTime?: number
  domContentLoaded?: number
}

// Core Web Vitalsの閾値
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 }
}

export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

export function measureWebVitals(onMetric: (metric: WebVitalsMetric) => void) {
  if (typeof window === 'undefined') return

  // Performance Observer for Core Web Vitals
  if ('PerformanceObserver' in window) {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcp = entries[entries.length - 1]
      if (fcp) {
        onMetric({
          name: 'FCP',
          value: fcp.startTime,
          rating: getRating('FCP', fcp.startTime),
          delta: fcp.startTime
        })
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      if (lcp) {
        onMetric({
          name: 'LCP',
          value: lcp.startTime,
          rating: getRating('LCP', lcp.startTime),
          delta: lcp.startTime
        })
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime
          onMetric({
            name: 'FID',
            value: fid,
            rating: getRating('FID', fid),
            delta: fid
          })
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      onMetric({
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        delta: clsValue
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }

  // Navigation Timing API
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      // Time to First Byte
      const ttfb = navigation.responseStart - navigation.requestStart
      onMetric({
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
        delta: ttfb
      })

      // Load Time
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      onMetric({
        name: 'Load Time',
        value: loadTime,
        rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor',
        delta: loadTime
      })

      // DOM Content Loaded
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      onMetric({
        name: 'DOM Content Loaded',
        value: domContentLoaded,
        rating: domContentLoaded < 1500 ? 'good' : domContentLoaded < 3000 ? 'needs-improvement' : 'poor',
        delta: domContentLoaded
      })
    }
  })
}

export function getPerformanceMetrics(): PerformanceMetrics | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')
  
  const metrics: PerformanceMetrics = {}

  if (navigation) {
    metrics.ttfb = navigation.responseStart - navigation.requestStart
    metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
    metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
  }

  paint.forEach((entry) => {
    if (entry.name === 'first-contentful-paint') {
      metrics.fcp = entry.startTime
    }
  })

  const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
  if (lcpEntries.length > 0) {
    metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime
  }

  return metrics
}

// パフォーマンス最適化の推奨事項
export function getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = []

  if (metrics.fcp && metrics.fcp > 3000) {
    recommendations.push('First Contentful Paintが遅いです。画像の最適化やCSSの最適化を検討してください。')
  }

  if (metrics.lcp && metrics.lcp > 4000) {
    recommendations.push('Largest Contentful Paintが遅いです。メイン画像の最適化やサーバーレスポンス時間の改善を検討してください。')
  }

  if (metrics.ttfb && metrics.ttfb > 1800) {
    recommendations.push('Time to First Byteが遅いです。サーバーの最適化やCDNの使用を検討してください。')
  }

  if (metrics.loadTime && metrics.loadTime > 5000) {
    recommendations.push('ページの読み込み時間が遅いです。リソースの最適化や遅延読み込みを検討してください。')
  }

  if (recommendations.length === 0) {
    recommendations.push('パフォーマンスは良好です！')
  }

  return recommendations
}

// Google Analytics 4 でのCore Web Vitals送信
export function sendWebVitalsToGA4(metric: WebVitalsMetric) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-ignore
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.value),
      non_interaction: true
    })
  }
}

// パフォーマンス監視の初期化
export function initPerformanceMonitoring() {
  measureWebVitals((metric) => {
    console.log('Web Vital:', metric)
    
    // Google Analytics に送信
    sendWebVitalsToGA4(metric)
    
    // 必要に応じて他の分析ツールにも送信
    // sendToAnalytics(metric)
  })
}