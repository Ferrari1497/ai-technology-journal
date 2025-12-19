const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')

// 環境変数を読み込み
require('dotenv').config({ path: '.env.staging' })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// AIニュースのプロンプトテンプレート
const newsPrompts = {
  ja: `最新のAI業界ニュースを1つ作成してください。必ず以下のJSON形式のみで回答してください。他の文字は一切含めないでください：

{
  "title": "【AIニュース速報】具体的なニュースタイトル",
  "summary": "ニュースの概要（100文字以内）",
  "source": "情報源（例：TechCrunch、OpenAI Blog等）",
  "url": "https://example.com/news-url",
  "category": "product-release",
  "content": "詳細な記事内容。ニュースの詳細説明、技術的な背景、業界への影響分析、今後の展望を含む。"
}

注意：JSONのみを返してください。説明文や追加のテキストは不要です。`,

  en: `Create a latest AI industry news article. Respond ONLY with the following JSON format. Do not include any other text:

{
  "title": "[AI News Flash] Specific news title",
  "summary": "News summary (within 100 characters)",
  "source": "Information source (e.g., TechCrunch, OpenAI Blog, etc.)",
  "url": "https://example.com/news-url",
  "category": "product-release",
  "content": "Detailed article content including news description, technical background, industry impact analysis, and future outlook."
}

Note: Return only JSON. No explanations or additional text needed.`,

  th: `สร้างข่าวอุตสาหกรรม AI ล่าสุด 1 ข่าว ตอบกลับเฉพาะ JSON ตามรูปแบบด้านล่างเท่านั้น อย่ารวมข้อความอื่นๆ:

{
  "title": "[ข่าวด่วน AI] หัวข้อข่าวที่เฉพาะเจาะจง",
  "summary": "สรุปข่าว (ไม่เกิน 100 ตัวอักษร)",
  "source": "แหล่งข้อมูล (เช่น TechCrunch, OpenAI Blog เป็นต้น)",
  "url": "https://example.com/news-url",
  "category": "product-release",
  "content": "เนื้อหาบทความโดยละเอียด รวมคำอธิบายข่าว ภูมิหลังทางเทคนิค การวิเคราะห์ผลกระทบ และแนวโน้มในอนาคต"
}

หมายเหตุ: ตอบกลับเฉพาะ JSON เท่านั้น ไม่ต้องการคำอธิบายหรือข้อความเพิ่มเติม`
}

