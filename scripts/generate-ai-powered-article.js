const fs = require('fs')
const path = require('path')
const TitleManager = require('./title-manager')

// .env.stagingファイルから環境変数を読み込み
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.staging')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        process.env[key] = value
      }
    })
    
    console.log('📄 Loaded environment variables from .env.staging')
  } else {
    console.log('⚠️  .env.staging file not found')
  }
}

// 環境変数を読み込み
loadEnvFile()

// OpenAI APIクライアント（fetch使用）
async function callOpenAI(prompt, language = 'ja') {
  const apiKey = process.env.OPENAI_API_KEY
  
  console.log(`🔑 API Key check: ${apiKey ? `Set (${apiKey.substring(0, 10)}...)` : 'Not set'}`)
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format')
  }

  console.log(`🤖 Calling OpenAI API for ${language} article...`)
  console.log(`📝 Prompt length: ${prompt.length} characters`)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional tech writer specializing in AI tools and technology. Write high-quality, informative articles in ${language === 'ja' ? 'Japanese' : language === 'en' ? 'English' : 'Thai'}.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log(`✅ OpenAI API response received (${data.usage?.total_tokens || 'unknown'} tokens)`)
    
    return data.choices[0].message.content
  } catch (error) {
    console.error(`❌ OpenAI API call failed: ${error.message}`)
    throw error
  }
}

// 多言語プロンプトテンプレート
const promptTemplates = {
  ja: [
    "2025年最新のAIツール比較記事を2000文字程度で書いてください。ChatGPT、Claude、Geminiの機能、料金、使いやすさを詳しく比較し、実際の使用例も含めてください。",
    "AIライティングツールの徹底比較記事を2000文字程度で書いてください。各ツールの特徴、料金体系、導入事例、メリット・デメリットを詳しく解説してください。",
    "コード生成AI（GitHub Copilot、Cursor、Codeium）の比較記事を2000文字程度で書いてください。開発効率、精度、料金、対応言語などを詳しく比較してください。",
    "AI画像生成ツール（Midjourney、DALL-E、Stable Diffusion）の比較記事を2000文字程度で書いてください。画質、使いやすさ、料金、商用利用について詳しく解説してください。",
    "ビジネス向けAIチャットボット（ChatGPT Enterprise、Claude Pro、Bard）の比較記事を2000文字程度で書いてください。企業導入事例、セキュリティ、コストパフォーマンスを中心に解説してください。"
  ],
  en: [
    "Write a comprehensive 2000-word comparison article about the latest AI tools in 2025. Compare ChatGPT, Claude, and Gemini in terms of features, pricing, and usability, including real-world use cases.",
    "Write a detailed 2000-word comparison article about AI writing tools. Explain the features, pricing models, implementation cases, and pros/cons of each tool in detail.",
    "Write a comprehensive 2000-word comparison article about code generation AI tools (GitHub Copilot, Cursor, Codeium). Compare development efficiency, accuracy, pricing, and supported languages in detail.",
    "Write a detailed 2000-word comparison article about AI image generation tools (Midjourney, DALL-E, Stable Diffusion). Explain image quality, usability, pricing, and commercial usage in detail.",
    "Write a comprehensive 2000-word comparison article about business AI chatbots (ChatGPT Enterprise, Claude Pro, Bard). Focus on enterprise implementation cases, security, and cost-effectiveness."
  ],
  th: [
    "เขียนบทความเปรียบเทียบเครื่องมือ AI ล่าสุดในปี 2025 ประมาณ 2000 คำ เปรียบเทียบ ChatGPT, Claude และ Gemini ในด้านฟีเจอร์ ราคา และความใช้งานง่าย รวมถึงตัวอย่างการใช้งานจริง",
    "เขียนบทความเปรียบเทียบเครื่องมือเขียน AI อย่างละเอียด ประมาณ 2000 คำ อธิบายคุณสมบัติ โมเดลราคา กรณีศึกษาการนำไปใช้ และข้อดี-ข้อเสียของแต่ละเครื่องมือ",
    "เขียนบทความเปรียบเทียบเครื่องมือ AI สร้างโค้ด (GitHub Copilot, Cursor, Codeium) ประมาณ 2000 คำ เปรียบเทียบประสิทธิภาพการพัฒนา ความแม่นยำ ราคา และภาษาที่รองรับ",
    "เขียนบทความเปรียบเทียบเครื่องมือสร้างภาพ AI (Midjourney, DALL-E, Stable Diffusion) ประมาณ 2000 คำ อธิบายคุณภาพภาพ ความใช้งานง่าย ราคา และการใช้งานเชิงพาณิชย์",
    "เขียนบทความเปรียบเทียบแชทบอท AI สำหรับธุรกิจ (ChatGPT Enterprise, Claude Pro, Bard) ประมาณ 2000 คำ เน้นกรณีศึกษาการนำไปใช้ในองค์กร ความปลอดภัย และความคุ้มค่า"
  ]
}

