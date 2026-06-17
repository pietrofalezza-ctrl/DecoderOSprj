import { describe, it, expect } from "vitest";
import {
  extractInsightBundle,
  extractFindings,
  stripFindingsBlock,
  compareFindings,
  severityBadgeClass,
  categoryBadgeClass,
  categoryDecorationClass,
  categoryGlyphClass,
  type Finding,
  type FindingSeverity,
} from "../findings";

// ─── extractInsightBundle ──────────────────────────────────────────

describe("extractInsightBundle", () => {
  it("returns empty bundle for empty text", () => {
    const b = extractInsightBundle("");
    expect(b.findings).toEqual([]);
    expect(b.unmapped).toEqual([]);
  });

  it("returns empty bundle for text with no fenced block", () => {
    const b = extractInsightBundle("just some markdown\nno json here\n");
    expect(b.findings).toEqual([]);
    expect(b.unmapped).toEqual([]);
  });

  it("parses new-style { insights, unmapped_insights } object", () => {
    const json = JSON.stringify({
      insights: [
        {
          id: "f1",
          category: "quality",
          severity: "medium",
          title: "Long function",
          explanation: "The function is too long",
          suggested_action: "Split it",
          start_line: 10,
          end_line: 50,
        },
      ],
      unmapped_insights: [
        {
          title: "General note",
          explanation: "Something file-level",
          reason_not_mapped: "Not line-specific",
        },
      ],
    });
    const b = extractInsightBundle("Some text\n```insights-json\n" + json + "\n```\n");
    expect(b.findings).toHaveLength(1);
    expect(b.findings[0].title).toBe("Long function");
    expect(b.findings[0].start_line).toBe(10);
    expect(b.findings[0].end_line).toBe(50);
    expect(b.findings[0].severity).toBe("medium");
    expect(b.unmapped).toHaveLength(1);
    expect(b.unmapped[0].title).toBe("General note");
  });

  it("parses legacy array-of-findings format", () => {
    const json = JSON.stringify([
      { severity: "high", title: "Security hole", explanation: "SQL injection", start_line: 42, end_line: 42 },
      { severity: "low", title: "Unused var", explanation: "Never read", start_line: 15, end_line: 15 },
    ]);
    const b = extractInsightBundle("```findings-json\n" + json + "\n```\n");
    expect(b.findings).toHaveLength(2);
    expect(b.findings[0].severity).toBe("high");
    expect(b.findings[1].severity).toBe("low");
    expect(b.unmapped).toEqual([]);
  });

  it("treats items without line info as unmapped", () => {
    const json = JSON.stringify({
      insights: [
        { title: "Mapped", explanation: "has lines", start_line: 1, end_line: 5 },
        { title: "Unmapped", explanation: "no line info here" },
      ],
    });
    const b = extractInsightBundle("```insights-json\n" + json + "\n```\n");
    expect(b.findings).toHaveLength(1);
    expect(b.unmapped).toHaveLength(1);
    expect(b.unmapped[0].title).toBe("Unmapped");
  });

  it("returns empty on malformed JSON", () => {
    const b = extractInsightBundle("```insights-json\n{invalid json...\n```\n");
    expect(b.findings).toEqual([]);
    expect(b.unmapped).toEqual([]);
  });

  it("caps findings at 100", () => {
    const items = Array.from({ length: 150 }, (_, i) => ({
      severity: "info",
      title: `Item ${i}`,
      explanation: "...",
      start_line: i + 1,
      end_line: i + 1,
    }));
    const json = JSON.stringify({ insights: items });
    const b = extractInsightBundle("```insights-json\n" + json + "\n```\n");
    expect(b.findings.length).toBeLessThanOrEqual(100);
  });

  it("caps unmapped at 30", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      title: `Unmapped ${i}`,
      explanation: "...",
    }));
    const json = JSON.stringify({ unmapped_insights: items });
    const b = extractInsightBundle("```insights-json\n" + json + "\n```\n");
    expect(b.unmapped.length).toBeLessThanOrEqual(30);
  });

  it("normalizes severity strings (warn → medium, error → high)", () => {
    const json = JSON.stringify([
      { severity: "warn", title: "Warn item", explanation: "...", start_line: 1, end_line: 1 },
      { severity: "error", title: "Error item", explanation: "...", start_line: 2, end_line: 2 },
      { severity: "WARNING", title: "Capitals", explanation: "...", start_line: 3, end_line: 3 },
    ]);
    const b = extractInsightBundle("```findings-json\n" + json + "\n```\n");
    expect(b.findings[0].severity).toBe("medium");
    expect(b.findings[1].severity).toBe("high");
    expect(b.findings[2].severity).toBe("medium");
  });

  it("supports alternative field names (startLine, endLine, message, detail)", () => {
    const json = JSON.stringify([
      { severity: "low", title: "Alt fields", message: "from message", startLine: 5, endLine: 10 },
    ]);
    const b = extractInsightBundle("```findings-json\n" + json + "\n```\n");
    expect(b.findings[0].message).toBe("from message");
    expect(b.findings[0].start_line).toBe(5);
    expect(b.findings[0].end_line).toBe(10);
  });

  it("applies fallbackCategory when item has no category", () => {
    const json = JSON.stringify([
      { severity: "info", title: "No cat", explanation: "...", start_line: 1, end_line: 1 },
    ]);
    const b = extractInsightBundle("```findings-json\n" + json + "\n```\n", 100000, "security");
    expect(b.findings[0].category).toBe("security");
  });

  it("clamps out-of-range line numbers", () => {
    const json = JSON.stringify([
      { severity: "info", title: "Test", explanation: "...", start_line: 0, end_line: 999999 },
    ]);
    const b = extractInsightBundle("```findings-json\n" + json + "\n```\n", 100);
    expect(b.findings[0].start_line).toBeGreaterThanOrEqual(1);
    expect(b.findings[0].end_line).toBeLessThanOrEqual(100);
  });

  it("tries insights-json first, then findings-json as fallback", () => {
    const json1 = JSON.stringify([{ severity: "high", title: "From insights", explanation: "...", start_line: 1, end_line: 1 }]);
    const json2 = JSON.stringify([{ severity: "low", title: "From findings", explanation: "...", start_line: 1, end_line: 1 }]);
    const b = extractInsightBundle(
      "```insights-json\n" + json1 + "\n```\n```findings-json\n" + json2 + "\n```\n",
    );
    expect(b.findings[0].title).toBe("From insights");
  });
});

