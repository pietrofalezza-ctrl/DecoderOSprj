import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);
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

    // Cache lookup
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

    // Load credential
    const { data: cred, error: cErr } = await context.supabase
      .from("user_ai_credentials")
      .select("encrypted_key")
      .eq("provider", data.provider)
      .maybeSingle();
    if (cErr || !cred) throw new Error("no_credential_for_provider");

    const apiKey = decryptSecret(cred.encrypted_key);

    // Load file content via admin client (file is RLS-validated above)
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
    let content = await blob.text();
    if (content.length > 60_000) content = content.slice(0, 60_000) + "\n…[truncated]";

    const { system, user } = buildPrompt({
      proficiency: data.proficiency,
      explanationType: data.explanation_type,
      language: data.language,
      filePath: file.path,
      fileContent: content,
    });

    const text = await callCloudProvider({
      provider: data.provider,
      apiKey,
      model: data.model,
      system,
      user,
    });

    // Persist cache
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
