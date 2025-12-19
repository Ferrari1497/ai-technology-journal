import { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import { getAllPosts, Post } from '../lib/posts'
import { Language, getTranslation } from '../lib/i18n'

interface ArchiveProps {
  allPosts: {
    ja: Post[]
    en: Post[]
    th: Post[]
  }
}

export default function Archive({ allPosts }: ArchiveProps) {
  return (
    <Layout>
      {(currentLang: Language) => {
        const posts = allPosts[currentLang]
        
        return (
          <>
            <div className="archive-header">
              <h2>{getTranslation(currentLang, 'allArticles')}</h2>
              <p>{getTranslation(currentLang, 'allArticlesDescription')}</p>
            </div>

            {posts.length > 0 ? (
              <div className="posts-grid">
                {posts.map((post) => (
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
              <div className="no-posts">
                <p>{getTranslation(currentLang, 'noArticles')}</p>
              </div>
            )}

            <div className="back-link">
              <Link href="/" className="back-button">
                {getTranslation(currentLang, 'backToHome')}
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
  const allPosts: any = {}
  
  languages.forEach(lang => {
    allPosts[lang] = getAllPosts(lang)
  })
  
  return {
    props: {
      allPosts,
    },
  }
}