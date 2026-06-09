import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Decoder" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Set a new password for your Decoder account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery hash and emits a PASSWORD_RECOVERY event
    // (or SIGNED_IN with a recovery session). Listen, then also check once.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecoverySession(true);
        setChecking(false);
      }
    });

    // Fallback: if hash already consumed, check current session.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const looksLikeRecovery = hash.includes("type=recovery") || hash.includes("access_token");
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasRecoverySession(true);
      } else if (!looksLikeRecovery) {
        // No session and no recovery hash — invalid landing.
        setHasRecoverySession(false);
      }
      setChecking(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Force re-auth: kill the recovery session so the owner signs in fresh.
      await supabase.auth.signOut();
      toast.success("Password updated. Please sign in.");
      navigate({ to: "/auth", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update password.");
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
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h1 className="text-xl font-semibold">Set a new password</h1>
          </div>

          {checking ? (
            <p className="text-sm text-muted-foreground">Verifying reset link…</p>
          ) : !hasRecoverySession ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired. Reset links
                are single-use and expire after 15 minutes.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters. Breached passwords are blocked for
                your safety.
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
