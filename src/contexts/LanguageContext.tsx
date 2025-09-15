import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TRANSLATIONS, FINNISH_TRANSLATIONS, DEFAULT_LANGUAGE, LanguageContextType } from '../config/language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or use default
    const savedLanguage = localStorage.getItem('ipma_language') as Language;
    return savedLanguage && ['fi', 'en'].includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('ipma_language', newLanguage);
    
    // Update document language attribute for accessibility
    document.documentElement.lang = newLanguage;
  };

  const t = (key: keyof typeof FINNISH_TRANSLATIONS): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;
  };

  // Set initial document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};