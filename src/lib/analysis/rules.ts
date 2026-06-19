import { sha256Hex } from "@/lib/crypto.server";
import { calculateEntropy, calculateMaxWindowEntropy, calculateSectionEntropy } from "./entropy";
import { extractStaticStrings, findStringMatches } from "./strings";
import { scoreIndicators } from "./scoring";
import type {
  AnalysisSeverity,
  PeAnalysisReport,
  PeParseSuccess,
  PeSection,
  PeSectionAnalysis,
  StaticAnalysisIndicator,
  StaticStringEvidence,
  TechniqueCategory,
} from "@/types/analysis";

const ANALYSIS_VERSION = "pe-static-1";

const STANDARD_SECTION_NAMES = new Set([
  ".text",
  ".data",
  ".rdata",
  ".bss",
  ".idata",
  ".edata",
  ".rsrc",
  ".reloc",
  ".tls",
  ".pdata",
  ".xdata",
]);

const SUSPICIOUS_STRING_KEYWORDS = [
  "OpenProcess",
  "VirtualAllocEx",
  "WriteProcessMemory",
  "VirtualProtectEx",
  "CreateRemoteThread",
  "NtCreateThreadEx",
  "QueueUserAPC",
  "SetThreadContext",
  "GetThreadContext",
  "SuspendThread",
  "ResumeThread",
  "NtMapViewOfSection",
  "NtCreateSection",
  "CreateProcessA",
  "CreateProcessW",
  "CREATE_SUSPENDED",
  "NtUnmapViewOfSection",
  "ZwUnmapViewOfSection",
  "NtWriteVirtualMemory",
  "ntdll.dll",
  "KnownDlls",
  "\\KnownDlls\\ntdll.dll",
  "NtOpenSection",
  "NtProtectVirtualMemory",
  "VirtualProtect",
  "RtlMoveMemory",
  "memcpy",
  ".text",
  "IsDebuggerPresent",
  "CheckRemoteDebuggerPresent",
  "NtQueryInformationProcess",
  "OutputDebugString",
  "QueryPerformanceCounter",
  "GetTickCount",
  "GetTickCount64",
  "Sleep",
  "NtDelayExecution",
  "VMware",
  "VirtualBox",
  "VBox",
  "vmtoolsd",
  "vboxservice",
  "qemu",
  "sandboxie",
  "wine",
  "LoadLibraryA",
  "LoadLibraryW",
  "GetProcAddress",
  "LdrLoadDll",
  "LdrGetProcedureAddress",
  "PEB",
  "Hell's Gate",
  "Halo's Gate",
  "HellsHall",
  "SysWhispers",
];

const PROCESS_INJECTION = [
  "OpenProcess",
  "VirtualAllocEx",
  "WriteProcessMemory",
  "VirtualProtectEx",
  "CreateRemoteThread",
  "NtCreateThreadEx",
  "QueueUserAPC",
  "SetThreadContext",
  "GetThreadContext",
  "SuspendThread",
  "ResumeThread",
  "NtMapViewOfSection",
  "NtCreateSection",
];

const PROCESS_HOLLOWING = [
  "CreateProcessA",
  "CreateProcessW",
  "CREATE_SUSPENDED",
  "NtUnmapViewOfSection",
  "ZwUnmapViewOfSection",
  "VirtualAllocEx",
  "WriteProcessMemory",
  "SetThreadContext",
  "ResumeThread",
  "GetThreadContext",
  "NtWriteVirtualMemory",
];

const UNHOOKING = [
  "ntdll.dll",
  "KnownDlls",
  "\\KnownDlls\\ntdll.dll",
  "NtOpenSection",
  "NtMapViewOfSection",
  "NtProtectVirtualMemory",
  "VirtualProtect",
  "memcpy",
  "RtlMoveMemory",
  ".text",
];

const ANTI_ANALYSIS = [
  "IsDebuggerPresent",
  "CheckRemoteDebuggerPresent",
  "NtQueryInformationProcess",
  "OutputDebugString",
  "QueryPerformanceCounter",
  "GetTickCount",
  "GetTickCount64",
  "Sleep",
  "NtDelayExecution",
  "VMware",
  "VirtualBox",
  "VBox",
  "vmtoolsd",
  "vboxservice",
  "qemu",
  "sandboxie",
  "wine",
];

