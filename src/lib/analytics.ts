export interface PerformanceData {
  date: string
  pageViews: number
  revenue: number
  seoScore: number
  engagementRate: number
  bounceRate: number
  avgTimeOnPage: number
  category: string
  keywords: string[]
  wordCount: number
}

export interface AnalysisResult {
  topCategories: string[]
  optimalWordCount: number
  bestKeywords: string[]
  optimalPublishTime: string
  successPatterns: string[]
  improvementAreas: string[]
  trendingTopics: string[]
}

export class PerformanceAnalyzer {
  private data: PerformanceData[] = []

  addData(data: PerformanceData) {
    this.data.push(data)
    // 30日分のデータのみ保持
    if (this.data.length > 30) {
      this.data = this.data.slice(-30)
    }
  }

  analyze(): AnalysisResult {
    if (this.data.length < 7) {
      return this.getDefaultAnalysis()
    }

    return {
      topCategories: this.getTopCategories(),
      optimalWordCount: this.getOptimalWordCount(),
      bestKeywords: this.getBestKeywords(),
      optimalPublishTime: this.getOptimalPublishTime(),
      successPatterns: this.getSuccessPatterns(),
      improvementAreas: this.getImprovementAreas(),
      trendingTopics: this.getTrendingTopics()
    }
  }

  private getTopCategories(): string[] {
    const categoryPerformance = new Map<string, number>()
    
    this.data.forEach(item => {
      const score = (item.revenue * 0.4) + (item.pageViews * 0.3) + (item.seoScore * 0.3)
      categoryPerformance.set(item.category, (categoryPerformance.get(item.category) || 0) + score)
    })

    return Array.from(categoryPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category)
  }

  private getOptimalWordCount(): number {
    const wordCountPerformance = this.data.map(item => ({
      wordCount: item.wordCount,
      performance: (item.revenue * 0.5) + (item.engagementRate * 0.3) + (item.seoScore * 0.2)
    }))

    const sorted = wordCountPerformance.sort((a, b) => b.performance - a.performance)
    const top20Percent = sorted.slice(0, Math.ceil(sorted.length * 0.2))
    
    return Math.round(top20Percent.reduce((sum, item) => sum + item.wordCount, 0) / top20Percent.length)
  }

  private getBestKeywords(): string[] {
    const keywordPerformance = new Map<string, number>()
    
    this.data.forEach(item => {
      const score = (item.revenue * 0.6) + (item.pageViews * 0.4)
      item.keywords.forEach(keyword => {
        keywordPerformance.set(keyword, (keywordPerformance.get(keyword) || 0) + score)
      })
    })

    return Array.from(keywordPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword)
  }

  private getOptimalPublishTime(): string {
    // 簡易実装：実際はより詳細な時間分析が必要
    const recentHighPerformance = this.data
      .filter(item => item.revenue > this.getAverageRevenue())
      .slice(-7)

    return recentHighPerformance.length > 0 ? '09:00' : '09:00'
  }

  private getSuccessPatterns(): string[] {
    const highPerformers = this.data
      .filter(item => item.seoScore > 80 && item.revenue > this.getAverageRevenue())
      .slice(-10)

    const patterns = []
    
    if (highPerformers.length > 0) {
      const avgWordCount = highPerformers.reduce((sum, item) => sum + item.wordCount, 0) / highPerformers.length
      patterns.push(`高パフォーマンス記事の平均文字数: ${Math.round(avgWordCount)}文字`)
      
      const commonCategories = this.getTopCategories()
      if (commonCategories.length > 0) {
        patterns.push(`成功カテゴリ: ${commonCategories[0]}`)
      }
    }

    return patterns
  }

  private getImprovementAreas(): string[] {
    const areas = []
    const avgSeoScore = this.data.reduce((sum, item) => sum + item.seoScore, 0) / this.data.length
    const avgBounceRate = this.data.reduce((sum, item) => sum + item.bounceRate, 0) / this.data.length

    if (avgSeoScore < 70) {
      areas.push('SEOスコア改善が必要')
    }
    if (avgBounceRate > 60) {
      areas.push('直帰率が高い - コンテンツ品質向上が必要')
    }

    return areas
  }

  private getTrendingTopics(): string[] {
    // 最近7日間で急上昇しているキーワード
    const recent = this.data.slice(-7)
    const older = this.data.slice(-14, -7)

    const recentKeywords = new Map<string, number>()
    const olderKeywords = new Map<string, number>()

    recent.forEach(item => {
      item.keywords.forEach(keyword => {
        recentKeywords.set(keyword, (recentKeywords.get(keyword) || 0) + item.pageViews)
      })
    })

    older.forEach(item => {
      item.keywords.forEach(keyword => {
        olderKeywords.set(keyword, (olderKeywords.get(keyword) || 0) + item.pageViews)
      })
    })

    const trending: string[] = []
    Array.from(recentKeywords.entries()).forEach(([keyword, recentViews]) => {
      const olderViews = olderKeywords.get(keyword) || 0
      if (recentViews > olderViews * 1.5) {
        trending.push(keyword)
      }
    })

    return trending.slice(0, 5)
  }

  private getAverageRevenue(): number {
    return this.data.reduce((sum, item) => sum + item.revenue, 0) / this.data.length
  }

  private getDefaultAnalysis(): AnalysisResult {
    return {
      topCategories: ['生成AIツール比較', 'SaaS紹介', '業務効率化'],
      optimalWordCount: 2000,
      bestKeywords: ['AI', 'ChatGPT', 'Claude', '比較', 'レビュー'],
      optimalPublishTime: '09:00',
      successPatterns: ['初期データ収集中'],
      improvementAreas: ['データ蓄積が必要'],
      trendingTopics: ['AI', 'ChatGPT', 'Claude']
    }
  }
}