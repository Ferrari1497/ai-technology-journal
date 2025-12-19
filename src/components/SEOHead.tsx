import Head from 'next/head'
import { SEOData } from '../lib/seo'

interface SEOHeadProps extends SEOData {
  lang?: string
  type?: 'article' | 'website' | 'tool'
}

export default function SEOHead({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonicalUrl, 
  structuredData,
  alternateUrls,
  publishedTime,
  modifiedTime,
  author,
  category,
  tags,
  lang = 'ja',
  type = 'website'
}: SEOHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="language" content={lang} />
      <meta httpEquiv="content-language" content={lang} />
      
      {/* Article specific meta */}
      {type === 'article' && author && <meta name="author" content={author} />}
      {type === 'article' && category && <meta name="article:section" content={category} />}
      {type === 'article' && publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}
      {type === 'article' && tags && tags.map(tag => (
        <meta key={tag} name="article:tag" content={tag} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AI Technology Journal" />
      <meta property="og:locale" content={lang === 'ja' ? 'ja_JP' : lang === 'en' ? 'en_US' : 'th_TH'} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@aitechjournal" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Alternate URLs for multilingual support */}
      {alternateUrls && Object.entries(alternateUrls).map(([langCode, url]) => (
        <link key={langCode} rel="alternate" hrefLang={langCode} href={url} />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Head>
  )
}