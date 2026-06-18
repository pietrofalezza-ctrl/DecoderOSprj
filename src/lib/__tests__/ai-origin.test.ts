import { describe, it, expect } from "vitest";
import { parseAiOriginScore, bucketize, weightedRepoScore, bucketColorClass } from "../ai-origin";

// ─── parseAiOriginScore ────────────────────────────────────────────

describe("parseAiOriginScore", () => {
  it("extracts score from SCORE: NN format", () => {
    expect(parseAiOriginScore("SCORE: 85")).toBe(85);
    expect(parseAiOriginScore("score: 42")).toBe(42);
    expect(parseAiOriginScore("SCORE : 0")).toBe(0);
    expect(parseAiOriginScore("SCORE=100")).toBe(100);
  });

  it("clamps score to 0–100", () => {
    expect(parseAiOriginScore("SCORE: 150")).toBe(100);
    // Negative numbers don't match the regex, so it returns null
    expect(parseAiOriginScore("SCORE: -10")).toBeNull();
  });

  it("returns null when no score found", () => {
    expect(parseAiOriginScore("")).toBeNull();
    expect(parseAiOriginScore("no score here")).toBeNull();
    expect(parseAiOriginScore("SCORES: 50")).toBeNull();
  });

  it("returns null for non-numeric score", () => {
    expect(parseAiOriginScore("SCORE: high")).toBeNull();
  });

  it("finds score in first 400 characters only", () => {
    const prefix = "x".repeat(390);
    expect(parseAiOriginScore(prefix + "SCORE: 99")).toBe(99);
    const tooFar = "x".repeat(500) + "SCORE: 50";
    expect(parseAiOriginScore(tooFar)).toBeNull();
  });
});

// ─── bucketize ─────────────────────────────────────────────────────

describe("bucketize", () => {
  it("returns human for scores 0–29", () => {
    expect(bucketize(0)).toBe("human");
    expect(bucketize(10)).toBe("human");
    expect(bucketize(29)).toBe("human");
  });

  it("returns mixed for scores 30–69", () => {
    expect(bucketize(30)).toBe("mixed");
    expect(bucketize(50)).toBe("mixed");
    expect(bucketize(69)).toBe("mixed");
  });

  it("returns ai for scores 70–100", () => {
    expect(bucketize(70)).toBe("ai");
    expect(bucketize(85)).toBe("ai");
    expect(bucketize(100)).toBe("ai");
  });
});

// ─── weightedRepoScore ─────────────────────────────────────────────

describe("weightedRepoScore", () => {
  it("returns 0 for empty input", () => {
    expect(weightedRepoScore([])).toBe(0);
  });

  it("returns 0 when total weight is 0", () => {
    expect(weightedRepoScore([{ score: 80, weight: 0 }])).toBe(0);
  });

  it("computes weighted average", () => {
    const items = [
      { score: 80, weight: 2 },
      { score: 40, weight: 1 },
    ];
    // (80*2 + 40*1) / 3 = 200/3 ≈ 66.67 → 67
    const result = weightedRepoScore(items);
    expect(result).toBe(67);
  });

  it("returns the score when single item with weight > 0", () => {
    expect(weightedRepoScore([{ score: 75, weight: 5 }])).toBe(75);
  });

  it("rounds to nearest integer", () => {
    const items = [
      { score: 10, weight: 1 },
      { score: 20, weight: 1 },
      { score: 30, weight: 1 },
    ];
    // (10+20+30)/3 = 20
    expect(weightedRepoScore(items)).toBe(20);
  });
});

// ─── bucketColorClass ──────────────────────────────────────────────

describe("bucketColorClass", () => {
  it("returns non-empty strings", () => {
    expect(bucketColorClass("human")).toBeTruthy();
    expect(bucketColorClass("mixed")).toBeTruthy();
    expect(bucketColorClass("ai")).toBeTruthy();
  });

  it("returns different classes for different buckets", () => {
    expect(bucketColorClass("human")).not.toBe(bucketColorClass("ai"));
    expect(bucketColorClass("mixed")).not.toBe(bucketColorClass("human"));
  });
});
