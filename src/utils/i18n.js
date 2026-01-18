/**
 * Internationalization (i18n) Configuration
 * 
 * Supports Arabic and English with RTL support
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Get initial language from localStorage
const getInitialLanguage = () => {
  const savedLang = localStorage.getItem('language');
  return savedLang || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = getInitialLanguage() === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = getInitialLanguage();

export default i18n;
