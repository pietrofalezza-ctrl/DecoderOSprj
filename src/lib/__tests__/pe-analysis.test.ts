import { describe, expect, it } from "vitest";

import { findStringMatches, extractStaticStrings } from "../analysis/strings";
import { analyzePeFile } from "../analysis/rules";
import { scoreIndicators } from "../analysis/scoring";
import { parsePeFile } from "../pe/parser";
import type { StaticAnalysisIndicator } from "@/types/analysis";

function writeAscii(bytes: Uint8Array, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    bytes[offset + i] = value.charCodeAt(i);
  }
  bytes[offset + value.length] = 0;
}

function writeUtf16Le(bytes: Uint8Array, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    bytes[offset + i * 2] = value.charCodeAt(i);
    bytes[offset + i * 2 + 1] = 0;
  }
}

function makePeWithEvidence(): Uint8Array {
  const bytes = new Uint8Array(0x900);
  const view = new DataView(bytes.buffer);
  const peOffset = 0x80;
  const optionalOffset = peOffset + 24;
  const sectionOffset = optionalOffset + 0xf0;

  bytes[0] = 0x4d;
  bytes[1] = 0x5a;
  view.setUint32(0x3c, peOffset, true);
  bytes[peOffset] = 0x50;
  bytes[peOffset + 1] = 0x45;
  view.setUint16(peOffset + 4, 0x8664, true);
  view.setUint16(peOffset + 6, 2, true);
  view.setUint16(peOffset + 20, 0xf0, true);
  view.setUint16(peOffset + 22, 0x0222, true);

  view.setUint16(optionalOffset, 0x20b, true);
  view.setUint32(optionalOffset + 16, 0x1010, true);
  view.setBigUint64(optionalOffset + 24, 0x140000000n, true);
  view.setUint32(optionalOffset + 32, 0x1000, true);
  view.setUint32(optionalOffset + 36, 0x200, true);
  view.setUint32(optionalOffset + 56, 0x3000, true);
  view.setUint32(optionalOffset + 60, 0x200, true);
  view.setUint16(optionalOffset + 68, 3, true);
  view.setUint32(optionalOffset + 108, 16, true);
  view.setUint32(optionalOffset + 120, 0x2000, true);
  view.setUint32(optionalOffset + 124, 0x100, true);

  writeAscii(bytes, sectionOffset, ".text");
  view.setUint32(sectionOffset + 8, 0x180, true);
  view.setUint32(sectionOffset + 12, 0x1000, true);
  view.setUint32(sectionOffset + 16, 0x200, true);
  view.setUint32(sectionOffset + 20, 0x200, true);
  view.setUint32(sectionOffset + 36, 0xe0000020, true);

  const idataOffset = sectionOffset + 40;
  writeAscii(bytes, idataOffset, ".idata");
  view.setUint32(idataOffset + 8, 0x300, true);
  view.setUint32(idataOffset + 12, 0x2000, true);
  view.setUint32(idataOffset + 16, 0x400, true);
  view.setUint32(idataOffset + 20, 0x400, true);
  view.setUint32(idataOffset + 36, 0x40000040, true);

  bytes.set([0x4c, 0x8b, 0xd1, 0xb8, 0x18, 0x00, 0x00, 0x00, 0x0f, 0x05, 0xc3], 0x210);

  view.setUint32(0x400, 0x2080, true);
  view.setUint32(0x40c, 0x2100, true);
  view.setUint32(0x410, 0x2080, true);
  writeAscii(bytes, 0x500, "KERNEL32.dll");
  const imports = [
    "OpenProcess",
    "VirtualAllocEx",
    "WriteProcessMemory",
    "CreateRemoteThread",
    "CreateProcessA",
    "SetThreadContext",
    "ResumeThread",
    "LoadLibraryA",
    "GetProcAddress",
  ];
  let thunkOffset = 0x480;
  let nameRva = 0x2140;
  for (const name of imports) {
    view.setBigUint64(thunkOffset, BigInt(nameRva), true);
    const nameOffset = 0x400 + (nameRva - 0x2000);
    view.setUint16(nameOffset, 0, true);
    writeAscii(bytes, nameOffset + 2, name);
    thunkOffset += 8;
    nameRva += 2 + name.length + 1;
  }

  writeAscii(
    bytes,
    0x720,
    "ntdll.dll KnownDlls \\\\KnownDlls\\\\ntdll.dll NtUnmapViewOfSection SysWhispers",
  );
  writeAscii(bytes, 0x780, "IsDebuggerPresent VirtualBox vmtoolsd");
  writeUtf16Le(bytes, 0x7c0, "NtProtectVirtualMemory");

  return bytes;
}

