import { createFileRoute } from "@tanstack/react-router";

// Retention policy:
//   delete a repository if it was uploaded > 60 days ago AND no explanation
//   under any of its files has been generated in the last 30 days.
// Called by pg_cron once per day. Auth via Supabase anon key (`apikey` header)
// because the route lives under /api/public/* which bypasses platform auth.

const RETENTION_DAYS = 60;
const ACTIVITY_DAYS = 30;

export const Route = createFileRoute("/api/public/hooks/cleanup-stale-repositories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { timingSafeEqual } = await import("crypto");
        const auth = request.headers.get("authorization") ?? "";
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const expected = process.env.CLEANUP_CRON_SECRET ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const retentionCutoff = new Date(
          Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString();
        const activityCutoff = new Date(
          Date.now() - ACTIVITY_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString();

        const { data: oldRepos, error: rErr } = await supabaseAdmin
          .from("repositories")
          .select("id")
          .lt("created_at", retentionCutoff);
        if (rErr) {
          return Response.json({ ok: false, error: rErr.message }, { status: 500 });
        }

        const stats = { scanned: oldRepos?.length ?? 0, deleted: 0, files: 0, objects: 0 };

        for (const repo of oldRepos ?? []) {
          // List files for the repo
          const { data: files } = await supabaseAdmin
            .from("files")
            .select("id, storage_path")
            .eq("repository_id", repo.id);
          const fileIds = (files ?? []).map((f) => f.id);

          // Skip if any explanation under these files is recent
          if (fileIds.length > 0) {
            const { count: recentCount } = await supabaseAdmin
              .from("explanations")
              .select("id", { count: "exact", head: true })
              .in("file_id", fileIds)
              .gte("created_at", activityCutoff);
            if ((recentCount ?? 0) > 0) continue;
          }

          // Remove storage objects (ignore individual failures)
          const paths = (files ?? []).map((f) => f.storage_path).filter(Boolean);
          if (paths.length > 0) {
            const { error: sErr } = await supabaseAdmin.storage.from("repositories").remove(paths);
            if (!sErr) stats.objects += paths.length;
          }

          // Delete DB rows (no FK cascade configured — delete children first)
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

        return Response.json({ ok: true, ...stats, retentionDays: RETENTION_DAYS });
      },
    },
  },
});
