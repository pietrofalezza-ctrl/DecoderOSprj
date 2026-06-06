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
      zip_base64: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const { extractZip } = await import("./zip.server");
    const { sha256Hex } = await import("./crypto.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const zipBytes = Uint8Array.from(Buffer.from(data.zip_base64, "base64"));
    if (zipBytes.length > MAX_ZIP_BYTES) throw new Error("zip_too_large");

    const files = extractZip(zipBytes);
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
    }> = [];

    for (const f of files) {
      const sha = sha256Hex(f.bytes);
      const storagePath = `${context.userId}/${repo.id}/${f.path}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("repositories")
        .upload(storagePath, f.bytes, {
          contentType: "text/plain; charset=utf-8",
          upsert: true,
        });
      if (upErr) throw upErr;
      rows.push({
        repository_id: repo.id,
        owner_id: context.userId,
        path: f.path,
        language: f.language,
        size_bytes: f.bytes.length,
        sha256: sha,
        storage_path: storagePath,
      });
    }

    // Insert in chunks
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error: fErr } = await context.supabase.from("files").insert(chunk);
      if (fErr) throw fErr;
    }

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
    const { data: files, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, language, size_bytes")
      .eq("repository_id", data.id)
      .order("path");
    if (fErr) throw fErr;
    return { repository: repo, files: files ?? [] };
  });

export const getFileContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file, error } = await context.supabase
      .from("files")
      .select("id, path, language, storage_path, sha256")
      .eq("id", data.file_id)
      .maybeSingle();
    if (error || !file) throw error ?? new Error("not_found");
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
    const text = await blob.text();
    return {
      id: file.id,
      path: file.path,
      language: file.language,
      sha256: file.sha256,
      content: text,
    };
  });
