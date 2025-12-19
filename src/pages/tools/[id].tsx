import { GetStaticProps, GetStaticPaths } from 'next'
import Layout from '../../components/Layout'
import { recommendedTools, getToolById, Tool } from '../../lib/tools'
import { Language, getTranslation } from '../../lib/i18n'
import AffiliateLink from '../../components/AffiliateLink'
import AdSense from '../../components/AdSense'

interface ToolDetailProps {
  tool: Tool
}

export default function ToolDetail({ tool }: ToolDetailProps) {
  return (
    <Layout>
      {(currentLang: Language) => (
        <article className="tool-detail">
          <div className="tool-hero">
            <div className="tool-hero-content">
              <h1>{tool.name[currentLang]}</h1>
              <p className="tool-hero-description">{tool.description[currentLang]}</p>
              <div className="tool-hero-meta">
                <div className="tool-pricing">
                  <span className="label">{getTranslation(currentLang, 'pricing')}:</span>
                  <span className="price">{tool.pricing}</span>
                </div>
                <div className="tool-rating">
                  <span className="stars">{'★'.repeat(Math.floor(tool.rating))}</span>
                  <span className="rating-number">{tool.rating}</span>
                </div>
              </div>
            </div>
            <div className="tool-hero-image">
              <img src={tool.image} alt={tool.name[currentLang]} />
            </div>
          </div>

          <AdSense adSlot="1111111111" style={{ margin: '30px 0' }} />

          <div className="tool-details">
            <div className="tool-pricing-section">
              <h2>{getTranslation(currentLang, 'pricing')}</h2>
              <div className="pricing-card">
                <div className="price-main">{tool.pricing}</div>
                {tool.freeTrialAvailable && (
                  <div className="free-trial-badge">
                    {getTranslation(currentLang, 'freeTrialAvailable')}
                  </div>
                )}
              </div>
            </div>

            <div className="tool-description-section">
              <h2>{getTranslation(currentLang, 'features')}</h2>
              <div className="detailed-description">
                <p>{tool.description[currentLang]}</p>
              </div>
            </div>

            <div className="tool-features-section">
              <h2>{getTranslation(currentLang, 'features')}</h2>
              <ul className="features-list">
                {tool.features[currentLang].map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="tool-usecases-section">
              <h2>{getTranslation(currentLang, 'useCases')}</h2>
              <ul className="usecases-list">
                {tool.useCases[currentLang].map((useCase, index) => (
                  <li key={index}>{useCase}</li>
                ))}
              </ul>
            </div>

            <div className="tool-target-section">
              <h2>{getTranslation(currentLang, 'targetUsers')}</h2>
              <div className="target-users">
                {tool.targetUsers[currentLang].map((user, index) => (
                  <span key={index} className="target-user-tag">{user}</span>
                ))}
              </div>
            </div>

            <div className="tool-cta">
              <AffiliateLink toolId={tool.id} originalUrl={tool.officialUrl} className="cta-button">
                {getTranslation(currentLang, 'officialSite')}
              </AffiliateLink>
            </div>
          </div>

          <AdSense adSlot="2222222222" style={{ margin: '30px 0' }} />
        </article>
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = recommendedTools.map((tool) => ({
    params: { id: tool.id },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tool = getToolById(params!.id as string)
  
  if (!tool) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      tool,
    },
  }
}