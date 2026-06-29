import { createFileRoute } from "@tanstack/react-router";

// Retention policy:
//   delete a repository if it was uploaded > RETENTION_DAYS days ago AND no
//   explanation under any of its files has been generated in the last
//   ACTIVITY_DAYS days.
//
// Called by pg_cron once per day. Auth: Bearer <CLEANUP_CRON_SECRET>
// (server-only secret, never the publishable anon key) compared with
// timingSafeEqual. Every run — success or failure — is recorded in
// public.maintenance_audit_log (admin-only readable).

const RETENTION_DAYS = 60;
const ACTIVITY_DAYS = 30;
const JOB_NAME = "cleanup-stale-repositories";

export const Route = createFileRoute("/api/public/hooks/cleanup-stale-repositories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { timingSafeEqual, randomUUID } = await import("crypto");
        const auth = request.headers.get("authorization") ?? "";
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const expected = process.env.CLEANUP_CRON_SECRET ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const requestId = randomUUID();
        const startedAt = new Date();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const writeAudit = async (
          status: "ok" | "error",
          stats: Record<string, number>,
          error?: string,
        ) => {
          const finishedAt = new Date();
          await supabaseAdmin.from("maintenance_audit_log").insert({
            job_name: JOB_NAME,
            request_id: requestId,
            status,
            started_at: startedAt.toISOString(),
            finished_at: finishedAt.toISOString(),
            duration_ms: finishedAt.getTime() - startedAt.getTime(),
            stats,
            error: error ?? null,
          });
        };

        const retentionCutoff = new Date(
          startedAt.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString();
        const activityCutoff = new Date(
          startedAt.getTime() - ACTIVITY_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString();

        const { data: oldRepos, error: rErr } = await supabaseAdmin
          .from("repositories")
          .select("id")
          .lt("created_at", retentionCutoff);
        if (rErr) {
          await writeAudit("error", { scanned: 0, deleted: 0, files: 0, objects: 0 }, rErr.message);
          return Response.json(
            { ok: false, error: rErr.message, request_id: requestId },
            { status: 500 },
          );
        }

        const stats = { scanned: oldRepos?.length ?? 0, deleted: 0, files: 0, objects: 0 };

        try {
          for (const repo of oldRepos ?? []) {
            const { data: files } = await supabaseAdmin
              .from("files")
              .select("id, storage_path")
              .eq("repository_id", repo.id);
            const fileIds = (files ?? []).map((f) => f.id);

            if (fileIds.length > 0) {
              const { count: recentCount } = await supabaseAdmin
                .from("explanations")
                .select("id", { count: "exact", head: true })
                .in("file_id", fileIds)
                .gte("created_at", activityCutoff);
              if ((recentCount ?? 0) > 0) continue;
            }

            const paths = (files ?? []).map((f) => f.storage_path).filter(Boolean);
            if (paths.length > 0) {
              const { error: sErr } = await supabaseAdmin.storage
                .from("repositories")
                .remove(paths);
              if (!sErr) stats.objects += paths.length;
            }

            if (fileIds.length > 0) {
              await supabaseAdmin.from("explanations").delete().in("file_id", fileIds);
              await supabaseAdmin.from("files").delete().eq("repository_id", repo.id);
              stats.files += fileIds.length;
            }
            const { error: dErr } = await supabaseAdmin
              .from("repositories")
              .delete()
              .eq("id", repo.id);
            if (!dErr) stats.deleted += 1;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await writeAudit("error", stats, message);
          return Response.json(
            { ok: false, error: message, request_id: requestId, ...stats },
            { status: 500 },
          );
        }

        await writeAudit("ok", stats);
        return Response.json({
          ok: true,
          request_id: requestId,
          retentionDays: RETENTION_DAYS,
          ...stats,
        });
      },
    },
  },
});
