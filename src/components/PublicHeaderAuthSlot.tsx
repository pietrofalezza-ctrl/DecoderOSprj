import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, LayoutDashboard, LogOut, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

type AuthState = "loading" | "signed-in" | "signed-out";

/**
 * Auth-aware CTA slot for public-route headers (landing, manifesto, docs, terms).
 * - Signed-out: shows "Inizia" → /auth (default CTA).
 * - Signed-in:  shows "Dashboard" + an account dropdown (Settings, Sign out).
 *
 * Keeps the user oriented when navigating between authenticated areas and
 * public pages — they don't feel "logged out" just because the chrome changes.
 */
export function PublicHeaderAuthSlot({
  ctaLabelKey = "landing.ctaStart",
  showArrow = true,
}: {
  ctaLabelKey?: string;
  showArrow?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState(data.session ? "signed-in" : "signed-out");
      setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setState(session ? "signed-in" : "signed-out");
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  if (state === "loading") {
    return <div aria-hidden className="h-9 w-24 animate-pulse rounded-md bg-muted/50" />;
  }

  if (state === "signed-out") {
    return (
      <Button asChild size="sm" className="ml-2">
        <Link to="/auth">
          {t(ctaLabelKey)}
          {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
        </Link>
      </Button>
    );
  }

  return (
    <div className="ml-2 flex items-center gap-1">
      <Button asChild size="sm">
        <Link to="/dashboard">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          {t("nav.dashboard")}
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" aria-label={email ?? "Account"}>
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {email && <div className="px-2 py-1.5 text-xs text-muted-foreground">{email}</div>}
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
          <DropdownMenuItem onSelect={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
