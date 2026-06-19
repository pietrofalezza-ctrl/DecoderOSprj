# Lovable Handoff - PE Static Malware Analysis

## Summary

This project was extended with a static Windows PE analysis layer inside the existing DecoderOSprj architecture. The implementation keeps the current TanStack Start, React, Supabase Storage, Tailwind/shadcn UI, and existing `Malware` workspace tab.

The feature is static-only. It reads uploaded file bytes, parses PE structures, extracts indicators, and produces an explainable heuristic report. It does not execute files, does not unpack or emulate code, and does not produce absolute verdicts such as "malware detected".

## What Changed

### PE parser

Added a dependency-free parser:

- `src/lib/pe/parser.ts`

It parses:

- DOS header and `e_lfanew`
- PE signature
- COFF header
- PE32 and PE32+ optional headers
- section table
- entry point RVA and entry point section
- import table when readable
- export table when readable
- overlay data after the last section

Malformed or truncated PE structures are reported as clean warnings/errors instead of crashing the analysis path.

### Shared report types

Added:

- `src/types/analysis.ts`

The stable report model includes:

- file metadata
- PE metadata
- section metadata and entropy
- imports and exports
- string evidence
- overlay metadata
- explainable indicators
- technique scores
- global static risk score
- warnings and errors

### Analysis modules

Added:

- `src/lib/analysis/entropy.ts`
- `src/lib/analysis/strings.ts`
- `src/lib/analysis/rules.ts`
- `src/lib/analysis/scoring.ts`

These modules provide:

- Shannon entropy reuse for whole-file and section analysis
- bounded ASCII and UTF-16LE string extraction
- PE structural indicators
- process injection indicators
- process hollowing indicators
- direct/indirect syscall indicators
- ntdll unhooking/tampering indicators
- anti-analysis / anti-debug / anti-VM indicators
- dynamic API resolution indicators
- weighted technique scores and global score from 0 to 100

All indicators are phrased as compatibility signals, not certainty.

### Existing static malware scanner integration

Updated:

- `src/lib/static-malware.server.ts`

`assessStaticMalwareFile()` now preserves the previous generic scanner fields while adding PE-specific fields when the selected file is a valid PE.

For non-PE files, the scanner keeps a clean generic report shape:

- `analysisVersion: "generic-static-1"`
- `pe: null`
- empty PE sections/imports/exports
- generic entropy, magic-byte, path, and obfuscation checks

For PE files, it returns:

- `analysisVersion: "pe-static-1"`
- structured PE metadata
- section/import/export/overlay data
- technique scores
- PE indicators

### Malware tab UI

Updated:

- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`

The existing `Malware` tab now renders a structured PE report when PE data is present:

- methodology notice: static heuristic, not definitive verdict
- global static risk score
- technique likelihood cards
- PE summary
- entropy summary
- indicators list
- section table with permissions, entropy, raw size, virtual size, and entry point marker
- suspicious API evidence chips
- JSON report export button

The legacy generic report view remains for non-PE files.

### Tests

Added:

- `src/lib/__tests__/pe-parser.test.ts`
- `src/lib/__tests__/pe-analysis.test.ts`

Updated:

- `src/lib/__tests__/static-malware.server.test.ts`

Coverage includes:

- minimal PE parsing
- section metadata and permissions
- entry point section lookup
- import parsing
- overlay detection
- clean non-PE handling
- static string extraction
- PE technique indicators
- score capping
- static malware integration for PE and non-PE files

### Design docs

Added:

- `docs/superpowers/specs/2026-06-19-pe-static-analysis-design.md`
- `docs/superpowers/plans/2026-06-19-pe-static-analysis.md`

These document the implementation contract and follow-up plan.

## How To Use

1. Upload a ZIP repository through the existing project upload flow.
2. Open a repository workspace.
3. Select a Windows PE file from the file tree.
4. Open the `Malware` tab.
5. Click the existing run/analyze button.
6. Review the static risk score, technique cards, sections, indicators, and API evidence.
7. Use the JSON button in the tab toolbar to export the structured report.

The scanner runs server-side against bytes already stored in Supabase Storage. It does not send file bytes to LLM providers.

## Important Language

The UI and report should avoid definitive claims. Prefer:

- "Indicators compatible with process injection"
- "Evidence compatible with packing or obfuscation"
- "Static heuristic score"
- "Not a definitive malware verdict"

Avoid:

- "Malware detected"
- "This file is malicious"
- "Confirmed process injection"
- "Guaranteed packed"

## Verification Performed

Fresh checks after implementation:

```bash
npx vitest run src/lib/__tests__/pe-parser.test.ts src/lib/__tests__/pe-analysis.test.ts src/lib/__tests__/static-malware.server.test.ts src/lib/__tests__/static-scan.server.test.ts
```

Result: passed, 4 files / 39 tests.

```bash
npm run build
```

Result: passed.

```bash
npx eslint src/types/analysis.ts src/lib/analysis/entropy.ts src/lib/analysis/strings.ts src/lib/analysis/scoring.ts src/lib/analysis/rules.ts src/lib/pe/parser.ts src/lib/static-malware.server.ts src/lib/__tests__/pe-parser.test.ts src/lib/__tests__/pe-analysis.test.ts src/lib/__tests__/static-malware.server.test.ts 'src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx'
```

Result: passed with 0 errors.

```bash
git diff --check
```

Result: passed.

## Known Pre-Existing Project Issues

The broader project checks still have unrelated failures that were present before this PE work:

- `npm test` fails one existing CSRF hardening assertion in `src/lib/__tests__/ui-hardening.test.ts`.
- `npm run lint -- --quiet` fails on pre-existing issues in:
  - `src/integrations/supabase/types.ts`
  - `src/lib/__tests__/zip.server.test.ts`
  - `src/lib/repos.functions.ts`
  - `src/lib/source-static.server.ts`

Those files were not fixed as part of the PE analysis feature.

## Limitations

This is a static heuristic analyzer, not a complete malware analysis platform.

Current limits:

- no file execution
- no sandboxing or dynamic behavior tracing
- no unpacking
- no emulation
- no disassembly beyond simple byte-pattern checks
- no YARA/signature database
- bounded string extraction
- import/export parsing supports common PE layouts but should be expanded with more real-world fixtures
- rendered browser smoke for the new Malware panel has not been run yet

Recommended next step: add a small benign PE fixture or generated PE sample to test the rendered Malware tab end to end.