const newsTemplates = {
  ja: (newsData, relatedNews, imageId) => `---
title: '${newsData.title}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${newsData.summary}'
category: 'AIニュース'
tags: ['AIニュース', '速報', '最新情報', '業界動向']
image: 'https://picsum.photos/800/400?random=${imageId}'
---

# ${newsData.title}

## ニュース概要

${newsData.summary}

## 詳細情報

${newsData.content}

### 発表内容のポイント

- **発表元**: ${newsData.source}
- **カテゴリー**: ${getCategoryLabel(newsData.category)}
- **影響度**: 業界全体に大きな影響を与える可能性

## 関連ニュース

${relatedNews.map(item => `### ${item.title}
${item.summary}
**出典**: ${item.source}`).join('\n\n')}

## 業界への影響分析

### 短期的な影響（1-3ヶ月）
- 競合他社の対応策発表
- 株価や投資動向への影響
- 開発者コミュニティでの議論活発化

### 中長期的な影響（6-12ヶ月）
- 新たなビジネスモデルの創出
- 既存サービスの機能強化
- 業界標準の変化

## まとめ

${newsData.title}は、AI業界の発展において重要なマイルストーンとなる可能性があります。今後の動向に注目が集まります。

### 関連リンク
- [元記事を読む](${newsData.url})
- [${newsData.source}公式サイト](${newsData.url})

---
*このニュース記事は生成AIによって作成されており、最新情報は各公式サイトでご確認ください。*`,

  en: (newsData, relatedNews, imageId) => `---
title: '${newsData.title}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${newsData.summary}'
category: 'AI News'
tags: ['AI News', 'Breaking', 'Latest', 'Industry Trends']
image: 'https://picsum.photos/800/400?random=${imageId}'
---

# ${newsData.title}

## News Overview

${newsData.summary}

## Detailed Information

${newsData.content}

### Key Points of the Announcement

- **Source**: ${newsData.source}
- **Category**: ${getCategoryLabel(newsData.category)}
- **Impact**: Likely to have significant industry-wide implications

## Related News

${relatedNews.map(item => `### ${item.title}
${item.summary}
**Source**: ${item.source}`).join('\n\n')}

## Industry Impact Analysis

### Short-term Impact (1-3 months)
- Competitor response announcements
- Stock price and investment trend effects
- Increased developer community discussions

### Medium to Long-term Impact (6-12 months)
- Creation of new business models
- Enhancement of existing services
- Changes in industry standards

## Summary

${newsData.title} could be an important milestone in AI industry development. Future developments will be closely watched.

### Related Links
- [Read Original Article](${newsData.url})
- [${newsData.source} Official Site](${newsData.url})

---
*This news article was created by generative AI. Please check official websites for the latest information.*`,

  th: (newsData, relatedNews, imageId) => `---
title: '${newsData.title}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${newsData.summary}'
category: 'ข่าว AI'
tags: ['ข่าว AI', 'ข่าวด่วน', 'ข้อมูลล่าสุด', 'แนวโน้มอุตสาหกรรม']
image: 'https://picsum.photos/800/400?random=${imageId}'
---

# ${newsData.title}

## ภาพรวมข่าว

${newsData.summary}

## ข้อมูลรายละเอียด

${newsData.content}

### จุดสำคัญของการประกาศ

- **แหล่งที่มา**: ${newsData.source}
- **หมวดหมู่**: ${getCategoryLabel(newsData.category)}
- **ผลกระทบ**: คาดว่าจะมีผลกระทบอย่างมีนัยสำคัญต่อทั้งอุตสาหกรรม

## ข่าวที่เกี่ยวข้อง

${relatedNews.map(item => `### ${item.title}
${item.summary}
**แหล่งที่มา**: ${item.source}`).join('\n\n')}

## การวิเคราะห์ผลกระทบต่ออุตสาหกรรม

### ผลกระทบระยะสั้น (1-3 เดือน)
- การประกาศตอบโต้จากคู่แข่ง
- ผลกระทบต่อราคาหุ้นและแนวโน้มการลงทุน
- การอภิปรายที่เพิ่มขึ้นในชุมชนนักพัฒนา

### ผลกระทบระยะกลางถึงยาว (6-12 เดือน)
- การสร้างโมเดลธุรกิจใหม่
- การเพิ่มประสิทธิภาพของบริการที่มีอยู่
- การเปลี่ยนแปลงมาตรฐานอุตสาหกรรม

## สรุป

${newsData.title} อาจเป็นจุดสำคัญในการพัฒนาอุตสาหกรรม AI การพัฒนาในอนาคตจะได้รับการติดตามอย่างใกล้ชิด

### ลิงก์ที่เกี่ยวข้อง
- [อ่านบทความต้นฉบับ](${newsData.url})
- [เว็บไซต์อย่างเป็นทางการ ${newsData.source}](${newsData.url})

---
*บทความข่าวนี้สร้างโดย AI กรุณาตรวจสอบเว็บไซต์อย่างเป็นทางการสำหรับข้อมูลล่าสุด*`
}

function getCategoryLabel(category) {
  const labels = {
    'product-release': '製品リリース',
    'product-update': '製品アップデート', 
    'performance': '性能向上',
    'regulation': '規制・法律',
    'funding': '資金調達',
    'partnership': 'パートナーシップ'
  }
  return labels[category] || category
}

