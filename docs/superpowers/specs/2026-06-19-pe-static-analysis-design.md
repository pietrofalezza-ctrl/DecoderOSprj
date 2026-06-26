# PE Static Analysis Design

## Goal

Extend DecoderOSprj's existing offline `Malware` tab into an explainable static analysis toolkit for Windows PE files. The analyzer must never execute uploaded files, must not upload bytes to external services, and must avoid absolute verdicts such as "malware detected".

## Current Architecture

DecoderOSprj is a TanStack Start, React 19, Vite, TypeScript, Supabase, Tailwind v4/shadcn app. Repository uploads currently accept ZIP files, persist extracted file bytes in Supabase Storage, and expose selected file content through server functions. The workspace route already has a `malware` tab backed by `runStaticMalwareScan`, which downloads a selected file server-side and runs `assessStaticMalwareFile`.

Existing Shannon entropy helpers live in `src/lib/static-risk.server.ts`; the current malware scanner reuses them for generic magic-byte, entropy, path, and text obfuscation checks. The new PE work will keep that existing path and add PE-specific parsing, scoring, and UI presentation.

## Scope

This phase analyzes PE files selected from an already uploaded repository. It does not add arbitrary single-file upload outside the repository model. Non-PE files continue to receive a clean generic static assessment. PE parsing is bounded to DOS header, NT headers, COFF header, optional header, section table, entry point, import table, export table when possible, overlay metadata, section entropy, static strings, byte patterns, technique indicators, and JSON export.

The analyzer reports evidence as "indicators compatible with" techniques. It does not claim certainty and does not perform dynamic analysis, unpacking, emulation, signature matching, or AV-style detection.

## Data Model

The stable report object includes:

- `analysisVersion`
- `file`: path, size, extension, sha256 when already available or cheap to include, magic signature
- `pe`: format, machine, architecture, image base, subsystem, entry point RVA, entry point section, timestamps, header warnings
- `sections`: name, RVA, virtual size, raw offset, raw size, characteristics, permissions, entropy, entry-point marker, suspicious flags
- `imports`: DLL name plus imported API names or ordinals
- `exports`: exported symbols when parsable
- `entropy`: global, max window, per-section summary
- `strings`: matched suspicious strings and string-derived API evidence, bounded to avoid huge reports
- `overlay`: offset, size, entropy, present flag
- `indicators`: id, title, severity, weight, description, evidence, category, optional section/offset
- `techniqueScores`: packing/obfuscation, process injection, process hollowing, direct/indirect syscall, unhooking, anti-analysis, dynamic API resolution
- `globalScore`
- `warnings` and `errors`

## Parsing Design

`src/lib/pe/parser.ts` provides a dependency-free parser over `Uint8Array` and `DataView`. It validates `MZ`, resolves `e_lfanew`, validates `PE\0\0`, parses COFF and optional headers for PE32/PE32+, maps data directories, extracts sections, maps RVA to raw offsets, and detects overlay data by comparing file length with the maximum section raw end.

Imports are parsed from the import data directory when the RVA maps into a section. The parser supports import descriptors, import lookup/name tables, ordinal imports, and null-terminated ASCII names. Exports are parsed from the export directory when available. Malformed or truncated structures become warnings, not hard crashes.

## Analysis Design

`src/lib/analysis/entropy.ts` wraps the existing Shannon implementation and adds per-section helpers. `src/lib/analysis/strings.ts` extracts bounded ASCII and UTF-16LE strings and locates suspicious terms. `src/lib/analysis/rules.ts` evaluates PE structural and behavioral evidence. `src/lib/analysis/scoring.ts` turns weighted indicators into technique scores and a global score.

Rules are modular and explainable. Each rule emits a stable id, category, title, description, severity, numeric weight, evidence strings, and optional section or offset. Scores are capped and derived from indicator weights so future tuning is readable.

## UI Design

The existing right-hand workspace tab remains the home for this work. The `Malware` tab should show structured report UI before Markdown:

- methodology banner: static heuristic, no definitive verdict
- global score strip with severity color and score
- technique likelihood cards in a compact grid
- PE summary chips: architecture, sections, imports, entry point, overlay
- indicators table/cards grouped by severity and technique
- sections table with entropy, permissions, raw/virtual size, and entry-point marker
- import/API evidence list for suspicious APIs
- JSON report export button

The UI follows the current neutral, compact shadcn/Tailwind style: small cards, border-based separation, lucide icons, existing red/amber/emerald risk colors, and no new landing page or redesign.

## Testing

Tests are focused on pure parser and scoring behavior:

- valid minimal PE parses DOS/NT/section metadata
- corrupt/truncated/non-PE files return clean warnings or generic assessment
- entry point section resolution works
- overlay is detected
- imports and strings feed technique indicators
- syscall opcode and x64 syscall stub patterns are recognized
- score outputs stay bounded from 0 to 100
- existing static malware tests continue to pass

## Verification Plan

Run targeted Vitest suites first, then broader checks:

- `npx vitest run src/lib/__tests__/pe-parser.test.ts`
- `npx vitest run src/lib/__tests__/pe-analysis.test.ts src/lib/__tests__/static-malware.server.test.ts src/lib/__tests__/static-scan.server.test.ts`
- `npm run build`
- `npm test`
- `npm run lint` if existing unrelated lint errors are resolved or scoped output is useful

Known pre-change state on 2026-06-19: build passes; tests have one pre-existing CSRF hardening failure; lint has pre-existing Prettier/style failures.
