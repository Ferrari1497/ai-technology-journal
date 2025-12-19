const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

function getAllPosts(lang = 'ja') {
  const postsDirectory = path.join(process.cwd(), 'posts', lang)
  
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(name => name.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      return {
        id: fileName.replace(/\.md$/, ''),
        date: data.date || new Date().toISOString(),
        lang
      }
    })
}

function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tech-journal.com'
  const languages = ['ja', 'en', 'th']
  
  // 全記事を取得
  const allPosts = []
  languages.forEach(lang => {
    const posts = getAllPosts(lang)
    allPosts.push(...posts)
  })
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main pages -->
  ${languages.map(lang => `
  <url>
    <loc>${baseUrl}${lang === 'ja' ? '' : '/' + lang}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('')}
  
  <!-- Archive pages -->
  ${languages.map(lang => `
  <url>
    <loc>${baseUrl}${lang === 'ja' ? '' : '/' + lang}/archive</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  <!-- Tools pages -->
  ${languages.map(lang => `
  <url>
    <loc>${baseUrl}${lang === 'ja' ? '' : '/' + lang}/tools</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  <!-- News pages -->
  ${languages.map(lang => `
  <url>
    <loc>${baseUrl}${lang === 'ja' ? '' : '/' + lang}/news</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  
  <!-- Post pages -->
  ${allPosts.map(post => `
  <url>
    <loc>${baseUrl}${post.lang === 'ja' ? '' : '/' + post.lang}/posts/${post.id}</loc>
    <lastmod>${new Date(post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`

  // publicディレクトリに保存
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(sitemapPath, sitemap)
  
  console.log(`✅ サイトマップが生成されました: ${sitemapPath}`)
  return sitemap
}

function generateRobotsTxt() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tech-journal.com'
  const isProduction = process.env.NODE_ENV === 'production' && !baseUrl.includes('staging')
  
  const robotsTxt = isProduction ? 
    `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Allow all crawlers
User-agent: *
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Crawl-delay for polite crawling
Crawl-delay: 1

# Popular crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /` :
    `User-agent: *
Disallow: /

# Staging environment - no indexing allowed`

  // publicディレクトリに保存
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
  fs.writeFileSync(robotsPath, robotsTxt)
  
  console.log(`✅ robots.txtが生成されました: ${robotsPath}`)
  return robotsTxt
}

function generateSEOFiles() {
  console.log('🔍 SEOファイルを生成中...')
  
  generateSitemap()
  generateRobotsTxt()
  
  console.log('📊 SEOファイル生成完了!')
  console.log('🌐 サイトマップ: http://localhost:3000/sitemap.xml')
  console.log('🤖 robots.txt: http://localhost:3000/robots.txt')
}

// スクリプト実行
if (require.main === module) {
  generateSEOFiles()
}

module.exports = { generateSitemap, generateRobotsTxt, generateSEOFiles }