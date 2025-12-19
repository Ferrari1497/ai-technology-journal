import { Language } from '../lib/i18n'

interface LanguageSwitcherProps {
  currentLang: Language
  onLanguageChange: (lang: Language) => void
}

export default function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  const languages = [
    { code: 'ja' as Language, flag: '🇯🇵', name: '日本語' },
    { code: 'en' as Language, flag: '🇺🇸', name: 'English' },
    { code: 'th' as Language, flag: '🇹🇭', name: 'ไทย' }
  ]

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`lang-btn ${currentLang === lang.code ? 'active' : ''}`}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  )
}