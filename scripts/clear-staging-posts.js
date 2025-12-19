const fs = require('fs')
const path = require('path')

function clearStagingPosts() {
  console.log('🗑️ 検証環境の記事を削除中...')
  
  const languages = ['ja', 'en', 'th']
  let deletedCount = 0
  
  languages.forEach(lang => {
    const postsDir = path.join(process.cwd(), 'posts', lang)
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir)
      files.forEach(file => {
        if (file.endsWith('.md')) {
          fs.unlinkSync(path.join(postsDir, file))
          console.log(`削除: ${lang}/${file}`)
          deletedCount++
        }
      })
    }
  })
  
  console.log(`✅ ${deletedCount}件の記事を削除しました`)
  console.log('🔄 検証環境がクリーンな状態になりました')
}

// 実行
if (require.main === module) {
  clearStagingPosts()
}

module.exports = { clearStagingPosts }