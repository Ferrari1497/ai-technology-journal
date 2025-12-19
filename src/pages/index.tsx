import { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import { getRecentPosts, getAllPosts, Post } from '../lib/posts'
import { recommendedTools, Tool } from '../lib/tools'
import { Language, getTranslation } from '../lib/i18n'
import { useEffect, useState } from 'react'

interface HomeProps {
  allPosts: {
    ja: { thisMonth: Post[], lastMonth: Post[], hasOlderPosts: boolean, latest20: Post[] }
    en: { thisMonth: Post[], lastMonth: Post[], hasOlderPosts: boolean, latest20: Post[] }
    th: { thisMonth: Post[], lastMonth: Post[], hasOlderPosts: boolean, latest20: Post[] }
  }
  featuredTools: Tool[]
}

export default function Home({ allPosts, featuredTools }: HomeProps) {
  return (
    <Layout>
      {(currentLang: Language) => {
        const { thisMonth, lastMonth, hasOlderPosts, latest20 } = allPosts[currentLang]
        
        return (
          <>
            <section className="hero">
              <h2>{getTranslation(currentLang, 'heroTitle')}</h2>
              <p dangerouslySetInnerHTML={{ __html: getTranslation(currentLang, 'heroDescription') }} />
            </section>

          <section className="monthly-posts">
            <h3>{getTranslation(currentLang, 'thisMonth')}</h3>
            {thisMonth.length > 0 ? (
              <div className="posts-grid">
                {thisMonth.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="post-card">
                    <h4>{post.title}</h4>
                    <p>{post.excerpt}</p>
                    <div className="post-meta">
                      <span className="category">{post.category}</span>
                      <span className="date">{post.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-posts">{getTranslation(currentLang, 'noPostsThisMonth')}</p>
            )}
          </section>

          <section className="featured-tools">
            <h3>{getTranslation(currentLang, 'thisMonthTools')}</h3>
            <div className="tools-grid-home">
              {featuredTools.map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`} className="tool-card-home">
                  <div className="tool-image-home">
                    <img src={tool.image} alt={tool.name[currentLang]} />
                  </div>
                  <div className="tool-info-home">
                    <h4>{tool.name[currentLang]}</h4>
                    <p className="tool-price">{tool.pricing}</p>
                    <div className="tool-rating-home">
                      <span className="stars">{'★'.repeat(Math.floor(tool.rating))}</span>
                      <span className="rating-number">{tool.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="ai-news-section">
            <div className="section-header">
              <h3>{getTranslation(currentLang, 'aiNews')}</h3>
              <Link href="/news" className="view-all-link">
                {getTranslation(currentLang, 'viewAllNews')}
              </Link>
            </div>
            <div className="news-preview">
              {allPosts[currentLang].latest20.filter(post => {
                const aiNewsCategories = {
                  ja: 'AIニュース',
                  en: 'AI News', 
                  th: 'ข่าว AI'
                }
                return post.category === aiNewsCategories[currentLang]
              }).slice(0, 3).map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="news-preview-item">
                  <div className="news-badge">{getTranslation(currentLang, 'breaking')}</div>
                  <h4>{post.title}</h4>
                  <p>{post.excerpt}</p>
                  <span className="news-date">{post.date}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="latest-articles">
            <div className="section-header">
              <h3>{getTranslation(currentLang, 'latestArticles')}</h3>
              <Link href="/archive" className="view-all-link">
                {getTranslation(currentLang, 'viewAllArticles')}
              </Link>
            </div>
            <div className="articles-list">
              {latest20.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="article-item">
                  <div className="article-info">
                    <h4>{post.title}</h4>
                    <div className="article-meta">
                      <span className="category">{post.category}</span>
                      <span className="date">{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {hasOlderPosts && (
            <section className="archive-link">
              <Link href="/archive" className="archive-button">
                {getTranslation(currentLang, 'viewOlderPosts')}
              </Link>
            </section>
          )}
          </>
        )
      }}


    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const languages: Language[] = ['ja', 'en', 'th']
  const allPosts: any = {}
  
  languages.forEach(lang => {
    const { thisMonth, lastMonth, older } = getRecentPosts(lang)
    const allPostsForLang = getAllPosts(lang)
    allPosts[lang] = {
      thisMonth: thisMonth.slice(0, 6),
      lastMonth: lastMonth.slice(0, 6),
      hasOlderPosts: older.length > 0,
      latest20: allPostsForLang.slice(0, 10)
    }
  })
  
  return {
    props: {
      allPosts,
      featuredTools: recommendedTools.slice(0, 3),
    },
  }
}