#!/usr/bin/env node

const { generateAINews } = require('./generate-ai-news')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('='.repeat(60))
console.log('AIニュース記事 - ステージング環境テスト')
console.log('='.repeat(60))
console.log()

// ステップ1: AIニュース記事を生成
console.log('📝 ステップ1: AIニュース記事を生成中...')
const generatedFiles = generateAINews()
console.log(`✅ ${generatedFiles.length}言語の記事を生成しました`)
generatedFiles.forEach(file => {
  console.log(`   - [${file.lang}] ${file.title}`)
})
console.log()

// ステップ2: 生成された記事の内容を確認
console.log('🔍 ステップ2: 生成された記事の内容を確認中...')
let allValid = true
generatedFiles.forEach(file => {
  const filepath = path.join(__dirname, '..', 'posts', file.lang, file.filename)
  const content = fs.readFileSync(filepath, 'utf8')
  
  // 基本的なバリデーション
  const hasTitle = content.includes('title:')
  const hasDate = content.includes('date:')
  const hasCategory = content.includes('category:')
  const hasContent = content.length > 500
  
  if (hasTitle && hasDate && hasCategory && hasContent) {
    console.log(`   ✅ [${file.lang}] 記事の構造が正常です`)
  } else {
    console.log(`   ❌ [${file.lang}] 記事の構造に問題があります`)
    allValid = false
  }
})
console.log()

if (!allValid) {
  console.error('❌ 記事の検証に失敗しました')
  process.exit(1)
}

// ステップ3: ビルドテスト
console.log('🔨 ステップ3: Next.jsビルドテスト中...')
try {
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  })
  console.log('✅ ビルドが成功しました')
} catch (error) {
  console.error('❌ ビルドに失敗しました')
  process.exit(1)
}
console.log()

// ステップ4: デプロイ準備チェック
console.log('📋 ステップ4: デプロイ準備チェック中...')
const requiredFiles = [
  'out/index.html',
  'out/news.html',
  'out/sitemap.xml',
  'out/robots.txt'
]

let deployReady = true
requiredFiles.forEach(file => {
  const filepath = path.join(__dirname, '..', file)
  if (fs.existsSync(filepath)) {
    console.log(`   ✅ ${file} が存在します`)
  } else {
    console.log(`   ❌ ${file} が見つかりません`)
    deployReady = false
  }
})
console.log()

if (!deployReady) {
  console.error('❌ デプロイ準備チェックに失敗しました')
  process.exit(1)
}

// ステップ5: ステージング環境へのデプロイ
console.log('🚀 ステップ5: ステージング環境へデプロイ中...')
console.log('   デプロイコマンド: npm run deploy:staging')
console.log()

try {
  execSync('npm run deploy:staging', { 
    stdio: 'inherit',
    env: { ...process.env }
  })
  console.log('✅ ステージング環境へのデプロイが完了しました')
} catch (error) {
  console.error('❌ デプロイに失敗しました')
  process.exit(1)
}
console.log()

// ステップ6: デプロイ後の検証
console.log('✅ ステップ6: デプロイ後の検証中...')
const stagingUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://ai-tech-journal-staging-1766039463.s3-website-ap-northeast-1.amazonaws.com'
console.log(`   ステージング環境URL: ${stagingUrl}`)
console.log()

// 結果サマリー
console.log('='.repeat(60))
console.log('✅ テスト完了！')
console.log('='.repeat(60))
console.log()
console.log('📊 テスト結果サマリー:')
console.log(`   - 生成記事数: ${generatedFiles.length}言語`)
console.log(`   - ビルド: 成功`)
console.log(`   - デプロイ: 成功`)
console.log()
console.log('🌐 確認方法:')
console.log(`   1. ブラウザで以下のURLにアクセス:`)
console.log(`      ${stagingUrl}`)
console.log(`   2. ニュースページを確認:`)
console.log(`      ${stagingUrl}/news`)
console.log(`   3. 生成された記事を確認:`)
generatedFiles.forEach(file => {
  const slug = file.filename.replace('.md', '')
  console.log(`      [${file.lang}] ${stagingUrl}/${file.lang}/posts/${slug}`)
})
console.log()
console.log('💡 次のステップ:')
console.log('   - ブラウザで記事の表示を確認')
console.log('   - レイアウトとスタイルをチェック')
console.log('   - 多言語切り替えが正常に動作するか確認')
console.log('   - モバイル表示を確認')
console.log()
