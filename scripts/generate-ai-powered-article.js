const fs = require('fs')
const path = require('path')
const TitleManager = require('./title-manager')
const PromptManager = require('./prompt-manager')

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
            content: `You are a professional tech writer specializing in AI tools and technology. Write comprehensive, detailed, and informative articles in ${language === 'ja' ? 'Japanese' : language === 'en' ? 'English' : 'Thai'}. Focus on providing in-depth analysis, practical examples, and actionable insights. Make sure to write at least 3000 characters for comprehensive coverage. Always create unique titles and content, even when covering similar topics.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.9,
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

// 多言語プロンプトテンプレート（より多様なトピックと長い記事）
const promptTemplates = {
  ja: [
    "2025年最新のAIツール比較記事を3000文字以上で書いてください。ChatGPT、Claude、Geminiの機能、料金、使いやすさを詳しく比較し、実際の使用例、導入事例、メリット・デメリット、将来展望も含めてください。",
    "AIライティングツールの徹底比較記事を3000文字以上で書いてください。Jasper、Copy.ai、Writesonic、Rytrなどの特徴、料金体系、導入事例、ROI分析、メリット・デメリットを詳しく解説してください。",
    "コード生成AIツールの完全ガイドを3000文字以上で書いてください。GitHub Copilot、Cursor、Codeium、Tabnine、Amazon CodeWhispererの開発効率、精度、料金、対応言語、セキュリティ機能を詳しく比較してください。",
    "AI画像生成ツールの総合レビューを3000文字以上で書いてください。Midjourney、DALL-E 3、Stable Diffusion、Adobe Firefly、Leonardo AIの画質、使いやすさ、料金、商用利用、ライセンスについて詳しく解説してください。",
    "ビジネス向けAIチャットボットの企業導入ガイドを3000文字以上で書いてください。ChatGPT Enterprise、Claude Pro、Microsoft Copilot、Google Bardの企業導入事例、セキュリティ、コストパフォーマンス、コンプライアンスを中心に解説してください。",
    "AI音声認識・音声合成ツールの最新動向を3000文字以上で書いてください。OpenAI Whisper、ElevenLabs、Murf、Speechify、Azure Speech Servicesの機能比較、精度、料金、実用事例を詳しく解説してください。",
    "AIデータ分析ツールのビジネス活用ガイドを3000文字以上で書いてください。Tableau、Power BI、DataRobot、H2O.ai、Google Analytics Intelligenceの機能、導入コスト、ROI、成功事例を詳しく解説してください。",
    "AI翻訳ツールの精度比較とビジネス活用を3000文字以上で書いてください。DeepL、Google Translate、Microsoft Translator、Amazon Translate、Papagoの精度、対応言語、料金、API連携、企業導入事例を詳しく解説してください。",
    "AI自動化ツールの導入効果と選び方ガイドを3000文字以上で書いてください。Zapier、Microsoft Power Automate、UiPath、Automation Anywhere、Blue Prismの機能比較、導入コスト、ROI分析、業務効率化事例を詳しく解説してください。"
  ],
  en: [
    "Write a comprehensive 3000+ word comparison article about the latest AI tools in 2025. Compare ChatGPT, Claude, and Gemini in terms of features, pricing, usability, real-world use cases, implementation examples, pros/cons, and future prospects.",
    "Write a detailed 3000+ word comparison article about AI writing tools. Compare Jasper, Copy.ai, Writesonic, Rytr in terms of features, pricing models, implementation cases, ROI analysis, and detailed pros/cons.",
    "Write a comprehensive 3000+ word guide about code generation AI tools. Compare GitHub Copilot, Cursor, Codeium, Tabnine, Amazon CodeWhisperer in terms of development efficiency, accuracy, pricing, supported languages, and security features.",
    "Write a detailed 3000+ word review about AI image generation tools. Compare Midjourney, DALL-E 3, Stable Diffusion, Adobe Firefly, Leonardo AI in terms of image quality, usability, pricing, commercial usage, and licensing.",
    "Write a comprehensive 3000+ word enterprise guide about business AI chatbots. Compare ChatGPT Enterprise, Claude Pro, Microsoft Copilot, Google Bard focusing on enterprise implementation, security, cost-effectiveness, and compliance.",
    "Write a detailed 3000+ word article about AI voice recognition and synthesis tools. Compare OpenAI Whisper, ElevenLabs, Murf, Speechify, Azure Speech Services in terms of features, accuracy, pricing, and practical applications.",
    "Write a comprehensive 3000+ word business guide about AI data analysis tools. Compare Tableau, Power BI, DataRobot, H2O.ai, Google Analytics Intelligence in terms of features, implementation costs, ROI, and success stories.",
    "Write a detailed 3000+ word comparison about AI translation tools for business. Compare DeepL, Google Translate, Microsoft Translator, Amazon Translate, Papago in terms of accuracy, supported languages, pricing, API integration, and enterprise use cases.",
    "Write a comprehensive 3000+ word guide about AI automation tools and their implementation benefits. Compare Zapier, Microsoft Power Automate, UiPath, Automation Anywhere, Blue Prism in terms of features, implementation costs, ROI analysis, and business efficiency cases."
  ],
  th: [
    "เขียนบทความเปรียบเทียบเครื่องมือ AI ล่าสุดในปี 2025 ประมาณ 3000+ คำ เปรียบเทียบ ChatGPT, Claude, Gemini ในด้านฟีเจอร์ ราคา ความใช้งานง่าย ตัวอย่างการใช้งานจริง ข้อดี-ข้อเสีย และแนวโน้มอนาคต",
    "เขียนบทความเปรียบเทียบเครื่องมือเขียน AI ประมาณ 3000+ คำ เปรียบเทียบ Jasper, Copy.ai, Writesonic, Rytr ในด้านคุณสมบัติ โมเดลราคา กรณีศึกษาการนำไปใช้ การวิเคราะห์ ROI และข้อดี-ข้อเสียอย่างละเอียด",
    "เขียนคู่มือครบถ้วนเกี่ยวกับเครื่องมือ AI สร้างโค้ด ประมาณ 3000+ คำ เปรียบเทียบ GitHub Copilot, Cursor, Codeium, Tabnine, Amazon CodeWhisperer ในด้านประสิทธิภาพการพัฒนา ความแม่นยำ ราคา ภาษาที่รองรับ และคุณสมบัติความปลอดภัย",
    "เขียนรีวิวครบถ้วนเกี่ยวกับเครื่องมือสร้างภาพ AI ประมาณ 3000+ คำ เปรียบเทียบ Midjourney, DALL-E 3, Stable Diffusion, Adobe Firefly, Leonardo AI ในด้านคุณภาพภาพ ความใช้งานง่าย ราคา การใช้งานเชิงพาณิชย์ และลิขสิทธิ์",
    "เขียนคู่มือองค์กรเกี่ยวกับแชทบอท AI สำหรับธุรกิจ ประมาณ 3000+ คำ เปรียบเทียบ ChatGPT Enterprise, Claude Pro, Microsoft Copilot, Google Bard เน้นการนำไปใช้ในองค์กร ความปลอดภัย ความคุ้มค่า และการปฏิบัติตามกฎระเบียบ",
    "เขียนบทความแนวโน้มล่าสุดเกี่ยวกับเครื่องมือ AI รับรู้เสียงและสังเคราะห์เสียง ประมาณ 3000+ คำ เปรียบเทียบ OpenAI Whisper, ElevenLabs, Murf, Speechify, Azure Speech Services ในด้านคุณสมบัติ ความแม่นยำ ราคา และการนำไปใช้จริง",
    "เขียนคู่มือธุรกิจเกี่ยวกับเครื่องมือวิเคราะห์ข้อมูล AI ประมาณ 3000+ คำ เปรียบเทียบ Tableau, Power BI, DataRobot, H2O.ai, Google Analytics Intelligence ในด้านคุณสมบัติ ต้นทุนการนำไปใช้ ROI และเรื่องราวความสำเร็จ",
    "เขียนบทความเปรียบเทียบเครื่องมือแปลภาษา AI สำหรับธุรกิจ ประมาณ 3000+ คำ เปรียบเทียบ DeepL, Google Translate, Microsoft Translator, Amazon Translate, Papago ในด้านความแม่นยำ ภาษาที่รองรับ ราคา การรวม API และกรณีศึกษาการใช้งานในองค์กร",
    "เขียนคู่มือครบถ้วนเกี่ยวกับเครื่องมือ AI อัตโนมัติและผลประโยชน์จากการนำไปใช้ ประมาณ 3000+ คำ เปรียบเทียบ Zapier, Microsoft Power Automate, UiPath, Automation Anywhere, Blue Prism ในด้านคุณสมบัติ ต้นทุนการนำไปใช้ การวิเคราะห์ ROI และกรณีศึกษาประสิทธิภาพทางธุรกิจ"
  ]
}

// カテゴリマッピング（9種類に拡張）
const categoryMapping = {
  ja: {
    0: '生成AIツール比較',
    1: 'AIライティングツール',
    2: 'コード生成AI',
    3: 'AI画像生成',
    4: 'ビジネスAI',
    5: 'AI音声技術',
    6: 'AIデータ分析',
    7: 'AI翻訳ツール',
    8: 'AI自動化ツール'
  },
  en: {
    0: 'AI Tools Comparison',
    1: 'AI Writing Tools',
    2: 'Code Generation AI',
    3: 'AI Image Generation',
    4: 'Business AI',
    5: 'AI Voice Technology',
    6: 'AI Data Analysis',
    7: 'AI Translation Tools',
    8: 'AI Automation Tools'
  },
  th: {
    0: 'เปรียบเทียบเครื่องมือ AI',
    1: 'เครื่องมือเขียน AI',
    2: 'AI สร้างโค้ด',
    3: 'AI สร้างภาพ',
    4: 'AI สำหรับธุรกิจ',
    5: 'เทคโนโลยีเสียง AI',
    6: 'AI วิเคราะห์ข้อมูล',
    7: 'เครื่องมือแปลภาษา AI',
    8: 'เครื่องมือ AI อัตโนมัติ'
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
  const promptManager = new PromptManager()
  
  // Check if posts directory exists
  const postsBaseDir = path.join(__dirname, '..', 'posts')
  console.log(`📁 Posts base directory: ${postsBaseDir}`)
  
  for (const lang of languages) {
    console.log(`\n🌐 Processing language: ${lang}`)
    
    try {
      // プロンプトを順次選択（ランダムではなく未使用のものを選択）
      const prompts = promptTemplates[lang]
      const selectedPrompt = promptManager.getNextAvailablePrompt(lang, prompts)
      const category = categoryMapping[lang][selectedPrompt.index]
      
      console.log(`📝 Selected prompt index: ${selectedPrompt.index}`)
      console.log(`📂 Category: ${category}`)
      console.log(`📝 Prompt: ${selectedPrompt.prompt.substring(0, 100)}...`)
      
      // If prompt is reused, add variation instruction
      let finalPrompt = selectedPrompt.prompt
      if (selectedPrompt.isReused) {
        const variations = {
          ja: '※重要：これまでに書いた記事とは異なる視点やアプローチで、ユニークなタイトルと内容にしてください。',
          en: '※Important: Please write with a different perspective or approach from previous articles, ensuring a unique title and content.',
          th: '※สำคัญ: กรุณาเขียนด้วยมุมมองหรือแนวทางที่แตกต่างจากบทความก่อนหน้า เพื่อให้ได้หัวข้อและเนื้อหาที่ไม่ซ้ำกัน'
        }
        finalPrompt = `${selectedPrompt.prompt}\n\n${variations[lang]}`
        console.log(`🔄 Added variation instruction for reused prompt`)
      }
      
      // OpenAI APIを呼び出し
      const aiContent = await callOpenAI(finalPrompt, lang)
      
      // タイトルを抽出して重複チェック
      const extractedTitle = extractTitle(aiContent, lang)
      const uniqueTitle = titleManager.generateUniqueTitle(`${lang}:${extractedTitle}`)
      const title = uniqueTitle.replace(`${lang}:`, '')
      console.log(`📄 Extracted title: ${extractedTitle}`)
      console.log(`📄 Unique title: ${title}`)
      
      // Markdown記事を作成
      const markdownContent = createMarkdownArticle(aiContent, title, category, lang)
      
      // ファイル名を生成（ユニークなタイムスタンプ付き）
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '-').substring(0, 30)
      const filename = `${new Date().toISOString().split('T')[0]}-${timestamp}-${randomSuffix}-${safeTitle}.md`
      
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
      
      const baseFallbackTitle = `AI技術の最新動向-${timestamp}`
      const fallbackTitle = titleManager.generateUniqueTitle(`${lang}:${baseFallbackTitle}`).replace(`${lang}:`, '')
      const fallbackCategory = categoryMapping[lang][0]
      const markdownContent = createMarkdownArticle(fallbackContent, fallbackTitle, fallbackCategory, lang)
      
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const filename = `${new Date().toISOString().split('T')[0]}-${timestamp}-${randomSuffix}-fallback.md`
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