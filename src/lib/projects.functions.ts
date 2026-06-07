import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { projects: data ?? [] };
  });

export const getProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { data: project, error } = await context.supabase
      .from("projects")
      .select("id, name, description, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    const { data: repos, error: rErr } = await context.supabase
      .from("repositories")
      .select("id, name, source, file_count, created_at")
      .eq("project_id", data.id)
      .order("created_at", { ascending: false });
    if (rErr) throw rErr;
    return { project, repositories: repos ?? [] };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(120),
      description: z.string().trim().max(2000).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { data: created, error } = await context.supabase
      .from("projects")
      .insert({
        owner_id: context.userId,
        name: data.name,
        description: data.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: created.id };
  });

/**
 * GDPR Art. 17 — granular deletion of a single project and all its
 * descendants (repositories, files, explanations, storage objects).
 */
export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = context.userId;
    // Ownership check via RLS-scoped client.
    const { data: owned, error: oErr } = await context.supabase
      .from("projects")
      .select("id")
      .eq("id", data.id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!owned) throw new Error("not_found");

    // Collect repos to clean up their storage prefix.
    const { data: repos } = await supabaseAdmin
      .from("repositories")
      .select("id")
      .eq("project_id", data.id)
      .eq("owner_id", uid);
    for (const r of repos ?? []) {
      try {
        const { data: list } = await supabaseAdmin.storage
          .from("repositories")
          .list(`${uid}/${r.id}`, { limit: 1000 });
        if (list?.length) {
          await supabaseAdmin.storage
            .from("repositories")
            .remove(list.map((o) => `${uid}/${r.id}/${o.name}`));
        }
      } catch {
        // best-effort
      }
    }

    await supabaseAdmin.from("explanations").delete().eq("owner_id", uid).in(
      "file_id",
      ((await supabaseAdmin.from("files").select("id").eq("owner_id", uid).in(
        "repository_id",
        (repos ?? []).map((r) => r.id),
      )).data ?? []).map((f) => f.id),
    );
    await supabaseAdmin.from("files").delete().eq("owner_id", uid).in(
      "repository_id",
      (repos ?? []).map((r) => r.id),
    );
    await supabaseAdmin.from("repositories").delete().eq("owner_id", uid).eq("project_id", data.id);
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", data.id).eq("owner_id", uid);
    if (error) throw error;
    return { ok: true };
  });
