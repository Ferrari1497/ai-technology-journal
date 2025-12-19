import { useState } from 'react'
import Link from 'next/link'
import { Language, getTranslation } from '../lib/i18n'

interface HamburgerMenuProps {
  currentLang: Language
  onLanguageChange: (lang: Language) => void
}

export default function HamburgerMenu({ currentLang, onLanguageChange }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const languages = [
    { code: 'ja' as Language, flag: '🇯🇵', name: '日本語' },
    { code: 'en' as Language, flag: '🇺🇸', name: 'English' },
    { code: 'th' as Language, flag: '🇹🇭', name: 'ไทย' }
  ]

  return (
    <div className="hamburger-menu">
      <button 
        className={`hamburger-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="メニュー"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="menu-content" onClick={(e) => e.stopPropagation()}>
            <nav className="menu-nav">
              <Link href="/" onClick={closeMenu}>
                {getTranslation(currentLang, 'home')}
              </Link>
              <Link href="/archive" onClick={closeMenu}>
                {getTranslation(currentLang, 'archive')}
              </Link>
              <Link href="/tools" onClick={closeMenu}>
                {getTranslation(currentLang, 'recommendedTools')}
              </Link>
              <Link href="/news" onClick={closeMenu}>
                {getTranslation(currentLang, 'aiNews')}
              </Link>
            </nav>


          </div>
        </div>
      )}
    </div>
  )
}