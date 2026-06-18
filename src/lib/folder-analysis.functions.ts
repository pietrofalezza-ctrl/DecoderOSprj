import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);
const Language = z.enum(["en", "it", "zh"]);
const Kind = z.enum(["smells", "deadcode", "bugs", "security"]);

/** Server-side list of file_ids belonging to a folder path (prefix match within a repo). */
export const listFolderFiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      folder_path: z.string().min(1).max(1000),
    }),
  )
  .handler(async ({ context, data }) => {
    const prefix = data.folder_path.replace(/\/+$/, "") + "/";
    const { data: files, error } = await context.supabase
      .from("files")
      .select("id, path, size_bytes, language")
      .eq("repository_id", data.repo_id)
      .like("path", `${prefix}%`)
      .order("path");
    if (error) throw error;
    return { files: files ?? [] };
  });

/** Aggregate per-file analyses into a folder-level synthesis (1 extra LLM call). */
export const aggregateFolderAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      folder_path: z.string().min(1).max(1000),
      kind: Kind,
      language: Language,
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      items: z
        .array(
          z.object({
            path: z.string().min(1).max(1000),
            excerpt: z.string().min(1).max(8_000),
          }),
        )
        .min(1)
        .max(40),
    }),
  )
  .handler(async ({ context, data }) => {
    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    await assertByokAckAccepted(context.supabase, context.userId);
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildFolderAggregatePrompt } = await import("./analysis-prompt");
    const { data: repository, error: repoErr } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", data.repo_id)
      .maybeSingle();
    if (repoErr) throw repoErr;

    let apiKey: string;
    {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { decryptSecret } = await import("./crypto.server");
      const { data: cred, error } = await supabaseAdmin
        .from("user_ai_credentials")
        .select("encrypted_key")
        .eq("owner_id", context.userId)
        .eq("provider", data.provider)
        .maybeSingle();
      if (error || !cred) throw new Error("no_credential_for_provider");
      apiKey = decryptSecret(cred.encrypted_key);
    }

    const { system, user } = buildFolderAggregatePrompt({
      language: data.language,
      kindLabel: data.kind,
      folderPath: data.folder_path,
      perFile: data.items,
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
      repositoryId: data.repo_id,
      activity_kind: "llm_folder_analysis",
      status: "ok",
      provider: data.provider,
      model: data.model ?? null,
      language: data.language,
      query_text: data.folder_path,
      result_summary: "folder analysis summary",
      result_content: text,
      result_metadata: {
        kind: data.kind,
        item_count: data.items.length,
      },
    });
    return { content: text };
  });
