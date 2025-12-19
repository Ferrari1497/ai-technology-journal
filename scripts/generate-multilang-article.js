const fs = require('fs')
const path = require('path')

// 多言語記事テンプレート
const multiLangTemplates = {
  ja: {
    category: '生成AIツール比較',
    topics: [
      'ChatGPT vs Claude vs Gemini：2025年最新機能比較',
      'AIライティングツール徹底比較：料金・精度・使いやすさ',
      'コード生成AI比較：GitHub Copilot vs Cursor vs Codeium'
    ]
  },
  en: {
    category: 'AI Tools Comparison',
    topics: [
      'ChatGPT vs Claude vs Gemini: 2025 Latest Feature Comparison',
      'AI Writing Tools Comprehensive Comparison: Pricing, Accuracy, Usability',
      'Code Generation AI Comparison: GitHub Copilot vs Cursor vs Codeium'
    ]
  },
  th: {
    category: 'เปรียบเทียบเครื่องมือ AI',
    topics: [
      'ChatGPT vs Claude vs Gemini: เปรียบเทียบฟีเจอร์ล่าสุด 2025',
      'เปรียบเทียบเครื่องมือเขียน AI: ราคา ความแม่นยำ ความใช้งานง่าย',
      'เปรียบเทียบ AI สร้างโค้ด: GitHub Copilot vs Cursor vs Codeium'
    ]
  }
}

const contentTemplates = {
  ja: (title, category) => `---
title: '${title}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${title}について詳しく解説。最新の比較データと導入事例、料金情報をまとめました。'
category: '${category}'
tags: ['AI', '比較', 'おすすめ', '料金', '導入事例']
image: 'https://picsum.photos/800/400?random=${Date.now()}'
---

# ${title}

## はじめに

現代のビジネス環境において、AI技術の活用は競争優位性を確保するための重要な要素となっています。本記事では、${title}について、最新のデータと実際の導入事例を基に詳しく解説します。

## 主要ツール・サービスの比較

| ツール名 | 月額料金 | 主要機能 | 対応言語 | 評価 |
|----------|----------|----------|----------|------|
| ツールA | $20 | 高精度処理 | 日英中 | ★★★★★ |
| ツールB | $15 | コスパ重視 | 日英 | ★★★★☆ |
| ツールC | $30 | 企業向け | 多言語 | ★★★★★ |

## 導入事例と成功要因

### 事例1：中小企業での活用
- 導入前の課題：手作業による品質管理で月100時間の工数
- 導入後の効果：AI自動検査により工数を20時間に削減
- 年間コスト削減：約480万円

## まとめ

${title}において重要なのは、自社の課題と目標を明確にした上で、適切なツールを選択することです。

---
*この記事は生成AIによって作成されており、情報に誤りがある可能性があります。最新情報は各サービスの公式サイトでご確認ください。*`,

  en: (title, category) => `---
title: '${title}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: 'Detailed explanation of ${title}. Latest comparison data, implementation cases, and pricing information.'
category: '${category}'
tags: ['AI', 'Comparison', 'Recommended', 'Pricing', 'Case Studies']
image: 'https://picsum.photos/800/400?random=${Date.now()}'
---

# ${title}

## Introduction

In today's business environment, leveraging AI technology is a crucial element for securing competitive advantage. This article provides a detailed explanation of ${title} based on the latest data and actual implementation cases.

## Comparison of Major Tools and Services

| Tool Name | Monthly Fee | Key Features | Languages | Rating |
|-----------|-------------|--------------|-----------|--------|
| Tool A | $20 | High Precision | EN/JP/CN | ★★★★★ |
| Tool B | $15 | Cost Effective | EN/JP | ★★★★☆ |
| Tool C | $30 | Enterprise | Multi-lang | ★★★★★ |

## Implementation Cases and Success Factors

### Case 1: Small Business Implementation
- Pre-implementation challenge: 100 hours/month for manual quality control
- Post-implementation effect: Reduced to 20 hours with AI automation
- Annual cost savings: Approximately $480,000

## Summary

The key to success in ${title} is to clearly define your company's challenges and goals before selecting the appropriate tools.

---
*This article was created by generative AI and may contain inaccuracies. Please check official websites for the latest information.*`,

  th: (title, category) => `---
title: '${title}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: 'คำอธิบายโดยละเอียดเกี่ยวกับ ${title} ข้อมูลเปรียบเทียบล่าสุด กรณีศึกษาการนำไปใช้ และข้อมูลราคา'
category: '${category}'
tags: ['AI', 'เปรียบเทียบ', 'แนะนำ', 'ราคา', 'กรณีศึกษา']
image: 'https://picsum.photos/800/400?random=${Date.now()}'
---

# ${title}

## บทนำ

ในสภาพแวดล้อมทางธุรกิจปัจจุบัน การใช้ประโยชน์จากเทคโนโลยี AI เป็นองค์ประกอบสำคัญในการสร้างความได้เปรียบทางการแข่งขัน บทความนี้ให้คำอธิบายโดยละเอียดเกี่ยวกับ ${title} โดยอิงจากข้อมูลล่าสุดและกรณีการนำไปใช้จริง

## เปรียบเทียบเครื่องมือและบริการหลัก

| ชื่อเครื่องมือ | ค่าใช้จ่ายรายเดือน | ฟีเจอร์หลัก | ภาษาที่รองรับ | คะแนน |
|---------------|-------------------|-------------|---------------|--------|
| เครื่องมือ A | $20 | ความแม่นยำสูง | EN/JP/CN | ★★★★★ |
| เครื่องมือ B | $15 | คุ้มค่า | EN/JP | ★★★★☆ |
| เครื่องมือ C | $30 | สำหรับองค์กร | หลายภาษา | ★★★★★ |

## กรณีศึกษาการนำไปใช้และปัจจัยแห่งความสำเร็จ

### กรณีศึกษา 1: การนำไปใช้ในธุรกิจขนาดเล็ก
- ความท้าทายก่อนการนำไปใช้: การควบคุมคุณภาพด้วยมือ 100 ชั่วโมง/เดือน
- ผลลัพธ์หลังการนำไปใช้: ลดลงเหลือ 20 ชั่วโมงด้วยระบบอัตโนมัติ AI
- การประหยัดต้นทุนรายปี: ประมาณ $480,000

## สรุป

กุญแจสำคัญของความสำเร็จใน ${title} คือการกำหนดความท้าทายและเป้าหมายของบริษัทให้ชัดเจนก่อนเลือกเครื่องมือที่เหมาะสม

---
*บทความนี้สร้างโดย AI และอาจมีข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบเว็บไซต์อย่างเป็นทางการสำหรับข้อมูลล่าสุด*`
}

