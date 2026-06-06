import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export function I18nBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    // i18n init is idempotent thanks to the guard in src/i18n/index.ts
  }, []);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
