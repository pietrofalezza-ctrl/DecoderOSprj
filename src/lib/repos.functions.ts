import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_ZIP_BYTES = 25 * 1024 * 1024; // 25 MB

export const createRepositoryFromZip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      project_id: z.string().uuid(),
      name: z.string().trim().min(1).max(160),
      // ~25 MB decoded payload plus base64 overhead (~33%). Caps the request
      // at the validation layer before any memory-intensive decoding.
      zip_base64: z.string().min(1).max(35_000_000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { extractZipWithReport } = await import("./zip.server");
    const { sha256Hex } = await import("./crypto.server");
    const { cleanupFailedRepositoryIngest } = await import("./repository-storage.server");

    const zipBytes = Uint8Array.from(Buffer.from(data.zip_base64, "base64"));
    if (zipBytes.length > MAX_ZIP_BYTES) throw new Error("zip_too_large");

    const project = await context.supabase
      .from("projects")
      .select("id")
      .eq("id", data.project_id)
      .maybeSingle();
    if (project.error) throw project.error;
    if (!project.data) throw new Error("project_not_found");

    const extraction = extractZipWithReport(zipBytes);
    const files = extraction.files;
    if (files.length === 0) throw new Error("no_files");

    const { data: repo, error: rErr } = await context.supabase
      .from("repositories")
      .insert({
        owner_id: context.userId,
        project_id: data.project_id,
        name: data.name,
        source: "zip",
        file_count: files.length,
      })
      .select("id")
      .single();
    if (rErr) throw rErr;

    const rows: Array<{
      repository_id: string;
      owner_id: string;
      path: string;
      language: string | null;
      size_bytes: number;
      sha256: string;
      storage_path: string;
      static_scan_status: "pending" | "scanning" | "safe" | "warn" | "block";
      static_scan_started_at: null;
      static_scan_finished_at: null;
      static_scan_report: null;
      static_entropy_global: null;
      static_entropy_window: null;
      static_decision: null;
      static_last_error: null;
    }> = [];
    const uploadedStoragePaths: string[] = [];

    try {
      for (const f of files) {
        const sha = sha256Hex(f.bytes);
        const storagePath = `${context.userId}/${repo.id}/${f.path}`;
        const { error: upErr } = await context.supabase.storage
          .from("repositories")
          .upload(storagePath, f.bytes, {
            contentType: "text/plain; charset=utf-8",
            upsert: true,
          });
        if (upErr) throw upErr;
        uploadedStoragePaths.push(storagePath);
        rows.push({
          repository_id: repo.id,
          owner_id: context.userId,
          path: f.path,
          language: f.language,
          size_bytes: f.bytes.length,
          sha256: sha,
          storage_path: storagePath,
          static_scan_status: "pending",
          static_scan_started_at: null,
          static_scan_finished_at: null,
          static_scan_report: null,
          static_entropy_global: null,
          static_entropy_window: null,
          static_decision: null,
          static_last_error: null,
        });
      }

      // Insert in chunks
      for (let i = 0; i < rows.length; i += 500) {
        const chunk = rows.slice(i, i + 500);
        const { error: fErr } = await context.supabase.from("files").insert(chunk);
        if (fErr) throw fErr;
      }
    } catch (err) {
      await cleanupFailedRepositoryIngest(context.supabase, {
        ownerId: context.userId,
        repositoryId: repo.id,
        uploadedStoragePaths,
      });
      throw err;
    }

    const { triggerStaticScanForRepository } = await import("./static-scan-queue.server");
    triggerStaticScanForRepository({
      supabase: context.supabase,
      repositoryId: repo.id,
    });

    return { repository_id: repo.id, file_count: files.length };
  });

export const getRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { data: repo, error } = await context.supabase
      .from("repositories")
      .select("id, name, project_id, file_count, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!repo) throw new Error("repo_not_found");
    const { data: projectData, error: pErr } = await context.supabase
      .from("projects")
      .select("analysis_mode")
      .eq("id", repo.project_id)
      .maybeSingle();
    if (pErr) throw pErr;

    const static_scan_summary = await fetchStaticScanSummary(context.supabase as unknown as SupabaseCountClient, data.id);
    const { data: files, error: fErr } = await context.supabase
      .from("files")
      .select(
        "id, path, language, size_bytes, owner_id, static_scan_status, static_entropy_global, static_entropy_window, static_decision, static_last_error",
      )
      .eq("repository_id", data.id)
      .order("path");
    if (fErr) throw fErr;
    return {
      repository: repo,
      project_analysis_mode: projectData?.analysis_mode ?? "both",
      files: files ?? [],
      static_scan_summary,
    };
  });

