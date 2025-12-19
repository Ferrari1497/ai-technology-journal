/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tech-journal.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/admin/*',
    '/seo-report',
    '/_next/*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/'
      }
    ],
    additionalSitemaps: [
      'https://ai-tech-journal.com/sitemap.xml'
    ]
  },
  transform: async (config, path) => {
    // カスタムの優先度とchangefreqを設定
    let priority = 0.7
    let changefreq = 'monthly'
    
    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.includes('/news')) {
      priority = 0.9
      changefreq = 'daily'
    } else if (path.includes('/tools') || path.includes('/archive')) {
      priority = 0.8
      changefreq = 'weekly'
    } else if (path.includes('/posts/')) {
      priority = 0.7
      changefreq = 'monthly'
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? []
    }
  },
  additionalPaths: async (config) => {
    const paths = []
    
    // 多言語対応のパスを追加
    const languages = ['ja', 'en', 'th']
    const basePages = ['/', '/archive', '/tools', '/news']
    
    languages.forEach(lang => {
      basePages.forEach(page => {
        const path = lang === 'ja' ? page : `/${lang}${page}`
        paths.push({
          loc: path,
          changefreq: page === '/' || page === '/news' ? 'daily' : 'weekly',
          priority: page === '/' ? 1.0 : page === '/news' ? 0.9 : 0.8,
          alternateRefs: languages.map(altLang => ({
            href: `${config.siteUrl}${altLang === 'ja' ? page : `/${altLang}${page}`}`,
            hreflang: altLang
          }))
        })
      })
    })
    
    return paths
  }
}