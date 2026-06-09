import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomInt, timingSafeEqual } from "crypto";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  // 6-digit numeric, leading zeros preserved.
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"•".repeat(Math.max(1, user.length - visible.length))}@${domain}`;
}

function renderEmail(code: string) {
  const subject = `Your Decoder password reset code: ${code}`;
  const text = [
    `Your Decoder password reset verification code is: ${code}`,
    ``,
    `This code expires in ${CODE_TTL_MINUTES} minutes and can only be used once.`,
    `If you did not request a password reset, you can safely ignore this email — your password will not change.`,
  ].join("\n");
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #0f172a;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">Password reset verification</h1>
      <p style="margin: 0 0 16px; color: #334155;">Enter this code on the password reset page to confirm it's really you:</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 16px 20px; background: #f1f5f9; border-radius: 8px; text-align: center; color: #0f172a;">${code}</div>
      <p style="margin: 16px 0 0; font-size: 13px; color: #64748b;">This code expires in ${CODE_TTL_MINUTES} minutes and can only be used once.</p>
      <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">If you did not request a password reset, ignore this email — your password will not change.</p>
    </div>`;
  return { subject, text, html };
}

export const issueResetChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId as string;

    // Look up the canonical account email from auth.users — never trust client input.
    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userRes?.user?.email) {
      throw new Error("Unable to load account email.");
    }
    const email = userRes.user.email;

    // Cooldown: refuse if a fresh challenge was issued very recently.
    const { data: recent } = await supabaseAdmin
      .from("password_reset_challenges")
      .select("created_at")
      .eq("user_id", userId)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent?.created_at) {
      const ageSec = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
      if (ageSec < RESEND_COOLDOWN_SECONDS) {
        return {
          ok: true as const,
          emailHint: maskEmail(email),
          cooldownSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - ageSec),
          resent: false as const,
        };
      }
    }

    // Invalidate any previous unconsumed challenges for this user.
    await supabaseAdmin
      .from("password_reset_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("consumed_at", null);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();
    const { error: insErr } = await supabaseAdmin.from("password_reset_challenges").insert({
      user_id: userId,
      code_hash: hashCode(code),
      expires_at: expiresAt,
    });
    if (insErr) {
      console.error("[reset-2fa] insert failed", insErr);
      throw new Error("Could not issue verification code.");
    }

    const { subject, html, text } = renderEmail(code);
    const messageId = crypto.randomUUID();
    const payload = {
      to: email,
      from: "Decoder Security <security@notify.decoderead.dev>",
      sender_domain: "notify.decoderead.dev",
      subject,
      html,
      text,
      purpose: "transactional" as const,
      label: "password-reset-2fa",
      idempotency_key: `pw-reset-2fa-${userId}-${Date.now()}`,
      message_id: messageId,
      queued_at: new Date().toISOString(),
    };

    const { error: enqErr } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: payload as never,
    });
    if (enqErr) {
      console.error("[reset-2fa] enqueue failed", enqErr);
      throw new Error("Could not send verification email.");
    }

    return {
      ok: true as const,
      emailHint: maskEmail(email),
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      resent: true as const,
    };
  });

export const verifyResetChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.") }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId as string;

    const { data: row, error } = await supabaseAdmin
      .from("password_reset_challenges")
      .select("id, code_hash, expires_at, attempts, consumed_at")
      .eq("user_id", userId)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) {
      return { ok: false as const, reason: "no_challenge" as const };
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from("password_reset_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", row.id);
      return { ok: false as const, reason: "expired" as const };
    }
    if ((row.attempts ?? 0) >= MAX_ATTEMPTS) {
      await supabaseAdmin
        .from("password_reset_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", row.id);
      return { ok: false as const, reason: "too_many_attempts" as const };
    }

    const submitted = Buffer.from(hashCode(data.code), "hex");
    const expected = Buffer.from(row.code_hash, "hex");
    const matches = submitted.length === expected.length && timingSafeEqual(submitted, expected);

    if (!matches) {
      const nextAttempts = (row.attempts ?? 0) + 1;
      await supabaseAdmin
        .from("password_reset_challenges")
        .update({ attempts: nextAttempts })
        .eq("id", row.id);
      return {
        ok: false as const,
        reason: "invalid" as const,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - nextAttempts),
      };
    }

    await supabaseAdmin
      .from("password_reset_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    return { ok: true as const };
  });
