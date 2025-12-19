import { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import { getAllPosts, Post } from '../lib/posts'
import { Language, getTranslation } from '../lib/i18n'

interface NewsProps {
  newsPosts: {
    ja: Post[]
    en: Post[]
    th: Post[]
  }
}

export default function News({ newsPosts }: NewsProps) {
  return (
    <Layout>
      {(currentLang: Language) => {
        const posts = newsPosts[currentLang]
        
        return (
          <>
            <div className="news-header">
              <h1>🚀 AIニュース速報</h1>
              <p>最新のAI業界ニュースを毎日お届けします</p>
            </div>

            {posts.length > 0 ? (
              <div className="news-grid">
                {posts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="news-card">
                    <div className="news-badge">速報</div>
                    <h3>{post.title}</h3>
                    <p className="news-excerpt">{post.excerpt}</p>
                    <div className="news-meta">
                      <span className="news-date">{post.date}</span>
                      <span className="news-category">{post.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-news">
                <p>AIニュースはまだありません</p>
              </div>
            )}

            <div className="back-link">
              <Link href="/" className="back-button">
                ← トップページに戻る
              </Link>
            </div>
          </>
        )
      }}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const languages: Language[] = ['ja', 'en', 'th']
  const newsPosts: any = {}
  
  languages.forEach(lang => {
    const allPosts = getAllPosts(lang)
    // AIニュースカテゴリーの記事のみフィルタ
    newsPosts[lang] = allPosts.filter(post => 
      post.category === 'AIニュース' || 
      post.category === 'AI News' || 
      post.category === 'ข่าว AI'
    ).slice(0, 20) // 最新20件
  })
  
  return {
    props: {
      newsPosts,
    },
  }
}