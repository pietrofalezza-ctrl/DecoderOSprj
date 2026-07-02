import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/common.json";
import it from "./locales/it/common.json";
import zh from "./locales/zh/common.json";
import hi from "./locales/hi/common.json";
import ta from "./locales/ta/common.json";

export const SUPPORTED_LANGUAGES = ["en", "it", "zh", "hi", "ta"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANG_STORAGE_KEY = "decoder.lang";

if (!i18n.isInitialized) {
  // No LanguageDetector here: server and first client render must agree on
  // `en` to avoid SSR hydration mismatches. The persisted preference is
  // applied post-mount by I18nBootstrap.
  i18n.use(initReactI18next).init({
    resources: {
      en: { common: en },
      it: { common: it },
      zh: { common: zh },
      hi: { common: hi },
      ta: { common: ta },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
  });
}

export default i18n;
