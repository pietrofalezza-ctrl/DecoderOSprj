import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
      .select(
        "id, created_at, activity_kind, status, provider, model, language, query_text, result_summary, result_content, result_metadata",
      )
      .eq("file_id", data.file_id)
      .like("activity_kind", "llm_%")
      .not("result_content", "is", null)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw error;

    return { activities: activities ?? [] };
  });
