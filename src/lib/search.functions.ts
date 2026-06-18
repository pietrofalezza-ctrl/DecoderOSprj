import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";
import { normalizeSearchQuery } from "@/lib/search";

export const recordRepositorySearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      query: z.string().trim().min(1).max(160),
      result_count: z.number().int().min(0).max(100_000),
    }),
  )
  .handler(async ({ context, data }) => {
    const query = normalizeSearchQuery(data.query);
    if (query.length < 2) {
      return { ok: true, persisted: false };
    }

    const { data: repo, error } = await context.supabase
      .from("repositories")
      .select("id, project_id")
      .eq("id", data.repo_id)
      .maybeSingle();
    if (error) throw error;
    if (!repo) throw new Error("repository_not_found");

    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repo.project_id,
      repositoryId: repo.id,
      activity_kind: "search_query",
      status: "ok",
      query_text: query,
      result_summary: `file_search results=${data.result_count}`,
      result_metadata: {
        scope: "repository_files",
        result_count: data.result_count,
      },
    });

    return { ok: true, persisted: true };
  });
