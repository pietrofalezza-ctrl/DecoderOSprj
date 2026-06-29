export type KnowledgeLevel = "beginner" | "junior" | "dev" | "senior" | "security" | "cto";
export type KnowledgeLang = "en" | "it" | "zh";
export type KnowledgeType = "capability" | "concept" | "integration" | "format";

export const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  "beginner",
  "junior",
  "dev",
  "senior",
  "security",
  "cto",
];

export const KNOWLEDGE_LANGS: KnowledgeLang[] = ["en", "it", "zh"];

export interface KnowledgeFAQ {
  q: string;
  a: string;
}

export interface KnowledgeGlossaryItem {
  term: string;
  definition: string;
}

export interface KnowledgeLevelContent {
  whatItIs: string;
  whyUseful: string;
  howDecoderImplements: string;
  whenToUse: string;
  whenNotToUse: string;
  practicalExample: string;
}

export interface KnowledgeLocale {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  byLevel: Partial<Record<KnowledgeLevel, KnowledgeLevelContent>>;
  faq: KnowledgeFAQ[];
  glossary: KnowledgeGlossaryItem[];
  cta: { label: string; href: string };
}

export interface KnowledgeEntry {
  slug: string;
  type: KnowledgeType;
  category: string;
  tags: string[];
  related: string[];
  screenshot?: string;
  i18n: Partial<Record<KnowledgeLang, KnowledgeLocale>>;
}
