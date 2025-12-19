import { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { recommendedTools, Tool } from '../../lib/tools'
import { Language, getTranslation } from '../../lib/i18n'
import AffiliateLink from '../../components/AffiliateLink'
import AdSense from '../../components/AdSense'

interface ToolsProps {
  tools: Tool[]
}

export default function Tools({ tools }: ToolsProps) {
  return (
    <Layout>
      {(currentLang: Language) => (
        <>
          <section className="tools-header">
            <h2>{getTranslation(currentLang, 'recommendedToolsList')}</h2>
            <p>{getTranslation(currentLang, 'toolsDescription')}</p>
          </section>

          <section className="tools-grid">
            {tools.map((tool) => (
              <div key={tool.id} className="tool-card">
                <div className="tool-image">
                  <img src={tool.image} alt={tool.name[currentLang]} />
                </div>
                <div className="tool-content">
                  <h3>{tool.name[currentLang]}</h3>
                  <p className="tool-description">{tool.description[currentLang]}</p>
                  
                  <div className="tool-info">
                    <div className="tool-pricing">
                      <span className="label">{getTranslation(currentLang, 'pricing')}:</span>
                      <span className="price">{tool.pricing}</span>
                    </div>
                    
                    <div className="tool-rating">
                      <span className="stars">{'★'.repeat(Math.floor(tool.rating))}</span>
                      <span className="rating-number">{tool.rating}</span>
                    </div>
                  </div>

                  <div className="tool-features">
                    <span className="label">{getTranslation(currentLang, 'features')}:</span>
                    <ul>
                      {tool.features[currentLang].slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  {tool.freeTrialAvailable && (
                    <div className="free-trial">
                      {getTranslation(currentLang, 'freeTrialAvailable')}
                    </div>
                  )}

                  <div className="tool-actions">
                    <Link href={`/tools/${tool.id}`} className="btn-secondary">
                      {getTranslation(currentLang, 'learnMore')}
                    </Link>
                    <AffiliateLink toolId={tool.id} originalUrl={tool.officialUrl} className="btn-primary">
                      {getTranslation(currentLang, 'officialSite')}
                    </AffiliateLink>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <AdSense adSlot="9876543210" style={{ margin: '40px 0' }} />
        </>
      )}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      tools: recommendedTools,
    },
  }
}