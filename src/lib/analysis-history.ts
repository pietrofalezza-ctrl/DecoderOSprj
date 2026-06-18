import type { AnalysisActivityKind } from "@/lib/analysis-activities";

export type WorkspaceSummarySub = "human" | "technical";
export type WorkspaceQualityKind = "smells" | "deadcode" | "bugs";
export type WorkspaceProficiency =
  | "nontech"
  | "junior"
  | "intermediate"
  | "senior"
  | "architect"
  | "cto";

export type PersistedAnalysisActivity = {
  activity_kind: AnalysisActivityKind | string;
  result_content: string | null;
  result_metadata: unknown;
};

export type WorkspaceHistoryDrafts = {
  summaryText: string;
  summarySub: WorkspaceSummarySub;
  proficiency: WorkspaceProficiency;
  qualityText: string;
  qualityKind: WorkspaceQualityKind;
  securityText: string;
  aiOriginText: string;
  fixText: string;
};

const SUMMARY_SUBS = new Set<WorkspaceSummarySub>(["human", "technical"]);
const QUALITY_KINDS = new Set<WorkspaceQualityKind>(["smells", "deadcode", "bugs"]);
const PROFICIENCIES = new Set<WorkspaceProficiency>([
  "nontech",
  "junior",
  "intermediate",
  "senior",
  "architect",
  "cto",
]);

function metadataValue(metadata: unknown, key: string): unknown {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
  return (metadata as Record<string, unknown>)[key];
}

function asSummarySub(value: unknown): WorkspaceSummarySub {
  return typeof value === "string" && SUMMARY_SUBS.has(value as WorkspaceSummarySub)
    ? (value as WorkspaceSummarySub)
    : "human";
}

function asQualityKind(value: unknown): WorkspaceQualityKind {
  return typeof value === "string" && QUALITY_KINDS.has(value as WorkspaceQualityKind)
    ? (value as WorkspaceQualityKind)
    : "smells";
}

function asProficiency(value: unknown): WorkspaceProficiency {
  return typeof value === "string" && PROFICIENCIES.has(value as WorkspaceProficiency)
    ? (value as WorkspaceProficiency)
    : "intermediate";
}

export function buildWorkspaceHistoryDrafts(
  activities: PersistedAnalysisActivity[],
): WorkspaceHistoryDrafts {
  const drafts: WorkspaceHistoryDrafts = {
    summaryText: "",
    summarySub: "human",
    proficiency: "intermediate",
    qualityText: "",
    qualityKind: "smells",
    securityText: "",
    aiOriginText: "",
    fixText: "",
  };

  for (const activity of activities) {
    const content = activity.result_content?.trim();
    if (!content) continue;

    if (activity.activity_kind === "llm_explanation" && !drafts.summaryText) {
      drafts.summaryText = content;
      drafts.summarySub = asSummarySub(metadataValue(activity.result_metadata, "explanation_type"));
      drafts.proficiency = asProficiency(metadataValue(activity.result_metadata, "proficiency"));
      continue;
    }

    if (activity.activity_kind === "llm_quality_analysis" && !drafts.qualityText) {
      drafts.qualityText = content;
      drafts.qualityKind = asQualityKind(metadataValue(activity.result_metadata, "kind"));
      continue;
    }

    if (activity.activity_kind === "llm_security_analysis" && !drafts.securityText) {
      drafts.securityText = content;
      continue;
    }

    if (activity.activity_kind === "llm_ai_origin_analysis" && !drafts.aiOriginText) {
      drafts.aiOriginText = content;
      continue;
    }

    if (activity.activity_kind === "llm_fix_generation" && !drafts.fixText) {
      drafts.fixText = content;
    }
  }

  return drafts;
}
