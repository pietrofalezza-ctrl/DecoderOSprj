import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ACTIVITY_COLS =
  "id, created_at, activity_kind, status, provider, model, language, query_text, result_summary, result_content, result_metadata, file_id, repository_id, project_id";

export const listFileAnalysisHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { data: file, error: fileError } = await context.supabase
      .from("files")
      .select("id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fileError) throw fileError;
    if (!file) throw new Error("file_not_found");

    const { data: activities, error } = await context.supabase
      .from("analysis_activities")
      .select(ACTIVITY_COLS)
      .eq("file_id", data.file_id)
      .like("activity_kind", "llm_%")
      .not("result_content", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    return { activities: activities ?? [] };
  });

export const listRepositoryAnalysisHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repository_id: z.string().uuid(),
      limit: z.number().int().min(1).max(100).default(50),
      cursor: z.string().datetime().optional(),
      kind: z.string().max(64).optional(),
      file_id: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    let q = context.supabase
      .from("analysis_activities")
      .select(ACTIVITY_COLS)
      .eq("repository_id", data.repository_id)
      .not("result_content", "is", null)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.cursor) q = q.lt("created_at", data.cursor);
    if (data.kind) q = q.eq("activity_kind", data.kind);
    if (data.file_id) q = q.eq("file_id", data.file_id);
    const { data: activities, error } = await q;
    if (error) throw error;
    const rows = activities ?? [];
    return {
      activities: rows,
      nextCursor: rows.length === data.limit ? rows[rows.length - 1].created_at : null,
    };
  });

export const listAccountAnalysisHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(100).default(50),
      cursor: z.string().datetime().optional(),
      kind: z.string().max(64).optional(),
      project_id: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    let q = context.supabase
      .from("analysis_activities")
      .select(ACTIVITY_COLS)
      .eq("owner_id", context.userId)
      .not("result_content", "is", null)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.cursor) q = q.lt("created_at", data.cursor);
    if (data.kind) q = q.eq("activity_kind", data.kind);
    if (data.project_id) q = q.eq("project_id", data.project_id);
    const { data: activities, error } = await q;
    if (error) throw error;
    const rows = activities ?? [];
    return {
      activities: rows,
      nextCursor: rows.length === data.limit ? rows[rows.length - 1].created_at : null,
    };
  });
