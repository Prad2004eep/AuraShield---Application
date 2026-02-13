import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStoragePlugin from 'i18next-react-native-async-storage';
import { getLocales } from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import te from './locales/te.json';
import ml from './locales/ml.json';
import ta from './locales/ta.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  te: { translation: te },
  ml: { translation: ml },
  ta: { translation: ta },
};

// Get device locale
const deviceLocale = getLocales()[0]?.languageCode || 'en';
const supportedLanguages = ['en', 'hi', 'kn', 'te', 'ml', 'ta'];
const fallbackLanguage = supportedLanguages.includes(deviceLocale) ? deviceLocale : 'en';

i18n
  .use(AsyncStoragePlugin('aura-shield-language'))
  .use(initReactI18next)
  .init({
    resources,
    lng: fallbackLanguage,
    fallbackLng: 'en',
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
    
    detection: {
      order: ['asyncStorage', 'navigator'],
      caches: ['asyncStorage'],
    },
  });

export default i18n;