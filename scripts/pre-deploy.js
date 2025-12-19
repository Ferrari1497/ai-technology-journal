const fs = require('fs')
const path = require('path')
const { generateSEOFiles } = require('./generate-sitemap')

async function preDeployChecks() {
  console.log('🚀 デプロイ前チェック開始...')
  
  // スキップチェック
  if (process.env.SKIP_PRE_DEPLOY_CHECK === 'true') {
    console.log('⏭️ デプロイ前チェックをスキップします')
    return { success: true, checks: [], skipped: true }
  }
  
  const checks = []
  
  // 1. 必須ファイルの存在確認
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'src/pages/index.tsx',
    'src/components/Layout.tsx'
  ]
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file))
    checks.push({ file, exists, type: 'required' })
    console.log(`${exists ? '✅' : '❌'} ${file}`)
  })
  
  // 2. 記事データの確認
  const languages = ['ja', 'en', 'th']
  languages.forEach(lang => {
    const postsDir = path.join(process.cwd(), 'posts', lang)
    const count = fs.existsSync(postsDir) ? 
      fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).length : 0
    
    checks.push({ file: `posts/${lang}`, exists: count > 0, type: 'posts', count })
    console.log(`${count > 0 ? '✅' : '⚠️'} ${lang}: ${count}件の記事`)
  })
  
  // 3. SEOファイル生成
  console.log('📄 SEOファイル生成中...')
  try {
    await generateSEOFiles()
    checks.push({ file: 'SEO files', exists: true, type: 'seo' })
    console.log('✅ SEOファイル生成完了')
  } catch (error) {
    checks.push({ file: 'SEO files', exists: false, type: 'seo', error: error.message })
    console.log('❌ SEOファイル生成失敗:', error.message)
  }
  
  // 4. 環境変数チェック
  const requiredEnvVars = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_ENVIRONMENT'
  ]
  
  requiredEnvVars.forEach(envVar => {
    const exists = !!process.env[envVar]
    checks.push({ file: envVar, exists, type: 'env' })
    console.log(`${exists ? '✅' : '❌'} ${envVar}: ${exists ? '設定済み' : '未設定'}`)
  })
  
  // 結果判定
  const failed = checks.filter(check => !check.exists)
  const success = failed.length === 0
  
  console.log('\n' + '='.repeat(50))
  console.log(`🎯 デプロイ前チェック結果: ${success ? '✅ 成功' : '❌ 失敗'}`)
  
  if (!success) {
    console.log('\n❌ 以下の問題を解決してください:')
    failed.forEach(check => {
      console.log(`- ${check.file}: ${check.error || '不足'}`)
    })
    process.exit(1)
  }
  
  return { success, checks }
}

if (require.main === module) {
  preDeployChecks().catch(error => {
    console.error('❌ デプロイ前チェック実行エラー:', error)
    process.exit(1)
  })
}

module.exports = { preDeployChecks }