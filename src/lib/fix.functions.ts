import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);
const Language = z.enum(["en", "it", "zh"]);
const Kind = z.enum(["smells", "deadcode", "bugs", "security"]);

async function resolveCloudKey(
  userId: string,
  provider: z.infer<typeof Provider>,
): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { decryptSecret } = await import("./crypto.server");
  const { data: cred, error } = await supabaseAdmin
    .from("user_ai_credentials")
    .select("encrypted_key")
    .eq("owner_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (error || !cred) throw new Error("no_credential_for_provider");
  return decryptSecret(cred.encrypted_key);
}

/** Generate a unified-diff patch for a single file, given the prior analysis output. */
export const proposeFileFix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      kind: Kind,
      language: Language,
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      analysis_markdown: z.string().min(1).max(40_000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    await assertByokAckAccepted(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildFixPrompt } = await import("./analysis-prompt");

    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, storage_path, repository_id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");
    const { data: repository, error: repoErr } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", file.repository_id)
      .maybeSingle();
    if (repoErr) throw repoErr;

    const apiKey = await resolveCloudKey(context.userId, data.provider);

    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
    const content = await blob.text();

    const { system, user } = buildFixPrompt({
      language: data.language,
      filePath: file.path,
      fileContent: content,
      analysisMarkdown: data.analysis_markdown,
      kindLabel: data.kind,
    });
    const text = await callCloudProvider({
      provider: data.provider,
      apiKey,
      model: data.model,
      system,
      user,
    });
    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repository?.project_id ?? null,
      repositoryId: file.repository_id,
      fileId: file.id,
      activity_kind: "llm_fix_generation",
      status: "ok",
      provider: data.provider,
      model: data.model ?? null,
      language: data.language,
      query_text: file.path,
      result_summary: "file patch generated",
      result_metadata: {
        kind: data.kind,
      },
    });
    return { content: text, file_path: file.path };
  });

/** Generate a multi-file unified-diff patch for every file in a folder with a prior analysis. */
export const proposeFolderFix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      kind: Kind,
      language: Language,
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      items: z
        .array(
          z.object({
            file_id: z.string().uuid(),
            analysis_markdown: z.string().min(1).max(20_000),
          }),
        )
        .min(1)
        .max(20),
    }),
  )
  .handler(async ({ context, data }) => {
    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    await assertByokAckAccepted(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildFixPrompt } = await import("./analysis-prompt");

    const apiKey = await resolveCloudKey(context.userId, data.provider);
    const parts: Array<{ path: string; diff: string; notes: string }> = [];
    let firstRepositoryId: string | null = null;

    for (const it of data.items) {
      const { data: file, error: fErr } = await context.supabase
        .from("files")
        .select("id, path, storage_path, repository_id")
        .eq("id", it.file_id)
        .maybeSingle();
      if (fErr || !file) continue;
      firstRepositoryId ??= file.repository_id;
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from("repositories")
        .download(file.storage_path);
      if (dlErr || !blob) continue;
      const content = await blob.text();
      const { system, user } = buildFixPrompt({
        language: data.language,
        filePath: file.path,
        fileContent: content,
        analysisMarkdown: it.analysis_markdown,
        kindLabel: data.kind,
      });
      try {
        const text = await callCloudProvider({
          provider: data.provider,
          apiKey,
          model: data.model,
          system,
          user,
        });
        const m = text.match(/```diff\s*([\s\S]*?)```/i);
        const diff = (m?.[1] ?? "").trim();
        const notesIdx = text.search(/```diff/i);
        const notes =
          notesIdx >= 0
            ? text.slice(notesIdx).replace(/```diff[\s\S]*?```/i, "").trim()
            : text.trim();
        parts.push({ path: file.path, diff, notes });
      } catch (e: any) {
        parts.push({ path: file.path, diff: "", notes: `[error] ${e?.message ?? "unknown"}` });
      }
    }

    if (firstRepositoryId) {
      const { data: repository } = await context.supabase
        .from("repositories")
        .select("project_id")
        .eq("id", firstRepositoryId)
        .maybeSingle();
      await appendAnalysisActivity({
        supabase: context.supabase,
        ownerId: context.userId,
        projectId: repository?.project_id ?? null,
        repositoryId: firstRepositoryId,
        activity_kind: "llm_fix_generation",
        status: "ok",
        provider: data.provider,
        model: data.model ?? null,
        language: data.language,
        query_text: data.items[0]?.file_id ?? "folder",
        result_summary: "folder patch generated",
        result_metadata: {
          kind: data.kind,
          file_count: parts.length,
        },
      });
    }

    const combined = parts
      .filter((p) => p.diff)
      .map((p) => p.diff.endsWith("\n") ? p.diff : p.diff + "\n")
      .join("\n");
    const notesAll = parts
      .map((p) => `### ${p.path}\n${p.notes || "(no notes)"}`)
      .join("\n\n");

    return { combined_diff: combined, notes: notesAll, file_count: parts.length };
  });
