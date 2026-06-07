import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  Github,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const me = useQuery({
    queryKey: ["me", "email"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.email ?? null;
    },
    staleTime: 60_000,
  });

  const email = me.data ?? "";
  const initial = (email?.[0] ?? "?").toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link to="/dashboard" aria-label={t("brand.name")}>
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="default" className="text-sm font-medium">
            <Link to="/docs">
              <BookOpen className="mr-2 h-5 w-5" />
              {t("nav.docs")}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="default" className="text-sm font-medium">
            <a href={t("common.repoUrl")} target="_blank" rel="noreferrer">
              <Github className="mr-2 h-5 w-5" />
              GitHub
            </a>
          </Button>
          <ThemeToggle />
          <LangSwitcher />
          <TooltipProvider delayDuration={200}>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="default"
                      className="ml-2 h-11 gap-2 px-2.5"
                      aria-label={t("nav.account")}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary ring-2 ring-primary/40 transition hover:ring-primary/70">
                        {initial}
                      </span>
                      <span className="hidden max-w-[160px] truncate text-sm font-medium md:inline">
                        {email || t("nav.account")}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{email || t("nav.account")}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                    {t("nav.signedInAs")}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {email || "—"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    {t("nav.dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-5 text-[11px] text-muted-foreground md:flex-row md:items-center">
          <p className="max-w-3xl leading-relaxed">{t("footer.disclaimer")}</p>
          <nav className="flex shrink-0 flex-wrap gap-3">
            <Link to="/terms" className="hover:text-foreground">{t("landing.nav.terms")}</Link>
            <Link to="/privacy" className="hover:text-foreground">{t("footer.privacy")}</Link>
            <Link to="/data-flow" className="hover:text-foreground">{t("footer.dataFlow")}</Link>
            <Link to="/manifesto" className="hover:text-foreground">{t("landing.nav.manifesto")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
