import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertCircle, LogIn, Mail, UserPlus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const SearchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => SearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — Decoder" },
      {
        name: "description",
        content:
          "Sign in or create your Decoder account to start auditing AI-generated code with your own provider keys or a local model.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Sign in — Decoder" },
      {
        property: "og:description",
        content:
          "Access your Decoder workspace — BYOK cloud or fully local code understanding.",
      },
      { property: "og:url", content: "https://decoderdev.lovable.app/auth" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(path?: string): string {
  if (!path) return "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const target = safeRedirect(search.redirect);

  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const disclaimerRef = useRef<HTMLDivElement>(null);

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

  const flagMissing = () => {
    setHighlight(true);
    disclaimerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast.error(t("auth.disclaimerRequired"));
    setTimeout(() => setHighlight(false), 2200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      flagMissing();
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
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
      flagMissing();
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

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = forgotEmail.trim();
    if (!value) return;
    setLoading(true);
    try {
      // Fire-and-forget: always show the same neutral message regardless of
      // whether the address is registered, to prevent account enumeration.
      await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: window.location.origin + "/reset-password",
      });
    } catch {
      /* swallow — neutral response */
    } finally {
      toast.success(
        "If an account exists for that email, we've sent a reset link.",
      );
      setForgotOpen(false);
      setForgotEmail("");
      setLoading(false);
    }
  };

  const headline =
    mode === "signup" ? t("auth.signUpHeadline") : t("auth.signInHeadline");
  const subline =
    mode === "signup" ? t("auth.signUpSubline") : t("auth.signInSubline");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between px-6">
        <Link to="/">
          <Logo />
        </Link>
        <LangSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
          {/* Clear Sign-in / Sign-up tabs */}
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                {t("auth.tabs.signIn")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                {t("auth.tabs.signUp")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <h1 className="mt-5 text-xl font-semibold">{headline}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subline}</p>

          {/* Disclaimer — shared between both modes */}
          <div
            ref={disclaimerRef}
            id="disclaimer-block"
            className={
              "mt-5 rounded-md border bg-primary/5 p-3 transition-all " +
              (highlight
                ? "border-destructive ring-2 ring-destructive animate-pulse"
                : accepted
                  ? "border-primary/30"
                  : "border-primary/40")
            }
          >
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              {t("auth.disclaimerHeader")}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="disclaimer"
                checked={accepted}
                onCheckedChange={(v) => {
                  setAccepted(v === true);
                  if (v === true) setHighlight(false);
                }}
                className="mt-0.5"
              />
              <Label
                htmlFor="disclaimer"
                className="text-xs font-normal leading-relaxed text-foreground"
              >
                {t("auth.disclaimerAcceptPrefix")}
                <Link
                  to="/terms"
                  target="_blank"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {t("auth.disclaimerAcceptLink")}
                </Link>
                {t("auth.disclaimerAcceptSuffix")}{" · "}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {t("footer.privacy")}
                </Link>
              </Label>
            </div>
            {!accepted && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                {t("auth.disclaimerRequiredHint")}
              </p>
            )}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
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
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="confirm">{t("auth.confirmPasswordLabel")}</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !accepted}
              aria-describedby="disclaimer-block"
            >
              {mode === "signin" ? (
                <>
                  <LogIn className="mr-2 h-3.5 w-3.5" />
                  {t("auth.signIn")}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  {t("auth.signUp")}
                </>
              )}
            </Button>

            {mode === "signin" && (
              <div className="pt-1 text-right">
                <button
                  type="button"
                  onClick={() => setForgotOpen((v) => !v)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          {mode === "signin" && forgotOpen && (
            <form
              onSubmit={sendReset}
              className="mt-3 space-y-2 rounded-md border border-border bg-muted/30 p-3"
            >
              <Label htmlFor="forgot-email" className="text-xs">
                Enter the email on your account
              </Label>
              <Input
                id="forgot-email"
                type="email"
                required
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                We'll email a one-time reset link to that address only. Link
                expires in 15 minutes.
              </p>
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={loading}
              >
                <Mail className="mr-2 h-3.5 w-3.5" />
                Send reset link
              </Button>
            </form>
          )}

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
            aria-describedby="disclaimer-block"
          >
            {mode === "signup" ? t("auth.signUpWithGoogle") : t("auth.withGoogle")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{t("auth.githubNote")}</p>

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
