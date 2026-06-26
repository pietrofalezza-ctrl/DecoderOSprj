# PE Static Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explainable static PE parsing, indicators, scoring, and a structured Malware tab report to DecoderOSprj.

**Architecture:** Keep the existing `runStaticMalwareScan` server function and `Malware` workspace tab. Add pure TypeScript parser/analysis modules that run on uploaded file bytes server-side and return a stable JSON report shape consumed by the current UI.

**Tech Stack:** TanStack Start server functions, React 19, TypeScript strict mode, Supabase Storage, Tailwind v4/shadcn, lucide-react, Vitest.

---

## File Structure

- Create `src/types/analysis.ts`: shared PE report, indicator, score, and section/import/export types.
- Create `src/lib/analysis/entropy.ts`: wrapper helpers around existing Shannon entropy for whole-file and section data.
- Create `src/lib/analysis/strings.ts`: bounded ASCII/UTF-16LE string extraction and keyword matching.
- Create `src/lib/pe/parser.ts`: dependency-free PE parser over `Uint8Array`.
- Create `src/lib/analysis/rules.ts`: explainable indicator rules for PE structure, APIs, strings, and opcode patterns.
- Create `src/lib/analysis/scoring.ts`: technique and global score aggregation.
- Modify `src/lib/static-malware.server.ts`: include PE analysis in the existing static malware report when file bytes are PE.
- Modify `src/lib/static-malware.functions.ts`: preserve current server function contract and return the richer report.
- Modify `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`: render structured PE report cards/tables and JSON export.
- Add tests under `src/lib/__tests__/pe-parser.test.ts` and `src/lib/__tests__/pe-analysis.test.ts`.

## Task 1: PE Parser RED/GREEN

**Files:**

- Create: `src/lib/__tests__/pe-parser.test.ts`
- Create: `src/lib/pe/parser.ts`
- Create: `src/types/analysis.ts`

- [ ] **Step 1: Write failing parser tests**

Create tests that build a minimal PE32 byte array with DOS header, NT signature, one `.text` section, and entry point RVA inside that section. Assert parser output includes machine, architecture, section metadata, entry point section, and clean non-PE error handling.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/lib/__tests__/pe-parser.test.ts`

Expected: fails because `src/lib/pe/parser.ts` does not exist.

- [ ] **Step 3: Implement minimal parser**

Implement `parsePeFile(bytes: Uint8Array): PeParseResult` with bounded reads, little-endian helpers, DOS/NT/COFF/optional header parsing, section parsing, RVA-to-offset mapping, entry point section lookup, and overlay detection.

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run src/lib/__tests__/pe-parser.test.ts`

Expected: tests pass.

## Task 2: Entropy And Strings RED/GREEN

**Files:**

- Create: `src/lib/analysis/entropy.ts`
- Create: `src/lib/analysis/strings.ts`
- Modify: `src/lib/__tests__/pe-analysis.test.ts`

- [ ] **Step 1: Write failing tests**

Assert section entropy uses the existing Shannon behavior and suspicious ASCII/UTF-16LE strings such as `VirtualAllocEx`, `ntdll.dll`, and `IsDebuggerPresent` are extracted from bounded bytes.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/lib/__tests__/pe-analysis.test.ts`

Expected: fails because analysis helpers do not exist.

- [ ] **Step 3: Implement helpers**

Add `calculateEntropy(bytes)`, `calculateSectionEntropy(bytes, section)`, `extractAsciiStrings(bytes, options)`, `extractUtf16LeStrings(bytes, options)`, and `findStringMatches(strings, keywords)`.

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run src/lib/__tests__/pe-analysis.test.ts`

Expected: helper tests pass.

## Task 3: Rules And Scoring RED/GREEN

**Files:**

- Create: `src/lib/analysis/rules.ts`
- Create: `src/lib/analysis/scoring.ts`
- Modify: `src/lib/__tests__/pe-analysis.test.ts`

