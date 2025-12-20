const fs = require('fs')
const path = require('path')
const TitleManager = require('./title-manager')

// OpenAI API設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required')
  process.exit(1)
}

// カテゴリー定義
const categories = {
  'AI_TOOLS': {
    ja: { name: '生成AIツール比較', description: 'ChatGPT、Claude、Geminiなどの生成AIツールの比較・レビュー記事' },
    en: { name: 'AI Tools Comparison', description: 'Comparison and review articles of generative AI tools like ChatGPT, Claude, Gemini' },
    th: { name: 'เปรียบเทียบเครื่องมือ AI', description: 'บทความเปรียบเทียบและรีวิวเครื่องมือ AI เช่น ChatGPT, Claude, Gemini' }
  },
  'SAAS': {
    ja: { name: 'SaaS紹介', description: 'AIを活用したSaaSツールの紹介・導入事例記事' },
    en: { name: 'SaaS Introduction', description: 'Introduction and implementation case articles of AI-powered SaaS tools' },
    th: { name: 'แนะนำ SaaS', description: 'บทความแนะนำและกรณีศึกษาการใช้งานเครื่องมือ SaaS ที่ใช้ AI' }
  },
  'PRODUCTIVITY': {
    ja: { name: '業務効率化', description: 'AIを使った業務効率化の方法・事例記事' },
    en: { name: 'Business Efficiency', description: 'Methods and case studies for business efficiency using AI' },
    th: { name: 'ประสิทธิภาพการทำงาน', description: 'วิธีการและกรณีศึกษาการเพิ่มประสิทธิภาพการทำงานด้วย AI' }
  }
}

// OpenAI API呼び出し関数
async function callOpenAI(prompt, maxTokens = 4000) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('❌ OpenAI API call failed:', error.message)
    throw error
  }
}

// 記事生成プロンプト作成
function createArticlePrompt(lang, categoryInfo) {
  const prompts = {
    ja: `あなたは日本のAI技術専門ライターです。以下の条件で記事を生成してください：

カテゴリー: ${categoryInfo.name}
説明: ${categoryInfo.description}

要件:
1. 2000文字程度の高品質な記事
2. SEO最適化されたタイトル（30-40文字）
3. 実用的で具体的な内容
4. 最新のAI技術動向を反映
5. 読者にとって価値のある情報

出力形式:
---
title: '[生成されたタイトル]'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '[記事の要約（100文字程度）]'
category: '${categoryInfo.name}'
tags: ['AI', 'タグ2', 'タグ3', 'タグ4', 'タグ5']
image: 'https://picsum.photos/800/400?random=${Date.now()}'
---

[記事本文をMarkdown形式で記述]

記事の最後に以下を追加:
---
*この記事は生成AIによって作成されており、情報に誤りがある可能性があります。最新情報は各サービスの公式サイトでご確認ください。*`,

    en: `You are an AI technology specialist writer. Generate an article with the following conditions:

Category: ${categoryInfo.name}
Description: ${categoryInfo.description}

Requirements:
1. High-quality article of approximately 2000 words
2. SEO-optimized title (30-60 characters)
3. Practical and specific content
4. Reflect latest AI technology trends
5. Valuable information for readers

Output format:
---
title: '[Generated Title]'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '[Article summary (about 100 characters)]'
category: '${categoryInfo.name}'
tags: ['AI', 'tag2', 'tag3', 'tag4', 'tag5']
image: 'https://picsum.photos/800/400?random=${Date.now()}'
---

[Article content in Markdown format]

Add this at the end:
---
*This article was created by generative AI and may contain inaccuracies. Please check official websites for the latest information.*`,

    th: `คุณเป็นนักเขียนผู้เชี่ยวชาญด้านเทคโนโลยี AI สร้างบทความตามเงื่อนไขต่อไปนี้:

หมวดหมู่: ${categoryInfo.name}
คำอธิบาย: ${categoryInfo.description}

ข้อกำหนด:
1. บทความคุณภาพสูงประมาณ 2000 คำ
2. หัวข้อที่เหมาะสมกับ SEO (30-60 ตัวอักษร)
3. เนื้อหาที่ใช้งานได้จริงและเฉพาะเจาะจง
4. สะท้อนแนวโน้มเทคโนโลยี AI ล่าสุด
5. ข้อมูลที่มีคุณค่าสำหรับผู้อ่าน

รูปแบบผลลัพธ์:
---
title: '[หัวข้อที่สร้างขึ้น]'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '[สรุปบทความ (ประมาณ 100 ตัวอักษร)]'
category: '${categoryInfo.name}'
tags: ['AI', 'แท็ก2', 'แท็ก3', 'แท็ก4', 'แท็ก5']
image: 'https://picsum.photos/800/400?random=${Date.now()}'
---

[เนื้อหาบทความในรูปแบบ Markdown]

เพิ่มข้อความนี้ที่ท้ายบทความ:
---
*บทความนี้สร้างโดย AI และอาจมีข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบเว็บไซต์อย่างเป็นทางการสำหรับข้อมูลล่าสุด*`
  }

  return prompts[lang]
}

