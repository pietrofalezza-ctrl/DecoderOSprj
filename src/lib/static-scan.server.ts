import { assessStaticMalwareFile, type StaticMalwareAssessment } from "@/lib/static-malware.server";

export type StaticScanStatus = "pending" | "scanning" | "safe" | "warn" | "block";

export type StaticScanPayload = {
  status: StaticScanStatus;
  startedAt: string;
  finishedAt: string;
  report: StaticMalwareAssessment;
};

export function runStaticScanFromBytes(path: string, bytes: Uint8Array): StaticScanPayload {
  const startedAt = new Date().toISOString();
  const report = assessStaticMalwareFile(path, bytes);

  return {
    status: report.decision === "allow" ? "safe" : report.decision,
    startedAt,
    finishedAt: new Date().toISOString(),
    report,
  };
}

export function staticScanDbValues(payload: StaticScanPayload) {
  return {
    static_scan_status: payload.status,
    static_scan_started_at: payload.startedAt,
    static_scan_finished_at: payload.finishedAt,
    static_scan_report: payload.report,
    static_entropy_global: payload.report.entropy.global,
    static_entropy_window: payload.report.entropy.maxWindow,
    static_decision: payload.report.decision,
    static_last_error: null,
  } as const;
}
