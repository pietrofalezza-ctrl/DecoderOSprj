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
