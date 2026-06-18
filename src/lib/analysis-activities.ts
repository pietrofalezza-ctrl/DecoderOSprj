import { type Json } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const ANALYSIS_STATUS = new Set(["ok", "warn", "error"] as const);

export type AnalysisActivityKind =
  | "llm_explanation"
  | "llm_quality_analysis"
  | "llm_security_analysis"
  | "llm_ai_origin_analysis"
  | "llm_folder_analysis"
  | "llm_fix_generation"
  | "static_scan"
  | "search_query";

export type AnalysisActivityInput = {
  supabase: SupabaseClient<Database>;
  ownerId: string;
  fileId?: string | null;
  repositoryId?: string | null;
  projectId?: string | null;
  activity_kind: AnalysisActivityKind;
  status?: "ok" | "warn" | "error";
  provider?: string | null;
  model?: string | null;
  language?: string | null;
  query_text?: string | null;
  result_summary?: string | null;
  result_content?: string | null;
  result_metadata?: Record<string, unknown>;
};

function toActivityStatus(value: string | undefined): "ok" | "warn" | "error" {
  if (value && ANALYSIS_STATUS.has(value as "ok" | "warn" | "error")) {
    return value as "ok" | "warn" | "error";
  }
  return "ok";
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Json {
  if (!metadata || Object.keys(metadata).length === 0) {
    return {};
  }
  return metadata as Json;
}

export async function appendAnalysisActivity(input: AnalysisActivityInput): Promise<void> {
  const {
    supabase,
    ownerId,
    fileId,
    repositoryId,
    projectId,
    activity_kind,
    status,
    provider,
    model,
    language,
    query_text,
    result_summary,
    result_content,
    result_metadata,
  } = input;

  try {
    await supabase.from("analysis_activities").insert({
      owner_id: ownerId,
      project_id: projectId ?? null,
      repository_id: repositoryId ?? null,
      file_id: fileId ?? null,
      activity_kind,
      status: toActivityStatus(status),
      provider: provider ?? null,
      model: model ?? null,
      language: language ?? null,
      query_text: query_text ?? null,
      result_summary: result_summary ?? null,
      result_content: result_content ?? null,
      result_metadata: sanitizeMetadata(result_metadata),
    });
  } catch {
    // Optional audit trail. Never fail primary flows if the table is unavailable.
  }
}