export const getFileContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { data: file, error } = await context.supabase
      .from("files")
      .select(
        "id, path, language, storage_path, sha256, static_scan_status, static_scan_report, static_decision, static_entropy_global, static_entropy_window, static_last_error",
      )
      .eq("id", data.file_id)
      .maybeSingle();
    if (error || !file) throw error ?? new Error("not_found");
    const { data: blob, error: dlErr } = await context.supabase.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
    const text = await blob.text();
    return {
      id: file.id,
      path: file.path,
      language: file.language,
      sha256: file.sha256,
      static_scan_status: file.static_scan_status,
      static_scan_decision: file.static_decision,
      static_entropy_global: file.static_entropy_global,
      static_entropy_window: file.static_entropy_window,
      static_scan_report: file.static_scan_report,
      static_last_error: file.static_last_error,
      content: text,
    };
  });

/**
 * GDPR Art. 17 — delete a single repository (files, explanations,
 * storage objects). RLS ensures only the owner can target it.
 */
export const deleteRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = context.userId;
    const { data: owned, error: oErr } = await context.supabase
      .from("repositories")
      .select("id")
      .eq("id", data.id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!owned) throw new Error("not_found");

    // Storage cleanup
    try {
      const { data: list } = await supabaseAdmin.storage
        .from("repositories")
        .list(`${uid}/${data.id}`, { limit: 1000 });
      if (list?.length) {
        await supabaseAdmin.storage
          .from("repositories")
          .remove(list.map((o) => `${uid}/${data.id}/${o.name}`));
      }
    } catch {
      // best-effort
    }

    const { data: fileIds } = await supabaseAdmin
      .from("files")
      .select("id")
      .eq("owner_id", uid)
      .eq("repository_id", data.id);
    if (fileIds?.length) {
      await supabaseAdmin
        .from("explanations")
        .delete()
        .eq("owner_id", uid)
        .in(
          "file_id",
          fileIds.map((f) => f.id),
        );
    }
    await supabaseAdmin.from("files").delete().eq("owner_id", uid).eq("repository_id", data.id);
    const { error } = await supabaseAdmin
      .from("repositories")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", uid);
    if (error) throw error;
    return { ok: true };
  });

type SupabaseCountResult = {
  count: number | null;
  error: unknown;
};

type SupabaseCountQuery = PromiseLike<SupabaseCountResult> & {
  eq: (column: string, value: string) => SupabaseCountQuery;
};

type SupabaseCountClient = {
  from: (table: "files") => {
    select: (...args: unknown[]) => SupabaseCountQuery;
  };
};

async function fetchStaticScanSummary(supabase: SupabaseCountClient, repositoryId: string) {
  const total = await supabase
    .from("files")
    .select("id", { head: true, count: "exact" })
    .eq("repository_id", repositoryId);
  const [pending, scanning, safe, warn, block] = await Promise.all([
    supabase
      .from("files")
      .select("id", { head: true, count: "exact" })
      .eq("repository_id", repositoryId)
      .eq("static_scan_status", "pending"),
    supabase
      .from("files")
      .select("id", { head: true, count: "exact" })
      .eq("repository_id", repositoryId)
      .eq("static_scan_status", "scanning"),
    supabase
      .from("files")
      .select("id", { head: true, count: "exact" })
      .eq("repository_id", repositoryId)
      .eq("static_scan_status", "safe"),
    supabase
      .from("files")
      .select("id", { head: true, count: "exact" })
      .eq("repository_id", repositoryId)
      .eq("static_scan_status", "warn"),
    supabase
      .from("files")
      .select("id", { head: true, count: "exact" })
      .eq("repository_id", repositoryId)
      .eq("static_scan_status", "block"),
  ]);

  if (total.error || pending.error || scanning.error || safe.error || warn.error || block.error) {
    throw (
      total.error ??
      pending.error ??
      scanning.error ??
      safe.error ??
      warn.error ??
      block.error ??
      new Error("static_summary_failed")
    );
  }

  return {
    total: Number(total.count ?? 0),
    pending: Number(pending.count ?? 0),
    scanning: Number(scanning.count ?? 0),
    safe: Number(safe.count ?? 0),
    warn: Number(warn.count ?? 0),
    block: Number(block.count ?? 0),
  };
}
