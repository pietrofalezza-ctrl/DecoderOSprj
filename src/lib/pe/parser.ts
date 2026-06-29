import type {
  PeExportSymbol,
  PeImportLibrary,
  PeImportSymbol,
  PeMetadata,
  PeOverlay,
  PeParseFailure,
  PeParseResult,
  PeParseSuccess,
  PeSection,
  PeSectionPermissions,
} from "@/types/analysis";

const IMAGE_SCN_MEM_EXECUTE = 0x20000000;
const IMAGE_SCN_MEM_READ = 0x40000000;
const IMAGE_SCN_MEM_WRITE = 0x80000000;

type DataDirectory = {
  rva: number;
  size: number;
};

function failure(
  reason: PeParseFailure["reason"],
  message: string,
  warnings: string[] = [],
): PeParseFailure {
  return { ok: false, reason, message, warnings };
}

function hasRange(bytes: Uint8Array, offset: number, length: number): boolean {
  return offset >= 0 && length >= 0 && offset + length <= bytes.length;
}

function readAscii(bytes: Uint8Array, offset: number, maxLength: number): string {
  const chars: number[] = [];
  const end = Math.min(bytes.length, offset + maxLength);
  for (let i = offset; i < end; i++) {
    const value = bytes[i];
    if (value === 0) break;
    chars.push(value);
  }
  return String.fromCharCode(...chars)
    .replace(/\0/g, "")
    .trim();
}

function machineToArchitecture(machine: number): PeMetadata["architecture"] {
  if (machine === 0x14c) return "x86";
  if (machine === 0x8664) return "x64";
  if (machine === 0x1c0 || machine === 0x1c4) return "arm";
  if (machine === 0xaa64) return "arm64";
  return "unknown";
}

function permissions(characteristics: number): PeSectionPermissions {
  return {
    read: (characteristics & IMAGE_SCN_MEM_READ) !== 0,
    write: (characteristics & IMAGE_SCN_MEM_WRITE) !== 0,
    execute: (characteristics & IMAGE_SCN_MEM_EXECUTE) !== 0,
  };
}

export function rvaToFileOffset(sections: PeSection[], rva: number): number | null {
  for (const section of sections) {
    const span = Math.max(section.virtualSize, section.rawSize);
    if (rva >= section.virtualAddress && rva < section.virtualAddress + span) {
      return section.rawOffset + (rva - section.virtualAddress);
    }
  }
  return null;
}

function parseImports(input: {
  bytes: Uint8Array;
  view: DataView;
  sections: PeSection[];
  directory: DataDirectory | undefined;
  isPe64: boolean;
  warnings: string[];
}): PeImportLibrary[] {
  const { bytes, view, sections, directory, isPe64, warnings } = input;
  if (!directory?.rva || !directory.size) return [];
  const start = rvaToFileOffset(sections, directory.rva);
  if (start == null || !hasRange(bytes, start, 20)) {
    warnings.push("Import directory RVA does not map to readable file bytes.");
    return [];
  }

  const libraries: PeImportLibrary[] = [];
  for (let descriptorOffset = start, count = 0; count < 256; descriptorOffset += 20, count++) {
    if (!hasRange(bytes, descriptorOffset, 20)) {
      warnings.push("Import descriptor table is truncated.");
      break;
    }
    const originalFirstThunk = view.getUint32(descriptorOffset, true);
    const nameRva = view.getUint32(descriptorOffset + 12, true);
    const firstThunk = view.getUint32(descriptorOffset + 16, true);
    if (originalFirstThunk === 0 && nameRva === 0 && firstThunk === 0) break;

    const nameOffset = rvaToFileOffset(sections, nameRva);
    const dll =
      nameOffset == null ? `dll@0x${nameRva.toString(16)}` : readAscii(bytes, nameOffset, 256);
    const thunkRva = originalFirstThunk || firstThunk;
    const thunkOffset = rvaToFileOffset(sections, thunkRva);
    const symbols: PeImportSymbol[] = [];

    if (thunkOffset == null) {
      warnings.push(`Import thunk table for ${dll} does not map to file bytes.`);
      libraries.push({ dll, symbols });
      continue;
    }

    const thunkSize = isPe64 ? 8 : 4;
    for (let i = 0; i < 512; i++) {
      const entryOffset = thunkOffset + i * thunkSize;
      if (!hasRange(bytes, entryOffset, thunkSize)) {
        warnings.push(`Import thunk table for ${dll} is truncated.`);
        break;
      }
      const raw: number = isPe64
        ? Number(view.getBigUint64(entryOffset, true) & 0x7fffffffn)
        : view.getUint32(entryOffset, true);
      const isOrdinal = isPe64
        ? (view.getBigUint64(entryOffset, true) & 0x8000000000000000n) !== 0n
        : (view.getUint32(entryOffset, true) & 0x80000000) !== 0;
      if (raw === 0) break;
      if (isOrdinal) {
        symbols.push({ name: `ordinal_${raw & 0xffff}`, ordinal: raw & 0xffff, thunkRva });
        continue;
      }
      const importNameOffset = rvaToFileOffset(sections, raw);
      if (importNameOffset == null || !hasRange(bytes, importNameOffset, 2)) {
        warnings.push(`Import name RVA 0x${raw.toString(16)} for ${dll} is unreadable.`);
        continue;
      }
      const hint = view.getUint16(importNameOffset, true);
      const name = readAscii(bytes, importNameOffset + 2, 256);
      symbols.push({ name, hint, thunkRva });
    }

    libraries.push({ dll, symbols });
  }
  return libraries;
}

