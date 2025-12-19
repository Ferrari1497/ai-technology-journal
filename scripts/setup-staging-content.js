const fs = require('fs')
const path = require('path')
const { generateEnhancedArticle } = require('./openai-article-generator')
const { generateAINews } = require('./generate-ai-news')

async function setupStagingContent() {
  console.log('🚀 検証環境用コンテンツ生成開始...')
  
  // 既存のサンプル記事を削除
  await clearExistingPosts()
  
  // 検証用記事を生成
  await generateStagingArticles()
  
  console.log('✅ 検証環境用コンテンツ生成完了!')
}

async function clearExistingPosts() {
  console.log('🗑️ 既存のサンプル記事を削除中...')
  
  const languages = ['ja', 'en', 'th']
  
  languages.forEach(lang => {
    const postsDir = path.join(process.cwd(), 'posts', lang)
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir)
      files.forEach(file => {
        if (file.endsWith('.md')) {
          fs.unlinkSync(path.join(postsDir, file))
          console.log(`削除: ${lang}/${file}`)
        }
      })
    }
  })
}

async function generateStagingArticles() {
  console.log('📝 検証用記事を生成中...')
  
  // 1. AIニュース記事を3記事生成
  console.log('📰 AIニュース記事を3記事生成中...')
  for (let i = 0; i < 3; i++) {
    await generateAINews()
    // 少し間隔を空けて異なる記事を生成
    await sleep(1000)
  }
  
  // 2. 日次記事を3記事生成
  console.log('📄 日次記事を3記事生成中...')
  for (let i = 0; i < 3; i++) {
    await generateEnhancedArticle()
    await sleep(1000)
  }
  
  // 3. ツール記事を3記事生成
  console.log('🔧 ツール記事を3記事生成中...')
  for (let i = 0; i < 3; i++) {
    await generateToolArticle()
    await sleep(1000)
  }
}

async function generateToolArticle() {
  const { generateToolReview } = require('./generate-tool-article')
  return generateToolReview()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 実行
if (require.main === module) {
  setupStagingContent().catch(error => {
    console.error('❌ 検証環境セットアップエラー:', error)
    process.exit(1)
  })
}

module.exports = { setupStagingContent }