// メイン記事生成関数
async function generateAIPoweredArticle() {
  console.log('🤖 Starting AI-powered article generation...')
  console.log(`📅 Current date: ${new Date().toISOString()}`)
  
  const languages = ['ja', 'en', 'th']
  const generatedFiles = []
  
  // カテゴリーローテーション
  const categoryKeys = Object.keys(categories)
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const selectedCategoryKey = categoryKeys[dayOfYear % categoryKeys.length]
  
  console.log(`🔄 Category rotation: Day ${dayOfYear}, Selected category: ${selectedCategoryKey}`)
  
  const titleManager = new TitleManager()
  
  for (const lang of languages) {
    console.log(`\n🌐 Processing language: ${lang}`)
    
    const categoryInfo = categories[selectedCategoryKey][lang]
    console.log(`📂 Category: ${categoryInfo.name}`)
    console.log(`📝 Description: ${categoryInfo.description}`)
    
    try {
      // OpenAI APIで記事生成
      console.log('🤖 Calling OpenAI API...')
      const prompt = createArticlePrompt(lang, categoryInfo)
      const generatedContent = await callOpenAI(prompt, 4000)
      
      // タイトル抽出
      const titleMatch = generatedContent.match(/title:\s*['"]([^'"]+)['"]/i)
      if (!titleMatch) {
        throw new Error('Failed to extract title from generated content')
      }
      
      const extractedTitle = titleMatch[1]
      console.log(`📝 Generated title: ${extractedTitle}`)
      
      // タイトル重複チェック
      const uniqueTitle = titleManager.generateUniqueTitle(`${lang}:${extractedTitle}`)
      const finalTitle = uniqueTitle.replace(`${lang}:`, '')
      
      // タイトルを更新した最終コンテンツ
      const finalContent = generatedContent.replace(
        /title:\s*['"][^'"]+['"]/i,
        `title: '${finalTitle}'`
      )
      
      // ファイル名生成
      const timestamp = Date.now()
      const filename = `${new Date().toISOString().split('T')[0]}-${timestamp}-${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`
      
      console.log(`📄 Generated filename: ${filename}`)
      console.log(`📊 Content length: ${finalContent.length} characters`)
      
      // ディレクトリ作成
      const postsDir = path.join(__dirname, '..', 'posts', lang)
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true })
      }
      
      // ファイル保存
      const filepath = path.join(postsDir, filename)
      fs.writeFileSync(filepath, finalContent, 'utf8')
      
      console.log(`✅ ${lang.toUpperCase()} article generated: ${filename}`)
      generatedFiles.push({ 
        lang, 
        filename, 
        filepath, 
        title: finalTitle, 
        category: categoryInfo.name 
      })
      
      // API制限を避けるため少し待機
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ Failed to generate article for ${lang}:`, error.message)
    }
  }
  
  console.log('\n📊 Generation Summary:')
  console.log(`📄 Total files generated: ${generatedFiles.length}`)
  console.log(`🔄 Selected category: ${selectedCategoryKey}`)
  generatedFiles.forEach(file => {
    console.log(`   - ${file.lang}: ${file.title}`)
    console.log(`     File: ${file.filename}`)
    console.log(`     Category: ${file.category}`)
  })
  
  console.log('🎉 AI-powered article generation completed!')
  return generatedFiles
}

// 実行
if (require.main === module) {
  generateAIPoweredArticle()
    .then(() => {
      console.log('🏁 Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { generateAIPoweredArticle }