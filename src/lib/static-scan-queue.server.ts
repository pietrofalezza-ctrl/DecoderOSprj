import {
  runStaticScanFromBytes,
  staticScanDbValues,
  type StaticScanStatus,
} from "@/lib/static-scan.server";
import { appendAnalysisActivity } from "@/lib/analysis-activities";

type FileRecord = {
  id: string;
  path: string;
  owner_id: string;
  repository_id: string;
  storage_path: string;
};

const ACTIVE_SCANS = new Map<string, Promise<void>>();

function nowIso(): string {
  return new Date().toISOString();
}

async function scanSingleFile(input: {
  file: FileRecord;
  supabase: any;
  supabaseAdmin: any;
  projectId: string | null;
}) {
  const { file, supabase, supabaseAdmin, projectId } = input;
  const startedAt = nowIso();
  await supabase
    .from("files")
    .update({
      static_scan_status: "scanning",
      static_scan_started_at: startedAt,
      static_last_error: null,
      static_scan_report: null,
    })
    .eq("id", file.id)
    .eq("static_scan_status", "pending");

  try {
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) {
      throw dlErr ?? new Error("scan_file_download_failed");
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const payload = runStaticScanFromBytes(file.path, bytes);
    const mapped = staticScanDbValues(payload);

    await supabase
      .from("files")
      .update({
        ...mapped,
        static_scan_status: payload.status,
        static_last_error: null,
        static_scan_report: mapped.static_scan_report,
      })
      .eq("id", file.id);

    await appendAnalysisActivity({
      supabase,
      ownerId: file.owner_id,
      fileId: file.id,
      repositoryId: file.repository_id,
      projectId,
      activity_kind: "static_scan",
      status: payload.status === "block" ? "error" : payload.status === "warn" ? "warn" : "ok",
      query_text: file.path,
      result_summary: `decision:${payload.status} entropy:${mapped.static_entropy_global}`,
      result_metadata: {
        risk: payload.report.riskScore,
        decision: payload.report.decision,
        entropyGlobal: payload.report.entropy.global,
        entropyWindow: payload.report.entropy.maxWindow,
      },
    });
  } catch (err: any) {
    const message = err?.message ?? "scan_failed";
    const failedAt = nowIso();
    await supabase
      .from("files")
      .update({
        static_scan_status: "block",
        static_scan_started_at: startedAt,
        static_scan_finished_at: failedAt,
        static_last_error: message,
        static_decision: "block",
        static_scan_report: { reason: "scan_failed", message },
      })
      .eq("id", file.id);

    await appendAnalysisActivity({
      supabase,
      ownerId: file.owner_id,
      fileId: file.id,
      repositoryId: file.repository_id,
      projectId,
      activity_kind: "static_scan",
      status: "error",
      query_text: file.path,
      result_summary: "scan_failed",
      result_metadata: { message },
    });
  }
}

async function getProjectForRepository(
  supabase: any,
  repositoryId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("repositories")
    .select("project_id")
    .eq("id", repositoryId)
    .maybeSingle();
  return data?.project_id ?? null;
}

export function triggerStaticScanForRepository(input: {
  supabase: any;
  supabaseAdmin: any;
  repositoryId: string;
}) {
  const { repositoryId } = input;
  if (ACTIVE_SCANS.has(repositoryId)) return;

  const scanPromise = runStaticScanForRepository(input)
    .catch(() => {
      // no-op: background scan must never fail foreground requests
    })
    .finally(() => {
      ACTIVE_SCANS.delete(repositoryId);
    });

  ACTIVE_SCANS.set(repositoryId, scanPromise);
  void scanPromise;
}

export async function runStaticScanForRepository(input: {
  supabase: any;
  supabaseAdmin: any;
  repositoryId: string;
}) {
  const { supabase, repositoryId } = input;

  const projectId = await getProjectForRepository(supabase, repositoryId);
  const { data: files, error } = await supabase
    .from("files")
    .select("id, path, owner_id, repository_id, storage_path")
    .eq("repository_id", repositoryId)
    .eq("static_scan_status", "pending");

  if (error || !files || files.length === 0) {
    return;
  }

  const target: FileRecord[] = files;
  for (const file of target) {
    await scanSingleFile({
      file,
      supabase,
      supabaseAdmin: input.supabaseAdmin,
      projectId,
    });
  }
}
