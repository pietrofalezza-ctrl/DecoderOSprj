export type StaticRiskSeverity = "allow" | "warn" | "block";

export type StaticRiskFinding = {
  path: string;
  severity: StaticRiskSeverity;
  reasons: string[];
  entropy: {
    global: number;
    maxWindow: number;
  };
  magicSignature: string | null;
};

export type StaticRiskAssessment = {
  findings: StaticRiskFinding[];
};

const MAX_BYTES = 2 * 1024 * 1024; // 2MB per file
const HIGH_ENTROPY = 7.7;
const EXTENT_WINDOW = 4096;

const MAGIC_SIGNATURES: Array<{ hex: string; name: string }> = [
  { hex: "25504446", name: "pdf" },
  { hex: "504b0304", name: "zip" },
  { hex: "504b0506", name: "zip-spanned" },
  { hex: "504b0708", name: "zip-spanned" },
  { hex: "7f454c46", name: "elf" },
  { hex: "4d5a", name: "pe-mz" },
  { hex: "89504e47", name: "png" },
  { hex: "47494638", name: "gif" },
  { hex: "ffd8ff", name: "jpeg" },
  { hex: "7b5c72746631", name: "rtf" },
  { hex: "4f676753", name: "ogg" },
  { hex: "526172211a0700", name: "rar" },
  { hex: "d0cf11e0a1b11ae1", name: "ole" },
];

export function shannonEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) {
    return 0;
  }

  const frequencies = new Map<number, number>();
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    frequencies.set(b, (frequencies.get(b) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / bytes.length;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

export function shannonEntropySliding(
  bytes: Uint8Array,
  window = EXTENT_WINDOW,
  step = 1024,
): number {
  if (bytes.length <= window) {
    return shannonEntropy(bytes);
  }

  let max = 0;
  for (let i = 0; i <= bytes.length - window; i += step) {
    const entropy = shannonEntropy(bytes.subarray(i, i + window));
    if (entropy > max) max = entropy;
    if (max >= 7.95) {
      return max;
    }
  }
  return max;
}

function signatureHex(bytes: Uint8Array, length = 12): string {
  const tail = Math.min(length, bytes.length);
  let out = "";
  for (let i = 0; i < tail; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function hasMagicMismatch(
  path: string,
  ext: string,
  magic: string,
): { mismatch: boolean; detected: string } {
  const lower = ext.toLowerCase();
  const suspicious = MAGIC_SIGNATURES.find((entry) => magic.startsWith(entry.hex));
  if (!suspicious) {
    return { mismatch: false, detected: "none" };
  }
  const binaryKnown = [
    "pdf",
    "zip",
    "elf",
    "pe-mz",
    "png",
    "gif",
    "jpeg",
    "ogg",
    "rar",
    "ole",
    "exe",
  ];
  if (binaryKnown.includes(suspicious.name) && !isTextyExtension(lower) && path) {
    return { mismatch: false, detected: suspicious.name };
  }
  if (binaryKnown.includes(suspicious.name) && isTextyExtension(lower)) {
    return { mismatch: true, detected: suspicious.name };
  }
  if (suspicious.name === "zip" && lower === "zip") {
    return { mismatch: false, detected: suspicious.name };
  }
  return { mismatch: false, detected: suspicious.name };
}

function isTextyExtension(ext: string): boolean {
  const known = new Set([
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "json",
    "md",
    "mdx",
    "yaml",
    "yml",
    "toml",
    "ini",
    "env",
    "sh",
    "bash",
    "zsh",
    "py",
    "rb",
    "go",
    "rs",
    "java",
    "kt",
    "kts",
    "swift",
    "c",
    "h",
    "cpp",
    "hpp",
    "cc",
    "cs",
    "php",
    "html",
    "htm",
    "css",
    "scss",
    "less",
    "vue",
    "svelte",
    "astro",
    "sql",
    "graphql",
    "gql",
    "lua",
    "pl",
    "ex",
    "exs",
    "erl",
    "clj",
    "cljs",
    "dart",
    "elm",
    "fs",
    "fsx",
    "scala",
    "groovy",
    "tf",
    "makefile",
    "dockerfile",
    "txt",
    "xml",
    "proto",
    "r",
    "jl",
    "nim",
    "zig",
  ]);
  if (!ext) {
    return false;
  }
  return known.has(ext);
}

function isSuspiciousPath(path: string): boolean {
  return (
    path.includes("\u0000") ||
    path.includes("..") ||
    path.includes("//") ||
    (/(^|\/)\./.test(path) &&
      path.includes("/.") &&
      (path.endsWith("/.DS_Store") || path.includes("/.git/") || path.includes("/.github/")))
  );
}

function isPathLengthSafe(path: string): boolean {
  return path.length <= 240 && [...path].every((c) => c.codePointAt(0)! <= 0x7e && c !== "\u0000");
}

export function assessStaticRisk(
  path: string,
  ext: string,
  bytes: Uint8Array,
): StaticRiskAssessment {
  const reasons: string[] = [];
  let severity: StaticRiskSeverity = "allow";

  if (bytes.length === 0) {
    return {
      findings: [],
    };
  }

  if (bytes.length > MAX_BYTES) {
    reasons.push(`File exceeds size policy (${bytes.length} > ${MAX_BYTES})`);
    severity = "block";
  }

  if (!isPathLengthSafe(path) || isSuspiciousPath(path)) {
    reasons.push("Path traversal or suspicious path encoding");
    severity = "block";
  }

  const globalEntropy = shannonEntropy(bytes);
  const maxWindowEntropy = shannonEntropySliding(bytes);
  const hasNulls = bytes.includes(0);
  if (hasNulls) {
    reasons.push("Binary null-bytes detected in entry");
    severity = "block";
  }

  const magic = signatureHex(bytes, 16);
  const magicResult = hasMagicMismatch(path, ext, magic);
  if (magicResult.mismatch) {
    reasons.push(`MIME/format mismatch: detected ${magicResult.detected} in text-like extension`);
    severity = "block";
  }

  if (globalEntropy >= HIGH_ENTROPY && maxWindowEntropy >= HIGH_ENTROPY) {
    if (bytes.length > 64_000) {
      reasons.push(`High entropy in large file: ${globalEntropy.toFixed(2)}`);
      severity = severity === "block" ? "block" : "warn";
    } else if (maxWindowEntropy > 7.9) {
      reasons.push(`High entropy local region: ${maxWindowEntropy.toFixed(2)}`);
      severity = severity === "block" ? "block" : "warn";
    }
  }

  if (path.toLowerCase().endsWith(".env") || path.toLowerCase().includes("secret")) {
    reasons.push("Potential secrets/credentials path");
    severity = severity === "allow" ? "warn" : severity;
  }

  if (reasons.length === 0) {
    return {
      findings: [],
    };
  }

  return {
    findings: [
      {
        path,
        severity,
        reasons,
        entropy: {
          global: globalEntropy,
          maxWindow: maxWindowEntropy,
        },
        magicSignature: magicResult.detected,
      },
    ],
  };
}
