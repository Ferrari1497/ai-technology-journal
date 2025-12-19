const fs = require('fs')
const path = require('path')
const TitleManager = require('./title-manager')

function checkDuplicateTitles() {
  console.log('🔍 Checking for duplicate titles...')
  
  const titleManager = new TitleManager()
  const postsDir = path.join(__dirname, '..', 'posts')
  const languages = ['ja', 'en', 'th']
  
  let totalFiles = 0
  let duplicatesFound = 0
  const allTitles = []
  
  languages.forEach(lang => {
    const langDir = path.join(postsDir, lang)
    
    if (!fs.existsSync(langDir)) {
      console.log(`📁 Directory not found: ${langDir}`)
      return
    }
    
    const files = fs.readdirSync(langDir).filter(file => file.endsWith('.md'))
    console.log(`\n📂 Checking ${lang}/ directory: ${files.length} files`)
    
    files.forEach(file => {
      const filePath = path.join(langDir, file)
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Extract title from frontmatter
      const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m)
      if (titleMatch) {
        const title = titleMatch[1]
        const titleWithLang = `${lang}:${title}`
        
        if (allTitles.includes(titleWithLang)) {
          console.log(`❌ Duplicate found: ${title} (${file})`)
          duplicatesFound++
        } else {
          allTitles.push(titleWithLang)
        }
        
        totalFiles++
      }
    })
  })
  
  console.log(`\n📊 Summary:`)
  console.log(`📄 Total files checked: ${totalFiles}`)
  console.log(`❌ Duplicates found: ${duplicatesFound}`)
  console.log(`📝 Used titles in database: ${titleManager.getUsedTitlesCount()}`)
  console.log(`📝 Actual titles found: ${allTitles.length}`)
  
  if (duplicatesFound === 0) {
    console.log('✅ No duplicate titles found!')
  } else {
    console.log('⚠️  Duplicate titles detected. Consider running title cleanup.')
  }
  
  return {
    totalFiles,
    duplicatesFound,
    allTitles: allTitles.length,
    usedTitlesInDb: titleManager.getUsedTitlesCount()
  }
}

// 実行
if (require.main === module) {
  checkDuplicateTitles()
}

module.exports = { checkDuplicateTitles }