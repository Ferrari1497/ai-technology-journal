const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

class PDCAAnalyzer {
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'performance-history.json')
    this.configPath = path.join(process.cwd(), 'data', 'optimization-config.json')
    this.ensureDataDirectory()
  }

  ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  // 日次データを収集・蓄積
  collectDailyData() {
    const today = new Date().toISOString().split('T')[0]
    
    // 模擬データ生成（実際の運用では Google Analytics API等から取得）
    const dailyData = {
      date: today,
      pageViews: Math.floor(Math.random() * 5000) + 1000,
      revenue: Math.floor(Math.random() * 3000) + 500,
      seoScore: Math.floor(Math.random() * 40) + 60,
      engagementRate: Math.random() * 50 + 30,
      bounceRate: Math.random() * 40 + 30,
      avgTimeOnPage: Math.random() * 180 + 60,
      posts: this.getRecentPosts()
    }

    this.savePerformanceData(dailyData)
    return dailyData
  }

  getRecentPosts() {
    const languages = ['ja', 'en', 'th']
    const posts = []

    languages.forEach(lang => {
      const postsDir = path.join(process.cwd(), 'posts', lang)
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir)
          .filter(f => f.endsWith('.md'))
          .slice(0, 5) // 最新5件

        files.forEach(file => {
          const filePath = path.join(postsDir, file)
          const content = fs.readFileSync(filePath, 'utf8')
          const { data } = matter(content)
          
          posts.push({
            id: file.replace('.md', ''),
            title: data.title || '',
            category: data.category || '',
            tags: data.tags || [],
            wordCount: content.split(/\s+/).length,
            lang,
            // 模擬パフォーマンスデータ
            pageViews: Math.floor(Math.random() * 1000) + 100,
            revenue: Math.floor(Math.random() * 500) + 50,
            seoScore: Math.floor(Math.random() * 40) + 60
          })
        })
      }
    })

    return posts
  }

  savePerformanceData(data) {
    let history = []
    
    if (fs.existsSync(this.dataPath)) {
      history = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'))
    }
    
    history.push(data)
    
    // 90日分のデータのみ保持
    if (history.length > 90) {
      history = history.slice(-90)
    }
    
    fs.writeFileSync(this.dataPath, JSON.stringify(history, null, 2))
  }

  // パフォーマンス分析実行
  analyzePerformance() {
    if (!fs.existsSync(this.dataPath)) {
      return this.getDefaultAnalysis()
    }

    const history = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'))
    
    if (history.length < 7) {
      return this.getDefaultAnalysis()
    }

    const analysis = {
      period: {
        start: history[0].date,
        end: history[history.length - 1].date,
        days: history.length
      },
      trends: this.analyzeTrends(history),
      topCategories: this.getTopCategories(history),
      optimalWordCount: this.getOptimalWordCount(history),
      bestKeywords: this.getBestKeywords(history),
      successPatterns: this.getSuccessPatterns(history),
      improvementAreas: this.getImprovementAreas(history),
      recommendations: this.generateRecommendations(history)
    }

    return analysis
  }

  analyzeTrends(history) {
    const recent = history.slice(-7)
    const previous = history.slice(-14, -7)

    const recentAvg = {
      pageViews: recent.reduce((sum, d) => sum + d.pageViews, 0) / recent.length,
      revenue: recent.reduce((sum, d) => sum + d.revenue, 0) / recent.length,
      seoScore: recent.reduce((sum, d) => sum + d.seoScore, 0) / recent.length
    }

    const previousAvg = {
      pageViews: previous.reduce((sum, d) => sum + d.pageViews, 0) / previous.length,
      revenue: previous.reduce((sum, d) => sum + d.revenue, 0) / previous.length,
      seoScore: previous.reduce((sum, d) => sum + d.seoScore, 0) / previous.length
    }

    return {
      pageViewsTrend: ((recentAvg.pageViews - previousAvg.pageViews) / previousAvg.pageViews * 100).toFixed(1),
      revenueTrend: ((recentAvg.revenue - previousAvg.revenue) / previousAvg.revenue * 100).toFixed(1),
      seoTrend: ((recentAvg.seoScore - previousAvg.seoScore) / previousAvg.seoScore * 100).toFixed(1)
    }
  }

  getTopCategories(history) {
    const categoryPerformance = new Map()
    
    history.forEach(day => {
      day.posts.forEach(post => {
        const score = (post.revenue * 0.4) + (post.pageViews * 0.3) + (post.seoScore * 0.3)
        categoryPerformance.set(
          post.category, 
          (categoryPerformance.get(post.category) || 0) + score
        )
      })
    })

    return Array.from(categoryPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, score]) => ({ category, score: Math.round(score) }))
  }

  getOptimalWordCount(history) {
    const wordCountData = []
    
    history.forEach(day => {
      day.posts.forEach(post => {
        wordCountData.push({
          wordCount: post.wordCount,
          performance: (post.revenue * 0.5) + (post.pageViews * 0.3) + (post.seoScore * 0.2)
        })
      })
    })

    const sorted = wordCountData.sort((a, b) => b.performance - a.performance)
    const top20Percent = sorted.slice(0, Math.ceil(sorted.length * 0.2))
    
    return Math.round(top20Percent.reduce((sum, item) => sum + item.wordCount, 0) / top20Percent.length)
  }

  getBestKeywords(history) {
    const keywordPerformance = new Map()
    
    history.forEach(day => {
      day.posts.forEach(post => {
        const score = (post.revenue * 0.6) + (post.pageViews * 0.4)
        post.tags.forEach(tag => {
          keywordPerformance.set(tag, (keywordPerformance.get(tag) || 0) + score)
        })
      })
    })

    return Array.from(keywordPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, score]) => ({ keyword, score: Math.round(score) }))
  }

  getSuccessPatterns(history) {
    const patterns = []
    const allPosts = history.flatMap(day => day.posts)
    const highPerformers = allPosts
      .filter(post => post.seoScore > 80 && post.revenue > 200)
      .slice(-20)

    if (highPerformers.length > 0) {
      const avgWordCount = highPerformers.reduce((sum, post) => sum + post.wordCount, 0) / highPerformers.length
      patterns.push(`高パフォーマンス記事の平均文字数: ${Math.round(avgWordCount)}文字`)
      
      const categoryCount = new Map()
      highPerformers.forEach(post => {
        categoryCount.set(post.category, (categoryCount.get(post.category) || 0) + 1)
      })
      
      const topCategory = Array.from(categoryCount.entries())
        .sort(([,a], [,b]) => b - a)[0]
      
      if (topCategory) {
        patterns.push(`成功率の高いカテゴリ: ${topCategory[0]}`)
      }
    }

    return patterns
  }

  getImprovementAreas(history) {
    const areas = []
    const recent = history.slice(-7)
    
    const avgSeoScore = recent.reduce((sum, day) => sum + day.seoScore, 0) / recent.length
    const avgBounceRate = recent.reduce((sum, day) => sum + day.bounceRate, 0) / recent.length
    const avgEngagement = recent.reduce((sum, day) => sum + day.engagementRate, 0) / recent.length

    if (avgSeoScore < 70) {
      areas.push('SEOスコア改善が必要（目標: 80以上）')
    }
    if (avgBounceRate > 60) {
      areas.push('直帰率が高い（目標: 50%以下）')
    }
    if (avgEngagement < 40) {
      areas.push('エンゲージメント率向上が必要（目標: 50%以上）')
    }

    return areas
  }

  generateRecommendations(history) {
    const recommendations = []
    const topCategories = this.getTopCategories(history)
    const bestKeywords = this.getBestKeywords(history)
    const optimalWordCount = this.getOptimalWordCount(history)

    recommendations.push({
      type: 'content',
      priority: 'high',
      action: `${topCategories[0]?.category || '生成AIツール比較'}カテゴリの記事を優先的に作成`
    })

    recommendations.push({
      type: 'seo',
      priority: 'high',
      action: `キーワード「${bestKeywords[0]?.keyword || 'AI'}」を重点的に活用`
    })

    recommendations.push({
      type: 'structure',
      priority: 'medium',
      action: `記事の文字数を${optimalWordCount}文字前後に調整`
    })

    return recommendations
  }

  getDefaultAnalysis() {
    return {
      period: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0], days: 0 },
      trends: { pageViewsTrend: '0.0', revenueTrend: '0.0', seoTrend: '0.0' },
      topCategories: [{ category: '生成AIツール比較', score: 100 }],
      optimalWordCount: 2000,
      bestKeywords: [{ keyword: 'AI', score: 100 }],
      successPatterns: ['データ収集中'],
      improvementAreas: ['十分なデータが蓄積されていません'],
      recommendations: [
        { type: 'setup', priority: 'high', action: 'データ収集を開始してください' }
      ]
    }
  }

  // 最適化設定を更新
  updateOptimizationConfig(analysis) {
    const config = {
      lastUpdated: new Date().toISOString(),
      targetCategory: analysis.topCategories[0]?.category || '生成AIツール比較',
      optimalWordCount: analysis.optimalWordCount,
      priorityKeywords: analysis.bestKeywords.slice(0, 5).map(k => k.keyword),
      publishingStrategy: {
        optimalTime: '09:00',
        frequency: 'daily',
        abTestEnabled: true
      },
      contentStrategy: {
        successPatterns: analysis.successPatterns,
        improvementFocus: analysis.improvementAreas
      }
    }

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2))
    return config
  }
}

