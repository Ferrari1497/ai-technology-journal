const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

// SEO分析関数（Node.js版）
function analyzeSEO(title, description, content, keywords = []) {
  const recommendations = []
  
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
  
  const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0
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
  
  // 画像最適化チェック
  const hasImages = content.includes('<img') || content.includes('![')
  if (hasImages && !content.includes('alt=') && !content.includes('alt="')) {
    recommendations.push({
      type: 'error',
      message: '画像にalt属性が設定されていません',
      priority: 'high'
    })
  }
  
  // 内部リンクチェック
  const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length
  if (internalLinks === 0) {
    recommendations.push({
      type: 'info',
      message: '内部リンクがありません',
      priority: 'low'
    })
  }
  
  // 見出し構造チェック
  const h1Count = (content.match(/^# /gm) || []).length
  const h2Count = (content.match(/^## /gm) || []).length
  
  if (h1Count > 1) {
    recommendations.push({
      type: 'warning',
      message: 'H1タグが複数あります',
      priority: 'medium'
    })
  }
  
  if (h2Count === 0) {
    recommendations.push({
      type: 'info',
      message: 'H2タグがありません（構造化推奨）',
      priority: 'low'
    })
  }
  
  // 総合スコア計算
  let score = 100
  recommendations.forEach(rec => {
    if (rec.type === 'error') score -= 20
    else if (rec.type === 'warning') score -= 10
    else score -= 5
  })
  
  return {
    score: Math.max(0, score),
    recommendations,
    metrics: {
      titleLength,
      descriptionLength,
      keywordDensity,
      wordCount,
      hasImages,
      internalLinks,
      h1Count,
      h2Count
    }
  }
}

function getAllPosts(lang = 'ja') {
  const postsDirectory = path.join(process.cwd(), 'posts', lang)
  
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames
    .filter(name => name.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        id: fileName.replace(/\.md$/, ''),
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: content || '',
        tags: data.tags || [],
        date: data.date || '',
        category: data.category || ''
      }
    })
  
  return posts
}

function generateSEOReport() {
  console.log('🔍 SEOレポートを生成中...')
  
  const languages = ['ja', 'en', 'th']
  const allAnalyses = []
  
  languages.forEach(lang => {
    console.log(`📝 ${lang}の記事を分析中...`)
    const posts = getAllPosts(lang)
    
    posts.forEach(post => {
      const analysis = analyzeSEO(
        post.title,
        post.excerpt,
        post.content,
        post.tags
      )
      
      allAnalyses.push({
        lang,
        slug: post.id,
        title: post.title,
        ...analysis
      })
    })
  })
  
  // 全体統計
  const overallScore = allAnalyses.length > 0 
    ? allAnalyses.reduce((sum, analysis) => sum + analysis.score, 0) / allAnalyses.length
    : 0
  
  const topPerformers = allAnalyses
    .filter(a => a.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  
  const needsImprovement = allAnalyses
    .filter(a => a.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
  
  // 共通の問題を特定
  const issueCount = {}
  allAnalyses.forEach(analysis => {
    analysis.recommendations.forEach(rec => {
      issueCount[rec.message] = (issueCount[rec.message] || 0) + 1
    })
  })
  
  const commonIssues = Object.entries(issueCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([issue, count]) => ({ issue, count }))
  
  // レポート生成
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPosts: allAnalyses.length,
      overallScore: Math.round(overallScore),
      languageBreakdown: languages.map(lang => ({
        lang,
        count: allAnalyses.filter(a => a.lang === lang).length,
        avgScore: Math.round(
          allAnalyses
            .filter(a => a.lang === lang)
            .reduce((sum, a) => sum + a.score, 0) / 
          allAnalyses.filter(a => a.lang === lang).length || 0
        )
      }))
    },
    topPerformers: topPerformers.map(p => ({
      lang: p.lang,
      slug: p.slug,
      title: p.title,
      score: Math.round(p.score)
    })),
    needsImprovement: needsImprovement.map(p => ({
      lang: p.lang,
      slug: p.slug,
      title: p.title,
      score: Math.round(p.score),
      issues: p.recommendations.length
    })),
    commonIssues,
    detailedAnalyses: allAnalyses.map(a => ({
      lang: a.lang,
      slug: a.slug,
      title: a.title,
      score: Math.round(a.score),
      metrics: a.metrics,
      recommendations: a.recommendations
    }))
  }
  
  // レポートをpublicディレクトリに保存（静的ファイルとしてアクセス可能）
  const reportPath = path.join(process.cwd(), 'public', 'seo-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  // コンソール出力
  console.log('\\n📊 SEOレポート結果:')
  console.log(`総記事数: ${report.summary.totalPosts}`)
  console.log(`全体スコア: ${report.summary.overallScore}/100`)
  console.log('\\n🏆 高スコア記事 (Top 5):')
  report.topPerformers.slice(0, 5).forEach((post, index) => {
    console.log(`${index + 1}. [${post.lang}] ${post.title} (${post.score}/100)`)
  })
  
  console.log('\\n⚠️  改善が必要な記事 (Top 5):')
  report.needsImprovement.slice(0, 5).forEach((post, index) => {
    console.log(`${index + 1}. [${post.lang}] ${post.title} (${post.score}/100)`)
  })
  
  console.log('\\n🔧 よくある問題:')
  report.commonIssues.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. ${item.issue} (${item.count}件)`)
  })
  
  console.log(`\\n✅ レポートが保存されました: ${reportPath}`)
  console.log('📊 ブラウザでレポートを確認: http://localhost:3000/seo-report')
  
  return report
}

// スクリプト実行
if (require.main === module) {
  generateSEOReport()
}

module.exports = { generateSEOReport, analyzeSEO }