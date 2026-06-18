import { describe, expect, it } from "vitest";

import { appendAnalysisActivity } from "../analysis-activities";

describe("appendAnalysisActivity", () => {
  it("persists LLM result content for durable conversation history", async () => {
    const inserted: unknown[] = [];
    const supabase = {
      from(table: string) {
        expect(table).toBe("analysis_activities");
        return {
          async insert(row: unknown) {
            inserted.push(row);
            return { error: null };
          },
        };
      },
    };

    await appendAnalysisActivity({
      supabase: supabase as never,
      ownerId: "00000000-0000-0000-0000-000000000001",
      fileId: "00000000-0000-0000-0000-000000000002",
      activity_kind: "llm_explanation",
      query_text: "src/App.tsx",
      result_summary: "fresh snippet explanation",
      result_content: "Persistent answer body",
      result_metadata: { cached: false },
    });

    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({
      activity_kind: "llm_explanation",
      query_text: "src/App.tsx",
      result_summary: "fresh snippet explanation",
      result_content: "Persistent answer body",
      result_metadata: { cached: false },
    });
  });
});