function generateMultiLangArticle() {
  console.log('🚀 Starting multilingual article generation...')
  console.log(`📅 Current date: ${new Date().toISOString()}`)
  console.log(`📁 Script directory: ${__dirname}`)
  console.log(`📁 Working directory: ${process.cwd()}`)
  
  const languages = ['ja', 'en', 'th']
  const generatedFiles = []
  
  // Check if posts directory exists
  const postsBaseDir = path.join(__dirname, '..', 'posts')
  console.log(`📁 Posts base directory: ${postsBaseDir}`)
  console.log(`📁 Posts directory exists: ${fs.existsSync(postsBaseDir)}`)
  
  languages.forEach(lang => {
    console.log(`\n🌐 Processing language: ${lang}`)
    
    const template = multiLangTemplates[lang]
    const randomIndex = Math.floor(Math.random() * template.topics.length)
    const randomTopic = template.topics[randomIndex]
    
    console.log(`📝 Selected topic (index ${randomIndex}): ${randomTopic}`)
    console.log(`📂 Category: ${template.category}`)
    
    const content = contentTemplates[lang](randomTopic, template.category)
    const timestamp = Date.now()
    const filename = `${new Date().toISOString().split('T')[0]}-${timestamp}-${randomTopic.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`
    
    console.log(`📄 Generated filename: ${filename}`)
    console.log(`📊 Content length: ${content.length} characters`)
    
    const postsDir = path.join(__dirname, '..', 'posts', lang)
    console.log(`📁 Target directory: ${postsDir}`)
    console.log(`📁 Directory exists before creation: ${fs.existsSync(postsDir)}`)
    
    if (!fs.existsSync(postsDir)) {
      console.log(`📁 Creating directory: ${postsDir}`)
      fs.mkdirSync(postsDir, { recursive: true })
      console.log(`📁 Directory created successfully: ${fs.existsSync(postsDir)}`)
    }
    
    const filepath = path.join(postsDir, filename)
    console.log(`📄 Full file path: ${filepath}`)
    
    try {
      fs.writeFileSync(filepath, content, 'utf8')
      console.log(`✅ File written successfully`)
      console.log(`📊 File size: ${fs.statSync(filepath).size} bytes`)
      console.log(`📄 File exists after write: ${fs.existsSync(filepath)}`)
    } catch (error) {
      console.error(`❌ Error writing file: ${error.message}`)
      console.error(`❌ Error stack: ${error.stack}`)
      throw error
    }
    
    console.log(`✅ ${lang.toUpperCase()}記事を生成しました: ${filename}`)
    generatedFiles.push({ lang, filename, filepath })
  })
  
  console.log('\n📊 Generation Summary:')
  console.log(`📄 Total files generated: ${generatedFiles.length}`)
  generatedFiles.forEach(file => {
    console.log(`   - ${file.lang}: ${file.filename}`)
    console.log(`     Path: ${file.filepath}`)
    console.log(`     Exists: ${fs.existsSync(file.filepath)}`)
  })
  
  // Final directory check
  console.log('\n📁 Final directory structure:')
  languages.forEach(lang => {
    const langDir = path.join(__dirname, '..', 'posts', lang)
    if (fs.existsSync(langDir)) {
      const files = fs.readdirSync(langDir)
      console.log(`   ${lang}/: ${files.length} files`)
      files.forEach(file => console.log(`     - ${file}`))
    } else {
      console.log(`   ${lang}/: Directory not found`)
    }
  })
  
  console.log('🎉 Article generation completed!')
  return generatedFiles
}

// 実行
if (require.main === module) {
  try {
    console.log('🎬 Script started as main module')
    const result = generateMultiLangArticle()
    console.log('🏁 Script completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('💥 Script failed with error:')
    console.error(`❌ Error message: ${error.message}`)
    console.error(`❌ Error stack: ${error.stack}`)
    process.exit(1)
  }
}

module.exports = { generateMultiLangArticle }