import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

export function LangSwitcher() {
  const { i18n, t } = useTranslation();
  // Avoid SSR hydration mismatches: language is resolved from localStorage /
  // navigator on the client, which the server cannot know. Render the active
  // label only after mount; show a stable placeholder during SSR/first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = (i18n.resolvedLanguage ?? "en") as SupportedLanguage;
  const change = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs uppercase" suppressHydrationWarning>
            {mounted ? current : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onSelect={() => change(lng)}
            className={mounted && lng === current ? "font-semibold" : ""}
          >
            {t(`languages.${lng}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
