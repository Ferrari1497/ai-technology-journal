const fs = require('fs')
const path = require('path')
const { analyzeSEO } = require('./generate-seo-report')
const { runPDCAAnalysis } = require('./pdca-analyzer')
const matter = require('gray-matter')

// 模擬的な収益データ生成（実際の運用では実データを使用）
function generateMockRevenueData() {
  const today = new Date().toISOString().split('T')[0]
  const baseAdsense = Math.random() * 2000 + 500 // ¥500-2500
  const baseAffiliate = Math.random() * 5000 + 1000 // ¥1000-6000
  const pageViews = Math.floor(Math.random() * 3000 + 1000)
  const clicks = Math.floor(pageViews * 0.02)
  
  return {
    date: today,
    adsenseRevenue: Math.round(baseAdsense),
    affiliateRevenue: Math.round(baseAffiliate),
    totalRevenue: Math.round(baseAdsense + baseAffiliate),
    pageViews,
    clicks
  }
}

function calculateStats(dailyData) {
  const today = dailyData[dailyData.length - 1] || generateMockRevenueData()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // 今月の収益合計
  const monthToDate = dailyData
    .filter(d => {
      const date = new Date(d.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, d) => sum + d.totalRevenue, 0)
  
  // 今年の収益合計
  const yearToDate = dailyData
    .filter(d => new Date(d.date).getFullYear() === currentYear)
    .reduce((sum, d) => sum + d.totalRevenue, 0)
  
  // 月間予測
  const dayOfMonth = new Date().getDate()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const projectedMonthly = Math.round((monthToDate / dayOfMonth) * daysInMonth)
  
  return {
    today,
    monthToDate,
    yearToDate,
    projectedMonthly,
    projectedYearly: Math.round(projectedMonthly * 12)
  }
}

function generateEmailContent(stats, seoData, pdcaData) {
  const { today, monthToDate, yearToDate, projectedMonthly, projectedYearly } = stats
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Technology Journal - 日次収益レポート</title>
  <style>
    body { font-family: 'Hiragino Sans', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .stats { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
    .stat-label { font-weight: bold; }
    .stat-value { color: #4299e1; font-weight: bold; }
    .today-highlight { background: #e6f3ff; border-left: 4px solid #4299e1; }
    .footer { text-align: center; color: #666; font-size: 0.9em; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 AI Technology Journal</h1>
      <h2>日次収益レポート</h2>
      <p>${today.date}</p>
    </div>
    
    <div class="stats">
      <h3>📊 本日の収益</h3>
      <div class="stat-row today-highlight">
        <span class="stat-label">AdSense収益:</span>
        <span class="stat-value">¥${today.adsenseRevenue.toLocaleString()}</span>
      </div>
      <div class="stat-row today-highlight">
        <span class="stat-label">アフィリエイト収益:</span>
        <span class="stat-value">¥${today.affiliateRevenue.toLocaleString()}</span>
      </div>
      <div class="stat-row today-highlight">
        <span class="stat-label">本日合計:</span>
        <span class="stat-value">¥${today.totalRevenue.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">ページビュー:</span>
        <span class="stat-value">${today.pageViews.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">クリック数:</span>
        <span class="stat-value">${today.clicks.toLocaleString()}</span>
      </div>
    </div>
    
    <div class="stats">
      <h3>📈 累計収益</h3>
      <div class="stat-row">
        <span class="stat-label">今月累計:</span>
        <span class="stat-value">¥${monthToDate.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">今年累計:</span>
        <span class="stat-value">¥${yearToDate.toLocaleString()}</span>
      </div>
    </div>
    
    <div class="stats">
      <h3>🎯 予測収益</h3>
      <div class="stat-row">
        <span class="stat-label">今月予測:</span>
        <span class="stat-value">¥${projectedMonthly.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">年間予測:</span>
        <span class="stat-value">¥${projectedYearly.toLocaleString()}</span>
      </div>
    </div>
    
    <div class="stats">
      <h3>🔍 SEOステータス</h3>
      <div class="stat-row">
        <span class="stat-label">全体SEOスコア:</span>
        <span class="stat-value">${seoData.overallScore}/100</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">総記事数:</span>
        <span class="stat-value">${seoData.totalPosts}件</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">高スコア記事:</span>
        <span class="stat-value">${seoData.topPerformers.length}件</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">改善必要:</span>
        <span class="stat-value">${seoData.needsImprovement.length}件</span>
      </div>
    </div>
    
    ${seoData.needsImprovement.length > 0 ? `
    <div class="stats">
      <h3>⚠️ 改善が必要な記事 (Top 3)</h3>
      ${seoData.needsImprovement.slice(0, 3).map(post => `
      <div class="stat-row">
        <span class="stat-label">[${post.lang}] ${post.title}:</span>
        <span class="stat-value">${post.score}/100</span>
      </div>`).join('')}
    </div>` : ''}
    
    ${seoData.commonIssues.length > 0 ? `
    <div class="stats">
      <h3>🔧 よくある問題 (Top 3)</h3>
      ${seoData.commonIssues.slice(0, 3).map((issue, index) => `
      <div class="stat-row">
        <span class="stat-label">${index + 1}. ${issue.issue}:</span>
        <span class="stat-value">${issue.count}件</span>
      </div>`).join('')}
    </div>` : ''}
    
    ${pdcaData ? `
    <div class="stats">
      <h3>🔄 PDCA最適化情報</h3>
      <div class="stat-row">
        <span class="stat-label">最適カテゴリ:</span>
        <span class="stat-value">${pdcaData.topCategories[0]?.category || 'N/A'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">推奨文字数:</span>
        <span class="stat-value">${pdcaData.optimalWordCount}文字</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">優先キーワード:</span>
        <span class="stat-value">${pdcaData.bestKeywords.slice(0, 3).map(k => k.keyword).join(', ')}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">ページビュートレンド:</span>
        <span class="stat-value">${pdcaData.trends.pageViewsTrend}%</span>
      </div>
    </div>
    
    <div class="stats">
      <h3>🎯 今日の推奨アクション</h3>
      ${pdcaData.recommendations.slice(0, 3).map((rec, index) => `
      <div class="stat-row">
        <span class="stat-label">${index + 1}. [${rec.priority.toUpperCase()}]</span>
        <span class="stat-value">${rec.action}</span>
      </div>`).join('')}
    </div>` : ''}
    
    <div class="footer">
      <p>このレポートは自動生成されています</p>
      <p>AI Technology Journal - Automated Revenue Tracking</p>
    </div>
  </div>
</body>
</html>
`
}

function generateSEOSummary() {
  try {
    const reportPath = path.join(process.cwd(), 'public', 'seo-report.json')
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      return {
        overallScore: report.summary.overallScore,
        totalPosts: report.summary.totalPosts,
        topPerformers: report.topPerformers,
        needsImprovement: report.needsImprovement,
        commonIssues: report.commonIssues
      }
    }
  } catch (error) {
    console.log('⚠️ SEOレポートが見つかりません')
  }
  
  return {
    overallScore: 0,
    totalPosts: 0,
    topPerformers: [],
    needsImprovement: [],
    commonIssues: []
  }
}

async function sendRevenueReport() {
  console.log('📧 メール送信機能は無効化されています')
  console.log('⚠️ 日次レポート生成をスキップしました')
  
  return {
    success: false,
    message: 'メール送信機能は無効化されています',
    disabled: true
  }
}

// 実行
if (require.main === module) {
  sendRevenueReport()
}

module.exports = { sendRevenueReport }