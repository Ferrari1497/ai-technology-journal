const { generateEnhancedArticle } = require('./openai-article-generator')
const { generateAINews } = require('./generate-ai-news')

async function generateDailyArticles(count = 3) {
  console.log(`📄 日次記事を${count}記事生成中...`)
  
  for (let i = 0; i < count; i++) {
    console.log(`記事 ${i + 1}/${count} を生成中...`)
    await generateEnhancedArticle()
    
    // 少し間隔を空けて異なる記事を生成
    if (i < count - 1) {
      await sleep(1000)
    }
  }
  
  console.log('✅ 日次記事生成完了!')
}

async function generateAINewsArticles(count = 3) {
  console.log(`📰 AIニュース記事を${count}記事生成中...`)
  
  for (let i = 0; i < count; i++) {
    console.log(`ニュース記事 ${i + 1}/${count} を生成中...`)
    await generateAINews()
    
    if (i < count - 1) {
      await sleep(1000)
    }
  }
  
  console.log('✅ AIニュース記事生成完了!')
}

async function generateToolArticles(count = 3) {
  console.log(`🔧 ツール記事を${count}記事生成中...`)
  
  const { generateToolReview } = require('./generate-tool-article')
  
  for (let i = 0; i < count; i++) {
    console.log(`ツール記事 ${i + 1}/${count} を生成中...`)
    await generateToolReview()
    
    if (i < count - 1) {
      await sleep(1000)
    }
  }
  
  console.log('✅ ツール記事生成完了!')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// コマンドライン引数の処理
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const count = parseInt(args[1]) || 3
  
  switch (command) {
    case 'daily':
      await generateDailyArticles(count)
      break
    case 'news':
      await generateAINewsArticles(count)
      break
    case 'tools':
      await generateToolArticles(count)
      break
    case 'all':
      await generateAINewsArticles(count)
      await generateDailyArticles(count)
      await generateToolArticles(count)
      break
    default:
      console.log(`
使用方法:
  node scripts/generate-staging-articles.js <command> [count]

コマンド:
  daily   - 日次記事を生成
  news    - AIニュース記事を生成
  tools   - ツール記事を生成
  all     - 全種類の記事を生成

例:
  npm run staging:daily 3     # 日次記事を3記事生成
  npm run staging:news 2      # AIニュース記事を2記事生成
  npm run staging:tools 1     # ツール記事を1記事生成
  npm run staging:all 3       # 全種類を3記事ずつ生成
      `)
      process.exit(1)
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 記事生成エラー:', error)
    process.exit(1)
  })
}

module.exports = {
  generateDailyArticles,
  generateAINewsArticles,
  generateToolArticles
}