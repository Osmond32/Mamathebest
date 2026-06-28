import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Carica la preferenza dal localStorage se esistente, altrimenti rileva lingua browser o default 'it'
    const savedLang = localStorage.getItem('mamathebest_lang');
    if (savedLang === 'it' || savedLang === 'fr') return savedLang;
    
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === 'fr' ? 'fr' : 'it';
  });

  const setLanguage = (lang) => {
    if (lang === 'it' || lang === 'fr') {
      setLanguageState(lang);
      localStorage.setItem('mamathebest_lang', lang);
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