// カテゴリマッピング
const categoryMapping = {
  ja: {
    0: '生成AIツール比較',
    1: 'AIライティングツール',
    2: 'コード生成AI',
    3: 'AI画像生成',
    4: 'ビジネスAI'
  },
  en: {
    0: 'AI Tools Comparison',
    1: 'AI Writing Tools',
    2: 'Code Generation AI',
    3: 'AI Image Generation',
    4: 'Business AI'
  },
  th: {
    0: 'เปรียบเทียบเครื่องมือ AI',
    1: 'เครื่องมือเขียน AI',
    2: 'AI สร้างโค้ด',
    3: 'AI สร้างภาพ',
    4: 'AI สำหรับธุรกิจ'
  }
}

// タイトル抽出関数
function extractTitle(content, language) {
  const lines = content.split('\n')
  
  // # で始まる最初の行を探す
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim()
    }
  }
  
  // 見つからない場合はデフォルトタイトル
  const defaultTitles = {
    ja: 'AI技術比較記事',
    en: 'AI Technology Comparison',
    th: 'เปรียบเทียบเทคโนโลยี AI'
  }
  
  return defaultTitles[language] || defaultTitles.ja
}

// Markdown記事生成
function createMarkdownArticle(content, title, category, language) {
  const date = new Date().toISOString().split('T')[0]
  const timestamp = Date.now()
  
  const tags = {
    ja: ['AI', '比較', 'おすすめ', '2025年', 'レビュー'],
    en: ['AI', 'Comparison', 'Review', '2025', 'Tools'],
    th: ['AI', 'เปรียบเทียบ', 'รีวิว', '2025', 'เครื่องมือ']
  }
  
  const excerpts = {
    ja: `${title}について詳しく解説。最新のAI技術比較と実用的な導入ガイドをお届けします。`,
    en: `Detailed analysis of ${title}. Latest AI technology comparison and practical implementation guide.`,
    th: `การวิเคราะห์โดยละเอียดเกี่ยวกับ ${title} การเปรียบเทียบเทคโนโลยี AI ล่าสุดและคู่มือการนำไปใช้งาน`
  }

  return `---
title: '${title}'
date: '${date}'
excerpt: '${excerpts[language]}'
category: '${category}'
tags: ${JSON.stringify(tags[language])}
image: 'https://picsum.photos/800/400?random=${timestamp}'
---

${content}

---
*この記事は生成AIによって作成されており、情報に誤りがある可能性があります。最新情報は各サービスの公式サイトでご確認ください。*`
}

