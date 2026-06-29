import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAssess } = vi.hoisted(() => ({ mockAssess: vi.fn() }));

vi.mock("../static-malware.server", () => ({
  assessStaticMalwareFile: mockAssess,
}));

import {
  runStaticScanFromBytes,
  staticScanDbValues,
  type StaticScanPayload,
} from "../static-scan.server";

const mockAssessment = {
  filePath: "test.exe",
  fileSize: 512,
  fileExt: "exe",
  decision: "block" as const,
  riskScore: 85,
  entropy: {
    global: 7.5,
    maxWindow: 7.8,
    maxWindowOffset: 100,
    suspiciousWindowCount: 3,
    windowSize: 256,
    windowStep: 128,
    sections: [],
  },
  findings: [
    {
      code: "magic.mismatch",
      title: "Bad magic",
      description: "...",
      severity: "high" as const,
      decision: "block" as const,
      confidence: "high" as const,
    },
  ],
  magicSignature: "4d5a",
  magicDetected: "pe-mz",
  metrics: {
    hasNullBytes: false,
    controlCharRatio: 0.1,
    printableRatio: 0.9,
    isTextLikeExt: false,
    pathLooksSafe: true,
  },
};

// ─── staticScanDbValues (pure) ─────────────────────────────────────

describe("staticScanDbValues", () => {
  const basePayload: StaticScanPayload = {
    status: "block",
    startedAt: "2025-01-15T10:00:00.000Z",
    finishedAt: "2025-01-15T10:00:01.000Z",
    report: {
      filePath: "test.exe",
      fileSize: 512,
      fileExt: "exe",
      decision: "block",
      riskScore: 85,
      entropy: {
        global: 7.5,
        maxWindow: 7.8,
        maxWindowOffset: 100,
        suspiciousWindowCount: 3,
        windowSize: 256,
        windowStep: 128,
        sections: [],
      },
      findings: [],
      magicSignature: "4d5a",
      magicDetected: "pe-mz",
      metrics: {
        hasNullBytes: false,
        controlCharRatio: 0.1,
        printableRatio: 0.9,
        isTextLikeExt: false,
        pathLooksSafe: true,
      },
    } as unknown as StaticScanPayload["report"],
  } satisfies StaticScanPayload;

  it("maps status field", () => {
    expect(staticScanDbValues(basePayload).static_scan_status).toBe("block");
  });

  it("maps startedAt to static_scan_started_at", () => {
    expect(staticScanDbValues(basePayload).static_scan_started_at).toBe("2025-01-15T10:00:00.000Z");
  });

  it("maps finishedAt", () => {
    expect(staticScanDbValues(basePayload).static_scan_finished_at).toBe(
      "2025-01-15T10:00:01.000Z",
    );
  });

  it("maps entropy values", () => {
    const v = staticScanDbValues(basePayload);
    expect(v.static_entropy_global).toBe(7.5);
    expect(v.static_entropy_window).toBe(7.8);
  });

  it("maps decision", () => {
    expect(staticScanDbValues(basePayload).static_decision).toBe("block");
  });

  it("sets static_last_error to null", () => {
    expect(staticScanDbValues(basePayload).static_last_error).toBeNull();
  });

  it("maps report object directly", () => {
    expect(staticScanDbValues(basePayload).static_scan_report).toEqual(basePayload.report);
  });

  it("handles safe status", () => {
    expect(staticScanDbValues({ ...basePayload, status: "safe" }).static_scan_status).toBe("safe");
  });

  it("handles warn status", () => {
    expect(staticScanDbValues({ ...basePayload, status: "warn" }).static_scan_status).toBe("warn");
  });
});

// ─── runStaticScanFromBytes (mocked) ───────────────────────────────

describe("runStaticScanFromBytes", () => {
  beforeEach(() => {
    mockAssess.mockReset();
    mockAssess.mockReturnValue(mockAssessment);
  });

  it("calls assessStaticMalwareFile with path and bytes", () => {
    const bytes = new Uint8Array([0x41, 0x42, 0x43]);
    runStaticScanFromBytes("test/file.bin", bytes);
    expect(mockAssess).toHaveBeenCalledWith("test/file.bin", bytes);
  });

  it("maps allow decision to safe status", () => {
    mockAssess.mockReturnValueOnce({ ...mockAssessment, decision: "allow" });
    expect(runStaticScanFromBytes("ok.ts", new Uint8Array(1)).status).toBe("safe");
  });

  it("maps warn decision to warn status", () => {
    mockAssess.mockReturnValueOnce({ ...mockAssessment, decision: "warn" });
    expect(runStaticScanFromBytes("warn.ts", new Uint8Array(1)).status).toBe("warn");
  });

  it("maps block decision to block status", () => {
    expect(runStaticScanFromBytes("block.ts", new Uint8Array(1)).status).toBe("block");
  });

  it("returns ISO timestamps in correct order", () => {
    const payload = runStaticScanFromBytes("time.ts", new Uint8Array(1));
    expect(payload.startedAt).toBeTruthy();
    expect(payload.finishedAt).toBeTruthy();
    expect(payload.startedAt <= payload.finishedAt).toBe(true);
  });

  it("returns the full report with correct filePath", () => {
    mockAssess.mockReturnValueOnce({ ...mockAssessment, filePath: "rpt.ts", decision: "block" });
    const payload = runStaticScanFromBytes("rpt.ts", new Uint8Array(1));
    expect(payload.report.filePath).toBe("rpt.ts");
  });
});
