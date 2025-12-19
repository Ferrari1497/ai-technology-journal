import { Language } from './i18n'

export interface Tool {
  id: string
  name: {
    ja: string
    en: string
    th: string
  }
  description: {
    ja: string
    en: string
    th: string
  }
  pricing: string
  rating: number
  image: string
  features: {
    ja: string[]
    en: string[]
    th: string[]
  }
  useCases: {
    ja: string[]
    en: string[]
    th: string[]
  }
  targetUsers: {
    ja: string[]
    en: string[]
    th: string[]
  }
  officialUrl: string
  freeTrialAvailable: boolean
}

export const recommendedTools: Tool[] = [
  {
    id: 'chatgpt-plus',
    name: {
      ja: 'ChatGPT Plus',
      en: 'ChatGPT Plus',
      th: 'ChatGPT Plus'
    },
    description: {
      ja: 'OpenAIが開発した最先端の対話型AI。GPT-4を使用した高精度な文章生成、コード作成、翻訳などが可能。',
      en: 'Advanced conversational AI developed by OpenAI. High-precision text generation, code creation, and translation using GPT-4.',
      th: 'AI สนทนาขั้นสูงที่พัฒนาโดย OpenAI สร้างข้อความ โค้ด และแปลภาษาด้วยความแม่นยำสูงโดยใช้ GPT-4'
    },
    pricing: '$20/月',
    rating: 4.8,
    image: 'https://picsum.photos/400/300?random=1',
    features: {
      ja: ['GPT-4アクセス', '優先アクセス', 'プラグイン対応', 'DALL-E統合'],
      en: ['GPT-4 Access', 'Priority Access', 'Plugin Support', 'DALL-E Integration'],
      th: ['เข้าถึง GPT-4', 'การเข้าถึงแบบพิเศษ', 'รองรับปลั๊กอิน', 'รวม DALL-E']
    },
    useCases: {
      ja: ['文章作成', 'コード生成', '翻訳', '要約', 'アイデア出し'],
      en: ['Content Creation', 'Code Generation', 'Translation', 'Summarization', 'Brainstorming'],
      th: ['สร้างเนื้อหา', 'สร้างโค้ด', 'แปลภาษา', 'สรุป', 'ระดมความคิด']
    },
    targetUsers: {
      ja: ['ライター', 'プログラマー', 'マーケター', '研究者'],
      en: ['Writers', 'Programmers', 'Marketers', 'Researchers'],
      th: ['นักเขียน', 'โปรแกรมเมอร์', 'นักการตลาด', 'นักวิจัย']
    },
    officialUrl: 'https://openai.com/chatgpt',
    freeTrialAvailable: true
  },
  {
    id: 'claude-pro',
    name: {
      ja: 'Claude Pro',
      en: 'Claude Pro',
      th: 'Claude Pro'
    },
    description: {
      ja: 'Anthropicが開発した安全性重視のAIアシスタント。長文処理に優れ、倫理的で正確な回答を提供。',
      en: 'Safety-focused AI assistant developed by Anthropic. Excellent at long-form processing with ethical and accurate responses.',
      th: 'ผู้ช่วย AI ที่เน้นความปลอดภัยพัฒนาโดย Anthropic เก่งในการประมวลผลข้อความยาวพร้อมคำตอบที่มีจริยธรรมและแม่นยำ'
    },
    pricing: '$20/月',
    rating: 4.7,
    image: 'https://picsum.photos/400/300?random=2',
    features: {
      ja: ['長文処理', '安全性重視', '高精度回答', 'API利用可能'],
      en: ['Long-form Processing', 'Safety-focused', 'High Accuracy', 'API Available'],
      th: ['ประมวลผลข้อความยาว', 'เน้นความปลอดภัย', 'ความแม่นยำสูง', 'มี API']
    },
    useCases: {
      ja: ['文書分析', '要約作成', '質問応答', '創作支援'],
      en: ['Document Analysis', 'Summarization', 'Q&A', 'Creative Writing'],
      th: ['วิเคราะห์เอกสาร', 'สร้างสรุป', 'ตอบคำถาม', 'ช่วยเขียนสร้างสรรค์']
    },
    targetUsers: {
      ja: ['研究者', 'アナリスト', 'ライター', '学生'],
      en: ['Researchers', 'Analysts', 'Writers', 'Students'],
      th: ['นักวิจัย', 'นักวิเคราะห์', 'นักเขียน', 'นักเรียน']
    },
    officialUrl: 'https://claude.ai',
    freeTrialAvailable: true
  },
  {
    id: 'github-copilot',
    name: {
      ja: 'GitHub Copilot',
      en: 'GitHub Copilot',
      th: 'GitHub Copilot'
    },
    description: {
      ja: 'GitHubとOpenAIが共同開発したAIペアプログラミングツール。リアルタイムでコード提案を行う。',
      en: 'AI pair programming tool co-developed by GitHub and OpenAI. Provides real-time code suggestions.',
      th: 'เครื่องมือ AI สำหรับเขียนโปรแกรมร่วมกันที่พัฒนาโดย GitHub และ OpenAI ให้คำแนะนำโค้ดแบบเรียลไทม์'
    },
    pricing: '$10/月',
    rating: 4.6,
    image: 'https://picsum.photos/400/300?random=3',
    features: {
      ja: ['リアルタイム提案', '多言語対応', 'IDE統合', 'コメント生成'],
      en: ['Real-time Suggestions', 'Multi-language', 'IDE Integration', 'Comment Generation'],
      th: ['คำแนะนำแบบเรียลไทม์', 'รองรับหลายภาษา', 'รวมกับ IDE', 'สร้างคอมเมนต์']
    },
    useCases: {
      ja: ['コード作成', 'バグ修正', 'テスト生成', 'リファクタリング'],
      en: ['Code Creation', 'Bug Fixing', 'Test Generation', 'Refactoring'],
      th: ['สร้างโค้ด', 'แก้บัก', 'สร้างเทส', 'ปรับปรุงโค้ด']
    },
    targetUsers: {
      ja: ['プログラマー', 'エンジニア', '開発者', '学生'],
      en: ['Programmers', 'Engineers', 'Developers', 'Students'],
      th: ['โปรแกรมเมอร์', 'วิศวกร', 'นักพัฒนา', 'นักเรียน']
    },
    officialUrl: 'https://github.com/features/copilot',
    freeTrialAvailable: true
  }
]

export function getToolById(id: string): Tool | undefined {
  return recommendedTools.find(tool => tool.id === id)
}

export function getToolsByCategory(category: string): Tool[] {
  // カテゴリー別フィルタリングの実装（必要に応じて拡張）
  return recommendedTools
}