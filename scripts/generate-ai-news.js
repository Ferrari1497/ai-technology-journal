const fs = require('fs')
const path = require('path')

// AIニュースのサンプルデータ（本番環境ではRSS/APIから取得）
const aiNewsData = [
  {
    title: {
      ja: 'OpenAI、GPT-5の開発を発表',
      en: 'OpenAI Announces GPT-5 Development',
      th: 'OpenAI ประกาศการพัฒนา GPT-5'
    },
    summary: {
      ja: 'OpenAIが次世代言語モデルGPT-5の開発を正式に発表。2025年後半のリリースを予定。',
      en: 'OpenAI officially announces development of next-generation language model GPT-5. Release planned for late 2025.',
      th: 'OpenAI ประกาศอย่างเป็นทางการการพัฒนาโมเดลภาษารุ่นใหม่ GPT-5 คาดว่าจะเปิดตัวในช่วงปลายปี 2025'
    },
    source: 'TechCrunch',
    url: 'https://techcrunch.com/gpt5-announcement',
    category: 'product-release'
  },
  {
    title: {
      ja: 'Google、Gemini Proの新機能を追加',
      en: 'Google Adds New Features to Gemini Pro',
      th: 'Google เพิ่มฟีเจอร์ใหม่ใน Gemini Pro'
    },
    summary: {
      ja: 'Googleが画像生成機能とコード実行機能をGemini Proに統合。開発者向け機能を大幅強化。',
      en: 'Google integrates image generation and code execution features into Gemini Pro. Significantly enhances developer-focused capabilities.',
      th: 'Google รวมฟีเจอร์การสร้างภาพและการรันโค้ดเข้าใน Gemini Pro เพิ่มความสามารถสำหรับนักพัฒนาอย่างมาก'
    },
    source: 'Google AI Blog',
    url: 'https://ai.googleblog.com/gemini-pro-update',
    category: 'product-update'
  },
  {
    title: {
      ja: 'Microsoft、Copilot for Businessを発表',
      en: 'Microsoft Announces Copilot for Business',
      th: 'Microsoft ประกาศ Copilot for Business'
    },
    summary: {
      ja: 'Microsoftが企業向けAIアシスタント「Copilot for Business」を発表。Office 365との深い統合を実現。',
      en: 'Microsoft announces enterprise AI assistant "Copilot for Business". Achieves deep integration with Office 365.',
      th: 'Microsoft ประกาศผู้ช่วย AI สำหรับองค์กร "Copilot for Business" บูรณาการอย่างลึกกับ Office 365'
    },
    source: 'Microsoft News',
    url: 'https://news.microsoft.com/copilot-business',
    category: 'product-release'
  },
  {
    title: {
      ja: 'Anthropic、Claude 3.5の性能向上を報告',
      en: 'Anthropic Reports Claude 3.5 Performance Improvements',
      th: 'Anthropic รายงานการปรับปรุงประสิทธิภาพ Claude 3.5'
    },
    summary: {
      ja: 'Anthropicが最新のClaude 3.5で推論能力が30%向上したと発表。数学問題の解答精度が大幅改善。',
      en: 'Anthropic announces 30% improvement in reasoning capabilities with latest Claude 3.5. Significant enhancement in mathematical problem-solving accuracy.',
      th: 'Anthropic ประกาศความสามารถในการใช้เหตุผลดีขึ้น 30% ใน Claude 3.5 ล่าสุด ความแม่นยำในการแก้โจทย์คณิตศาสตร์ดีขึ้นอย่างมาก'
    },
    source: 'Anthropic Blog',
    url: 'https://www.anthropic.com/claude-3-5-improvements',
    category: 'performance'
  },
  {
    title: {
      ja: 'AI規制法案、欧州議会で可決',
      en: 'AI Regulation Bill Passed by European Parliament',
      th: 'ร่างกฎหมายควบคุม AI ผ่านความเห็นชอบของรัฐสภายุโรป'
    },
    summary: {
      ja: 'EU AI法が欧州議会で正式可決。2025年から段階的に施行予定。企業のAI利用に新たな規制。',
      en: 'EU AI Act officially passed by European Parliament. Scheduled for phased implementation from 2025. New regulations for corporate AI usage.',
      th: 'กฎหมาย AI ของสหภาพยุโรปผ่านความเห็นชอบอย่างเป็นทางการ กำหนดให้บังคับใช้แบบค่อยๆ ตั้งแต่ปี 2025 ข้อบังคับใหม่สำหรับการใช้ AI ของบริษัท'
    },
    source: 'Reuters',
    url: 'https://reuters.com/eu-ai-act-passed',
    category: 'regulation'
  }
]