const DYNAMIC_API = [
  "LoadLibraryA",
  "LoadLibraryW",
  "GetProcAddress",
  "LdrLoadDll",
  "LdrGetProcedureAddress",
  "PEB",
];

const SYSCALL_STRINGS = ["ntdll.dll", "SysWhispers", "Hell's Gate", "Halo's Gate", "HellsHall"];

function extension(path: string): string {
  const last = path.split("/").pop() ?? path;
  return last.includes(".") ? last.split(".").pop()!.toLowerCase() : "";
}

function addIndicator(
  indicators: StaticAnalysisIndicator[],
  input: {
    id: string;
    title: string;
    severity: AnalysisSeverity;
    weight: number;
    description: string;
    evidence: string[];
    category: TechniqueCategory;
    section?: string;
    offset?: number;
  },
): void {
  if (input.evidence.length === 0) return;
  if (indicators.some((indicator) => indicator.id === input.id)) return;
  indicators.push(input);
}

function namesFromImports(parsed: PeParseSuccess): string[] {
  const names: string[] = [];
  for (const library of parsed.imports) {
    names.push(library.dll);
    for (const symbol of library.symbols) {
      names.push(symbol.name);
    }
  }
  return names;
}

function matchingEvidence(values: string[], keywords: string[]): string[] {
  const lower = values.map((value) => ({ raw: value, lower: value.toLowerCase() }));
  const matches = new Set<string>();
  for (const keyword of keywords) {
    const needle = keyword.toLowerCase();
    const match = lower.find((value) => value.lower.includes(needle));
    if (match) matches.add(match.raw);
  }
  return Array.from(matches);
}

function countMatches(values: string[], keywords: string[]): number {
  return matchingEvidence(values, keywords).length;
}

