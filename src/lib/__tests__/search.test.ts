import { describe, expect, it } from "vitest";

import {
  filterFilesBySearch,
  normalizeSearchQuery,
  shouldPersistSearchQuery,
  type SearchableFile,
} from "../search";

const files: SearchableFile[] = [
  { id: "1", path: "src/routes/auth.tsx", language: "typescript" },
  { id: "2", path: "src/lib/static-malware.server.ts", language: "typescript" },
  { id: "3", path: "README.md", language: "markdown" },
];

describe("repository search helpers", () => {
  it("normalizes query whitespace and casing without losing user terms", () => {
    expect(normalizeSearchQuery("  Static   Malware  ")).toBe("static malware");
  });

  it("returns all files for an empty query", () => {
    expect(filterFilesBySearch(files, " ")).toEqual(files);
  });

  it("matches every query token against file path or language", () => {
    expect(filterFilesBySearch(files, "static ts")).toEqual([files[1]]);
    expect(filterFilesBySearch(files, "markdown")).toEqual([files[2]]);
  });

  it("persists only meaningful new normalized queries", () => {
    expect(shouldPersistSearchQuery("a", null)).toBe(false);
    expect(shouldPersistSearchQuery("  auth  ", "auth")).toBe(false);
    expect(shouldPersistSearchQuery("  auth  ", null)).toBe(true);
  });
});
