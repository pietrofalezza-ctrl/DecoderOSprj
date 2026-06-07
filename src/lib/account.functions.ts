import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * GDPR Art. 20 — Right to data portability.
 * Returns a JSON snapshot of everything we hold about the calling user,
 * except encrypted secrets which are intentionally redacted.
 */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [profile, projects, repos, files, explanations, creds, endpoints] =
      await Promise.all([
        sb.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
        sb.from("projects").select("*"),
        sb.from("repositories").select("*"),
        sb.from("files").select("id, repository_id, path, language, size_bytes, sha256, created_at"),
        sb.from("explanations").select("id, file_id, provider, model, language, explanation_type, proficiency, created_at, content"),
        sb.from("user_ai_credentials_safe").select("provider, key_hint, created_at, updated_at"),
        sb.from("user_local_endpoints").select("kind, base_url, default_model, created_at, updated_at"),
      ]);

    return {
      generated_at: new Date().toISOString(),
      user_id: context.userId,
      profile: profile.data ?? null,
      projects: projects.data ?? [],
      repositories: repos.data ?? [],
      files: files.data ?? [],
      explanations: explanations.data ?? [],
      ai_credentials_redacted: creds.data ?? [],
      local_endpoints: endpoints.data ?? [],

      notice:
        "Encrypted AI provider keys are intentionally redacted. To retrieve a key, ask the provider directly.",
    };
  });

/**
 * GDPR Art. 17 — Right to erasure.
 * Hard-delete the auth user; cascade on owner_id cleans all rows.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Best-effort cleanup of user-owned rows (RLS-bypass via admin client).
    const uid = context.userId;
    await supabaseAdmin.from("explanations").delete().eq("owner_id", uid);
    await supabaseAdmin.from("files").delete().eq("owner_id", uid);
    await supabaseAdmin.from("repositories").delete().eq("owner_id", uid);
    await supabaseAdmin.from("projects").delete().eq("owner_id", uid);
    await supabaseAdmin.from("user_ai_credentials").delete().eq("owner_id", uid);
    await supabaseAdmin.from("user_local_endpoints").delete().eq("owner_id", uid);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    await supabaseAdmin.from("profiles").delete().eq("id", uid);

    // Remove storage objects owned by the user (best-effort).
    try {
      const { data: list } = await supabaseAdmin.storage.from("repositories").list(uid, { limit: 1000 });
      if (list && list.length) {
        const paths = list.map((o) => `${uid}/${o.name}`);
        await supabaseAdmin.storage.from("repositories").remove(paths);
      }
    } catch {
      // ignore — bucket may already be empty
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) throw error;
    return { ok: true };
  });
