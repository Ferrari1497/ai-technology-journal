import React, { Component, ErrorInfo, ReactNode } from 'react'
import { monitoring } from '../lib/monitoring'
import { logger } from '../lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラー情報をログに記録
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    // 監視システムにエラーを送信
    monitoring.logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: new Date().toISOString()
    })
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを表示
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラーUI
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            申し訳ございません
          </h2>
          <p style={{ color: '#374151', marginBottom: '1rem' }}>
            予期しないエラーが発生しました。ページを再読み込みしてください。
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ページを再読み込み
          </button>
        </div>
      )
    }

    return this.props.children
  }
}