async function runPDCAAnalysis() {
  console.log('🔄 PDCA分析開始...')
  
  const analyzer = new PDCAAnalyzer()
  
  // 1. データ収集
  console.log('📊 日次データ収集中...')
  const dailyData = analyzer.collectDailyData()
  
  // 2. パフォーマンス分析
  console.log('🔍 パフォーマンス分析中...')
  const analysis = analyzer.analyzePerformance()
  
  // 3. 最適化設定更新
  console.log('⚙️ 最適化設定更新中...')
  const config = analyzer.updateOptimizationConfig(analysis)
  
  // 4. 結果出力
  console.log('\n📈 PDCA分析結果:')
  console.log(`分析期間: ${analysis.period.days}日間`)
  console.log(`トップカテゴリ: ${analysis.topCategories[0]?.category}`)
  console.log(`最適文字数: ${analysis.optimalWordCount}文字`)
  console.log(`優先キーワード: ${analysis.bestKeywords.slice(0, 3).map(k => k.keyword).join(', ')}`)
  
  console.log('\n📊 トレンド:')
  console.log(`ページビュー: ${analysis.trends.pageViewsTrend}%`)
  console.log(`収益: ${analysis.trends.revenueTrend}%`)
  console.log(`SEOスコア: ${analysis.trends.seoTrend}%`)
  
  console.log('\n🎯 推奨アクション:')
  analysis.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`)
  })
  
  return { analysis, config }
}

if (require.main === module) {
  runPDCAAnalysis().catch(error => {
    console.error('❌ PDCA分析エラー:', error)
    process.exit(1)
  })
}

module.exports = { PDCAAnalyzer, runPDCAAnalysis }