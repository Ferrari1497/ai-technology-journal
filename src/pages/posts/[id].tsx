import { GetStaticProps, GetStaticPaths } from 'next'
import Layout from '../../components/Layout'
import { getAllPosts, getPostData, Post } from '../../lib/posts'
import { Language, getTranslation } from '../../lib/i18n'

interface PostProps {
  allPosts: {
    ja?: Post
    en?: Post
    th?: Post
  }
  postId: string
}

export default function PostPage({ allPosts, postId }: PostProps) {
  return (
    <Layout>
      {(currentLang: Language) => {
        const post = allPosts[currentLang]
        
        if (!post) {
          return (
            <div className="no-posts">
              {getTranslation(currentLang, 'noArticles')}
            </div>
          )
        }
        
        return (
        <article className="post">
          <header className="post-header">
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span className="category">{post.category}</span>
              <span className="date">{post.date}</span>
            </div>
            <div className="tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </header>

          <div className="ad-space">
            <div className="ad-banner">{getTranslation(currentLang, 'adSpaceTop')}</div>
          </div>

          {post.image ? (
            <div className="post-image">
              <img src={post.image} alt={post.title} onError={(e) => console.log('Image failed to load:', post.image)} />
            </div>
          ) : (
            <div className="post-image-debug">
              <p>No image set</p>
            </div>
          )}

          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="ad-space">
            <div className="ad-banner">{getTranslation(currentLang, 'adSpaceBottom')}</div>
          </div>

          <div className="affiliate-section">
            <h3>{getTranslation(currentLang, 'recommendedTools')}</h3>
            <div className="affiliate-links">
              <a href="#" className="affiliate-link">{getTranslation(currentLang, 'chatgptPlusOfficial')}</a>
              <a href="#" className="affiliate-link">{getTranslation(currentLang, 'claudeProOfficial')}</a>
            </div>
          </div>
        </article>
        )
      }}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const languages: Language[] = ['ja', 'en', 'th']
  const paths: { params: { id: string } }[] = []
  
  languages.forEach(lang => {
    const posts = getAllPosts(lang)
    posts.forEach(post => {
      paths.push({ params: { id: post.id } })
    })
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params!.id as string
  const languages: Language[] = ['ja', 'en', 'th']
  const allPosts: any = {}
  
  for (const lang of languages) {
    try {
      allPosts[lang] = await getPostData(id, lang)
    } catch (error) {
      // 言語版が存在しない場合はスキップ
    }
  }
  
  // 少なくとも1つの言語版が存在する場合のみページを生成
  if (Object.keys(allPosts).length === 0) {
    return {
      notFound: true,
    }
  }
  
  return {
    props: {
      allPosts,
      postId: id,
    },
  }
}