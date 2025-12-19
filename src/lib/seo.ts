import { Language } from './i18n'

export interface SEOData {
  title: string
  description: string
  keywords: string
  ogImage?: string
  canonicalUrl?: string
  structuredData?: any
  alternateUrls?: { [key: string]: string }
  publishedTime?: string
  modifiedTime?: string
  author?: string
  category?: string
  tags?: string[]
}

export function generateSEOData(
  title: string,
  description: string,
  lang: Language = 'ja',
  type: 'article' | 'website' | 'tool' = 'website',
  additionalData?: any
): SEOData {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tech-journal.com'
  
  // タイトルの最適化
  const optimizedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title
  const siteTitle = lang === 'ja' ? 'AIテクノロジージャーナル' : 
                   lang === 'en' ? 'AI Technology Journal' : 
                   'AI Technology Journal'
  const fullTitle = type === 'website' ? optimizedTitle : `${optimizedTitle} | ${siteTitle}`
  
  // 説明文の最適化
  const optimizedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  
  const keywords = {
    ja: 'AI,生成AI,ChatGPT,Claude,Gemini,AIツール,比較,レビュー,料金,使い方,業務効率化,SaaS',
    en: 'AI,Generative AI,ChatGPT,Claude,Gemini,AI Tools,Comparison,Review,Pricing,Tutorial,Business Efficiency,SaaS',
    th: 'AI,เครื่องมือ AI,ChatGPT,Claude,Gemini,เปรียบเทียบ,รีวิว,ราคา,วิธีใช้,ประสิทธิภาพธุรกิจ,SaaS'
  }
  
  // 多言語サポートのための代替 URL
  const alternateUrls: { [key: string]: string } = {}
  if (additionalData?.slug) {
    alternateUrls['ja'] = `${baseUrl}/posts/${additionalData.slug}`
    alternateUrls['en'] = `${baseUrl}/en/posts/${additionalData.slug}`
    alternateUrls['th'] = `${baseUrl}/th/posts/${additionalData.slug}`
  }

  let structuredData = null
  
  if (type === 'article') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": optimizedTitle,
      "description": optimizedDescription,
      "image": additionalData?.image || `${baseUrl}/favicon.ico`,
      "author": {
        "@type": "Organization",
        "name": "AI Technology Journal",
        "url": baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "AI Technology Journal",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/favicon.ico`,
          "width": 60,
          "height": 60
        },
        "url": baseUrl
      },
      "datePublished": additionalData?.date || new Date().toISOString(),
      "dateModified": additionalData?.modifiedDate || additionalData?.date || new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": additionalData?.url || baseUrl
      },
      "articleSection": additionalData?.category || "AIツール",
      "keywords": additionalData?.tags?.join(',') || keywords[lang],
      "wordCount": additionalData?.wordCount || 2000,
      "inLanguage": lang
    }
  } else if (type === 'tool') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": title,
      "description": description,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": additionalData?.pricing ? {
        "@type": "Offer",
        "price": additionalData.pricing,
        "priceCurrency": "USD"
      } : undefined,
      "aggregateRating": additionalData?.rating ? {
        "@type": "AggregateRating",
        "ratingValue": additionalData.rating,
        "bestRating": 5,
        "worstRating": 1
      } : undefined
    }
  }

  return {
    title: fullTitle,
    description: optimizedDescription,
    keywords: additionalData?.tags ? `${keywords[lang]},${additionalData.tags.join(',')}` : keywords[lang],
    ogImage: additionalData?.image || `${baseUrl}/favicon.ico`,
    canonicalUrl: additionalData?.url || baseUrl,
    structuredData,
    alternateUrls,
    publishedTime: additionalData?.date,
    modifiedTime: additionalData?.modifiedDate || additionalData?.date,
    author: additionalData?.author || 'AI Technology Journal',
    category: additionalData?.category,
    tags: additionalData?.tags
  }
}