function mustParse(bytes: Uint8Array) {
  const parsed = parsePeFile(bytes);
  if (!parsed.ok) throw new Error(parsed.message);
  return parsed;
}

describe("PE analysis helpers", () => {
  it("extracts bounded ASCII and UTF-16LE static strings", () => {
    const bytes = new Uint8Array(128);
    writeAscii(bytes, 4, "VirtualAllocEx");
    writeUtf16Le(bytes, 40, "ntdll.dll");

    const strings = extractStaticStrings(bytes, { minLength: 4 });
    const values = strings.map((entry) => entry.value);

    expect(values).toContain("VirtualAllocEx");
    expect(values).toContain("ntdll.dll");
    expect(findStringMatches(strings, ["virtualallocex"])[0]).toMatchObject({
      value: "VirtualAllocEx",
      keyword: "virtualallocex",
    });
  });

  it("turns PE imports, strings, sections, and opcodes into technique indicators", () => {
    const bytes = makePeWithEvidence();
    const parsed = mustParse(bytes);
    const report = analyzePeFile("sample.exe", bytes, parsed);

    expect(report.pe?.architecture).toBe("x64");
    expect(
      report.sections.some((section) => section.permissions.write && section.permissions.execute),
    ).toBe(true);
    expect(report.indicators.some((indicator) => indicator.category === "processInjection")).toBe(
      true,
    );
    expect(report.indicators.some((indicator) => indicator.category === "processHollowing")).toBe(
      true,
    );
    expect(report.indicators.some((indicator) => indicator.category === "directSyscall")).toBe(
      true,
    );
    expect(report.indicators.some((indicator) => indicator.category === "unhooking")).toBe(true);
    expect(report.indicators.some((indicator) => indicator.category === "antiAnalysis")).toBe(true);
    expect(report.indicators.some((indicator) => indicator.category === "dynamicApi")).toBe(true);
    expect(report.techniqueScores.processInjection.score).toBeGreaterThan(0);
    expect(report.globalScore).toBeGreaterThan(0);
    expect(report.globalScore).toBeLessThanOrEqual(100);
  });

  it("scores weighted indicators by technique and caps scores at 100", () => {
    const indicators: StaticAnalysisIndicator[] = [
      {
        id: "test.injection",
        title: "Injection APIs",
        severity: "high",
        weight: 55,
        description: "Injection-compatible APIs were found.",
        evidence: ["VirtualAllocEx", "WriteProcessMemory"],
        category: "processInjection",
      },
      {
        id: "test.syscall",
        title: "Syscall opcode",
        severity: "medium",
        weight: 80,
        description: "Syscall opcode was found.",
        evidence: ["0f05"],
        category: "directSyscall",
      },
      {
        id: "test.syscall.2",
        title: "Syscall string",
        severity: "medium",
        weight: 80,
        description: "Syscall framework string was found.",
        evidence: ["SysWhispers"],
        category: "directSyscall",
      },
    ];

    const { techniqueScores, globalScore } = scoreIndicators(indicators);

    expect(techniqueScores.processInjection.score).toBe(55);
    expect(techniqueScores.directSyscall.score).toBe(100);
    expect(globalScore).toBeGreaterThanOrEqual(80);
    expect(globalScore).toBeLessThanOrEqual(100);
  });
});
