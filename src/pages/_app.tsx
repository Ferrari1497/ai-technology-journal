import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'
import ErrorBoundary from '../components/ErrorBoundary'
import { monitoring } from '../lib/monitoring'
import { logger } from '../lib/logger'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 監視システム初期化
    logger.info('Application started', {
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    
    // ページビュー追跡
    monitoring.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer
    })
  }, [])

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}