function findPattern(bytes: Uint8Array, pattern: number[]): number {
  if (pattern.length === 0 || bytes.length < pattern.length) return -1;
  for (let i = 0; i <= bytes.length - pattern.length; i++) {
    let matched = true;
    for (let j = 0; j < pattern.length; j++) {
      if (bytes[i + j] !== pattern[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return i;
  }
  return -1;
}

function sectionFlags(section: PeSection, entropy: number): string[] {
  const flags: string[] = [];
  if (!STANDARD_SECTION_NAMES.has(section.name.toLowerCase())) flags.push("non-standard-name");
  if (section.permissions.write && section.permissions.execute) flags.push("rwx");
  if (section.containsEntryPoint && section.permissions.write) flags.push("writable-entry-point");
  if (section.rawSize > 0 && section.virtualSize > section.rawSize * 4)
    flags.push("virtual-size-mismatch");
  if (entropy >= 7.2) flags.push("high-entropy");
  return flags;
}

function describeMatches(matches: StaticStringEvidence[], limit = 8): string[] {
  return matches.slice(0, limit).map((match) => `${match.value} @ 0x${match.offset.toString(16)}`);
}

export function analyzePeFile(
  path: string,
  bytes: Uint8Array,
  parsed: PeParseSuccess,
): PeAnalysisReport {
  const sections: PeSectionAnalysis[] = parsed.sections.map((section) => {
    const entropy = calculateSectionEntropy(bytes, section);
    return {
      ...section,
      entropy,
      suspiciousFlags: sectionFlags(section, entropy),
    };
  });
  const strings = extractStaticStrings(bytes, {
    minLength: 4,
    maxBytes: 1_000_000,
    maxStrings: 2_000,
  });
  const stringMatches = findStringMatches(strings, SUSPICIOUS_STRING_KEYWORDS);
  const importNames = namesFromImports(parsed);
  const combinedEvidence = [...importNames, ...strings.map((entry) => entry.value)];
  const indicators: StaticAnalysisIndicator[] = [];

  const highEntropySections = sections.filter((section) => section.entropy >= 7.2);
  addIndicator(indicators, {
    id: "pe.packing.high_entropy_sections",
    title: "High entropy PE sections",
    severity: "medium",
    weight: 25,
    description:
      "One or more sections have high Shannon entropy, which is compatible with packing, encryption, or compressed payloads.",
    evidence: highEntropySections.map(
      (section) => `${section.name} entropy ${section.entropy.toFixed(3)}`,
    ),
    category: "packing",
  });

  const rwxSections = sections.filter(
    (section) => section.permissions.write && section.permissions.execute,
  );
  addIndicator(indicators, {
    id: "pe.section.rwx",
    title: "Writable and executable section",
    severity: "high",
    weight: 35,
    description:
      "RWX section permissions are compatible with unpacking stubs or injected code regions.",
    evidence: rwxSections.map((section) => section.name),
    category: "peStructure",
  });

  const suspiciousNames = sections.filter(
    (section) => !STANDARD_SECTION_NAMES.has(section.name.toLowerCase()),
  );
  addIndicator(indicators, {
    id: "pe.section.non_standard_name",
    title: "Non-standard PE section name",
    severity: "low",
    weight: 10,
    description:
      "Non-standard section names are not suspicious alone, but can support packing or obfuscation hypotheses.",
    evidence: suspiciousNames.map((section) => section.name),
    category: "packing",
  });

  const writableEntry = sections.filter(
    (section) => section.containsEntryPoint && section.permissions.write,
  );
  addIndicator(indicators, {
    id: "pe.entrypoint.writable_section",
    title: "Entry point in writable section",
    severity: "high",
    weight: 35,
    description:
      "An entry point inside a writable section can be compatible with packed or self-modifying code.",
    evidence: writableEntry.map((section) => section.name),
    category: "packing",
  });

  const virtualMismatch = sections.filter(
    (section) => section.rawSize > 0 && section.virtualSize > section.rawSize * 4,
  );
  addIndicator(indicators, {
    id: "pe.section.virtual_raw_mismatch",
    title: "Virtual size much larger than raw size",
    severity: "medium",
    weight: 20,
    description:
      "A section with much larger virtual size than raw size may reserve memory for unpacked data.",
    evidence: virtualMismatch.map(
      (section) => `${section.name} raw=${section.rawSize} virtual=${section.virtualSize}`,
    ),
    category: "packing",
  });

  if (parsed.overlay.present) {
    const overlayEntropy = calculateEntropy(bytes.subarray(parsed.overlay.offset));
    parsed.overlay.entropy = overlayEntropy;
    addIndicator(indicators, {
      id: "pe.overlay.present",
      title: "Overlay data present",
      severity: overlayEntropy >= 7.2 ? "medium" : "low",
      weight: overlayEntropy >= 7.2 ? 25 : 10,
      description:
        "Data appended after the last PE section can contain installer data, signatures, or hidden payloads.",
      evidence: [
        `offset 0x${parsed.overlay.offset.toString(16)}`,
        `${parsed.overlay.size} bytes`,
        `entropy ${overlayEntropy.toFixed(3)}`,
      ],
      category: "packing",
      offset: parsed.overlay.offset,
    });
  }

  const injectionEvidence = matchingEvidence(combinedEvidence, PROCESS_INJECTION);
  if (countMatches(combinedEvidence, PROCESS_INJECTION) >= 3) {
    addIndicator(indicators, {
      id: "technique.process_injection.api_cluster",
      title: "API cluster compatible with process injection",
      severity: "high",
      weight: 45,
      description:
        "The file references multiple APIs commonly used together for remote process allocation, writing, protection changes, or thread creation.",
      evidence: injectionEvidence,
      category: "processInjection",
    });
  }

  const hollowingEvidence = matchingEvidence(combinedEvidence, PROCESS_HOLLOWING);
  if (countMatches(combinedEvidence, PROCESS_HOLLOWING) >= 4) {
    addIndicator(indicators, {
      id: "technique.process_hollowing.api_cluster",
      title: "API cluster compatible with process hollowing",
      severity: "high",
      weight: 45,
      description:
        "The file references APIs compatible with creating a suspended process, replacing memory, changing context, and resuming execution.",
      evidence: hollowingEvidence,
      category: "processHollowing",
    });
  }

  const syscallOffset = findPattern(bytes, [0x0f, 0x05]);
  addIndicator(indicators, {
    id: "technique.syscall.opcode",
    title: "x64 syscall opcode present",
    severity: "medium",
    weight: 30,
    description:
      "The `0F 05` opcode is compatible with direct syscall usage when found in executable code.",
    evidence: syscallOffset >= 0 ? [`0f05 @ 0x${syscallOffset.toString(16)}`] : [],
    category: "directSyscall",
    offset: syscallOffset >= 0 ? syscallOffset : undefined,
  });

  const syscallStubOffset = findPattern(bytes, [0x4c, 0x8b, 0xd1, 0xb8]);
  addIndicator(indicators, {
    id: "technique.syscall.stub",
    title: "x64 syscall stub pattern present",
    severity: "high",
    weight: 40,
    description:
      "The bytes `mov r10, rcx; mov eax, imm` near a syscall are compatible with direct syscall stubs.",
    evidence: syscallStubOffset >= 0 ? [`stub @ 0x${syscallStubOffset.toString(16)}`] : [],
    category: "directSyscall",
    offset: syscallStubOffset >= 0 ? syscallStubOffset : undefined,
  });

  const syscallStringEvidence = matchingEvidence(combinedEvidence, SYSCALL_STRINGS);
  addIndicator(indicators, {
    id: "technique.syscall.native_api_strings",
    title: "Native API or syscall framework references",
    severity: "medium",
    weight: 20,
    description:
      "Native API DLL names or syscall framework strings can support direct or indirect syscall hypotheses.",
    evidence: syscallStringEvidence,
    category: "directSyscall",
  });

  const unhookingEvidence = matchingEvidence(combinedEvidence, UNHOOKING);
  if (countMatches(combinedEvidence, UNHOOKING) >= 3) {
    addIndicator(indicators, {
      id: "technique.unhooking.ntdll_mapping",
      title: "Indicators compatible with ntdll unhooking",
      severity: "medium",
      weight: 35,
      description:
        "References to ntdll, KnownDlls, native section mapping, and memory copy/protection APIs can be compatible with ntdll text-section tampering.",
      evidence: unhookingEvidence,
      category: "unhooking",
    });
  }

  const antiAnalysisEvidence = matchingEvidence(combinedEvidence, ANTI_ANALYSIS);
  if (antiAnalysisEvidence.length > 0) {
    addIndicator(indicators, {
      id: "technique.anti_analysis.debug_vm_strings",
      title: "Anti-debug or anti-VM indicators",
      severity: antiAnalysisEvidence.length >= 3 ? "medium" : "low",
      weight: antiAnalysisEvidence.length >= 3 ? 30 : 15,
      description:
        "The file references APIs or strings commonly used for debugger, timing, sleep, or VM checks.",
      evidence: antiAnalysisEvidence,
      category: "antiAnalysis",
    });
  }

  const dynamicEvidence = matchingEvidence(combinedEvidence, DYNAMIC_API);
  if (dynamicEvidence.length >= 2) {
    addIndicator(indicators, {
      id: "technique.dynamic_api.resolution",
      title: "Dynamic API resolution indicators",
      severity: "medium",
      weight: 30,
      description:
        "References to library loading and procedure lookup APIs are compatible with dynamic API resolution or API hashing workflows.",
      evidence: dynamicEvidence,
      category: "dynamicApi",
    });
  }

  const suspiciousStringEvidence = describeMatches(stringMatches);
  addIndicator(indicators, {
    id: "pe.strings.suspicious_terms",
    title: "Suspicious static strings",
    severity: "low",
    weight: 10,
    description:
      "Suspicious strings are weak evidence alone, but useful when correlated with imports and structure.",
    evidence: suspiciousStringEvidence,
    category: "peStructure",
  });

  const { techniqueScores, globalScore } = scoreIndicators(indicators);
  const sectionEntropy = sections.map((section) => ({
    name: section.name,
    entropy: section.entropy,
  }));

  return {
    analysisVersion: ANALYSIS_VERSION,
    file: {
      path,
      size: bytes.length,
      extension: extension(path),
      magic: Array.from(bytes.subarray(0, 16))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
      sha256: sha256Hex(bytes),
    },
    pe: parsed.pe,
    sections,
    imports: parsed.imports,
    exports: parsed.exports,
    entropy: {
      global: calculateEntropy(bytes),
      maxWindow: calculateMaxWindowEntropy(bytes),
      sections: sectionEntropy,
    },
    strings: stringMatches,
    overlay: parsed.overlay,
    indicators,
    techniqueScores,
    globalScore,
    warnings: parsed.warnings,
    errors: [],
  };
}
