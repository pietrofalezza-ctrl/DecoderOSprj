import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnalysisMode = z.enum(["static", "llm", "both"]);

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, name, description, created_at, analysis_mode")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { projects: data ?? [] };
  });

export const getProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { data: project, error } = await context.supabase
      .from("projects")
      .select("id, name, description, created_at, analysis_mode")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    const { data: repos, error: rErr } = await context.supabase
      .from("repositories")
      .select("id, name, source, file_count, created_at")
      .eq("project_id", data.id)
      .order("created_at", { ascending: false });
    if (rErr) throw rErr;

    const repoIds = (repos ?? []).map((r) => r.id);
    const repoSummaryMap = new Map<
      string,
      {
        total: number;
        pending: number;
        scanning: number;
        safe: number;
        warn: number;
        block: number;
        entropySum: number;
        entropyCount: number;
        entropyWindowSum: number;
        entropyWindowCount: number;
        entropyWindowMax: number;
      }
    >();
    const projectMetrics = {
      total_files: 0,
      pending_files: 0,
      scanning_files: 0,
      safe_files: 0,
      warn_files: 0,
      block_files: 0,
      average_entropy_global: null as number | null,
      average_entropy_window: null as number | null,
      max_entropy_window: null as number | null,
    };
    if (repoIds.length > 0) {
      const { data: fileStats, error: fErr } = await context.supabase
        .from("files")
        .select("repository_id, static_scan_status, static_entropy_global, static_entropy_window")
        .in("repository_id", repoIds);
      if (fErr) throw fErr;

      for (const r of repoIds) {
        repoSummaryMap.set(r, {
          total: 0,
          pending: 0,
          scanning: 0,
          safe: 0,
          warn: 0,
          block: 0,
          entropySum: 0,
          entropyCount: 0,
          entropyWindowSum: 0,
          entropyWindowCount: 0,
          entropyWindowMax: 0,
        });
      }
      for (const row of fileStats ?? []) {
        const bucket = repoSummaryMap.get(row.repository_id);
        if (!bucket) continue;
        bucket.total += 1;
        projectMetrics.total_files += 1;
        if (row.static_scan_status === "pending") bucket.pending += 1;
        else if (row.static_scan_status === "scanning") bucket.scanning += 1;
        else if (row.static_scan_status === "safe") bucket.safe += 1;
        else if (row.static_scan_status === "warn") bucket.warn += 1;
        else if (row.static_scan_status === "block") bucket.block += 1;
        if (row.static_scan_status === "pending") projectMetrics.pending_files += 1;
        else if (row.static_scan_status === "scanning") projectMetrics.scanning_files += 1;
        else if (row.static_scan_status === "safe") projectMetrics.safe_files += 1;
        else if (row.static_scan_status === "warn") projectMetrics.warn_files += 1;
        else if (row.static_scan_status === "block") projectMetrics.block_files += 1;
        if (typeof row.static_entropy_global === "number") {
          bucket.entropySum += row.static_entropy_global;
          bucket.entropyCount += 1;
        }
        if (typeof row.static_entropy_window === "number") {
          bucket.entropyWindowSum += row.static_entropy_window;
          bucket.entropyWindowCount += 1;
          bucket.entropyWindowMax = Math.max(bucket.entropyWindowMax, row.static_entropy_window);
        }
      }

      const entropyValues = (fileStats ?? [])
        .map((row) => row.static_entropy_global)
        .filter((value): value is number => typeof value === "number");
      const entropyWindowValues = (fileStats ?? [])
        .map((row) => row.static_entropy_window)
        .filter((value): value is number => typeof value === "number");
      if (entropyValues.length > 0) {
        projectMetrics.average_entropy_global =
          entropyValues.reduce((acc, value) => acc + value, 0) / entropyValues.length;
      }
      if (entropyWindowValues.length > 0) {
        projectMetrics.average_entropy_window =
          entropyWindowValues.reduce((acc, value) => acc + value, 0) / entropyWindowValues.length;
        projectMetrics.max_entropy_window = Math.max(...entropyWindowValues);
      }
    }

    const reposWithSummary = (repos ?? []).map((repo) => ({
      ...repo,
      static_scan_summary: repoSummaryMap.get(repo.id) ?? {
        total: 0,
        pending: 0,
        scanning: 0,
        safe: 0,
        warn: 0,
        block: 0,
        entropySum: 0,
        entropyCount: 0,
        entropyWindowSum: 0,
        entropyWindowCount: 0,
        entropyWindowMax: 0,
      },
    }));

    const recentActivitiesQuery = await context.supabase
      .from("analysis_activities")
      .select(
        "id, created_at, activity_kind, status, provider, model, language, query_text, result_summary, repository_id, file_id",
      )
      .eq("project_id", data.id)
      .order("created_at", { ascending: false })
      .limit(12);
    if (recentActivitiesQuery.error) throw recentActivitiesQuery.error;

    const recentActivities = recentActivitiesQuery.data ?? [];
    const llmCount = recentActivities.filter((row) => row.activity_kind.startsWith("llm_")).length;
    const staticCount = recentActivities.filter(
      (row) => row.activity_kind === "static_scan",
    ).length;

    return {
      project,
      repositories: reposWithSummary,
      metrics: {
        ...projectMetrics,
        repository_count: reposWithSummary.length,
        llm_activities: llmCount,
        static_activities: staticCount,
      },
      recent_activities: recentActivities,
    };
  });

