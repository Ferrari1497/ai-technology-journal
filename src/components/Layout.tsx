import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Language, getTranslation } from '../lib/i18n'
import { generateSEOData } from '../lib/seo'
import HamburgerMenu from './HamburgerMenu'
import AdSense from './AdSense'
import SEOHead from './SEOHead'

interface LayoutProps {
  children: React.ReactNode | ((lang: Language) => React.ReactNode)
  title?: string
  description?: string
  seoData?: any
}

export default function Layout({ children, title, description, seoData }: LayoutProps) {
  const [currentLang, setCurrentLang] = useState<Language>('ja')
  
  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') as Language
    if (savedLang && ['ja', 'en', 'th'].includes(savedLang)) {
      setCurrentLang(savedLang)
    }
  }, [])
  
  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang)
    localStorage.setItem('selectedLanguage', lang)
  }
  
  const pageTitle = title || getTranslation(currentLang, 'siteTitle')
  const pageDescription = description || getTranslation(currentLang, 'heroDescription')
  
  const flags = [
    { code: 'ja' as Language, flag: '🇯🇵', name: '日本語' },
    { code: 'en' as Language, flag: '🇺🇸', name: 'English' },
    { code: 'th' as Language, flag: '🇹🇭', name: 'ไทย' }
  ]
  return (
    <>
      {seoData ? (
        <SEOHead {...seoData} lang={currentLang} />
      ) : (
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      )}
      
      <header>
        <div className="header-container">
          <Link href="/">
            <h1>{getTranslation(currentLang, 'siteTitle')}</h1>
          </Link>
          <div className="header-right">
            <div className="flag-switcher">
              {flags.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flag-btn ${currentLang === lang.code ? 'active' : ''}`}
                  title={lang.name}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
            <HamburgerMenu 
              currentLang={currentLang} 
              onLanguageChange={handleLanguageChange} 
            />
          </div>
        </div>
      </header>
      
      <div className="container">

        <main>{typeof children === 'function' ? children(currentLang) : children}</main>

        <aside className="ad-space">
          <AdSense adSlot="1234567890" />
        </aside>

        <footer>
          <p>&copy; {new Date().getFullYear()} {getTranslation(currentLang, 'siteTitle')}. {getTranslation(currentLang, 'copyright')}</p>
        </footer>
      </div>
    </>
  )
}