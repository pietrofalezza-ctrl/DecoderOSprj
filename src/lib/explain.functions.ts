import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Provider = z.enum(["lovable", "openai", "anthropic", "gemini", "openrouter"]);
const Proficiency = z.enum([
  "nontech",
  "junior",
  "intermediate",
  "senior",
  "architect",
  "cto",
]);
const ExplanationType = z.enum(["human", "technical"]);
const Language = z.enum(["en", "it", "zh"]);

export const explainFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      proficiency: Proficiency,
      explanation_type: ExplanationType,
      language: Language,
      snippet: z
        .object({
          content: z.string().min(1).max(60_000),
          start_line: z.number().int().min(1),
          end_line: z.number().int().min(1),
        })
        .optional(),
    }),
  )

  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptSecret } = await import("./crypto.server");
    const { callCloudProvider, buildPrompt } = await import("./ai-providers.server");

    // Load file (RLS scoped to user)
    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, storage_path, sha256")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");

    const hasSnippet = !!data.snippet;

    // Cache lookup (only for full-file explanations — snippets are ad-hoc).
    if (!hasSnippet) {
      const { data: cached } = await context.supabase
        .from("explanations")
        .select("content, provider, model")
        .eq("file_id", file.id)
        .eq("proficiency", data.proficiency)
        .eq("explanation_type", data.explanation_type)
        .eq("language", data.language)
        .eq("file_sha256", file.sha256)
        .maybeSingle();
      if (cached) {
        return { content: cached.content, provider: cached.provider, model: cached.model, cached: true };
      }
    }

    const { assertByokAckAccepted } = await import("./byok-acknowledgement.functions");
    await assertByokAckAccepted(context.supabase, context.userId);

    // Load credential (skip for Lovable AI which uses the server-side gateway key).
    let apiKey: string;
    if (data.provider === "lovable") {
      const { assertHostedLovableAllowed } = await import("./hosted-ai-guard.server");
      assertHostedLovableAllowed(data.provider);
      const k = process.env.LOVABLE_API_KEY!;
      // Free-tier daily quota — enforced only for the managed provider.
      // Returned as a structured result (not thrown) so it isn't reported
      // as a runtime error in the client.
      const { checkLovableQuota } = await import("./rate-limit.server");
      const quota = await checkLovableQuota(context.supabase, context.userId, data.language);
      if (!quota.ok) {
        return { quotaExceeded: true as const, message: quota.message };
      }
      apiKey = k;
    } else {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: cred, error: cErr } = await supabaseAdmin
        .from("user_ai_credentials")
        .select("encrypted_key")
        .eq("owner_id", context.userId)
        .eq("provider", data.provider)
        .maybeSingle();
      if (cErr || !cred) throw new Error("no_credential_for_provider");
      apiKey = decryptSecret(cred.encrypted_key);
    }

    let contentForPrompt: string;
    let pathForPrompt: string = file.path;
    if (hasSnippet) {
      contentForPrompt = data.snippet!.content;
      pathForPrompt = `${file.path} (selezione righe ${data.snippet!.start_line}–${data.snippet!.end_line})`;
    } else {
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from("repositories")
        .download(file.storage_path);
      if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
      contentForPrompt = await blob.text();
      if (contentForPrompt.length > 60_000) contentForPrompt = contentForPrompt.slice(0, 60_000) + "\n…[truncated]";
    }

    const { system, user } = buildPrompt({
      proficiency: data.proficiency,
      explanationType: data.explanation_type,
      language: data.language,
      filePath: pathForPrompt,
      fileContent: contentForPrompt,
    });

    const text = await callCloudProvider({
      provider: data.provider,
      apiKey,
      model: data.model,
      system,
      user,
    });

    // Persist cache only for full-file explanations.
    if (!hasSnippet) {
      await context.supabase.from("explanations").insert({
        owner_id: context.userId,
        file_id: file.id,
        proficiency: data.proficiency,
        explanation_type: data.explanation_type,
        language: data.language,
        provider: data.provider,
        model: data.model ?? null,
        content: text,
        file_sha256: file.sha256,
      });
    }


    return { content: text, provider: data.provider, model: data.model ?? null, cached: false };
  });

// Persist a locally-computed explanation (Ollama / LM Studio mode). The
// model call already happened in the browser; we only save the result so it
// shows up in the cache and is portable across devices.
export const saveLocalExplanation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      proficiency: Proficiency,
      explanation_type: ExplanationType,
      language: Language,
      content: z.string().min(1).max(50_000),
      kind: z.enum(["ollama", "lmstudio"]),
      model: z.string().trim().max(160).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, sha256")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");

    await context.supabase.from("explanations").insert({
      owner_id: context.userId,
      file_id: file.id,
      proficiency: data.proficiency,
      explanation_type: data.explanation_type,
      language: data.language,
      provider: data.kind, // "ollama" | "lmstudio"
      model: data.model ?? null,
      content: data.content,
      file_sha256: file.sha256,
    });
    return { ok: true };
  });
