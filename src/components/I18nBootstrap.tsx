import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { LANG_STORAGE_KEY, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

export function I18nBootstrap({ children }: { children: ReactNode }) {
  // `key` bumps once after mount so the entire subtree re-renders cleanly with
  // the user's preferred language. SSR + first client paint both use the
  // deterministic default (`en`), so hydration matches; the second render
  // then swaps in the persisted language without comparing against SSR HTML.
  const [key, setKey] = useState(0);

  useEffect(() => {
    let target: SupportedLanguage = "en";
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as
        | SupportedLanguage
        | null;
      const nav = (navigator.language ?? "en").slice(0, 2) as SupportedLanguage;
      target =
        stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
          ? stored
          : (SUPPORTED_LANGUAGES as readonly string[]).includes(nav)
            ? nav
            : "en";
    } catch {
      /* ignore */
    }
    const apply = () => {
      if (target !== i18n.language) {
        i18n.changeLanguage(target).finally(() => setKey((k) => k + 1));
      } else {
        setKey((k) => k + 1);
      }
    };
    apply();

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

  return (
    <I18nextProvider i18n={i18n}>
      <div key={key} suppressHydrationWarning>
        {children}
      </div>
    </I18nextProvider>
  );
}
