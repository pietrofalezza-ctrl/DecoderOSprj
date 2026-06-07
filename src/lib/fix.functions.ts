import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Provider = z.enum(["lovable", "openai", "anthropic", "gemini", "openrouter"]);
const Language = z.enum(["en", "it", "zh"]);
const Kind = z.enum(["smells", "deadcode", "bugs", "security"]);

async function resolveCloudKey(
  userId: string,
  provider: z.infer<typeof Provider>,
): Promise<string> {
  if (provider === "lovable") {
    const k = process.env.LOVABLE_API_KEY;
    if (!k) throw new Error("lovable_ai_not_configured");
    return k;
  }
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildFixPrompt } = await import("./analysis-prompt");

    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, storage_path")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildFixPrompt } = await import("./analysis-prompt");

    const apiKey = await resolveCloudKey(context.userId, data.provider);
    const parts: Array<{ path: string; diff: string; notes: string }> = [];

    for (const it of data.items) {
      const { data: file, error: fErr } = await context.supabase
        .from("files")
        .select("id, path, storage_path")
        .eq("id", it.file_id)
        .maybeSingle();
      if (fErr || !file) continue;
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

    const combined = parts
      .filter((p) => p.diff)
      .map((p) => p.diff.endsWith("\n") ? p.diff : p.diff + "\n")
      .join("\n");
    const notesAll = parts
      .map((p) => `### ${p.path}\n${p.notes || "(no notes)"}`)
      .join("\n\n");

    return { combined_diff: combined, notes: notesAll, file_count: parts.length };
  });
