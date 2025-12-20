#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// ステージング環境の記事レポート生成
function generateStagingReport() {
  console.log('📊 Generating staging environment report...')
  
  const languages = ['ja', 'en', 'th']
  const report = {
    timestamp: new Date().toISOString(),
    totalArticles: 0,
    byLanguage: {},
    recentArticles: [],
    categories: {},
    stagingUrl: 'http://ai-tech-journal-staging-1766124861.s3-website-ap-northeast-1.amazonaws.com'
  }
  
  languages.forEach(lang => {
    const postsDir = path.join(__dirname, '..', 'posts', lang)
    
    if (!fs.existsSync(postsDir)) {
      report.byLanguage[lang] = { count: 0, articles: [] }
      return
    }
    
    const files = fs.readdirSync(postsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filepath = path.join(postsDir, file)
        const stats = fs.statSync(filepath)
        const content = fs.readFileSync(filepath, 'utf8')
        
        // メタデータ抽出
        const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/i)
        const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/i)
        const dateMatch = content.match(/date:\s*['"]([^'"]+)['"]/i)
        
        return {
          filename: file,
          title: titleMatch ? titleMatch[1] : 'No title',
          category: categoryMatch ? categoryMatch[1] : 'Unknown',
          date: dateMatch ? dateMatch[1] : 'Unknown',
          created: stats.birthtime,
          size: stats.size,
          wordCount: content.replace(/---[\s\S]*?---/, '').trim().length
        }
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created))
    
    report.byLanguage[lang] = {
      count: files.length,
      articles: files
    }
    
    report.totalArticles += files.length
    
    // 最新記事を追加
    files.slice(0, 3).forEach(article => {
      report.recentArticles.push({
        ...article,
        language: lang,
        url: `${report.stagingUrl}/posts/${article.filename.replace('.md', '')}`
      })
    })
    
    // カテゴリー集計
    files.forEach(article => {
      if (!report.categories[article.category]) {
        report.categories[article.category] = 0
      }
      report.categories[article.category]++
    })
  })
  
  // 最新記事を時系列でソート
  report.recentArticles.sort((a, b) => new Date(b.created) - new Date(a.created))
  report.recentArticles = report.recentArticles.slice(0, 10)
  
  return report
}

// レポート表示
function displayReport(report) {
  console.log('\n🌐 ステージング環境レポート')
  console.log('=' .repeat(50))
  console.log(`📅 生成日時: ${new Date(report.timestamp).toLocaleString('ja-JP')}`)
  console.log(`🔗 ステージングURL: ${report.stagingUrl}`)
  console.log(`🔐 ログイン: admin / staging123`)
  console.log(`📄 総記事数: ${report.totalArticles}記事`)
  
  console.log('\n📊 言語別記事数:')
  Object.entries(report.byLanguage).forEach(([lang, data]) => {
    const langName = { ja: '日本語', en: '英語', th: 'タイ語' }[lang] || lang
    console.log(`   ${langName}: ${data.count}記事`)
  })
  
  console.log('\n📂 カテゴリー別記事数:')
  Object.entries(report.categories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count}記事`)
    })
  
  console.log('\n📝 最新記事 (上位10件):')
  report.recentArticles.forEach((article, index) => {
    const langName = { ja: '🇯🇵', en: '🇺🇸', th: '🇹🇭' }[article.language] || article.language
    console.log(`   ${index + 1}. ${langName} ${article.title}`)
    console.log(`      📁 ${article.category} | 📊 ${article.wordCount}文字 | 📅 ${article.date}`)
    console.log(`      🔗 ${article.url}`)
    console.log('')
  })
  
  console.log('🎯 テスト推奨項目:')
  console.log('   ✅ トップページの表示確認')
  console.log('   ✅ 各言語の記事一覧ページ')
  console.log('   ✅ 最新記事の詳細ページ')
  console.log('   ✅ カテゴリー別フィルタリング')
  console.log('   ✅ レスポンシブデザイン')
  console.log('   ✅ SEO要素（タイトル、メタ説明）')
}

// JSON形式でレポート保存
function saveReportAsJson(report) {
  const reportPath = path.join(__dirname, '..', 'staging-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`💾 レポートを保存しました: ${reportPath}`)
}

// メイン実行
if (require.main === module) {
  try {
    const report = generateStagingReport()
    displayReport(report)
    saveReportAsJson(report)
    
    console.log('\n🎉 ステージング環境レポート生成完了!')
  } catch (error) {
    console.error('❌ レポート生成エラー:', error.message)
    process.exit(1)
  }
}

module.exports = { generateStagingReport, displayReport }