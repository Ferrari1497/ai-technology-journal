export interface SEOMetrics {
  titleLength: number
  descriptionLength: number
  keywordDensity: number
  readabilityScore: number
  imageOptimization: boolean
  loadTime: number
}

export interface SEORecommendation {
  type: 'error' | 'warning' | 'info'
  message: string
  priority: 'high' | 'medium' | 'low'
}

export function analyzeSEO(
  title: string,
  description: string,
  content: string,
  keywords: string[]
): {
  metrics: SEOMetrics
  recommendations: SEORecommendation[]
  score: number
} {
  const recommendations: SEORecommendation[] = []
  
  // タイトル分析
  const titleLength = title.length
  if (titleLength < 30) {
    recommendations.push({
      type: 'warning',
      message: 'タイトルが短すぎます（30文字以上推奨）',
      priority: 'medium'
    })
  } else if (titleLength > 60) {
    recommendations.push({
      type: 'warning',
      message: 'タイトルが長すぎます（60文字以下推奨）',
      priority: 'medium'
    })
  }
  
  // 説明文分析
  const descriptionLength = description.length
  if (descriptionLength < 120) {
    recommendations.push({
      type: 'warning',
      message: '説明文が短すぎます（120文字以上推奨）',
      priority: 'medium'
    })
  } else if (descriptionLength > 160) {
    recommendations.push({
      type: 'warning',
      message: '説明文が長すぎます（160文字以下推奨）',
      priority: 'medium'
    })
  }
  
  // キーワード密度分析
  const wordCount = content.split(/\s+/).length
  const keywordCount = keywords.reduce((count, keyword) => {
    const regex = new RegExp(keyword, 'gi')
    const matches = content.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
  
  const keywordDensity = (keywordCount / wordCount) * 100
  if (keywordDensity < 1) {
    recommendations.push({
      type: 'info',
      message: 'キーワード密度が低いです（1-3%推奨）',
      priority: 'low'
    })
  } else if (keywordDensity > 3) {
    recommendations.push({
      type: 'warning',
      message: 'キーワード密度が高すぎます（1-3%推奨）',
      priority: 'high'
    })
  }
  
  // 読みやすさスコア（簡易版）
  const sentences = content.split(/[。！？]/).length
  const avgWordsPerSentence = wordCount / sentences
  const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence - 15) * 2)
  
  if (readabilityScore < 60) {
    recommendations.push({
      type: 'warning',
      message: '文章が読みにくい可能性があります',
      priority: 'medium'
    })
  }
  
  // 画像最適化チェック（簡易版）
  const hasImages = content.includes('<img') || content.includes('![')
  const imageOptimization = hasImages
  
  if (hasImages && !content.includes('alt=')) {
    recommendations.push({
      type: 'error',
      message: '画像にalt属性が設定されていません',
      priority: 'high'
    })
  }
  
  // 総合スコア計算
  let score = 100
  recommendations.forEach(rec => {
    if (rec.type === 'error') score -= 20
    else if (rec.type === 'warning') score -= 10
    else score -= 5
  })
  
  const metrics: SEOMetrics = {
    titleLength,
    descriptionLength,
    keywordDensity,
    readabilityScore,
    imageOptimization,
    loadTime: 0 // 実際の実装では Performance API を使用
  }
  
  return {
    metrics,
    recommendations,
    score: Math.max(0, score)
  }
}

export function generateSEOReport(
  posts: Array<{
    title: string
    description: string
    content: string
    keywords: string[]
    slug: string
  }>
): {
  overallScore: number
  topPerformers: string[]
  needsImprovement: string[]
  commonIssues: string[]
} {
  const analyses = posts.map(post => ({
    slug: post.slug,
    ...analyzeSEO(post.title, post.description, post.content, post.keywords)
  }))
  
  const overallScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0) / analyses.length
  
  const topPerformers = analyses
    .filter(a => a.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(a => a.slug)
  
  const needsImprovement = analyses
    .filter(a => a.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(a => a.slug)
  
  // 共通の問題を特定
  const issueCount: { [key: string]: number } = {}
  analyses.forEach(analysis => {
    analysis.recommendations.forEach(rec => {
      issueCount[rec.message] = (issueCount[rec.message] || 0) + 1
    })
  })
  
  const commonIssues = Object.entries(issueCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([issue]) => issue)
  
  return {
    overallScore,
    topPerformers,
    needsImprovement,
    commonIssues
  }
}

// パフォーマンス監視
export function trackPagePerformance() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
    }
  }
  
  return null
}