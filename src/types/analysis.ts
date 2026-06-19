export type AnalysisSeverity = "info" | "low" | "medium" | "high" | "critical";

export type TechniqueCategory =
  | "packing"
  | "processInjection"
  | "processHollowing"
  | "directSyscall"
  | "unhooking"
  | "antiAnalysis"
  | "dynamicApi"
  | "peStructure";

export type TechniqueScoreKey = Exclude<TechniqueCategory, "peStructure">;

export type StaticAnalysisIndicator = {
  id: string;
  title: string;
  severity: AnalysisSeverity;
  weight: number;
  description: string;
  evidence: string[];
  category: TechniqueCategory;
  section?: string;
  offset?: number;
};

export type TechniqueScore = {
  key: TechniqueScoreKey;
  label: string;
  score: number;
  indicatorIds: string[];
};

export type TechniqueScores = Record<TechniqueScoreKey, TechniqueScore>;

export type PeSectionPermissions = {
  read: boolean;
  write: boolean;
  execute: boolean;
};

export type PeSection = {
  name: string;
  virtualAddress: number;
  virtualSize: number;
  rawOffset: number;
  rawSize: number;
  characteristics: number;
  permissions: PeSectionPermissions;
  containsEntryPoint: boolean;
};

export type PeSectionAnalysis = PeSection & {
  entropy: number;
  suspiciousFlags: string[];
};

export type PeImportSymbol = {
  name: string;
  ordinal?: number;
  hint?: number;
  thunkRva?: number;
};

export type PeImportLibrary = {
  dll: string;
  symbols: PeImportSymbol[];
};

export type PeExportSymbol = {
  name: string;
  ordinal: number;
  rva: number;
};

export type PeOverlay = {
  present: boolean;
  offset: number;
  size: number;
  entropy?: number;
};

export type PeMetadata = {
  machine: string;
  architecture: "x86" | "x64" | "arm" | "arm64" | "unknown";
  isPe64: boolean;
  numberOfSections: number;
  timestamp: number;
  optionalHeaderMagic: string;
  imageBase: string;
  subsystem: number;
  entryPointRva: number;
  entryPointSection: string | null;
  sizeOfImage: number;
  numberOfRvaAndSizes: number;
};

export type PeParseSuccess = {
  ok: true;
  pe: PeMetadata;
  sections: PeSection[];
  imports: PeImportLibrary[];
  exports: PeExportSymbol[];
  overlay: PeOverlay;
  warnings: string[];
};

export type PeParseFailureReason = "not_pe" | "truncated" | "malformed";

export type PeParseFailure = {
  ok: false;
  reason: PeParseFailureReason;
  message: string;
  warnings: string[];
};

export type PeParseResult = PeParseSuccess | PeParseFailure;

export type StaticStringEvidence = {
  value: string;
  offset: number;
  encoding: "ascii" | "utf16le";
};

export type StaticStringMatch = StaticStringEvidence & {
  keyword: string;
};

export type PeAnalysisReport = {
  analysisVersion: string;
  file: {
    path: string;
    size: number;
    extension: string;
    magic: string;
    sha256?: string;
  };
  pe: PeMetadata | null;
  sections: PeSectionAnalysis[];
  imports: PeImportLibrary[];
  exports: PeExportSymbol[];
  entropy: {
    global: number;
    maxWindow: number;
    sections: Array<{ name: string; entropy: number }>;
  };
  strings: StaticStringMatch[];
  overlay: PeOverlay | null;
  indicators: StaticAnalysisIndicator[];
  techniqueScores: TechniqueScores;
  globalScore: number;
  warnings: string[];
  errors: string[];
};
