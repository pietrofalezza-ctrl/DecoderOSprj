import type { KnowledgeEntry, KnowledgeLang, KnowledgeLocale } from "./types";
import { KNOWLEDGE_TRANSLATIONS } from "./translations";

import { staticMalwareAnalysis } from "./entries/static-malware-analysis";
import { byok } from "./entries/byok";
import { repositoryAnalysis } from "./entries/repository-analysis";
import { localAi } from "./entries/local-ai";
import { ollama } from "./entries/ollama";
import { openrouter } from "./entries/openrouter";
import { entropy } from "./entries/entropy";
import { aiOriginDetection } from "./entries/ai-origin-detection";
import { chatWithCode } from "./entries/chat-with-code";
import { zipAnalysis } from "./entries/zip-analysis";
import { powershellAnalysis } from "./entries/powershell-analysis";
import { binaryAnalysis } from "./entries/binary-analysis";
import { severityScoring } from "./entries/severity-scoring";
import { cweMapping } from "./entries/cwe-mapping";
import { yaraRules } from "./entries/yara-rules";
import { obfuscationDetection } from "./entries/obfuscation-detection";
import { secretDetection } from "./entries/secret-detection";
import { dependencyAnalysis } from "./entries/dependency-analysis";
import { sast } from "./entries/sast";
import { supplyChainSecurity } from "./entries/supply-chain-security";
import { euAiAct } from "./entries/eu-ai-act";
import { gdprCompliance } from "./entries/gdpr-compliance";
import { lockbitCaseStudy } from "./entries/lockbit-case-study";
import { githubIntegration } from "./entries/github-integration";
import { lmStudio } from "./entries/lm-studio";
import { anthropicClaude } from "./entries/anthropic-claude";
import { openaiGpt } from "./entries/openai-gpt";
import { googleGemini } from "./entries/google-gemini";
import { pythonFormat } from "./entries/python-format";
import { javascriptFormat } from "./entries/javascript-format";
import { javaFormat } from "./entries/java-format";
import { dockerfileFormat } from "./entries/dockerfile-format";

const RAW_ENTRIES: KnowledgeEntry[] = [
  staticMalwareAnalysis,
  byok,
  repositoryAnalysis,
  localAi,
  ollama,
  openrouter,
  entropy,
  aiOriginDetection,
  chatWithCode,
  zipAnalysis,
  powershellAnalysis,
  binaryAnalysis,
  severityScoring,
  cweMapping,
  yaraRules,
  obfuscationDetection,
  secretDetection,
  dependencyAnalysis,
  sast,
  supplyChainSecurity,
  euAiAct,
  gdprCompliance,
  lockbitCaseStudy,
  githubIntegration,
  lmStudio,
  anthropicClaude,
  openaiGpt,
  googleGemini,
  pythonFormat,
  javascriptFormat,
  javaFormat,
  dockerfileFormat,
];

export const KNOWLEDGE_BY_SLUG: Record<string, KnowledgeEntry> = Object.fromEntries(
  KNOWLEDGE_ENTRIES.map((e) => [e.slug, e]),
);

// Reverse graph: who links TO this slug
export const KNOWLEDGE_BACKLINKS: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const entry of KNOWLEDGE_ENTRIES) {
    for (const target of entry.related) {
      if (!map[target]) map[target] = [];
      if (!map[target].includes(entry.slug)) map[target].push(entry.slug);
    }
  }
  return map;
})();

export function getEntry(slug: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_BY_SLUG[slug];
}

export function getLocale(entry: KnowledgeEntry, lang: KnowledgeLang): KnowledgeLocale {
  return entry.i18n[lang] ?? entry.i18n.en!;
}

export function getRelatedEntries(slug: string): KnowledgeEntry[] {
  const entry = KNOWLEDGE_BY_SLUG[slug];
  if (!entry) return [];
  const out = new Set<string>();
  for (const s of entry.related) out.add(s);
  for (const s of KNOWLEDGE_BACKLINKS[slug] ?? []) out.add(s);
  return [...out].map((s) => KNOWLEDGE_BY_SLUG[s]).filter(Boolean);
}

export const KNOWLEDGE_CATEGORIES = [
  ...new Set(KNOWLEDGE_ENTRIES.map((e) => e.category)),
].sort();

export const KNOWLEDGE_TAGS = [
  ...new Set(KNOWLEDGE_ENTRIES.flatMap((e) => e.tags)),
].sort();
