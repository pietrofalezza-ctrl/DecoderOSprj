import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ChevronDown,
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
import { isAdmin } from "@/lib/admin.functions";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAdminFn = useServerFn(isAdmin);
  const admin = useQuery({
    queryKey: ["me", "admin"],
    queryFn: () => isAdminFn(),
    staleTime: 60_000,
  });
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
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link to="/dashboard" aria-label={t("brand.name")}>
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/manifesto">
              <Sparkles className="mr-2 h-4 w-4" />
              {t("nav.manifesto")}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/docs">
              <BookOpen className="mr-2 h-4 w-4" />
              {t("nav.docs")}
            </Link>
          </Button>
          <ThemeToggle />
          <LangSwitcher />
          <TooltipProvider delayDuration={200}>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-9 gap-1.5 px-1.5"
                      aria-label={t("nav.account")}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {initial}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t("nav.dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                {admin.data?.admin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {t("nav.admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
