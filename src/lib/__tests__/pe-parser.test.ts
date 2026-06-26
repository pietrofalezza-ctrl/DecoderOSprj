import { describe, expect, it } from "vitest";

import { parsePeFile, rvaToFileOffset } from "../pe/parser";

type ImportSpec = {
  dll: string;
  names: string[];
};

function writeAscii(bytes: Uint8Array, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    bytes[offset + i] = value.charCodeAt(i);
  }
  bytes[offset + value.length] = 0;
}

function makeMinimalPe(input: { imports?: ImportSpec[]; overlay?: Uint8Array } = {}): Uint8Array {
  const overlay = input.overlay ?? new Uint8Array(0);
  const size = 0x800 + overlay.length;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  const peOffset = 0x80;
  const optionalOffset = peOffset + 24;
  const sectionOffset = optionalOffset + 0xe0;

  bytes[0] = 0x4d;
  bytes[1] = 0x5a;
  view.setUint32(0x3c, peOffset, true);

  bytes[peOffset] = 0x50;
  bytes[peOffset + 1] = 0x45;
  view.setUint16(peOffset + 4, 0x14c, true);
  view.setUint16(peOffset + 6, 2, true);
  view.setUint32(peOffset + 8, 0x65f00000, true);
  view.setUint16(peOffset + 20, 0xe0, true);
  view.setUint16(peOffset + 22, 0x0102, true);

  view.setUint16(optionalOffset, 0x10b, true);
  view.setUint32(optionalOffset + 16, 0x1010, true);
  view.setUint32(optionalOffset + 28, 0x400000, true);
  view.setUint32(optionalOffset + 32, 0x1000, true);
  view.setUint32(optionalOffset + 36, 0x200, true);
  view.setUint32(optionalOffset + 56, 0x3000, true);
  view.setUint32(optionalOffset + 60, 0x200, true);
  view.setUint16(optionalOffset + 68, 3, true);
  view.setUint32(optionalOffset + 92, 16, true);

  if (input.imports?.length) {
    view.setUint32(optionalOffset + 104, 0x2000, true);
    view.setUint32(optionalOffset + 108, 0x100, true);
  }

  writeAscii(bytes, sectionOffset, ".text");
  view.setUint32(sectionOffset + 8, 0x180, true);
  view.setUint32(sectionOffset + 12, 0x1000, true);
  view.setUint32(sectionOffset + 16, 0x200, true);
  view.setUint32(sectionOffset + 20, 0x200, true);
  view.setUint32(sectionOffset + 36, 0x60000020, true);

  const idataOffset = sectionOffset + 40;
  writeAscii(bytes, idataOffset, ".idata");
  view.setUint32(idataOffset + 8, 0x300, true);
  view.setUint32(idataOffset + 12, 0x2000, true);
  view.setUint32(idataOffset + 16, 0x400, true);
  view.setUint32(idataOffset + 20, 0x400, true);
  view.setUint32(idataOffset + 36, 0x40000040, true);

  for (let i = 0; i < 0x180; i++) {
    bytes[0x200 + i] = i % 251;
  }

  if (input.imports?.length) {
    let descriptorOffset = 0x400;
    let thunkRva = 0x2080;
    let nameRva = 0x2100;
    for (const library of input.imports) {
      view.setUint32(descriptorOffset, thunkRva, true);
      view.setUint32(descriptorOffset + 12, nameRva, true);
      view.setUint32(descriptorOffset + 16, thunkRva, true);
      writeAscii(bytes, 0x400 + (nameRva - 0x2000), library.dll);

      let thunkOffset = 0x400 + (thunkRva - 0x2000);
      let importNameRva = nameRva + 0x40;
      for (const name of library.names) {
        view.setUint32(thunkOffset, importNameRva, true);
        const importNameOffset = 0x400 + (importNameRva - 0x2000);
        view.setUint16(importNameOffset, 0, true);
        writeAscii(bytes, importNameOffset + 2, name);
        thunkOffset += 4;
        importNameRva += 2 + name.length + 1;
      }
      view.setUint32(thunkOffset, 0, true);
      descriptorOffset += 20;
      thunkRva += 0x80;
      nameRva += 0x120;
    }
  }

  bytes.set(overlay, 0x800);
  return bytes;
}

describe("parsePeFile", () => {
  it("parses DOS, NT, optional header, sections, and entry point section", () => {
    const result = parsePeFile(makeMinimalPe());

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);

    expect(result.pe.machine).toBe("0x014c");
    expect(result.pe.architecture).toBe("x86");
    expect(result.pe.numberOfSections).toBe(2);
    expect(result.pe.entryPointRva).toBe(0x1010);
    expect(result.pe.entryPointSection).toBe(".text");
    expect(result.sections[0]).toMatchObject({
      name: ".text",
      virtualAddress: 0x1000,
      rawOffset: 0x200,
      rawSize: 0x200,
      containsEntryPoint: true,
    });
    expect(result.sections[0].permissions).toEqual({ read: true, write: false, execute: true });
    expect(rvaToFileOffset(result.sections, 0x1010)).toBe(0x210);
  });

  it("parses import descriptors and imported API names", () => {
    const result = parsePeFile(
      makeMinimalPe({
        imports: [{ dll: "KERNEL32.dll", names: ["VirtualAllocEx", "WriteProcessMemory"] }],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);

    expect(result.imports).toHaveLength(1);
    expect(result.imports[0].dll).toBe("KERNEL32.dll");
    expect(result.imports[0].symbols.map((symbol) => symbol.name)).toEqual([
      "VirtualAllocEx",
      "WriteProcessMemory",
    ]);
  });

  it("detects overlay data after the last section", () => {
    const result = parsePeFile(makeMinimalPe({ overlay: new Uint8Array([1, 2, 3, 4]) }));

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);

    expect(result.overlay).toEqual({ present: true, offset: 0x800, size: 4 });
  });

  it("returns a clean non-PE result for unrelated bytes", () => {
    const result = parsePeFile(new Uint8Array([0x7f, 0x45, 0x4c, 0x46]));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected non-PE result");
    expect(result.reason).toBe("not_pe");
    expect(result.message).toContain("MZ");
  });
});
