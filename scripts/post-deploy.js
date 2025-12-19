const https = require('https')
const { runHealthCheck } = require('./health-check')

async function postDeployVerification(environment = 'staging') {
  console.log(`🔍 ${environment}環境のデプロイ後検証開始...`)
  
  const urls = {
    staging: 'https://staging.ai-tech-journal.com',
    production: 'https://ai-tech-journal.com'
  }
  
  const targetUrl = urls[environment]
  if (!targetUrl) {
    throw new Error(`Unknown environment: ${environment}`)
  }
  
  // 1. サイトの可用性確認
  console.log('🌐 サイト可用性チェック...')
  const siteCheck = await checkSiteAvailability(targetUrl)
  console.log(`${siteCheck.success ? '✅' : '❌'} ${targetUrl}: ${siteCheck.status}`)
  
  // 2. 重要ページの確認
  const criticalPages = [
    '/',
    '/archive',
    '/tools',
    '/sitemap.xml',
    '/robots.txt'
  ]
  
  console.log('📄 重要ページチェック...')
  const pageChecks = []
  
  for (const page of criticalPages) {
    const pageUrl = `${targetUrl}${page}`
    const result = await checkSiteAvailability(pageUrl)
    pageChecks.push({ page, ...result })
    console.log(`${result.success ? '✅' : '❌'} ${page}: ${result.status}`)
  }
  
  // 3. パフォーマンスチェック
  console.log('⚡ パフォーマンスチェック...')
  const perfCheck = await checkPerformance(targetUrl)
  console.log(`⚡ レスポンス時間: ${perfCheck.responseTime}ms`)
  
  // 4. SEOファイル確認
  console.log('🔍 SEOファイル確認...')
  const seoChecks = await Promise.all([
    checkSiteAvailability(`${targetUrl}/sitemap.xml`),
    checkSiteAvailability(`${targetUrl}/robots.txt`)
  ])
  
  seoChecks.forEach((check, index) => {
    const file = index === 0 ? 'sitemap.xml' : 'robots.txt'
    console.log(`${check.success ? '✅' : '❌'} ${file}: ${check.status}`)
  })
  
  // 結果サマリー
  const allChecks = [siteCheck, ...pageChecks, ...seoChecks]
  const failedChecks = allChecks.filter(check => !check.success)
  const success = failedChecks.length === 0
  
  console.log('\n' + '='.repeat(50))
  console.log(`🎯 デプロイ後検証結果: ${success ? '✅ 成功' : '❌ 失敗'}`)
  
  if (!success) {
    console.log('\n❌ 以下のページで問題が発生しています:')
    failedChecks.forEach(check => {
      console.log(`- ${check.url || check.page}: ${check.status}`)
    })
  }
  
  // 通知送信
  await sendDeployNotification(environment, success, {
    siteCheck,
    pageChecks,
    seoChecks,
    performance: perfCheck
  })
  
  return { success, checks: allChecks }
}

function checkSiteAvailability(url) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime
      resolve({
        url,
        status: res.statusCode,
        responseTime,
        success: res.statusCode >= 200 && res.statusCode < 400
      })
    })
    
    req.on('timeout', () => {
      req.destroy()
      resolve({ url, status: 'TIMEOUT', success: false })
    })
    
    req.on('error', (error) => {
      resolve({ url, status: error.message, success: false })
    })
  })
}

async function checkPerformance(url) {
  const result = await checkSiteAvailability(url)
  return {
    responseTime: result.responseTime || 0,
    status: result.status
  }
}

async function sendDeployNotification(environment, success, details) {
  const status = success ? '✅ 成功' : '❌ 失敗'
  const message = `
🚀 ${environment}環境デプロイ完了

結果: ${status}
サイト: ${details.siteCheck.success ? '✅' : '❌'} ${details.siteCheck.status}
パフォーマンス: ${details.performance.responseTime}ms
SEO: ${details.seoChecks.every(c => c.success) ? '✅' : '❌'}

時刻: ${new Date().toISOString()}
  `.trim()
  
  console.log('\n📧 デプロイ通知:')
  console.log(message)
  
  // 実際の運用では Slack、Discord、メール等に送信
  return message
}

if (require.main === module) {
  const environment = process.argv[2] || 'staging'
  postDeployVerification(environment).catch(error => {
    console.error('❌ デプロイ後検証エラー:', error)
    process.exit(1)
  })
}

module.exports = { postDeployVerification }