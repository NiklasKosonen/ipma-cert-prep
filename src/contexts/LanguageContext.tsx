import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Language } from '../types'

export const languages: Language[] = [
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation keys
const translations = {
  en: {
    'app.title': 'IPMA Level C Certification Prep',
    'app.subtitle': 'Professional project management certification preparation',
    'auth.login': 'Log in',
    'auth.logout': 'Log out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.resetPassword': 'Reset Password',
    'auth.updatePassword': 'Update Password',
    'auth.rolePicker.title': 'Choose your role',
    'auth.rolePicker.user': 'User',
    'auth.rolePicker.trainer': 'Trainer',
    'auth.rolePicker.admin': 'Admin',
    'auth.rolePicker.userDesc': 'Practice and prepare for certification',
    'auth.rolePicker.trainerDesc': 'Monitor learner progress',
    'auth.rolePicker.adminDesc': 'Manage platform and content',
    'nav.home': 'Home',
    'nav.practice': 'Practice',
    'nav.history': 'History',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'topics.title': 'Practice Topics',
    'topics.startPractice': 'Start Practice',
    'practice.timer': 'Time remaining',
    'practice.submit': 'Submit Answer',
    'practice.next': 'Next Question',
    'practice.previous': 'Previous Question',
    'results.score': 'Score',
    'results.detectedKPIs': 'Detected KPIs',
    'results.missingKPIs': 'Missing KPIs',
    'results.coachNote': 'Coach\'s Note',
    'history.title': 'Practice History',
    'history.export': 'Export CSV',
    'admin.overview': 'Overview',
    'admin.topics': 'Topics',
    'admin.kpis': 'KPIs',
    'admin.questions': 'Questions',
    'admin.aiTraining': 'AI Training',
    'admin.results': 'Results',
    'admin.settings': 'Settings',
    'admin.companyCodes': 'Company Codes',
  },
  fi: {
    'app.title': 'IPMA Level C Sertifiointivalmennus',
    'app.subtitle': 'Ammattimainen projektinhallinnan sertifiointivalmennus',
    'auth.login': 'Kirjaudu sisään',
    'auth.logout': 'Kirjaudu ulos',
    'auth.email': 'Sähköposti',
    'auth.password': 'Salasana',
    'auth.confirmPassword': 'Vahvista salasana',
    'auth.forgotPassword': 'Unohtuiko salasana?',
    'auth.resetPassword': 'Nollaa salasana',
    'auth.updatePassword': 'Päivitä salasana',
    'auth.rolePicker.title': 'Valitse roolisi',
    'auth.rolePicker.user': 'Käyttäjä',
    'auth.rolePicker.trainer': 'Valmentaja',
    'auth.rolePicker.admin': 'Ylläpitäjä',
    'auth.rolePicker.userDesc': 'Harjoittele ja valmennu sertifiointiin',
    'auth.rolePicker.trainerDesc': 'Seuraa oppijoiden edistymistä',
    'auth.rolePicker.adminDesc': 'Hallinnoi alustaa ja sisältöä',
    'nav.home': 'Koti',
    'nav.practice': 'Harjoittelu',
    'nav.history': 'Historia',
    'nav.dashboard': 'Hallintapaneeli',
    'nav.admin': 'Ylläpito',
    'topics.title': 'Harjoittelun aiheet',
    'topics.startPractice': 'Aloita harjoittelu',
    'practice.timer': 'Aikaa jäljellä',
    'practice.submit': 'Lähetä vastaus',
    'practice.next': 'Seuraava kysymys',
    'practice.previous': 'Edellinen kysymys',
    'results.score': 'Pisteet',
    'results.detectedKPIs': 'Havaitut KPI:t',
    'results.missingKPIs': 'Puuttuvat KPI:t',
    'results.coachNote': 'Valmentajan huomio',
    'history.title': 'Harjoitteluhistoria',
    'history.export': 'Vie CSV',
    'admin.overview': 'Yleiskatsaus',
    'admin.topics': 'Aiheet',
    'admin.kpis': 'KPI:t',
    'admin.questions': 'Kysymykset',
    'admin.aiTraining': 'AI-koulutus',
    'admin.results': 'Tulokset',
    'admin.settings': 'Asetukset',
    'admin.companyCodes': 'Yrityskoodit',
  },
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', languages[0]) // Finnish is default

  const t = (key: string): string => {
    return translations[language.code][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
