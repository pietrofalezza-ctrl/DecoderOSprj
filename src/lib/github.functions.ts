import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

const GH_URL = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/,
    "Must be a https://github.com/<owner>/<repo> URL",
  );

export const importFromGitHub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      project_id: z.string().uuid(),
      url: GH_URL,
      ref: z.string().trim().min(1).max(120).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { extractZip } = await import("./zip.server");
    const { sha256Hex } = await import("./crypto.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const m = data.url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (!m) throw new Error("invalid_github_url");
    const owner = m[1];
    const repo = m[2];
    // codeload doesn't accept "HEAD" — try the user-supplied ref, otherwise main → master
    const candidates = data.ref ? [data.ref] : ["main", "master"];
    let r: Response | null = null;
    let lastStatus = 0;
    for (const candidate of candidates) {
      const archiveUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${encodeURIComponent(candidate)}`;
      const res = await fetch(archiveUrl, { redirect: "follow" });
      if (res.ok) {
        r = res;
        break;
      }
      lastStatus = res.status;
      // drain body so the connection can be reused
      await res.arrayBuffer().catch(() => undefined);
    }
    if (!r) {
      if (lastStatus === 404) throw new Error("repo_or_ref_not_found");
      throw new Error(`github_download_failed_${lastStatus}`);
    }
    const ab = await r.arrayBuffer();
    if (ab.byteLength > MAX_BYTES) throw new Error("repo_too_large");
    const bytes = new Uint8Array(ab);

    const files = extractZip(bytes);
    if (files.length === 0) throw new Error("no_files");

    const repoName = `${owner}/${repo}${data.ref ? `@${data.ref}` : ""}`;
    const { data: repoRow, error: rErr } = await context.supabase
      .from("repositories")
      .insert({
        owner_id: context.userId,
        project_id: data.project_id,
        name: repoName.slice(0, 160),
        source: "github",
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
    }> = [];
    for (const f of files) {
      const sha = sha256Hex(f.bytes);
      const storagePath = `${context.userId}/${repoRow.id}/${f.path}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("repositories")
        .upload(storagePath, f.bytes, {
          contentType: "text/plain; charset=utf-8",
          upsert: true,
        });
      if (upErr) throw upErr;
      rows.push({
        repository_id: repoRow.id,
        owner_id: context.userId,
        path: f.path,
        language: f.language,
        size_bytes: f.bytes.length,
        sha256: sha,
        storage_path: storagePath,
      });
    }
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error: fErr } = await context.supabase.from("files").insert(chunk);
      if (fErr) throw fErr;
    }

    return { repository_id: repoRow.id, file_count: files.length };
  });
