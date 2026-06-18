export type SourceLanguage =
  | "typescript"
  | "javascript"
  | "php"
  | "python"
  | "java"
  | "kotlin"
  | "go"
  | "ruby"
  | "rust"
  | "csharp"
  | "cpp"
  | "c"
  | "swift"
  | "scala"
  | "shell"
  | "powershell"
  | "perl"
  | "lua"
  | "dart"
  | "html"
  | "css"
  | "sql"
  | "yaml"
  | "json"
  | "unknown";

export type SourceStaticSeverity = "info" | "low" | "medium" | "high" | "critical";

export type SourceStaticInput = {
  path: string;
  language?: SourceLanguage | string;
  content: string;
  rules?: SourceStaticRule[];
};

export type SourceSymbol = {
  name: string;
  kind: "class" | "function" | "method" | "import" | "variable";
  line: number;
};

export type SourceFunction = {
  name: string;
  line: number;
  endLine: number;
  cyclomatic_complexity: number;
  max_nesting_depth: number;
  parameter_count: number;
};

export type SourceClass = {
  name: string;
  line: number;
};

export type SourceStaticFinding = {
  id: string;
  title: string;
  severity: SourceStaticSeverity;
  confidence: "low" | "medium" | "high";
  file: string;
  line: number;
  source: string;
  sink: string;
  path: string[];
  remediation: string;
  cwe?: string;
  owasp?: string;
};

export type SourceStaticRule = {
  id: string;
  title: string;
  severity: SourceStaticSeverity;
  language?: SourceLanguage | string;
  source: { any: string[] };
  sink: { any: string[] };
  sanitizer?: { any: string[] };
  condition?: {
    require_path?: "source_to_sink";
    forbid_sanitizer?: boolean;
  };
  confidence?: "low" | "medium" | "high";
  remediation: string;
  cwe?: string;
  owasp?: string;
};

export type SourceStaticMetrics = {
  total_loc: number;
  total_functions: number;
  total_classes: number;
  cyclomatic_complexity: number;
  average_cyclomatic_complexity: number;
  max_cyclomatic_complexity: number;
  max_nesting_depth: number;
  dangerous_sink_count: number;
  tainted_source_count: number;
  reachable_source_sink_paths: number;
  sanitizer_coverage: number;
  unsanitized_sink_count: number;
  maintainability_score: number;
  security_risk_score: number;
};

export type SourceStaticReport = {
  file: string;
  language: SourceLanguage | string;
  symbols: string[];
  symbolTable: SourceSymbol[];
  functions: SourceFunction[];
  classes: SourceClass[];
  imports: string[];
  metrics: SourceStaticMetrics;
  findings: SourceStaticFinding[];
};

export function sourceStaticActivityStatus(report: SourceStaticReport): "ok" | "warn" | "error" {
  if (report.findings.some((finding) => finding.severity === "critical")) return "error";
  if (report.metrics.unsanitized_sink_count > 0 || report.metrics.security_risk_score >= 60) {
    return "warn";
  }
  return "ok";
}

export function formatSourceStaticMarkdown(report: SourceStaticReport): string {
  const lines = [
    "# Offline source static analysis",
    "",
    `File: ${report.file}`,
    `Language: ${report.language}`,
    `Maintainability score: ${report.metrics.maintainability_score}/100`,
    `Security risk score: ${report.metrics.security_risk_score}/100`,
    "",
    "## Metrics",
    `- LOC: ${report.metrics.total_loc}`,
    `- Functions: ${report.metrics.total_functions}`,
    `- Classes: ${report.metrics.total_classes}`,
    `- Cyclomatic complexity: ${report.metrics.cyclomatic_complexity}`,
    `- Max nesting depth: ${report.metrics.max_nesting_depth}`,
    `- Tainted sources: ${report.metrics.tainted_source_count}`,
    `- Dangerous sinks: ${report.metrics.dangerous_sink_count}`,
    `- Unsanitized sinks: ${report.metrics.unsanitized_sink_count}`,
    `- Sanitizer coverage: ${(report.metrics.sanitizer_coverage * 100).toFixed(0)}%`,
    "",
    "## Findings",
  ];

  if (report.findings.length === 0) {
    lines.push("- No deterministic source findings for this file.");
  } else {
    for (const finding of report.findings) {
      lines.push(
        `- [${finding.severity}] line ${finding.line}: ${finding.title} (${finding.id})`,
        `  - Path: ${finding.path.join(" -> ")}`,
        `  - Remediation: ${finding.remediation}`,
      );
    }
  }

  lines.push(
    "",
    "## Analyzer note",
    "This offline analyzer uses deterministic structural heuristics. It is not a complete AST/CFG/SSA/CPG engine yet.",
  );

  return lines.join("\n");
}

