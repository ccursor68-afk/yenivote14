'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { translations } from './translations';

// Create context for language
const LanguageContext = createContext();

// Language Provider Component
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('tr');
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('serverlistrank_lang');
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      setLang(savedLang);
    } else {
      // Detect browser language
      const browserLang = navigator.language?.toLowerCase();
      if (browserLang?.startsWith('en')) {
        setLang('en');
      }
    }
  }, []);

  // Save language to localStorage when changed
  const changeLang = (newLang) => {
    if (newLang === 'tr' || newLang === 'en') {
      setLang(newLang);
      localStorage.setItem('serverlistrank_lang', newLang);
    }
  };

  // Get translation
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Turkish if key not found
        value = translations['tr'];
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ lang: 'tr', setLang: () => {}, t: (key) => translations['tr'][key] || key }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use translations
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export default useTranslation;