const newsTemplates = {
  ja: (news, relatedNews, imageId) => `---
title: '【AIニュース速報】${news.title.ja}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${news.summary.ja}'
category: 'AIニュース'
tags: ['AIニュース', '速報', '最新情報', '業界動向']
image: 'https://picsum.photos/800/400?random=${imageId}'
---

# 【AIニュース速報】${news.title.ja}

## ニュース概要

${news.summary.ja}

## 詳細情報

### 発表内容のポイント

- **発表元**: ${news.source}
- **カテゴリー**: ${getCategoryLabel(news.category)}
- **影響度**: 業界全体に大きな影響を与える可能性

### 技術的な詳細

この発表により、AI業界では以下のような変化が予想されます：

1. **競合他社への影響**: 他のAI企業も同様の機能開発を加速させる可能性
2. **ユーザーへの影響**: より高性能なAIツールが利用可能になる
3. **市場への影響**: AI市場の成長がさらに加速する見込み

## 関連ニュース

${relatedNews.map(item => `### ${item.title.ja}
${item.summary.ja}
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

${news.title.ja}は、AI業界の発展において重要なマイルストーンとなる可能性があります。今後の動向に注目が集まります。

### 関連リンク
- [元記事を読む](${news.url})
- [${news.source}公式サイト](${news.url})

---
*このニュース記事は生成AIによって作成されており、最新情報は各公式サイトでご確認ください。*`,

  en: (news, relatedNews, imageId) => `---
title: '[AI News Flash] ${news.title.en}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${news.summary.en}'
category: 'AI News'
tags: ['AI News', 'Breaking', 'Latest', 'Industry Trends']
image: 'https://picsum.photos/800/400?random=${imageId}'
---

# [AI News Flash] ${news.title.en}

## News Overview

${news.summary.en}

## Detailed Information

### Key Points of the Announcement

- **Source**: ${news.source}
- **Category**: ${getCategoryLabel(news.category)}
- **Impact**: Likely to have significant industry-wide implications

### Technical Details

This announcement is expected to bring the following changes to the AI industry:

1. **Impact on Competitors**: Other AI companies may accelerate similar feature development
2. **Impact on Users**: More powerful AI tools will become available
3. **Market Impact**: Expected to further accelerate AI market growth

## Related News

${relatedNews.map(item => `### ${item.title.en}
${item.summary.en}
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

${news.title.en} could be an important milestone in AI industry development. Future developments will be closely watched.

### Related Links
- [Read Original Article](${news.url})
- [${news.source} Official Site](${news.url})

---
*This news article was created by generative AI. Please check official websites for the latest information.*`,

  th: (news, relatedNews, imageId) => `---
title: '[ข่าวด่วน AI] ${news.title.th}'
date: '${new Date().toISOString().split('T')[0]}'
excerpt: '${news.summary.th}'
category: 'ข่าว AI'
tags: ['ข่าว AI', 'ข่าวด่วน', 'ข้อมูลล่าสุด', 'แนวโน้มอุตสาหกรรม']
image: 'https://picsum.photos/800/400?random=${imageId}'
---

# [ข่าวด่วน AI] ${news.title.th}

## ภาพรวมข่าว

${news.summary.th}

## ข้อมูลรายละเอียด

### จุดสำคัญของการประกาศ

- **แหล่งที่มา**: ${news.source}
- **หมวดหมู่**: ${getCategoryLabel(news.category)}
- **ผลกระทบ**: คาดว่าจะมีผลกระทบอย่างมีนัยสำคัญต่อทั้งอุตสาหกรรม

## ข่าวที่เกี่ยวข้อง

${relatedNews.map(item => `### ${item.title.th}
${item.summary.th}
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

${news.title.th} อาจเป็นจุดสำคัญในการพัฒนาอุตสาหกรรม AI การพัฒนาในอนาคตจะได้รับการติดตามอย่างใกล้ชิด

### ลิงก์ที่เกี่ยวข้อง
- [อ่านบทความต้นฉบับ](${news.url})
- [เว็บไซต์อย่างเป็นทางการ ${news.source}](${news.url})

---
*บทความข่าวนี้สร้างโดย AI กรุณาตรวจสอบเว็บไซต์อย่างเป็นทางการสำหรับข้อมูลล่าสุด*`
}

function getCategoryLabel(category) {
  const labels = {
    'product-release': '製品リリース',
    'product-update': '製品アップデート', 
    'performance': '性能向上',
    'regulation': '規制・法律'
  }
  return labels[category] || category
}

function generateAINews() {
  const languages = ['ja', 'en', 'th']
  const generatedFiles = []
  
  // ランダムにメインニュースを選択
  const mainNews = aiNewsData[Math.floor(Math.random() * aiNewsData.length)]
  const relatedNews = aiNewsData.filter(news => news !== mainNews).slice(0, 2)
  
  // 全言語で同じIDと画像IDを使用
  const baseId = `ai-news-${Date.now()}`
  const imageId = Date.now()
  
  languages.forEach(lang => {
    const content = newsTemplates[lang](mainNews, relatedNews, imageId)
    const filename = `${new Date().toISOString().split('T')[0]}-${baseId}.md`
    
    const postsDir = path.join(__dirname, '..', 'posts', lang)
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true })
    }
    
    const filepath = path.join(postsDir, filename)
    fs.writeFileSync(filepath, content, 'utf8')
    
    console.log(`${lang.toUpperCase()}ニュース記事を生成しました: ${filename}`)
    generatedFiles.push({ lang, filename, title: mainNews.title[lang] })
  })
  
  return generatedFiles
}

// 実行
if (require.main === module) {
  generateAINews()
}

module.exports = { generateAINews }