function parseExports(input: {
  bytes: Uint8Array;
  view: DataView;
  sections: PeSection[];
  directory: DataDirectory | undefined;
  warnings: string[];
}): PeExportSymbol[] {
  const { bytes, view, sections, directory, warnings } = input;
  if (!directory?.rva || !directory.size) return [];
  const offset = rvaToFileOffset(sections, directory.rva);
  if (offset == null || !hasRange(bytes, offset, 40)) {
    warnings.push("Export directory RVA does not map to readable file bytes.");
    return [];
  }

  const ordinalBase = view.getUint32(offset + 16, true);
  const numberOfNames = Math.min(view.getUint32(offset + 24, true), 512);
  const functionsRva = view.getUint32(offset + 28, true);
  const namesRva = view.getUint32(offset + 32, true);
  const ordinalsRva = view.getUint32(offset + 36, true);
  const namesOffset = rvaToFileOffset(sections, namesRva);
  const ordinalsOffset = rvaToFileOffset(sections, ordinalsRva);
  const functionsOffset = rvaToFileOffset(sections, functionsRva);
  if (namesOffset == null || ordinalsOffset == null || functionsOffset == null) {
    warnings.push("Export name, ordinal, or function table RVA is unreadable.");
    return [];
  }

  const exports: PeExportSymbol[] = [];
  for (let i = 0; i < numberOfNames; i++) {
    const namePointerOffset = namesOffset + i * 4;
    const ordinalOffset = ordinalsOffset + i * 2;
    if (!hasRange(bytes, namePointerOffset, 4) || !hasRange(bytes, ordinalOffset, 2)) break;
    const nameRva = view.getUint32(namePointerOffset, true);
    const nameOffset = rvaToFileOffset(sections, nameRva);
    const ordinalIndex = view.getUint16(ordinalOffset, true);
    const functionOffset = functionsOffset + ordinalIndex * 4;
    const rva = hasRange(bytes, functionOffset, 4) ? view.getUint32(functionOffset, true) : 0;
    if (nameOffset != null) {
      exports.push({
        name: readAscii(bytes, nameOffset, 256),
        ordinal: ordinalBase + ordinalIndex,
        rva,
      });
    }
  }
  return exports;
}