export const updateProjectAnalysisMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      analysis_mode: AnalysisMode,
    }),
  )
  .handler(async ({ context, data }) => {
    const owned = await context.supabase
      .from("projects")
      .select("id")
      .eq("id", data.id)
      .maybeSingle();
    if (owned.error) throw owned.error;
    if (!owned.data) throw new Error("not_found");

    const { error } = await context.supabase
      .from("projects")
      .update({ analysis_mode: data.analysis_mode })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true, analysis_mode: data.analysis_mode };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(120),
      description: z.string().trim().max(2000).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { data: created, error } = await context.supabase
      .from("projects")
      .insert({
        owner_id: context.userId,
        name: data.name,
        description: data.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: created.id };
  });

/**
 * GDPR Art. 17 — granular deletion of a single project and all its
 * descendants (repositories, files, explanations, storage objects).
 */
export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = context.userId;
    // Ownership check via RLS-scoped client.
    const { data: owned, error: oErr } = await context.supabase
      .from("projects")
      .select("id")
      .eq("id", data.id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!owned) throw new Error("not_found");

    // Collect repos to clean up their storage prefix.
    const { data: repos } = await supabaseAdmin
      .from("repositories")
      .select("id")
      .eq("project_id", data.id)
      .eq("owner_id", uid);
    for (const r of repos ?? []) {
      try {
        const { data: list } = await supabaseAdmin.storage
          .from("repositories")
          .list(`${uid}/${r.id}`, { limit: 1000 });
        if (list?.length) {
          await supabaseAdmin.storage
            .from("repositories")
            .remove(list.map((o) => `${uid}/${r.id}/${o.name}`));
        }
      } catch {
        // best-effort
      }
    }

    await supabaseAdmin
      .from("explanations")
      .delete()
      .eq("owner_id", uid)
      .in(
        "file_id",
        (
          (
            await supabaseAdmin
              .from("files")
              .select("id")
              .eq("owner_id", uid)
              .in(
                "repository_id",
                (repos ?? []).map((r) => r.id),
              )
          ).data ?? []
        ).map((f) => f.id),
      );
    await supabaseAdmin
      .from("files")
      .delete()
      .eq("owner_id", uid)
      .in(
        "repository_id",
        (repos ?? []).map((r) => r.id),
      );
    await supabaseAdmin.from("repositories").delete().eq("owner_id", uid).eq("project_id", data.id);
    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", uid);
    if (error) throw error;
    return { ok: true };
  });