async function generateNewsWithOpenAI(language) {
  try {
    console.log(`🤖 OpenAI APIで${language.toUpperCase()}ニュースを生成中...`)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは専門的なAI業界ジャーナリストです。最新のAI技術動向に詳しく、正確で魅力的なニュース記事を作成します。必ず有効なJSONフォーマットで回答してください。"
        },
        {
          role: "user",
          content: newsPrompts[language]
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    let response = completion.choices[0].message.content.trim()
    
    // JSONの前後の不要な文字を削除
    const jsonStart = response.indexOf('{')
    const jsonEnd = response.lastIndexOf('}') + 1
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      response = response.substring(jsonStart, jsonEnd)
    }
    
    // 改行文字をエスケープ
    response = response.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
    
    const newsData = JSON.parse(response)
    
    console.log(`✅ ${language.toUpperCase()}ニュース生成完了: ${newsData.title}`)
    return newsData
    
  } catch (error) {
    console.error(`❌ ${language.toUpperCase()}ニュース生成エラー:`, error.message)
    console.error(`レスポンス内容:`, completion?.choices?.[0]?.message?.content || 'なし')
    
    // フォールバック: 静的データを使用
    const fallbackNews = {
      title: language === 'ja' ? '【AIニュース速報】AI技術の最新動向' : 
             language === 'en' ? '[AI News Flash] Latest AI Technology Trends' :
             '[ข่าวด่วน AI] แนวโน้มเทคโนโลยี AI ล่าสุด',
      summary: language === 'ja' ? 'AI業界で注目される最新の技術動向をお伝えします。' :
               language === 'en' ? 'Latest technology trends in the AI industry.' :
               'แนวโน้มเทคโนโลยีล่าสุดในอุตสาหกรรม AI',
      source: 'AI Tech Journal',
      url: 'https://example.com/ai-news',
      category: 'product-update',
      content: language === 'ja' ? 'AI技術の進歩により、様々な分野で革新的な変化が起きています。機械学習、自然言語処理、コンピュータビジョンなどの技術が急速に発展し、ビジネスや日常生活に大きな影響を与えています。' :
               language === 'en' ? 'Advances in AI technology are bringing innovative changes to various fields. Technologies such as machine learning, natural language processing, and computer vision are rapidly developing and having a major impact on business and daily life.' :
               'ความก้าวหน้าของเทคโนโลยี AI กำลังนำการเปลี่ยนแปลงที่เป็นนวัตกรรมมาสู่หลายสาขา เทคโนโลยีต่างๆ เช่น การเรียนรู้ของเครื่อง การประมวลผลภาษาธรรมชาติ และการมองเห็นของคอมพิวเตอร์ กำลังพัฒนาอย่างรวดเร็วและส่งผลกระทบอย่างมากต่อธุรกิจและชีวิตประจำวัน'
    }
    
    console.log(`⚠️ ${language.toUpperCase()}フォールバック記事を使用`)
    return fallbackNews
  }
}

async function generateAINewsWithOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY環境変数が設定されていません')
    process.exit(1)
  }

  const languages = ['ja', 'en', 'th']
  const generatedFiles = []
  const newsDataByLang = {}
  
  // 各言語でニュースを生成
  for (const lang of languages) {
    newsDataByLang[lang] = await generateNewsWithOpenAI(lang)
  }
  
  // 関連ニュースを生成（簡略版）
  const relatedNews = [
    {
      title: 'AI市場の成長予測',
      summary: 'AI市場は2025年に大幅な成長が予想されています。',
      source: 'Market Research'
    },
    {
      title: '新しいAI規制の動向',
      summary: '各国でAI規制に関する議論が活発化しています。',
      source: 'Tech Policy'
    }
  ]
  
  const baseId = `ai-news-openai-${Date.now()}`
  const imageId = Date.now()
  
  // 各言語で記事ファイルを生成
  languages.forEach(lang => {
    const newsData = newsDataByLang[lang]
    const content = newsTemplates[lang](newsData, relatedNews, imageId)
    const filename = `${new Date().toISOString().split('T')[0]}-${baseId}.md`
    
    const postsDir = path.join(__dirname, '..', 'posts', lang)
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true })
    }
    
    const filepath = path.join(postsDir, filename)
    fs.writeFileSync(filepath, content, 'utf8')
    
    console.log(`📝 ${lang.toUpperCase()}記事を保存: ${filename}`)
    generatedFiles.push({ 
      lang, 
      filename, 
      title: newsData.title,
      source: 'OpenAI API'
    })
  })
  
  return generatedFiles
}

// 実行
if (require.main === module) {
  generateAINewsWithOpenAI()
    .then(files => {
      console.log('\n🎉 OpenAI APIを使用したAIニュース記事生成が完了しました!')
      files.forEach(file => {
        console.log(`   - [${file.lang}] ${file.title}`)
      })
    })
    .catch(error => {
      console.error('❌ 記事生成に失敗しました:', error)
      process.exit(1)
    })
}

module.exports = { generateAINewsWithOpenAI }