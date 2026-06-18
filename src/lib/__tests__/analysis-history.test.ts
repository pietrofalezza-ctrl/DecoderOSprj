import { describe, expect, it } from "vitest";

import { buildWorkspaceHistoryDrafts, type PersistedAnalysisActivity } from "../analysis-history";

describe("buildWorkspaceHistoryDrafts", () => {
  it("hydrates workspace panels from persisted LLM activities", () => {
    const activities: PersistedAnalysisActivity[] = [
      {
        activity_kind: "llm_fix_generation",
        result_content: "```diff\n+fixed\n```",
        result_metadata: { kind: "bugs" },
      },
      {
        activity_kind: "llm_security_analysis",
        result_content: "Security persisted",
        result_metadata: { kind: "security" },
      },
      {
        activity_kind: "llm_quality_analysis",
        result_content: "Quality persisted",
        result_metadata: { kind: "bugs" },
      },
      {
        activity_kind: "llm_explanation",
        result_content: "Summary persisted",
        result_metadata: { explanation_type: "technical", proficiency: "senior" },
      },
      {
        activity_kind: "search_query",
        result_content: null,
        result_metadata: {},
      },
    ];

    expect(buildWorkspaceHistoryDrafts(activities)).toEqual({
      summaryText: "Summary persisted",
      summarySub: "technical",
      proficiency: "senior",
      qualityText: "Quality persisted",
      qualityKind: "bugs",
      securityText: "Security persisted",
      aiOriginText: "",
      fixText: "```diff\n+fixed\n```",
    });
  });

  it("keeps the first/newest content for each panel", () => {
    const activities: PersistedAnalysisActivity[] = [
      {
        activity_kind: "llm_explanation",
        result_content: "Newest",
        result_metadata: { explanation_type: "human" },
      },
      {
        activity_kind: "llm_explanation",
        result_content: "Older",
        result_metadata: { explanation_type: "technical" },
      },
    ];

    expect(buildWorkspaceHistoryDrafts(activities).summaryText).toBe("Newest");
    expect(buildWorkspaceHistoryDrafts(activities).summarySub).toBe("human");
  });
});