- [ ] **Step 1: Write failing rule tests**

Assert process injection APIs produce process injection indicators, hollowing API combinations produce hollowing likelihood, `0F 05` and x64 syscall stub bytes produce syscall indicators, `KnownDlls`/`ntdll.dll` evidence produces unhooking indicators, anti-debug/VM strings produce anti-analysis indicators, and scores stay within 0-100.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/lib/__tests__/pe-analysis.test.ts`

Expected: fails because rule/scoring modules do not exist.

- [ ] **Step 3: Implement rules**

Add keyword/API groups and structural checks for packing, suspicious sections, RWX permissions, entry point in suspicious or writable section, raw/virtual size mismatch, overlay entropy, imports scarcity, suspicious APIs, opcode patterns, and dynamic API resolution.

- [ ] **Step 4: Implement scoring**

Aggregate indicator weights by technique, cap each technique score at 100, compute global score from the strongest technique score plus weighted indicator density, and map legacy decision `allow|warn|block` without using definitive malware language.

- [ ] **Step 5: Verify GREEN**

Run: `npx vitest run src/lib/__tests__/pe-analysis.test.ts`

Expected: rule/scoring tests pass.

## Task 4: Static Malware Integration RED/GREEN

**Files:**

- Modify: `src/lib/static-malware.server.ts`
- Modify: `src/lib/__tests__/static-malware.server.test.ts`
- Modify: `src/lib/__tests__/static-scan.server.test.ts`

- [ ] **Step 1: Write failing integration tests**

Assert `assessStaticMalwareFile("sample.exe", peBytes)` returns a report with `pe`, `sections`, `imports`, `techniqueScores`, `globalScore`, and PE indicators. Assert non-PE files keep the generic report path and do not throw.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/lib/__tests__/static-malware.server.test.ts src/lib/__tests__/static-scan.server.test.ts`

Expected: fails because the current report type lacks PE fields.

- [ ] **Step 3: Integrate parser and scoring**

Call `parsePeFile` inside `assessStaticMalwareFile`. If parsing succeeds, enrich the report with PE analysis. If parsing fails because the file is not PE, keep the existing generic assessment. If parsing fails because the file is malformed PE, return a clean warning indicator.

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run src/lib/__tests__/static-malware.server.test.ts src/lib/__tests__/static-scan.server.test.ts`

Expected: updated and existing static malware tests pass.

## Task 5: Malware Tab UI

**Files:**

- Modify: `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`

- [ ] **Step 1: Add JSON export action**

When `mainTab === "malware"` and `malwareReport` exists, add an action that downloads `malwareReport` as formatted JSON. Keep the existing Markdown copy/download behavior.

- [ ] **Step 2: Replace PE panel layout**

Update `MalwareReportPanel` so PE reports show methodology banner, score strip, technique cards, PE summary chips, sections table, indicators list, imports/API evidence, overlay summary, and errors/warnings. Non-PE reports continue to show the existing generic heuristic signals.

- [ ] **Step 3: Run build check**

Run: `npm run build`

Expected: build passes.

## Task 6: Final Verification And Documentation

**Files:**

- Modify: `ai-sandbox/logbooks/LOGBOOK_PROJECT.md`

- [ ] **Step 1: Run targeted tests**

Run: `npx vitest run src/lib/__tests__/pe-parser.test.ts src/lib/__tests__/pe-analysis.test.ts src/lib/__tests__/static-malware.server.test.ts src/lib/__tests__/static-scan.server.test.ts`

Expected: targeted tests pass.

- [ ] **Step 2: Run broad checks**

Run: `npm test`, `npm run build`, and `npm run lint`.

Expected: build passes. Test/lint outcomes are recorded with clear separation between new failures and known pre-existing failures.

- [ ] **Step 3: Update logbook**

Record files changed, test results, and residual risks in `ai-sandbox/logbooks/LOGBOOK_PROJECT.md`.
