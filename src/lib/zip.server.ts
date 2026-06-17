import { unzipSync, strFromU8 } from "fflate";

import { assessStaticRisk, type StaticRiskAssessment } from "./static-risk.server";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
  "target",
  ".idea",
  ".vscode",
]);

const TEXT_EXT = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs", "json", "md", "mdx", "yaml", "yml",
  "toml", "ini", "env", "sh", "bash", "zsh", "py", "rb", "go", "rs", "java",
  "kt", "kts", "swift", "c", "h", "cpp", "hpp", "cc", "cs", "php", "html",
  "htm", "css", "scss", "less", "vue", "svelte", "astro", "sql", "graphql",
  "gql", "lua", "pl", "ex", "exs", "erl", "clj", "cljs", "dart", "elm", "fs",
  "fsx", "scala", "groovy", "tf", "dockerfile", "makefile", "txt", "xml",
  "proto", "r", "jl", "nim", "zig",
]);

const LANG_BY_EXT: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  mjs: "javascript", cjs: "javascript", json: "json", md: "markdown",
  mdx: "markdown", yml: "yaml", yaml: "yaml", toml: "ini", ini: "ini",
  sh: "shell", bash: "shell", zsh: "shell", py: "python", rb: "ruby",
  go: "go", rs: "rust", java: "java", kt: "kotlin", swift: "swift",
  c: "c", h: "c", cpp: "cpp", hpp: "cpp", cc: "cpp", cs: "csharp",
  php: "php", html: "html", htm: "html", css: "css", scss: "scss",
  less: "less", vue: "html", svelte: "html", sql: "sql", graphql: "graphql",
  gql: "graphql", lua: "lua", dart: "dart", scala: "scala", xml: "xml",
};

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB
const MAX_TOTAL_FILES = 2000;
const MAX_PATH_BYTES = 240;

export type ExtractedFile = {
  path: string;
  bytes: Uint8Array;
  language: string | null;
};

export type ExtractionFinding = StaticRiskAssessment["findings"][number];

export type ExtractionReport = {
  files: ExtractedFile[];
  findings: {
    blocked: ExtractionFinding[];
    warned: ExtractionFinding[];
  };
  droppedPaths: string[];
};

export function extractZip(zipBytes: Uint8Array): ExtractedFile[] {
  return extractZipWithReport(zipBytes).files;
}

export function extractZipWithReport(zipBytes: Uint8Array): ExtractionReport {
  const entries = unzipSync(zipBytes);
  const out: ExtractedFile[] = [];
  const blocked: ExtractionFinding[] = [];
  const warned: ExtractionFinding[] = [];
  const droppedPaths: string[] = [];

  for (const [rawPath, bytes] of Object.entries(entries)) {
    if (rawPath.endsWith("/")) continue; // directory
    if (rawPath.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(rawPath)) {
      droppedPaths.push(rawPath);
      continue;
    }
    const normalized = rawPath.replace(/\\/g, "/");
    const segments = normalized.split("/").filter(Boolean);

    if (segments.some((s) => s === "..")) {
      droppedPaths.push(rawPath);
      continue;
    }
    if (segments.some((s) => SKIP_DIRS.has(s.toLowerCase()))) {
      droppedPaths.push(rawPath);
      continue;
    }

    const path = segments.join("/");
    if (!path || path.length > MAX_PATH_BYTES) {
      droppedPaths.push(rawPath);
      continue;
    }

    if (bytes.length > MAX_FILE_BYTES) {
      droppedPaths.push(rawPath);
      continue;
    }

    if (bytes.length === 0) {
      warned.push({
        path,
        severity: "warn",
        reasons: ["Empty file stored for offline review"],
        entropy: {
          global: 0,
          maxWindow: 0,
        },
        magicSignature: "none",
      });
    }

    const lower = path.toLowerCase();
    const ext = lower.includes(".") ? lower.split(".").pop()! : "";
    const baseName = segments[segments.length - 1].toLowerCase();
    const isTextByName = baseName === "dockerfile" || baseName === "makefile" || baseName === "readme";

    const risks = assessStaticRisk(path, ext, bytes).findings;
    for (const finding of risks) {
      if (finding.severity === "block") {
        blocked.push(finding);
      } else if (finding.severity === "warn") {
        warned.push(finding);
      }
    }

    if (!TEXT_EXT.has(ext) && !isTextByName) {
      warned.push({
        path,
        severity: "warn",
        reasons: [`Unsupported extension: .${ext || "unknown"}; retained for offline analysis`],
        entropy: {
          global: 0,
          maxWindow: 0,
        },
        magicSignature: "none",
      });
    }

    // quick binary sniff: presence of null byte in first 4KB
    const sniff = bytes.slice(0, Math.min(4096, bytes.length));
    let hasNull = false;
    for (let i = 0; i < sniff.length; i++) if (sniff[i] === 0) {
      hasNull = true;
      break;
    }
    if (hasNull) {
      warned.push({
        path,
        severity: "warn",
        reasons: ["Possible binary payload detected (null-bytes in first 4KB)."],
        entropy: {
          global: 0,
          maxWindow: 0,
        },
        magicSignature: "none",
      });
    }

    const language = LANG_BY_EXT[ext] ?? (isTextByName ? "shell" : null);
    out.push({ path, bytes, language });

    if (out.length >= MAX_TOTAL_FILES) {
      warned.push({
        path,
        severity: "warn",
        reasons: ["Total file count capped at 2000 entries"],
        entropy: {
          global: 0,
          maxWindow: 0,
        },
        magicSignature: "none",
      });
      break;
    }
  }

  if (out.length > 0) {
    const firstSeg = out[0].path.split("/")[0];
    const allShare = out.every((f) => f.path.split("/")[0] === firstSeg);
    if (allShare && out.some((f) => f.path.includes("/"))) {
      for (const f of out) f.path = f.path.slice(firstSeg.length + 1);
    }
  }

  return {
    files: out,
    findings: {
      blocked,
      warned,
    },
    droppedPaths,
  };
}

export function decodeText(bytes: Uint8Array): string {
  return strFromU8(bytes);
}
