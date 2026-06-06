import { unzipSync, strFromU8 } from "fflate";

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

const MAX_FILE_BYTES = 1024 * 1024; // 1 MB
const MAX_TOTAL_FILES = 2000;

export type ExtractedFile = {
  path: string;
  bytes: Uint8Array;
  language: string | null;
};

export function extractZip(zipBytes: Uint8Array): ExtractedFile[] {
  const entries = unzipSync(zipBytes);
  const out: ExtractedFile[] = [];

  for (const [rawPath, bytes] of Object.entries(entries)) {
    if (rawPath.endsWith("/")) continue; // directory
    const segments = rawPath.split("/").filter(Boolean);
    // Strip a single common root folder if present (e.g. repo-main/)
    if (segments.some((s) => SKIP_DIRS.has(s.toLowerCase()))) continue;
    const path = segments.join("/");
    if (bytes.length === 0 || bytes.length > MAX_FILE_BYTES) continue;

    const lower = path.toLowerCase();
    const ext = lower.includes(".") ? lower.split(".").pop()! : "";
    const baseName = segments[segments.length - 1].toLowerCase();
    const isTextByName = baseName === "dockerfile" || baseName === "makefile" || baseName === "readme";
    if (!TEXT_EXT.has(ext) && !isTextByName) continue;

    // quick binary sniff: presence of null byte in first 4KB
    const sniff = bytes.slice(0, Math.min(4096, bytes.length));
    let hasNull = false;
    for (let i = 0; i < sniff.length; i++) if (sniff[i] === 0) { hasNull = true; break; }
    if (hasNull) continue;

    const language = LANG_BY_EXT[ext] ?? (isTextByName ? "shell" : null);
    out.push({ path, bytes, language });

    if (out.length >= MAX_TOTAL_FILES) break;
  }

  // Strip common root folder e.g. "repo-main/..."
  if (out.length > 0) {
    const firstSeg = out[0].path.split("/")[0];
    const allShare = out.every((f) => f.path.split("/")[0] === firstSeg);
    if (allShare && out.some((f) => f.path.includes("/"))) {
      for (const f of out) f.path = f.path.slice(firstSeg.length + 1);
    }
  }

  return out;
}

export function decodeText(bytes: Uint8Array): string {
  return strFromU8(bytes);
}
