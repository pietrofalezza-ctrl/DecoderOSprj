import { describe, it, expect } from "vitest";
import {
  buildAnalysisPrompt,
  buildFixPrompt,
  buildFolderAggregatePrompt,
} from "../analysis-prompt";

// ─── buildAnalysisPrompt ───────────────────────────────────────────

describe("buildAnalysisPrompt", () => {
  const sampleCode = "function hello() {\n  return 42;\n}\n";

  it("returns system and user strings", () => {
    const p = buildAnalysisPrompt({
      kind: "smells",
      language: "en",
      filePath: "src/hello.ts",
      fileContent: sampleCode,
    });
    expect(p.system).toBeTruthy();
    expect(p.user).toBeTruthy();
    expect(p.system).toContain("code smells");
    expect(p.user).toContain("src/hello.ts");
    expect(p.user).toContain("```");
  });

  it("includes lang-specific instructions for all languages", () => {
    for (const lang of ["en", "it", "zh"] as const) {
      const p = buildAnalysisPrompt({
        kind: "bugs",
        language: lang,
        filePath: "app.ts",
        fileContent: sampleCode,
      });
      expect(p.system.length).toBeGreaterThan(10);
      expect(p.user.length).toBeGreaterThan(10);
    }
  });

  it("includes findings block for non-ai_origin kinds", () => {
    for (const kind of ["smells", "deadcode", "bugs", "security"] as const) {
      const p = buildAnalysisPrompt({
        kind,
        language: "en",
        filePath: "f.ts",
        fileContent: sampleCode,
      });
      expect(p.system).toContain("insights-json");
    }
  });

  it("excludes findings block for ai_origin", () => {
    const p = buildAnalysisPrompt({
      kind: "ai_origin",
      language: "en",
      filePath: "src/ml.ts",
      fileContent: sampleCode,
    });
    expect(p.system).not.toContain("insights-json");
    expect(p.system).toContain("SCORE:");
    expect(p.system).toContain("VERDICT:");
  });

  it("truncates file content at 60K chars", () => {
    const bigContent = "A".repeat(70_000);
    const p = buildAnalysisPrompt({
      kind: "smells",
      language: "en",
      filePath: "big.ts",
      fileContent: bigContent,
    });
    expect(p.user).toContain("truncated");
    expect(p.user.length).toBeLessThan(70_000 + 200);
  });

  it("does not truncate content under 60K", () => {
    const small = "abc".repeat(1000);
    const p = buildAnalysisPrompt({
      kind: "bugs",
      language: "en",
      filePath: "small.ts",
      fileContent: small,
    });
    expect(p.user).not.toContain("truncated");
  });

  it("includes focus for each kind", () => {
    expect(
      buildAnalysisPrompt({ kind: "deadcode", language: "en", filePath: "x.ts", fileContent: "x" })
        .system,
    ).toContain("dead code");
    expect(
      buildAnalysisPrompt({ kind: "security", language: "en", filePath: "x.ts", fileContent: "x" })
        .system,
    ).toContain("security");
  });
});

// ─── buildFixPrompt ────────────────────────────────────────────────

describe("buildFixPrompt", () => {
  it("returns system and user strings with diff instructions", () => {
    const p = buildFixPrompt({
      language: "en",
      filePath: "src/bug.ts",
      fileContent: "function bad() { return; }\n",
      analysisMarkdown: "## Issue\nMissing return value.",
      kindLabel: "bugs",
    });
    expect(p.system).toContain("unified-diff");
    expect(p.user).toContain("src/bug.ts");
    expect(p.user).toContain("Missing return value.");
  });
});

// ─── buildFolderAggregatePrompt ────────────────────────────────────

describe("buildFolderAggregatePrompt", () => {
  it("returns system with folder synthesis instructions", () => {
    const p = buildFolderAggregatePrompt({
      language: "en",
      kindLabel: "quality",
      folderPath: "src/utils",
      perFile: [
        { path: "src/utils/a.ts", excerpt: "## Issue 1\nLong function in a.ts" },
        { path: "src/utils/b.ts", excerpt: "## Issue 2\nDead code in b.ts" },
      ],
    });
    expect(p.system).toContain("Sintesi");
    expect(p.system).toContain("Pattern ricorrenti");
    expect(p.user).toContain("src/utils");
    expect(p.user).toContain("src/utils/a.ts");
    expect(p.user).toContain("src/utils/b.ts");
  });

  it("handles empty perFile array", () => {
    const p = buildFolderAggregatePrompt({
      language: "it",
      kindLabel: "security",
      folderPath: "empty/",
      perFile: [],
    });
    expect(p.user).toContain("Number of files: 0");
  });
});