type TaintRecord = {
  variable: string;
  source: string;
  path: string[];
  line: number;
  sanitized: boolean;
};

type SinkEvidence = {
  name: string;
  line: number;
  expression: string;
  taint?: TaintRecord;
  sanitized: boolean;
};

type TaintFlow = SinkEvidence & {
  taint: TaintRecord;
};

type SarifReport = {
  version: "2.1.0";
  $schema: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        informationUri: string;
        rules: Array<{
          id: string;
          name: string;
          shortDescription: { text: string };
          fullDescription: { text: string };
          defaultConfiguration: { level: "none" | "note" | "warning" | "error" };
          properties: Record<string, unknown>;
        }>;
      };
    };
    results: Array<{
      ruleId: string;
      level: "none" | "note" | "warning" | "error";
      message: { text: string };
      locations: Array<{
        physicalLocation: {
          artifactLocation: { uri: string };
          region: { startLine: number };
        };
      }>;
      properties: Record<string, unknown>;
    }>;
  }>;
};

const BRANCH_TOKENS = /\b(if|else\s+if|for|while|case|catch|switch|match|&&|\|\||\?)\b/g;
const SINK_PATTERNS: Array<{ name: string; regex: RegExp; cwe: string; title: string }> = [
  {
    name: "DB::select",
    regex: /\bDB::(?:select|statement|raw|unprepared)\s*\(/,
    cwe: "CWE-89",
    title: "Tainted input reaches raw SQL sink",
  },
  {
    name: "whereRaw",
    regex: /\bwhereRaw\s*\(/,
    cwe: "CWE-89",
    title: "Tainted input reaches raw SQL sink",
  },
  {
    name: "db.query",
    regex: /\b(?:db|client|connection)\.query\s*\(/,
    cwe: "CWE-89",
    title: "Tainted input reaches raw SQL sink",
  },
  {
    name: "eval",
    regex: /\beval\s*\(/,
    cwe: "CWE-95",
    title: "Tainted input reaches dynamic execution sink",
  },
  {
    name: "exec",
    regex: /\b(?:exec|spawn|shell_exec|system|passthru)\s*\(/,
    cwe: "CWE-78",
    title: "Tainted input reaches command execution sink",
  },
];

const SOURCE_PATTERNS: Array<{ source: string; regex: RegExp }> = [
  { source: "req.query", regex: /\breq\.query(?:\.[A-Za-z_$][\w$]*)?/ },
  { source: "req.body", regex: /\breq\.body(?:\.[A-Za-z_$][\w$]*)?/ },
  { source: "req.params", regex: /\breq\.params(?:\.[A-Za-z_$][\w$]*)?/ },
  { source: "request", regex: /\brequest\s*\(\s*['"][^'"]+['"]\s*\)/ },
  { source: "$_GET", regex: /\$_GET\s*\[/ },
  { source: "$_POST", regex: /\$_POST\s*\[/ },
  { source: "$_REQUEST", regex: /\$_REQUEST\s*\[/ },
  { source: "environment", regex: /\b(?:process\.env|env\s*\()/ },
];

const SANITIZER_RE =
  /\b(?:sanitize|escape|validate|validated|validator|zod|parseInt|Number|String|htmlspecialchars|filter_var|real_escape_string|parameterize)\b/i;

export const DEFAULT_SOURCE_STATIC_RULES: SourceStaticRule[] = [
  {
    id: "source-taint-raw-sql",
    title: "Tainted input reaches raw SQL sink",
    severity: "high",
    source: {
      any: ["req.query", "req.body", "req.params", "request", "$_GET", "$_POST", "$_REQUEST"],
    },
    sink: { any: ["DB::select", "whereRaw", "db.query"] },
    sanitizer: {
      any: ["sanitize", "escape", "validate", "validated", "prepared_statement", "parameterize"],
    },
    condition: { require_path: "source_to_sink", forbid_sanitizer: true },
    confidence: "medium",
    remediation:
      "Use prepared statements or allowlist validation before the sink, and keep untrusted input out of raw query strings.",
    cwe: "CWE-89",
    owasp: "A03:2021-Injection",
  },
  {
    id: "source-taint-dynamic-exec",
    title: "Tainted input reaches dynamic execution sink",
    severity: "critical",
    source: {
      any: ["req.query", "req.body", "req.params", "request", "$_GET", "$_POST", "$_REQUEST"],
    },
    sink: { any: ["eval"] },
    sanitizer: { any: ["sanitize", "validate", "allowlist"] },
    condition: { require_path: "source_to_sink", forbid_sanitizer: true },
    confidence: "medium",
    remediation:
      "Do not execute request-controlled strings. Replace dynamic execution with a fixed command map.",
    cwe: "CWE-95",
    owasp: "A03:2021-Injection",
  },
  {
    id: "source-taint-command-exec",
    title: "Tainted input reaches command execution sink",
    severity: "critical",
    source: {
      any: ["req.query", "req.body", "req.params", "request", "$_GET", "$_POST", "$_REQUEST"],
    },
    sink: { any: ["exec"] },
    sanitizer: { any: ["sanitize", "validate", "allowlist"] },
    condition: { require_path: "source_to_sink", forbid_sanitizer: true },
    confidence: "medium",
    remediation: "Use an allowlisted command map and pass arguments without shell interpolation.",
    cwe: "CWE-78",
    owasp: "A03:2021-Injection",
  },
];

function normalizeLanguage(input: SourceStaticInput): SourceLanguage | string {
  if (input.language) return input.language;
  const ext = input.path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
    case "mts":
    case "cts":
      return "typescript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "php":
    case "phtml":
    case "php5":
    case "php7":
    case "php8":
      return "php";
    case "py":
    case "pyw":
    case "pyi":
      return "python";
    case "java":
      return "java";
    case "kt":
    case "kts":
      return "kotlin";
    case "go":
      return "go";
    case "rb":
    case "erb":
    case "rake":
      return "ruby";
    case "rs":
      return "rust";
    case "cs":
    case "csx":
      return "csharp";
    case "cpp":
    case "cc":
    case "cxx":
    case "hpp":
    case "hh":
    case "hxx":
      return "cpp";
    case "c":
    case "h":
      return "c";
    case "swift":
      return "swift";
    case "scala":
    case "sc":
      return "scala";
    case "sh":
    case "bash":
    case "zsh":
    case "ksh":
      return "shell";
    case "ps1":
    case "psm1":
    case "psd1":
      return "powershell";
    case "pl":
    case "pm":
      return "perl";
    case "lua":
      return "lua";
    case "dart":
      return "dart";
    case "html":
    case "htm":
      return "html";
    case "css":
    case "scss":
    case "sass":
    case "less":
      return "css";
    case "sql":
      return "sql";
    case "yaml":
    case "yml":
      return "yaml";
    case "json":
    case "jsonc":
      return "json";
    default:
      return "unknown";
  }
}

function lineNumberAt(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function countMatches(input: string, regex: RegExp): number {
  const matches = input.match(regex);
  return matches ? matches.length : 0;
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function extractImports(content: string, language: string): SourceSymbol[] {
  const imports: SourceSymbol[] = [];
  const push = (name: string, index: number) => {
    const clean = name.trim().replace(/^['"<]|['">]$/g, "");
    if (clean) imports.push({ name: clean, kind: "import", line: lineNumberAt(content, index) });
  };

  const patterns: RegExp[] = [];
  switch (language) {
    case "php":
      patterns.push(/^\s*(?:use|include|require|include_once|require_once)\s+([^;]+);?/gm);
      break;
    case "python":
      patterns.push(/^\s*(?:from\s+([\w.]+)\s+import\s+[\w*,\s]+|import\s+([\w.,\s]+))/gm);
      break;
    case "java":
    case "kotlin":
    case "scala":
      patterns.push(/^\s*import\s+([\w.*]+);?/gm);
      break;
    case "go":
      patterns.push(/^\s*import\s+["]([^"]+)["]/gm);
      patterns.push(/"([^"\s]+)"/gm);
      break;
    case "rust":
      patterns.push(/^\s*use\s+([\w:{}*,\s]+);/gm);
      break;
    case "csharp":
      patterns.push(/^\s*using\s+([\w.]+);/gm);
      break;
    case "c":
    case "cpp":
      patterns.push(/^\s*#\s*include\s*[<"]([^>"]+)[>"]/gm);
      break;
    case "ruby":
      patterns.push(/^\s*require(?:_relative)?\s+["']([^"']+)["']/gm);
      break;
    case "swift":
      patterns.push(/^\s*import\s+([\w.]+)/gm);
      break;
    case "shell":
    case "bash":
      patterns.push(/^\s*(?:source|\.)\s+([^\s;]+)/gm);
      break;
    case "perl":
      patterns.push(/^\s*use\s+([\w:]+)/gm);
      break;
    case "lua":
      patterns.push(/require\s*\(?\s*["']([^"']+)["']/gm);
      break;
    case "dart":
      patterns.push(/^\s*import\s+["']([^"']+)["']/gm);
      break;
    default:
      patterns.push(
        /^\s*import\s+(?:type\s+)?(?:(?:[\w$]+|\{[^}]+\}|\*\s+as\s+[\w$]+)\s+from\s+)?["']([^"']+)["'];?/gm,
      );
      patterns.push(/^\s*(?:const|let|var)\s+[\w${}\s,]+=\s*require\(\s*["']([^"']+)["']\s*\)/gm);
  }

  for (const re of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(content))) {
      const captured = match[1] ?? match[2];
      if (captured) push(captured, match.index);
    }
  }

  // also collect named JS/TS imports (legacy behaviour)
  if (language === "javascript" || language === "typescript" || language === "unknown") {
    const named = /import\s+\{([^}]+)\}\s+from\s+["'][^"']+["']/gm;
    let m: RegExpExecArray | null;
    while ((m = named.exec(content))) {
      for (const part of m[1].split(",")) {
        const name = part.trim().split(/\s+as\s+/i)[0]?.trim();
        if (name) push(name, m.index);
      }
    }
  }

  return imports;
}

function extractClasses(content: string): SourceClass[] {
  const classes: SourceClass[] = [];
  const re = /\bclass\s+([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    classes.push({ name: match[1], line: lineNumberAt(content, match.index) });
  }
  return classes;
}

function findBlockEndLine(lines: string[], startLineIndex: number): number {
  let depth = 0;
  let sawBrace = false;
  for (let i = startLineIndex; i < lines.length; i++) {
    for (const char of lines[i]) {
      if (char === "{") {
        depth += 1;
        sawBrace = true;
      } else if (char === "}") {
        depth -= 1;
        if (sawBrace && depth <= 0) return i + 1;
      }
    }
  }
  return startLineIndex + 1;
}

function maxBraceNesting(lines: string[], start: number, end: number): number {
  let depth = 0;
  let max = 0;
  for (let i = start; i < end; i++) {
    for (const char of lines[i] ?? "") {
      if (char === "{") {
        depth += 1;
        max = Math.max(max, depth);
      } else if (char === "}") {
        depth = Math.max(0, depth - 1);
      }
    }
  }
  return max;
}

function parameterCount(signature: string): number {
  const inside = signature.match(/\(([^)]*)\)/)?.[1]?.trim();
  if (!inside) return 0;
  return inside.split(",").filter((part) => part.trim()).length;
}

function extractFunctions(content: string, language: string): SourceFunction[] {
  const lines = content.split(/\r?\n/);
  const functions: SourceFunction[] = [];
  const seen = new Set<string>();
  const functionRe = (() => {
    switch (language) {
      case "php":
        return /\bfunction\s+([A-Za-z_][\w]*)\s*\([^)]*\)/;
      case "python":
        return /^\s*(?:async\s+)?def\s+([A-Za-z_][\w]*)\s*\(/;
      case "ruby":
        return /^\s*def\s+([A-Za-z_][\w?!]*)/;
      case "go":
        return /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)\s*\(/;
      case "rust":
        return /^\s*(?:pub\s+)?fn\s+([A-Za-z_][\w]*)\s*\(/;
      case "swift":
      case "kotlin":
      case "scala":
        return /^\s*(?:public|private|internal|protected|open|override|static|final|fun|func|def)\s+([A-Za-z_][\w]*)\s*\(/;
      case "csharp":
      case "java":
        return /^\s*(?:public|private|protected|internal|static|final|abstract|override|virtual|\s)+[\w<>\[\],?\s]+\s+([A-Za-z_][\w]*)\s*\([^)]*\)\s*(?:throws[^{]*)?\{/;
      case "c":
      case "cpp":
        return /^\s*(?:[\w*&:<>,\s]+?)\s+([A-Za-z_][\w]*)\s*\([^)]*\)\s*(?:const)?\s*\{/;
      case "shell":
        return /^\s*(?:function\s+)?([A-Za-z_][\w]*)\s*\(\)\s*\{/;
      case "lua":
        return /^\s*(?:local\s+)?function\s+([A-Za-z_][\w.:]*)\s*\(/;
      case "perl":
        return /^\s*sub\s+([A-Za-z_][\w]*)/;
      case "dart":
        return /^\s*(?:[\w<>?,\s]+\s+)?([A-Za-z_][\w]*)\s*\([^)]*\)\s*(?:async\s*)?\{/;
      default:
        return /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)|^\s*(?:public|private|protected|async|static|\s)*\s*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/;
    }
  })();

  lines.forEach((line, index) => {
    const match = line.match(functionRe);
    const name = match?.[1] ?? match?.[2];
    if (!name) return;
    if (["if", "for", "while", "switch", "catch", "function"].includes(name)) return;
    const key = `${name}:${index + 1}`;
    if (seen.has(key)) return;
    seen.add(key);
    const endLine = findBlockEndLine(lines, index);
    const block = lines.slice(index, endLine).join("\n");
    const complexity = 1 + countMatches(block, BRANCH_TOKENS);
    functions.push({
      name,
      line: index + 1,
      endLine,
      cyclomatic_complexity: complexity,
      max_nesting_depth: maxBraceNesting(lines, index, endLine),
      parameter_count: parameterCount(line),
    });
  });
  return functions;
}

function assignmentParts(line: string): { variable: string; expression: string } | null {
  const trimmed = line.trim();
  const match =
    trimmed.match(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.+?);?$/) ??
    trimmed.match(/^(\$[A-Za-z_][\w]*)\s*=\s*(.+?);?$/) ??
    trimmed.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+?);?$/);
  if (!match) return null;
  return { variable: match[1], expression: match[2] };
}

function sourceInExpression(expression: string): string | null {
  for (const pattern of SOURCE_PATTERNS) {
    const match = expression.match(pattern.regex);
    if (match) return match[0] || pattern.source;
  }
  return null;
}

function expressionUsesTaint(
  expression: string,
  taints: Map<string, TaintRecord>,
): TaintRecord | null {
  for (const [variable, record] of taints) {
    const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^\\w$])${escaped}([^\\w$]|$)`).test(expression)) {
      return record;
    }
  }
  return null;
}

function sinkInLine(line: string): { name: string; cwe: string; title: string } | null {
  for (const sink of SINK_PATTERNS) {
    if (sink.regex.test(line)) return sink;
  }
  return null;
}

function isPreparedOrSanitizedSink(line: string): boolean {
  if (SANITIZER_RE.test(line)) return true;
  return /\?\s*["'`]\s*,\s*\[/.test(line) || /\[[^\]]+\]\s*\)/.test(line);
}

function normalizeSourceName(source: string): string {
  return source
    .replace(/\.[A-Za-z_$][\w$]*$/, "")
    .replace(/\s*\(\s*['"][^'"]+['"]\s*\)/, "")
    .trim();
}

function tokenMatches(value: string, tokens: string[]): boolean {
  const normalized = normalizeSourceName(value);
  return tokens.some((token) => {
    if (value === token || normalized === token) return true;
    return value.startsWith(`${token}.`) || value.startsWith(`${token}[`);
  });
}

function sanitizerMatches(flow: TaintFlow, rule: SourceStaticRule): boolean {
  if (flow.sanitized) return true;
  const sanitizers = rule.sanitizer?.any ?? [];
  if (sanitizers.length === 0) return false;
  return sanitizers.some((sanitizer) =>
    flow.expression.toLowerCase().includes(sanitizer.toLowerCase()),
  );
}

function languageMatches(rule: SourceStaticRule, language: string): boolean {
  return !rule.language || rule.language === language;
}

function evaluateSourceStaticRules(input: {
  file: string;
  language: string;
  flows: TaintFlow[];
  rules: SourceStaticRule[];
}): SourceStaticFinding[] {
  const findings: SourceStaticFinding[] = [];
  for (const flow of input.flows) {
    for (const rule of input.rules) {
      if (!languageMatches(rule, input.language)) continue;
      if (!tokenMatches(flow.taint.source, rule.source.any)) continue;
      if (!tokenMatches(flow.name, rule.sink.any)) continue;
      if (rule.condition?.forbid_sanitizer && sanitizerMatches(flow, rule)) continue;
      findings.push({
        id: rule.id,
        title: rule.title,
        severity: rule.severity,
        confidence: rule.confidence ?? "medium",
        file: input.file,
        line: flow.line,
        source: normalizeSourceName(flow.taint.source),
        sink: flow.name,
        path: [...flow.taint.path, flow.name],
        remediation: rule.remediation,
        cwe: rule.cwe,
        owasp: rule.owasp,
      });
      break;
    }
  }
  return findings;
}

function analyzeTaint(lines: string[]): {
  flows: TaintFlow[];
  sourceCount: number;
  sinkCount: number;
  sanitizedSinkCount: number;
  unsanitizedSinkCount: number;
  sinks: SinkEvidence[];
} {
  const taints = new Map<string, TaintRecord>();
  const sourceKeys = new Set<string>();
  const sinks: SinkEvidence[] = [];
  const flows: TaintFlow[] = [];

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const assignment = assignmentParts(line);
    const directSource = sourceInExpression(line);
    if (directSource) sourceKeys.add(`${lineNo}:${directSource}`);

    if (assignment) {
      const source = sourceInExpression(assignment.expression);
      const upstream = expressionUsesTaint(assignment.expression, taints);
      const sanitized = SANITIZER_RE.test(assignment.expression);
      if (source && !sanitized) {
        taints.set(assignment.variable, {
          variable: assignment.variable,
          source,
          path: [source, assignment.variable],
          line: lineNo,
          sanitized: false,
        });
      } else if (upstream && !sanitized) {
        taints.set(assignment.variable, {
          variable: assignment.variable,
          source: upstream.source,
          path: [...upstream.path, assignment.variable],
          line: lineNo,
          sanitized: upstream.sanitized,
        });
      } else if (source || upstream) {
        taints.set(assignment.variable, {
          variable: assignment.variable,
          source: source ?? upstream?.source ?? "unknown",
          path: [source ?? upstream?.source ?? "unknown", assignment.variable],
          line: lineNo,
          sanitized: true,
        });
      }
    }

    const sink = sinkInLine(line);
    if (!sink) return;
    const taint = expressionUsesTaint(line, taints);
    const sanitized = isPreparedOrSanitizedSink(line) || Boolean(taint?.sanitized);
    sinks.push({
      name: sink.name,
      line: lineNo,
      expression: line.trim(),
      taint: taint ?? undefined,
      sanitized,
    });
    if (taint) {
      flows.push({
        name: sink.name,
        line: lineNo,
        expression: line.trim(),
        taint,
        sanitized,
      });
    }
  });

  return {
    flows,
    sourceCount: sourceKeys.size,
    sinkCount: sinks.length,
    sanitizedSinkCount: sinks.filter((sink) => sink.taint && sink.sanitized).length,
    unsanitizedSinkCount: sinks.filter((sink) => sink.taint && !sink.sanitized).length,
    sinks,
  };
}

function riskScores(metrics: {
  loc: number;
  functions: SourceFunction[];
  classes: SourceClass[];
  unsanitized: number;
  sinks: number;
}): { maintainability: number; security: number } {
  const maxComplexity = Math.max(0, ...metrics.functions.map((fn) => fn.cyclomatic_complexity));
  const avgComplexity =
    metrics.functions.length === 0
      ? 0
      : metrics.functions.reduce((sum, fn) => sum + fn.cyclomatic_complexity, 0) /
        metrics.functions.length;
  const complexityPenalty = Math.min(45, maxComplexity * 3 + avgComplexity * 2);
  const sizePenalty = Math.min(20, metrics.loc / 30);
  const maintainability = Math.max(0, Math.round(100 - complexityPenalty - sizePenalty));
  const security = Math.min(100, Math.round(metrics.unsanitized * 55 + metrics.sinks * 8));
  return { maintainability, security };
}

export function analyzeSourceFile(input: SourceStaticInput): SourceStaticReport {
  const language = normalizeLanguage(input);
  const lines = input.content.split(/\r?\n/);
  const loc = lines.filter((line) => line.trim() && !line.trim().startsWith("//")).length;
  const importSymbols = extractImports(input.content, String(language));
  const classes = extractClasses(input.content);
  const functions = extractFunctions(input.content, String(language));
  const taint = analyzeTaint(lines);
  const rules = input.rules ?? DEFAULT_SOURCE_STATIC_RULES;
  const findings = evaluateSourceStaticRules({
    file: input.path,
    language: String(language),
    flows: taint.flows,
    rules,
  });
  const totalComplexity = functions.reduce((sum, fn) => sum + fn.cyclomatic_complexity, 0);
  const maxComplexity = Math.max(0, ...functions.map((fn) => fn.cyclomatic_complexity));
  const averageComplexity = functions.length === 0 ? 0 : totalComplexity / functions.length;
  const scores = riskScores({
    loc,
    functions,
    classes,
    unsanitized: taint.unsanitizedSinkCount,
    sinks: taint.sinkCount,
  });
  const sanitizerCoverage =
    taint.sinkCount === 0 ? 1 : Number((taint.sanitizedSinkCount / taint.sinkCount).toFixed(2));
  const symbolTable: SourceSymbol[] = [
    ...importSymbols,
    ...classes.map((item) => ({ name: item.name, kind: "class" as const, line: item.line })),
    ...functions.map((item) => ({
      name: item.name,
      kind: "function" as const,
      line: item.line,
    })),
  ];

  return {
    file: input.path,
    language,
    symbols: uniqueSorted(symbolTable.map((symbol) => symbol.name)),
    symbolTable,
    functions,
    classes,
    imports: uniqueSorted(importSymbols.map((symbol) => symbol.name)),
    metrics: {
      total_loc: loc,
      total_functions: functions.length,
      total_classes: classes.length,
      cyclomatic_complexity: Math.max(1, totalComplexity || 1),
      average_cyclomatic_complexity: Number(averageComplexity.toFixed(2)),
      max_cyclomatic_complexity: maxComplexity,
      max_nesting_depth: Math.max(0, ...functions.map((fn) => fn.max_nesting_depth)),
      dangerous_sink_count: taint.sinkCount,
      tainted_source_count: taint.sourceCount,
      reachable_source_sink_paths: taint.flows.length,
      sanitizer_coverage: sanitizerCoverage,
      unsanitized_sink_count: taint.unsanitizedSinkCount,
      maintainability_score: scores.maintainability,
      security_risk_score: scores.security,
    },
    findings,
  };
}

function sarifLevel(severity: SourceStaticSeverity): "none" | "note" | "warning" | "error" {
  if (severity === "critical" || severity === "high") return "error";
  if (severity === "medium" || severity === "low") return "warning";
  return "note";
}

export function sourceStaticToSarif(report: SourceStaticReport): SarifReport {
  const rules = uniqueSorted(report.findings.map((finding) => finding.id)).map((id) => {
    const finding = report.findings.find((item) => item.id === id);
    return {
      id,
      name: finding?.title ?? id,
      shortDescription: { text: finding?.title ?? id },
      fullDescription: {
        text:
          finding?.remediation ??
          "Deterministic source static analysis finding produced without LLM inference.",
      },
      defaultConfiguration: { level: sarifLevel(finding?.severity ?? "info") },
      properties: {
        cwe: finding?.cwe,
        owasp: finding?.owasp,
        confidence: finding?.confidence,
      },
    };
  });

  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "DecoderOS Source Static Analyzer",
            informationUri: "https://github.com/oasis-tcs/sarif-spec",
            rules,
          },
        },
        results: report.findings.map((finding) => ({
          ruleId: finding.id,
          level: sarifLevel(finding.severity),
          message: {
            text: `${finding.title}: ${finding.source} -> ${finding.sink}`,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: finding.file },
                region: { startLine: finding.line },
              },
            },
          ],
          properties: {
            confidence: finding.confidence,
            source: finding.source,
            sink: finding.sink,
            path: finding.path,
            cwe: finding.cwe,
            owasp: finding.owasp,
          },
        })),
      },
    ],
  };
}