export function parsePeFile(bytes: Uint8Array): PeParseResult {
  const warnings: string[] = [];
  if (bytes.length < 2)
    return failure("truncated", "File is too small to contain a PE DOS header.", warnings);
  if (bytes[0] !== 0x4d || bytes[1] !== 0x5a) {
    return failure("not_pe", "File does not start with an MZ DOS header.", warnings);
  }
  if (bytes.length < 64) {
    return failure("truncated", "File is too small to contain a PE DOS header.", warnings);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const peOffset = view.getUint32(0x3c, true);
  if (!hasRange(bytes, peOffset, 24)) {
    return failure("truncated", "PE header offset points outside the file.", warnings);
  }
  if (
    bytes[peOffset] !== 0x50 ||
    bytes[peOffset + 1] !== 0x45 ||
    bytes[peOffset + 2] !== 0 ||
    bytes[peOffset + 3] !== 0
  ) {
    return failure("malformed", "PE signature was not found at e_lfanew.", warnings);
  }

  const coffOffset = peOffset + 4;
  const machine = view.getUint16(coffOffset, true);
  const numberOfSections = view.getUint16(coffOffset + 2, true);
  const timestamp = view.getUint32(coffOffset + 4, true);
  const sizeOfOptionalHeader = view.getUint16(coffOffset + 16, true);
  const optionalOffset = coffOffset + 20;
  if (!hasRange(bytes, optionalOffset, sizeOfOptionalHeader)) {
    return failure("truncated", "Optional header is truncated.", warnings);
  }

  const optionalMagic = view.getUint16(optionalOffset, true);
  const isPe64 = optionalMagic === 0x20b;
  if (optionalMagic !== 0x10b && optionalMagic !== 0x20b) {
    return failure(
      "malformed",
      `Unsupported PE optional header magic 0x${optionalMagic.toString(16)}.`,
      warnings,
    );
  }

  const entryPointRva = view.getUint32(optionalOffset + 16, true);
  const imageBase = isPe64
    ? `0x${view.getBigUint64(optionalOffset + 24, true).toString(16)}`
    : `0x${view.getUint32(optionalOffset + 28, true).toString(16)}`;
  const sizeOfImage = view.getUint32(optionalOffset + 56, true);
  const subsystem = view.getUint16(optionalOffset + 68, true);
  const numberOfRvaAndSizesOffset = optionalOffset + (isPe64 ? 108 : 92);
  const dataDirectoryOffset = optionalOffset + (isPe64 ? 112 : 96);
  const numberOfRvaAndSizes = hasRange(bytes, numberOfRvaAndSizesOffset, 4)
    ? view.getUint32(numberOfRvaAndSizesOffset, true)
    : 0;

  const directories: DataDirectory[] = [];
  const directoryCount = Math.min(numberOfRvaAndSizes, 16);
  for (let i = 0; i < directoryCount; i++) {
    const offset = dataDirectoryOffset + i * 8;
    if (!hasRange(bytes, offset, 8)) break;
    directories.push({
      rva: view.getUint32(offset, true),
      size: view.getUint32(offset + 4, true),
    });
  }

  const sectionTableOffset = optionalOffset + sizeOfOptionalHeader;
  if (!hasRange(bytes, sectionTableOffset, numberOfSections * 40)) {
    return failure("truncated", "Section table is truncated.", warnings);
  }

  const sections: PeSection[] = [];
  for (let i = 0; i < numberOfSections; i++) {
    const offset = sectionTableOffset + i * 40;
    const name = readAscii(bytes, offset, 8) || `section_${i + 1}`;
    const virtualSize = view.getUint32(offset + 8, true);
    const virtualAddress = view.getUint32(offset + 12, true);
    const rawSize = view.getUint32(offset + 16, true);
    const rawOffset = view.getUint32(offset + 20, true);
    const characteristics = view.getUint32(offset + 36, true);
    const span = Math.max(virtualSize, rawSize);
    sections.push({
      name,
      virtualAddress,
      virtualSize,
      rawOffset,
      rawSize,
      characteristics,
      permissions: permissions(characteristics),
      containsEntryPoint: entryPointRva >= virtualAddress && entryPointRva < virtualAddress + span,
    });
  }

  const entryPointSection = sections.find((section) => section.containsEntryPoint)?.name ?? null;
  let rawEnd = 0;
  for (const section of sections) {
    if (section.rawSize > 0) {
      rawEnd = Math.max(rawEnd, section.rawOffset + section.rawSize);
    }
  }
  const overlay: PeOverlay =
    rawEnd > 0 && bytes.length > rawEnd
      ? { present: true, offset: rawEnd, size: bytes.length - rawEnd }
      : { present: false, offset: bytes.length, size: 0 };

  const pe: PeMetadata = {
    machine: `0x${machine.toString(16).padStart(4, "0")}`,
    architecture: machineToArchitecture(machine),
    isPe64,
    numberOfSections,
    timestamp,
    optionalHeaderMagic: `0x${optionalMagic.toString(16)}`,
    imageBase,
    subsystem,
    entryPointRva,
    entryPointSection,
    sizeOfImage,
    numberOfRvaAndSizes,
  };

  const result: PeParseSuccess = {
    ok: true,
    pe,
    sections,
    imports: parseImports({
      bytes,
      view,
      sections,
      directory: directories[1],
      isPe64,
      warnings,
    }),
    exports: parseExports({ bytes, view, sections, directory: directories[0], warnings }),
    overlay,
    warnings,
  };
  return result;
}
