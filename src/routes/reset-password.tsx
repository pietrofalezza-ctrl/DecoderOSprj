import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  issueResetChallenge,
  verifyResetChallenge,
} from "@/lib/reset-2fa.functions";

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

type Stage = "checking" | "invalid" | "verify" | "setPassword";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const issue = useServerFn(issueResetChallenge);
  const verify = useServerFn(verifyResetChallenge);

  const [stage, setStage] = useState<Stage>("checking");
  const [code, setCode] = useState("");
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [updating, setUpdating] = useState(false);
  const issuedRef = useRef(false);

  // 1) Detect the Supabase recovery session.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStage((s) => (s === "checking" || s === "invalid" ? "verify" : s));
      }
    });

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const looksLikeRecovery = hash.includes("type=recovery") || hash.includes("access_token");
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStage((s) => (s === "checking" ? "verify" : s));
      } else if (!looksLikeRecovery) {
        setStage("invalid");
      } else {
        // Hash present but session not parsed yet — leave checking; listener will resolve.
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2) Auto-issue the verification code once the recovery session is ready.
  useEffect(() => {
    if (stage !== "verify" || issuedRef.current) return;
    issuedRef.current = true;
    (async () => {
      try {
        const res = await issue();
        if (res?.emailHint) setEmailHint(res.emailHint);
        if (res?.cooldownSeconds) setCooldown(res.cooldownSeconds);
        if (res?.resent) {
          toast.success("Verification code sent to your inbox.");
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Could not send verification code.");
      }
    })();
  }, [stage, issue]);

  // 3) Cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      const res = await issue();
      if (res?.emailHint) setEmailHint(res.emailHint);
      if (res?.cooldownSeconds) setCooldown(res.cooldownSeconds);
      toast.success("A fresh verification code is on its way.");
      setCode("");
      setAttemptsRemaining(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not resend code.");
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      const res = await verify({ data: { code } });
      if (res.ok) {
        toast.success("Identity confirmed. Set your new password.");
        setStage("setPassword");
        return;
      }
      if (res.reason === "invalid") {
        setAttemptsRemaining(res.attemptsRemaining);
        toast.error(
          res.attemptsRemaining > 0
            ? `Incorrect code. ${res.attemptsRemaining} attempt${res.attemptsRemaining === 1 ? "" : "s"} left.`
            : "Incorrect code.",
        );
      } else if (res.reason === "expired") {
        toast.error("That code expired. Request a new one.");
      } else if (res.reason === "too_many_attempts") {
        toast.error("Too many attempts. Request a new code.");
      } else {
        toast.error("No active verification code. Request a new one.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Could not verify code.");
    } finally {
      setVerifying(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Password updated. Please sign in.");
      navigate({ to: "/auth", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update password.");
    } finally {
      setUpdating(false);
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
            {stage === "setPassword" ? (
              <KeyRound className="h-4 w-4 text-primary" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-primary" />
            )}
            <h1 className="text-xl font-semibold">
              {stage === "setPassword" ? "Set a new password" : "Verify it's you"}
            </h1>
          </div>

          {stage === "checking" && (
            <p className="text-sm text-muted-foreground">Verifying reset link…</p>
          )}

          {stage === "invalid" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired. Reset links
                are single-use and expire after 15 minutes.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          )}

          {stage === "verify" && (
            <form onSubmit={submitCode} className="space-y-4">
              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Check your inbox
                </div>
                <p className="mt-1">
                  We sent a 6-digit verification code to
                  {emailHint ? ` ${emailHint}` : " the address on this account"}.
                  Enter it below to confirm you own this account. The code expires in 10 minutes.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="otp">Verification code</Label>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={code}
                  onChange={(v) => setCode(v.replace(/\D/g, ""))}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
                {verifying ? "Verifying…" : "Verify and continue"}
              </Button>

              <button
                type="button"
                onClick={resend}
                disabled={cooldown > 0}
                className="block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:no-underline disabled:opacity-60"
              >
                {cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : "Didn't get it? Resend code"}
              </button>
            </form>
          )}

          {stage === "setPassword" && (
            <form onSubmit={submitPassword} className="space-y-3">
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
                Use at least 8 characters. Breached passwords are blocked for your safety.
              </p>
              <Button type="submit" className="w-full" disabled={updating}>
                {updating ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
