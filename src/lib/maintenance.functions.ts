import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`role check failed: ${error.message}`);
  if (!data) throw new Error("Forbidden");
}

export const listMaintenanceAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("maintenance_audit_log")
      .select(
        "id, job_name, request_id, status, started_at, finished_at, duration_ms, stats, error",
      )
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { entries: data ?? [] };
  });

/**
 * Re-schedule pg_cron jobs that rely on a server-only bearer secret using the
 * CURRENT value of the matching env var. Use this AFTER the admin has rotated
 * the secret in the Lovable secret store: the new value is read here from
 * process.env and baked into the cron command. The secret value never transits
 * the UI or DB.
 */
export const rescheduleMaintenanceCron = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ job: z.enum(["cleanup-stale-repositories"]) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let secret = "";
    let url = "";
    let schedule = "";
    if (data.job === "cleanup-stale-repositories") {
      secret = process.env.CLEANUP_CRON_SECRET ?? "";
      url =
        "https://project--100c38a8-8056-44b5-9137-113283fe9cce.lovable.app/api/public/hooks/cleanup-stale-repositories";
      schedule = "0 3 * * *";
    }
    if (!secret) {
      throw new Error("Secret env var is empty. Update the secret in Lovable Cloud, then retry.");
    }

    // pg_cron lives in the cron schema; use a SQL escape for the bearer.
    const escapedSecret = secret.replace(/'/g, "''");
    const command = `SELECT net.http_post(
  url := '${url}',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${escapedSecret}"}'::jsonb,
  body := '{}'::jsonb
);`;

    // Re-schedule via a service-role-only SECURITY DEFINER fn that wraps
    // cron.unschedule + cron.schedule (PostgREST can't call cron.* directly).
    const { error } = await supabaseAdmin.rpc(
      "admin_reschedule_cron" as never,
      {
        _job_name: data.job,
        _schedule: schedule,
        _command: command,
      } as never,
    );
    if (error) throw new Error(error.message);

    // Audit the rotation event (no secret material logged).
    await supabaseAdmin.from("maintenance_audit_log").insert({
      job_name: `reschedule:${data.job}`,
      status: "ok",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: 0,
      stats: { rotated_by: context.userId },
    });

    return { ok: true };
  });

/**
 * Returns the visible status of the stored credentials for the calling user,
 * distinguishing "missing" from "present but unreadable" (decryption probe
 * failure — e.g. encryption key was rotated and the ciphertext is now stale).
 */
export const getCredentialsStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const PROVIDERS = ["openai", "anthropic", "gemini", "openrouter"] as const;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_ai_credentials")
      .select("provider, key_hint, encrypted_key, updated_at")
      .eq("owner_id", context.userId);
    if (error) throw error;

    const { decryptSecret } = await import("./crypto.server");

    return {
      providers: PROVIDERS.map((provider) => {
        const row = (data ?? []).find((r) => r.provider === provider);
        if (!row) {
          return {
            provider,
            configured: false,
            readable: false,
            key_hint: null as string | null,
            updated_at: null as string | null,
          };
        }
        let readable = false;
        try {
          const cipher = (row as { encrypted_key?: string }).encrypted_key;
          if (cipher) {
            decryptSecret(cipher);
            readable = true;
          }
        } catch {
          readable = false;
        }
        return {
          provider,
          configured: true,
          readable,
          key_hint: row.key_hint ?? null,
          updated_at: row.updated_at ?? null,
        };
      }),
    };
  });