// メイン関数
async function generateAIPoweredArticle() {
  console.log('🚀 Starting AI-powered article generation...')
  console.log(`📅 Current date: ${new Date().toISOString()}`)
  console.log(`🔑 OpenAI API Key set: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`)
  
  const languages = ['ja', 'en', 'th']
  const generatedFiles = []
  const titleManager = new TitleManager()
  
  // Check if posts directory exists
  const postsBaseDir = path.join(__dirname, '..', 'posts')
  console.log(`📁 Posts base directory: ${postsBaseDir}`)
  
  for (const lang of languages) {
    console.log(`\n🌐 Processing language: ${lang}`)
    
    try {
      // ランダムなプロンプトを選択
      const prompts = promptTemplates[lang]
      const randomIndex = Math.floor(Math.random() * prompts.length)
      const selectedPrompt = prompts[randomIndex]
      const category = categoryMapping[lang][randomIndex]
      
      console.log(`📝 Selected prompt index: ${randomIndex}`)
      console.log(`📂 Category: ${category}`)
      console.log(`📝 Prompt: ${selectedPrompt.substring(0, 100)}...`)
      
      // OpenAI APIを呼び出し
      const aiContent = await callOpenAI(selectedPrompt, lang)
      
      // タイトルを抽出して重複チェック
      const extractedTitle = extractTitle(aiContent, lang)
      const uniqueTitle = titleManager.generateUniqueTitle(`${lang}:${extractedTitle}`)
      const title = uniqueTitle.replace(`${lang}:`, '')
      console.log(`📄 Extracted title: ${extractedTitle}`)
      console.log(`📄 Unique title: ${title}`)
      
      // Markdown記事を作成
      const markdownContent = createMarkdownArticle(aiContent, title, category, lang)
      
      // ファイル名を生成
      const timestamp = Date.now()
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '-').substring(0, 50)
      const filename = `${new Date().toISOString().split('T')[0]}-${timestamp}-${safeTitle}.md`
      
      console.log(`📄 Generated filename: ${filename}`)
      console.log(`📊 Content length: ${markdownContent.length} characters`)
      
      // ディレクトリを作成
      const postsDir = path.join(postsBaseDir, lang)
      if (!fs.existsSync(postsDir)) {
        console.log(`📁 Creating directory: ${postsDir}`)
        fs.mkdirSync(postsDir, { recursive: true })
      }
      
      // ファイルを書き込み
      const filepath = path.join(postsDir, filename)
      fs.writeFileSync(filepath, markdownContent, 'utf8')
      
      console.log(`✅ ${lang.toUpperCase()} AI記事を生成しました: ${filename}`)
      console.log(`📊 File size: ${fs.statSync(filepath).size} bytes`)
      
      generatedFiles.push({ lang, filename, filepath, title, category })
      
      // API制限を避けるため少し待機
      if (lang !== languages[languages.length - 1]) {
        console.log('⏳ Waiting 2 seconds before next API call...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
    } catch (error) {
      console.error(`❌ Error generating ${lang} article: ${error.message}`)
      console.error(`❌ Error stack: ${error.stack}`)
      
      // エラーの場合はフォールバック記事を生成
      console.log(`🔄 Generating fallback article for ${lang}...`)
      const fallbackContent = `# AI技術の最新動向\n\n申し訳ございませんが、現在AI記事生成サービスに一時的な問題が発生しています。\n\n## 今後の予定\n\n- サービス復旧後に高品質な記事をお届けします\n- 最新のAI技術情報をお待ちください\n\n*このメッセージは自動生成されています。*`
      
      const baseFallbackTitle = 'AI技術の最新動向'
      const fallbackTitle = titleManager.generateUniqueTitle(`${lang}:${baseFallbackTitle}`).replace(`${lang}:`, '')
      const fallbackCategory = categoryMapping[lang][0]
      const markdownContent = createMarkdownArticle(fallbackContent, fallbackTitle, fallbackCategory, lang)
      
      const timestamp = Date.now()
      const filename = `${new Date().toISOString().split('T')[0]}-${timestamp}-fallback.md`
      const postsDir = path.join(postsBaseDir, lang)
      
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true })
      }
      
      const filepath = path.join(postsDir, filename)
      fs.writeFileSync(filepath, markdownContent, 'utf8')
      
      console.log(`🔄 ${lang.toUpperCase()} フォールバック記事を生成しました: ${filename}`)
      console.log(`📄 Fallback title: ${fallbackTitle}`)
      generatedFiles.push({ lang, filename, filepath, title: fallbackTitle, category: fallbackCategory })
    }
  }
  
  console.log('\n📊 Generation Summary:')
  console.log(`📄 Total files generated: ${generatedFiles.length}`)
  generatedFiles.forEach(file => {
    console.log(`   - ${file.lang}: ${file.title}`)
    console.log(`     File: ${file.filename}`)
    console.log(`     Category: ${file.category}`)
  })
  
  console.log('🎉 AI-powered article generation completed!')
  console.log(`📊 Total used titles: ${titleManager.getUsedTitlesCount()}`)
  return generatedFiles
}

// 実行
if (require.main === module) {
  generateAIPoweredArticle()
    .then(result => {
      console.log('🏁 Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Script failed with error:')
      console.error(`❌ Error message: ${error.message}`)
      console.error(`❌ Error stack: ${error.stack}`)
      process.exit(1)
    })
}

module.exports = { generateAIPoweredArticle }