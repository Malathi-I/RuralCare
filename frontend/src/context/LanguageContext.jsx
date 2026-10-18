import { createContext, useContext, useEffect, useState } from 'react';
import translations from '../i18n/index.js';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
];

const STORAGE_KEY = 'rc_language';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // Read the saved language so the choice survives a page refresh.
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translates a dotted key such as "nav.home".
   *
   * Supports simple {placeholder} interpolation, for example
   * t('doctor.resultCount', { count: 3 }) where the translation reads
   * "Showing {count} of {total} doctors".
   *
   * Falls back to the key itself when a translation is missing, and to
   * English when a whole language file is unavailable.
   */
  const t = (key, params) => {
    const dictionary = translations[language] || translations.en;

    let value = key
      .split('.')
      .reduce((current, part) => (current ? current[part] : undefined), dictionary);

    // Fall back to English before giving up on the key entirely.
    if (value === undefined && dictionary !== translations.en) {
      value = key
        .split('.')
        .reduce(
          (current, part) => (current ? current[part] : undefined),
          translations.en
        );
    }

    if (value === undefined) return key;
    if (typeof value !== 'string' || !params) return value;

    return value.replace(/\{(\w+)\}/g, (match, token) =>
      params[token] !== undefined ? String(params[token]) : match
    );
  };

  const value = { language, setLanguage: setLanguageState, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);