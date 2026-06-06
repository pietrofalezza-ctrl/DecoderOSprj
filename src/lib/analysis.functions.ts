import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Provider = z.enum(["lovable", "openai", "anthropic", "gemini", "openrouter"]);
const Language = z.enum(["en", "it", "zh"]);
const Kind = z.enum(["smells", "deadcode", "bugs", "security"]);

export const runAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      kind: Kind,
      language: Language,
    }),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptSecret } = await import("./crypto.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildAnalysisPrompt } = await import("./analysis-prompt");

    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, storage_path, sha256")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");

    const explanationType = `analysis:${data.kind}`;
    const proficiency = "intermediate"; // schema requires non-null

    const { data: cached } = await context.supabase
      .from("explanations")
      .select("content, provider, model")
      .eq("file_id", file.id)
      .eq("explanation_type", explanationType)
      .eq("proficiency", proficiency)
      .eq("language", data.language)
      .eq("file_sha256", file.sha256)
      .maybeSingle();
    if (cached) return { content: cached.content, cached: true };

    let apiKey: string;
    if (data.provider === "lovable") {
      const k = process.env.LOVABLE_API_KEY;
      if (!k) throw new Error("lovable_ai_not_configured");
      apiKey = k;
    } else {
      const { data: cred, error: cErr } = await context.supabase
        .from("user_ai_credentials")
        .select("encrypted_key")
        .eq("provider", data.provider)
        .maybeSingle();
      if (cErr || !cred) throw new Error("no_credential_for_provider");
      apiKey = decryptSecret(cred.encrypted_key);
    }

    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("repositories")
      .download(file.storage_path);
    if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
    let content = await blob.text();
    if (content.length > 60_000) content = content.slice(0, 60_000) + "\n…[truncated]";

    const { system, user } = buildAnalysisPrompt({
      kind: data.kind,
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

    await context.supabase.from("explanations").insert({
      owner_id: context.userId,
      file_id: file.id,
      proficiency,
      explanation_type: explanationType,
      language: data.language,
      provider: data.provider,
      model: data.model ?? null,
      content: text,
      file_sha256: file.sha256,
    });
    return { content: text, cached: false };
  });

export const saveLocalAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      kind: Kind,
      language: Language,
      content: z.string().min(1).max(50_000),
      provider_kind: z.enum(["ollama", "lmstudio"]),
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
      proficiency: "intermediate",
      explanation_type: `analysis:${data.kind}`,
      language: data.language,
      provider: data.provider_kind,
      model: data.model ?? null,
      content: data.content,
      file_sha256: file.sha256,
    });
    return { ok: true };
  });
