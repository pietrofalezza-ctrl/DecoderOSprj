import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUnzipSync, mockStrFromU8, mockAssessStaticRisk } = vi.hoisted(() => ({
  mockUnzipSync: vi.fn(),
  mockStrFromU8: vi.fn((bytes: Uint8Array) => new TextDecoder().decode(bytes)),
  mockAssessStaticRisk: vi.fn((): { findings: Array<Record<string, unknown>> } => ({ findings: [] })),
}));

vi.mock("fflate", () => ({
  unzipSync: mockUnzipSync,
  strFromU8: mockStrFromU8,
}));

vi.mock("../static-risk.server", () => ({
  assessStaticRisk: mockAssessStaticRisk,
  shannonEntropy: vi.fn(() => 4.5),
  shannonEntropySliding: vi.fn(() => 4.5),
}));

import { extractZip, extractZipWithReport, decodeText } from "../zip.server";

function textBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function mockZip(entries: Record<string, Uint8Array>) {
  mockUnzipSync.mockReturnValue(entries);
}

describe("decodeText", () => {
  it("decodes ASCII bytes to string", () => {
    expect(decodeText(textBytes("Hello, world!"))).toBe("Hello, world!");
  });

  it("decodes empty Uint8Array to empty string", () => {
    expect(decodeText(new Uint8Array(0))).toBe("");
  });

  it("decodes unicode content", () => {
    expect(decodeText(textBytes("Café résumé"))).toBe("Café résumé");
  });
});

describe("extractZipWithReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessStaticRisk.mockReturnValue({ findings: [] });
  });

  it("extracts text files from a mock ZIP", () => {
    mockZip({
      "src/index.ts": textBytes("export const x = 1;\n"),
      "src/helper.ts": textBytes("export function h() {}\n"),
    });
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files).toHaveLength(2);
    expect(report.files[0].path).toContain("index.ts");
    expect(report.files[0].language).toBe("typescript");
    expect(report.files[1].path).toContain("helper.ts");
  });

  it("skips directory entries (paths ending with /)", () => {
    // prefix stripping removes common root "src/" since it's shared by entries
    mockZip({ "src/": new Uint8Array(0), "src/file.ts": textBytes("code") });
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files).toHaveLength(1);
    expect(report.files[0].path).toContain("file.ts");
  });

  it("drops path traversal attempts (paths with ..)", () => {
    mockZip({ "src/file.ts": textBytes("code"), "../../../etc/passwd": textBytes("bad") });
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files).toHaveLength(1);
    expect(report.droppedPaths).toContain("../../../etc/passwd");
  });

  it("strips common root prefix from all paths", () => {
    mockZip({ "my-project/src/a.ts": textBytes("a"), "my-project/src/b.ts": textBytes("b") });
    const report = extractZipWithReport(new Uint8Array(0));
    for (const f of report.files) {
      expect(f.path.startsWith("my-project/")).toBe(false);
    }
    expect(report.files[0].path).toContain("src/a.ts");
  });

  it("maps Dockerfile and Makefile language to shell", () => {
    mockZip({ Dockerfile: textBytes("FROM node:20\n"), Makefile: textBytes("all: build\n") });
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files.find((f) => f.path === "Dockerfile")?.language).toBe("shell");
    expect(report.files.find((f) => f.path === "Makefile")?.language).toBe("shell");
  });

  it("maps known extensions to languages", () => {
    mockZip({
      "app.tsx": textBytes("const App = () => <div/>;"),
      "style.css": textBytes("body { color: red; }"),
      "config.json": textBytes('{"key": "value"}'),
      "script.py": textBytes("print('hello')"),
      "main.go": textBytes("package main"),
    });
    const report = extractZipWithReport(new Uint8Array(0));
    const byPath = Object.fromEntries(report.files.map((f) => [f.path, f.language]));
    expect(byPath["app.tsx"]).toBe("typescript");
    expect(byPath["style.css"]).toBe("css");
    expect(byPath["config.json"]).toBe("json");
    expect(byPath["script.py"]).toBe("python");
    expect(byPath["main.go"]).toBe("go");
  });

  it("returns null language for unmapped extensions", () => {
    mockZip({ "data.xyzzy": textBytes("???") });
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files[0].language).toBeNull();
  });

  it("retains files that static risk flags as block so offline analysis can inspect them", () => {
    mockAssessStaticRisk.mockReturnValue({
      findings: [
        {
          path: "src/suspicious.ts",
          severity: "block",
          reasons: ["PE executable magic bytes embedded in a source-looking file"],
          entropy: {
            global: 7.9,
            maxWindow: 7.95,
          },
          magicSignature: "4d5a",
        },
      ],
    });
    mockZip({ "src/suspicious.ts": new Uint8Array([0x4d, 0x5a, 0x00, 0x00]) });

    const report = extractZipWithReport(new Uint8Array(0));

    expect(report.files).toHaveLength(1);
    expect(report.files[0]).toMatchObject({
      path: "suspicious.ts",
      language: "typescript",
    });
    expect(report.findings.blocked).toHaveLength(1);
    expect(report.droppedPaths).toEqual([]);
  });

  it("keeps only files, drops nested directories", () => {
    mockZip({
      "empty_dir/": new Uint8Array(0),
      "nested/deep/": new Uint8Array(0),
      "nested/deep/actual.ts": textBytes("code"),
    });
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files).toHaveLength(1);
    expect(report.files[0].path).toContain("actual.ts");
  });

  it("caps files at MAX_TOTAL_FILES (2000)", () => {
    const many: Record<string, Uint8Array> = {};
    for (let i = 0; i < 2500; i++) many[`file_${i}.txt`] = textBytes(`content_${i}`);
    mockZip(many);
    const report = extractZipWithReport(new Uint8Array(0));
    expect(report.files.length).toBeLessThanOrEqual(2000);
  });
});

describe("extractZip", () => {
  it("returns only files array from extractZipWithReport", () => {
    mockUnzipSync.mockReturnValue({ "a.ts": textBytes("a"), "b.ts": textBytes("b") });
    const files = extractZip(new Uint8Array(0));
    expect(files).toHaveLength(2);
    expect(files[0].path).toBe("a.ts");
    expect(files[1].path).toBe("b.ts");
  });
});
