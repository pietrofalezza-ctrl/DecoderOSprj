import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";
import { buildStaticVerbalizePrompt } from "@/lib/static-verbalize-prompt";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);
const Language = z.enum(["en", "it", "zh"]);
const Scanner = z.enum(["source", "malware"]);
const LocalKind = z.enum(["ollama", "lmstudio"]);

function explanationTypeFor(scanner: "source" | "malware"): string {
  return scanner === "source" ? "static_verbalize:source" : "static_verbalize:malware";
}

function activityKindFor(): "static_verbalize" {
  return "static_verbalize";
}

export const verbalizeStaticReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      scanner: Scanner,
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      language: Language,
      report_markdown: z.string().min(10).max(40_000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptSecret } = await import("./crypto.server");
    const { callCloudProvider } = await import("./ai-providers.server");

    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, sha256, repository_id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");

    const { data: repository, error: repoErr } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", file.repository_id)
      .maybeSingle();
    if (repoErr) throw repoErr;

    const explanation_type = explanationTypeFor(data.scanner);
    const proficiency = "intermediate";

    const { data: cached } = await context.supabase
      .from("explanations")
      .select("content, provider, model")
      .eq("file_id", file.id)
      .eq("explanation_type", explanation_type)
      .eq("proficiency", proficiency)
      .eq("language", data.language)
      .eq("file_sha256", file.sha256)
      .maybeSingle();
    if (cached) {
      return { content: cached.content, cached: true };
    }

    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    await assertByokAckAccepted(context.supabase, context.userId);

    let apiKey: string;
    {
      const { data: cred, error: cErr } = await supabaseAdmin
        .from("user_ai_credentials")
        .select("encrypted_key")
        .eq("owner_id", context.userId)
        .eq("provider", data.provider)
        .maybeSingle();
      if (cErr || !cred) throw new Error("no_credential_for_provider");
      apiKey = decryptSecret(cred.encrypted_key);
    }

    const { system, user } = buildStaticVerbalizePrompt({
      scanner: data.scanner,
      language: data.language,
      filePath: file.path,
      reportMarkdown: data.report_markdown,
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
      explanation_type,
      language: data.language,
      provider: data.provider,
      model: data.model ?? null,
      content: text,
      file_sha256: file.sha256,
    });
    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repository?.project_id ?? null,
      fileId: file.id,
      repositoryId: file.repository_id,
      activity_kind: activityKindFor(),
      status: "ok",
      provider: data.provider,
      model: data.model ?? null,
      language: data.language,
      query_text: file.path,
      result_summary: `static_verbalize:${data.scanner}`,
      result_content: text,
      result_metadata: { cached: false, scanner: data.scanner },
    });

    return { content: text, cached: false };
  });

export const saveLocalStaticVerbalization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      scanner: Scanner,
      language: Language,
      content: z.string().min(1).max(50_000),
      provider_kind: LocalKind,
      model: z.string().trim().max(160).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { data: file, error: fErr } = await context.supabase
      .from("files")
      .select("id, sha256, path, repository_id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fErr || !file) throw fErr ?? new Error("file_not_found");
    const { data: repository } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", file.repository_id)
      .maybeSingle();

    await context.supabase.from("explanations").insert({
      owner_id: context.userId,
      file_id: file.id,
      proficiency: "intermediate",
      explanation_type: explanationTypeFor(data.scanner),
      language: data.language,
      provider: data.provider_kind,
      model: data.model ?? null,
      content: data.content,
      file_sha256: file.sha256,
    });
    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repository?.project_id ?? null,
      fileId: file.id,
      repositoryId: file.repository_id,
      activity_kind: activityKindFor(),
      status: "ok",
      provider: data.provider_kind,
      model: data.model ?? null,
      language: data.language,
      query_text: file.path,
      result_summary: `static_verbalize:${data.scanner} (local)`,
      result_content: data.content,
      result_metadata: { cached: false, scanner: data.scanner, local: true },
    });

    return { ok: true as const };
  });
