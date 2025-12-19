import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { Language } from './i18n'

function getPostsDirectory(lang: Language = 'ja'): string {
  return path.join(process.cwd(), 'posts', lang)
}

export interface Post {
  id: string
  title: string
  date: string
  excerpt: string
  category: string
  tags: string[]
  content: string
  image?: string
}

export function getAllPosts(lang: Language = 'ja'): Post[] {
  const postsDirectory = getPostsDirectory(lang)
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      ...matterResult.data,
      content: matterResult.content,
    } as Post
  })

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getRecentPosts(lang: Language = 'ja'): { thisMonth: Post[], lastMonth: Post[], older: Post[] } {
  const posts = getAllPosts(lang)
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return {
    thisMonth: posts.filter(post => {
      const postDate = new Date(post.date)
      return postDate >= thisMonth && postDate < nextMonth
    }),
    lastMonth: posts.filter(post => {
      const postDate = new Date(post.date)
      return postDate >= lastMonth && postDate < thisMonth
    }),
    older: posts.filter(post => new Date(post.date) < lastMonth)
  }
}

function convertMarkdownTables(content: string): string {
  // マークダウンの表をHTMLテーブルに変換
  return content.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map((cell: string) => cell.trim())
    const isHeader = content.includes('---')
    
    if (isHeader) {
      return '' // ヘッダー区切り行は削除
    }
    
    const tag = cells.every((cell: string) => cell.includes('---')) ? '' : 
               cells[0] && !cells[0].includes('---') ? 'tr' : 'tr'
    
    if (tag === 'tr') {
      const cellTags = cells.map((cell: string) => 
        cell.includes('**') || /^[A-Z]/.test(cell) ? `<th>${cell.replace(/\*\*/g, '')}</th>` : `<td>${cell}</td>`
      ).join('')
      return `<${tag}>${cellTags}</${tag}>`
    }
    return match
  })
}

export async function getPostData(id: string, lang: Language = 'ja'): Promise<Post> {
  const postsDirectory = getPostsDirectory(lang)
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  // マークダウンの表を事前に変換
  let processedMarkdown = matterResult.content
  
  // 表の変換
  processedMarkdown = processedMarkdown.replace(
    /(\|.+\|\n)+/g,
    (tableMatch) => {
      const lines = tableMatch.trim().split('\n')
      const headerLine = lines[0]
      const separatorLine = lines[1]
      const dataLines = lines.slice(2)
      
      if (separatorLine && separatorLine.includes('---')) {
        const headers = headerLine.split('|').map(h => h.trim()).filter(h => h)
        const rows = dataLines.map(line => 
          line.split('|').map(cell => cell.trim()).filter(cell => cell)
        )
        
        let tableHtml = '<table>\n<thead>\n<tr>'
        headers.forEach(header => {
          tableHtml += `<th>${header}</th>`
        })
        tableHtml += '</tr>\n</thead>\n<tbody>\n'
        
        rows.forEach(row => {
          tableHtml += '<tr>'
          row.forEach(cell => {
            tableHtml += `<td>${cell}</td>`
          })
          tableHtml += '</tr>\n'
        })
        
        tableHtml += '</tbody>\n</table>\n'
        return tableHtml
      }
      return tableMatch
    }
  )
  
  const processedContent = await remark().use(html).process(processedMarkdown)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  } as Post
}