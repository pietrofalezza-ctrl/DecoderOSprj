import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { LANG_STORAGE_KEY, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

export function I18nBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Apply persisted preference (or browser language) AFTER hydration so the
    // server-rendered HTML (always `en`) matches the client's first paint.
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as
        | SupportedLanguage
        | null;
      const nav = (navigator.language ?? "en").slice(0, 2) as SupportedLanguage;
      const next =
        stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
          ? stored
          : (SUPPORTED_LANGUAGES as readonly string[]).includes(nav)
            ? nav
            : "en";
      if (next !== i18n.language) {
        i18n.changeLanguage(next);
      }
    } catch {
      /* ignore */
    }
    const onChange = (lng: string) => {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lng);
      } catch {
        /* ignore */
      }
    };
    i18n.on("languageChanged", onChange);
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, []);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
