const fs = require('fs')
const path = require('path')
const https = require('https')

// ヘルスチェック設定
const HEALTH_CHECKS = {
  production: 'https://ai-tech-journal.com',
  staging: 'https://staging.ai-tech-journal.com'
}

const TIMEOUT = 10000 // 10秒

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const req = https.get(url, { timeout: TIMEOUT }, (res) => {
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
      reject(new Error(`Timeout: ${url}`))
    })
    
    req.on('error', (error) => {
      reject(error)
    })
  })
}

async function checkFileSystem() {
  const checks = []
  
  // 重要なディレクトリの存在確認
  const criticalPaths = [
    'posts/ja',
    'posts/en', 
    'posts/th',
    'public',
    'src/pages',
    'src/components'
  ]
  
  criticalPaths.forEach(dirPath => {
    const fullPath = path.join(process.cwd(), dirPath)
    checks.push({
      path: dirPath,
      exists: fs.existsSync(fullPath),
      type: 'directory'
    })
  })
  
  // 重要なファイルの存在確認
  const criticalFiles = [
    'package.json',
    'next.config.js',
    'public/sitemap.xml',
    'public/robots.txt'
  ]
  
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath)
    checks.push({
      path: filePath,
      exists: fs.existsSync(fullPath),
      type: 'file'
    })
  })
  
  return checks
}

async function checkPostsIntegrity() {
  const languages = ['ja', 'en', 'th']
  const results = {}
  
  languages.forEach(lang => {
    const postsDir = path.join(process.cwd(), 'posts', lang)
    
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
      results[lang] = {
        count: files.length,
        files: files.slice(0, 5) // 最初の5件のみ表示
      }
    } else {
      results[lang] = { count: 0, files: [] }
    }
  })
  
  return results
}

async function runHealthCheck() {
  console.log('🏥 ヘルスチェック開始...')
  console.log('=' * 50)
  
  const results = {
    timestamp: new Date().toISOString(),
    urls: {},
    filesystem: [],
    posts: {},
    overall: true
  }
  
  // URL チェック
  console.log('\n🌐 URL チェック:')
  for (const [env, url] of Object.entries(HEALTH_CHECKS)) {
    try {
      const result = await checkUrl(url)
      results.urls[env] = result
      
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${env}: ${result.status} (${result.responseTime}ms)`)
      
      if (!result.success) results.overall = false
    } catch (error) {
      results.urls[env] = { url, error: error.message, success: false }
      console.log(`❌ ${env}: ${error.message}`)
      results.overall = false
    }
  }
  
  // ファイルシステム チェック
  console.log('\n📁 ファイルシステム チェック:')
  results.filesystem = await checkFileSystem()
  
  results.filesystem.forEach(check => {
    const status = check.exists ? '✅' : '❌'
    console.log(`${status} ${check.type}: ${check.path}`)
    
    if (!check.exists) results.overall = false
  })
  
  // 記事整合性 チェック
  console.log('\n📝 記事整合性 チェック:')
  results.posts = await checkPostsIntegrity()
  
  Object.entries(results.posts).forEach(([lang, data]) => {
    console.log(`📄 ${lang}: ${data.count}件の記事`)
    if (data.count === 0) {
      console.log(`⚠️  ${lang}の記事が見つかりません`)
    }
  })
  
  // 結果サマリー
  console.log('\n' + '=' * 50)
  const overallStatus = results.overall ? '✅ 正常' : '❌ 問題あり'
  console.log(`🏥 全体ステータス: ${overallStatus}`)
  
  // 結果をファイルに保存
  const reportPath = path.join(process.cwd(), 'health-check-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log(`📊 レポート保存: ${reportPath}`)
  
  // 異常時は終了コード1で終了
  if (!results.overall) {
    process.exit(1)
  }
  
  return results
}

// スクリプト実行
if (require.main === module) {
  runHealthCheck().catch(error => {
    console.error('❌ ヘルスチェック実行エラー:', error)
    process.exit(1)
  })
}

module.exports = { runHealthCheck }