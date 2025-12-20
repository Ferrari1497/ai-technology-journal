#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🗑️ Clearing staging environment cache...')

try {
  // S3のHTMLファイルのキャッシュヘッダーを更新
  console.log('📄 Updating cache headers for HTML files...')
  
  const commands = [
    // インデックスページ
    'aws s3 cp s3://ai-tech-journal-staging-1766124861/index.html s3://ai-tech-journal-staging-1766124861/index.html --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate"',
    
    // 記事ページ（HTMLファイル）
    'aws s3 cp s3://ai-tech-journal-staging-1766124861/posts/ s3://ai-tech-journal-staging-1766124861/posts/ --recursive --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate" --exclude "*" --include "*.html"',
    
    // その他の主要ページ
    'aws s3 cp s3://ai-tech-journal-staging-1766124861/ja/ s3://ai-tech-journal-staging-1766124861/ja/ --recursive --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate" --exclude "*" --include "*.html"',
    'aws s3 cp s3://ai-tech-journal-staging-1766124861/en/ s3://ai-tech-journal-staging-1766124861/en/ --recursive --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate" --exclude "*" --include "*.html"',
    'aws s3 cp s3://ai-tech-journal-staging-1766124861/th/ s3://ai-tech-journal-staging-1766124861/th/ --recursive --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate" --exclude "*" --include "*.html"'
  ]
  
  commands.forEach((command, index) => {
    try {
      console.log(`⏳ Executing command ${index + 1}/${commands.length}...`)
      execSync(command, { stdio: 'inherit' })
    } catch (error) {
      console.log(`⚠️ Command ${index + 1} failed (this may be normal if files don't exist)`)
    }
  })
  
  console.log('\n✅ Cache clearing completed!')
  console.log('🌐 Staging URL: http://ai-tech-journal-staging-1766124861.s3-website-ap-northeast-1.amazonaws.com')
  console.log('🔐 Login: admin / staging123')
  console.log('💡 Recommendation: Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)')
  
} catch (error) {
  console.error('❌ Cache clearing failed:', error.message)
  console.log('💡 Make sure AWS CLI is configured with proper credentials')
  process.exit(1)
}