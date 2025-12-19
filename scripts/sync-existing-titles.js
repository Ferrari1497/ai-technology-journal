const fs = require('fs')
const path = require('path')
const TitleManager = require('./title-manager')

function syncExistingTitles() {
  console.log('🔄 Syncing existing titles to database...')
  
  const titleManager = new TitleManager()
  const postsDir = path.join(__dirname, '..', 'posts')
  const languages = ['ja', 'en', 'th']
  
  let totalFiles = 0
  let titlesAdded = 0
  
  // Clear existing titles first
  titleManager.clearAllTitles()
  console.log('🗑️  Cleared existing title database')
  
  languages.forEach(lang => {
    const langDir = path.join(postsDir, lang)
    
    if (!fs.existsSync(langDir)) {
      console.log(`📁 Directory not found: ${langDir}`)
      return
    }
    
    const files = fs.readdirSync(langDir).filter(file => file.endsWith('.md'))
    console.log(`\n📂 Processing ${lang}/ directory: ${files.length} files`)
    
    files.forEach(file => {
      const filePath = path.join(langDir, file)
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Extract title from frontmatter
      const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m)
      if (titleMatch) {
        const title = titleMatch[1]
        const titleWithLang = `${lang}:${title}`
        
        if (titleManager.addTitle(titleWithLang)) {
          console.log(`✅ Added: ${title}`)
          titlesAdded++
        } else {
          console.log(`⚠️  Already exists: ${title}`)
        }
        
        totalFiles++
      } else {
        console.log(`❌ No title found in: ${file}`)
      }
    })
  })
  
  console.log(`\n📊 Sync Summary:`)
  console.log(`📄 Total files processed: ${totalFiles}`)
  console.log(`✅ Titles added to database: ${titlesAdded}`)
  console.log(`📝 Total titles in database: ${titleManager.getUsedTitlesCount()}`)
  
  return {
    totalFiles,
    titlesAdded,
    totalInDatabase: titleManager.getUsedTitlesCount()
  }
}

// 実行
if (require.main === module) {
  syncExistingTitles()
}

module.exports = { syncExistingTitles }