import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const SearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => SearchSchema.parse(s),
  component: AuthPage,
});

function safeRedirect(path?: string): string {
  if (!path) return "/dashboard";
  // Only allow relative same-origin paths.
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const target = safeRedirect(search.redirect);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: target, replace: true });
    });
    try {
      if (typeof window !== "undefined" && localStorage.getItem("decoder.disclaimer.acceptedAt")) {
        setAccepted(true);
      }
    } catch {
      /* ignore */
    }
  }, [navigate, target]);

  const persistAcceptance = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("decoder.disclaimer.acceptedAt", new Date().toISOString());
      }
    } catch {
      /* ignore */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error(t("auth.disclaimerRequired"));
      return;
    }
    persistAcceptance();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        toast.success(t("auth.checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: target, replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message ?? t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    if (!accepted) {
      toast.error(t("auth.disclaimerRequired"));
      return;
    }
    persistAcceptance();
    setLoading(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth?redirect=" + encodeURIComponent(target),
      });
      if (r.error) {
        toast.error(r.error.message ?? t("errors.generic"));
      } else if (!r.redirected) {
        navigate({ to: target, replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between px-6">
        <Link to="/">
          <Logo />
        </Link>
        <LangSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">{t("auth.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">{t("auth.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3">
              <Checkbox
                id="disclaimer"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="disclaimer"
                className="text-xs font-normal leading-relaxed text-muted-foreground"
              >
                {t("auth.disclaimerAcceptPrefix")}
                <Link
                  to="/terms"
                  target="_blank"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {t("auth.disclaimerAcceptLink")}
                </Link>
                {t("auth.disclaimerAcceptSuffix")}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !accepted}>
              {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            {t("auth.or")}
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={google}
            disabled={loading || !accepted}
          >
            {t("auth.withGoogle")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{t("auth.githubNote")}</p>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
          </button>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← {t("common.home")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
