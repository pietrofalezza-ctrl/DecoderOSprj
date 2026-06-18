import { describe, it, expect } from "vitest";
import { buildPrompt, type Proficiency, type ExplanationType } from "../prompt";

const sampleCode = "export function add(a: number, b: number): number {\n  return a + b;\n}\n";

describe("buildPrompt", () => {
  it("returns system and user strings", () => {
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "en",
      filePath: "src/add.ts",
      fileContent: sampleCode,
    });
    expect(p.system).toBeTruthy();
    expect(p.user).toBeTruthy();
  });

  it("includes file path in user message", () => {
    const p = buildPrompt({
      proficiency: "junior",
      explanationType: "human",
      language: "en",
      filePath: "src/utils/helper.ts",
      fileContent: sampleCode,
    });
    expect(p.user).toContain("src/utils/helper.ts");
    expect(p.user).toContain("```");
  });

  it("includes file content in user message", () => {
    const p = buildPrompt({
      proficiency: "intermediate",
      explanationType: "technical",
      language: "en",
      filePath: "test.ts",
      fileContent: "const x = 1;",
    });
    expect(p.user).toContain("const x = 1;");
  });

  // ── Language ─────────────────────────────────────────────────────

  it("uses English language name for en", () => {
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "en",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("Reply in English");
  });

  it("uses Italian language name for it", () => {
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "it",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("Reply in Italian");
  });

  it("uses Chinese language name for zh", () => {
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "zh",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("Reply in Simplified Chinese");
  });

  // ── Proficiency (audience) ───────────────────────────────────────

  const audiences: Record<Proficiency, string> = {
    nontech: "non-technical",
    junior: "junior developer",
    intermediate: "intermediate developer",
    senior: "senior developer",
    architect: "software architect",
    cto: "CTO",
  };

  for (const [prof, label] of Object.entries(audiences)) {
    it(`includes audience "${label}" for proficiency ${prof}`, () => {
      const p = buildPrompt({
        proficiency: prof as Proficiency,
        explanationType: "technical",
        language: "en",
        filePath: "a.ts",
        fileContent: "x",
      });
      expect(p.system).toContain(label);
    });
  }

  // ── Explanation type ─────────────────────────────────────────────

  it("human explanation requests plain language, avoids jargon", () => {
    const p = buildPrompt({
      proficiency: "nontech",
      explanationType: "human",
      language: "en",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("plain language");
    expect(p.system).toContain("Avoid jargon");
  });

  it("technical explanation requests precise summary", () => {
    const p = buildPrompt({
      proficiency: "architect",
      explanationType: "technical",
      language: "en",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("technical summary");
    expect(p.system).toContain("responsibilities");
  });

  // ── Truncation ───────────────────────────────────────────────────

  it("truncates file content over 60K characters", () => {
    const big = "A".repeat(70_000);
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "en",
      filePath: "big.ts",
      fileContent: big,
    });
    expect(p.user).toContain("truncated");
    expect(p.user.length).toBeLessThan(65_000);
  });

  it("does not truncate content under 60K", () => {
    const small = "abc".repeat(1000);
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "en",
      filePath: "small.ts",
      fileContent: small,
    });
    expect(p.user).not.toContain("truncated");
  });

  // ── System prompt structure ──────────────────────────────────────

  it("system prompt includes insights-json block instructions", () => {
    const p = buildPrompt({
      proficiency: "intermediate",
      explanationType: "technical",
      language: "en",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("insights-json");
    expect(p.system).toContain("unmapped_insights");
  });

  it("system prompt mentions conciseness constraint", () => {
    const p = buildPrompt({
      proficiency: "cto",
      explanationType: "human",
      language: "it",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("350");
  });

  it("system prompt warns against fabricating behavior", () => {
    const p = buildPrompt({
      proficiency: "senior",
      explanationType: "technical",
      language: "en",
      filePath: "a.ts",
      fileContent: "x",
    });
    expect(p.system).toContain("Never invent");
  });
});
