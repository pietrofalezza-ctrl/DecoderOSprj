import type {
  StaticAnalysisIndicator,
  TechniqueScore,
  TechniqueScoreKey,
  TechniqueScores,
} from "@/types/analysis";

const TECHNIQUE_LABELS: Record<TechniqueScoreKey, string> = {
  packing: "Packing / obfuscation",
  processInjection: "Process injection",
  processHollowing: "Process hollowing",
  directSyscall: "Direct / indirect syscall",
  unhooking: "ntdll unhooking / tampering",
  antiAnalysis: "Anti-analysis",
  dynamicApi: "Dynamic API resolution",
};

export function emptyTechniqueScores(): TechniqueScores {
  return Object.fromEntries(
    (Object.keys(TECHNIQUE_LABELS) as TechniqueScoreKey[]).map((key) => [
      key,
      { key, label: TECHNIQUE_LABELS[key], score: 0, indicatorIds: [] } satisfies TechniqueScore,
    ]),
  ) as unknown as TechniqueScores;
}

export function scoreIndicators(indicators: StaticAnalysisIndicator[]): {
  techniqueScores: TechniqueScores;
  globalScore: number;
} {
  const techniqueScores = emptyTechniqueScores();
  for (const indicator of indicators) {
    if (indicator.category === "peStructure") continue;
    const score = techniqueScores[indicator.category];
    score.score = Math.min(100, score.score + Math.max(0, indicator.weight));
    score.indicatorIds.push(indicator.id);
  }

  const values = Object.values(techniqueScores).map((score) => score.score);
  const strongest = values.length > 0 ? Math.max(...values) : 0;
  const density = Math.min(
    35,
    indicators.reduce((sum, indicator) => sum + indicator.weight, 0) / 8,
  );
  const globalScore = Math.max(0, Math.min(100, Math.round(strongest * 0.75 + density)));

  return { techniqueScores, globalScore };
}