// ─── extractFindings (legacy) ──────────────────────────────────────

describe("extractFindings", () => {
  it("returns only mapped findings", () => {
    const json = JSON.stringify({
      insights: [{ severity: "info", title: "Mapped", explanation: "...", start_line: 1, end_line: 1 }],
      unmapped_insights: [{ title: "Unmapped", explanation: "..." }],
    });
    const findings = extractFindings("```insights-json\n" + json + "\n```\n");
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toBe("Mapped");
  });
});

// ─── stripFindingsBlock ────────────────────────────────────────────

describe("stripFindingsBlock", () => {
  it("removes insights-json block", () => {
    const input = "## Analysis\nSome text.\n```insights-json\n{}\n```\n";
    const stripped = stripFindingsBlock(input);
    expect(stripped).toBe("## Analysis\nSome text.");
  });

  it("removes findings-json block (fallback tag)", () => {
    const input = "## Analysis\n```findings-json\n[]\n```\n";
    const stripped = stripFindingsBlock(input);
    expect(stripped).toBe("## Analysis");
  });

  it("returns empty string unchanged", () => {
    expect(stripFindingsBlock("")).toBe("");
  });

  it("keeps text without any fenced block unchanged (except trailing whitespace)", () => {
    const input = "Just some markdown.\nNo blocks here.";
    expect(stripFindingsBlock(input)).toBe(input);
    // stripFindingsBlock calls trimEnd()
    expect(stripFindingsBlock("Just some markdown.\nNo blocks here.\n")).toBe("Just some markdown.\nNo blocks here.");
  });
});

// ─── compareFindings ───────────────────────────────────────────────

describe("compareFindings", () => {
  const f = (severity: FindingSeverity, start: number): Finding => ({
    id: "x",
    title: "x",
    message: "",
    severity,
    start_line: start,
    end_line: start,
  });

  it("orders by severity (critical > high > medium > low > info)", () => {
    const items = [
      f("low", 1),
      f("critical", 2),
      f("medium", 3),
      f("high", 4),
      f("info", 5),
    ];
    items.sort(compareFindings);
    expect(items[0].severity).toBe("critical");
    expect(items[1].severity).toBe("high");
    expect(items[2].severity).toBe("medium");
    expect(items[3].severity).toBe("low");
    expect(items[4].severity).toBe("info");
  });

  it("orders by start_line when severity is equal", () => {
    const items = [f("medium", 30), f("medium", 10)];
    items.sort(compareFindings);
    expect(items[0].start_line).toBe(10);
    expect(items[1].start_line).toBe(30);
  });
});

// ─── severityBadgeClass ────────────────────────────────────────────

describe("severityBadgeClass", () => {
  it("returns non-empty string for all severities", () => {
    for (const s of ["critical", "high", "medium", "low", "info"] as FindingSeverity[]) {
      expect(severityBadgeClass(s)).toBeTruthy();
      expect(typeof severityBadgeClass(s)).toBe("string");
    }
  });
});

// ─── categoryBadgeClass ────────────────────────────────────────────

describe("categoryBadgeClass", () => {
  it("returns correct class for each category", () => {
    expect(categoryBadgeClass("security")).toContain("red");
    expect(categoryBadgeClass("quality")).toContain("amber");
    expect(categoryBadgeClass("architecture")).toContain("blue");
    expect(categoryBadgeClass("ai_origin")).toContain("violet");
    expect(categoryBadgeClass("comment")).toContain("teal");
    expect(categoryBadgeClass("summary")).toContain("teal");
  });

  it("returns teal default for undefined", () => {
    expect(categoryBadgeClass()).toContain("teal");
  });
});

// ─── categoryDecorationClass ───────────────────────────────────────

describe("categoryDecorationClass", () => {
  it("returns decoder-finding prefixed class for each category", () => {
    expect(categoryDecorationClass("security")).toContain("decoder-cat--security");
    expect(categoryDecorationClass("quality")).toContain("decoder-cat--quality");
    expect(categoryDecorationClass("summary")).toContain("decoder-cat--summary");
  });
});

// ─── categoryGlyphClass ────────────────────────────────────────────

describe("categoryGlyphClass", () => {
  it("returns decoder-finding-glyph prefixed class for each category", () => {
    expect(categoryGlyphClass("security")).toContain("decoder-cat-glyph--security");
    expect(categoryGlyphClass("ai_origin")).toContain("decoder-cat-glyph--ai-origin");
  });
});
