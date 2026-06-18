import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";
import {
  analyzeSourceFile,
  formatSourceStaticMarkdown,
  sourceStaticActivityStatus,
  type SourceStaticReport,
} from "@/lib/source-static.server";

export const runSourceStaticAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
    }),
  )
  .handler(async ({ context, data }): Promise<SourceStaticReport> => {
    const { data: file, error } = await context.supabase
      .from("files")
      .select("id, path, language, storage_path, repository_id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (error || !file) throw error ?? new Error("file_not_found");

    const { data: repository, error: repoErr } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", file.repository_id)
      .maybeSingle();
    if (repoErr) throw repoErr;

    const { data: blob, error: dlErr } = await context.supabase.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) throw dlErr ?? new Error("download_failed");

    const content = await blob.text();
    const report = analyzeSourceFile({
      path: file.path,
      language: file.language ?? undefined,
      content,
    });

    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      fileId: file.id,
      repositoryId: file.repository_id,
      projectId: repository?.project_id ?? null,
      activity_kind: "static_scan",
      status: sourceStaticActivityStatus(report),
      language: file.language,
      query_text: file.path,
      result_summary: `source_static risk=${report.metrics.security_risk_score} findings=${report.findings.length}`,
      result_content: formatSourceStaticMarkdown(report),
      result_metadata: {
        scanner: "source_static",
        securityRiskScore: report.metrics.security_risk_score,
        maintainabilityScore: report.metrics.maintainability_score,
        unsanitizedSinkCount: report.metrics.unsanitized_sink_count,
        dangerousSinkCount: report.metrics.dangerous_sink_count,
      },
    });

    return report;
  });

export type { SourceStaticReport };
