import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Provider = z.enum(["lovable", "openai", "anthropic", "gemini", "openrouter"]);
const Language = z.enum(["en", "it", "zh"]);
const Kind = z.enum(["smells", "deadcode", "bugs", "security", "ai_origin"]);

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
    const proficiency = "intermediate";

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

// File extensions considered "real source code" for whole-repo AI-origin scan.
// Markdown/JSON/config aren't useful signals.
const CODE_EXTS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "rb", "go", "rs", "java", "kt", "swift",
  "c", "h", "cpp", "hpp", "cc", "cs", "php",
  "vue", "svelte", "astro", "lua", "dart", "scala",
]);

const MAX_FILES_PER_SCAN = 30;

export const analyzeRepoAiOrigin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      language: Language,
    }),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptSecret } = await import("./crypto.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { buildAnalysisPrompt } = await import("./analysis-prompt");
    const { parseAiOriginScore, weightedRepoScore, bucketize } = await import("./ai-origin");

    const { data: files, error: fErr } = await context.supabase
      .from("files")
      .select("id, path, storage_path, sha256, size_bytes, language")
      .eq("repository_id", data.repo_id)
      .order("size_bytes", { ascending: false });
    if (fErr) throw fErr;

    const allFiles = files ?? [];
    const codeFiles = allFiles.filter((f) => {
      const ext = (f.path.split(".").pop() ?? "").toLowerCase();
      return CODE_EXTS.has(ext);
    });
    const totalCodeFiles = codeFiles.length;
    const sampled = codeFiles.slice(0, MAX_FILES_PER_SCAN);
    const unsampled = Math.max(0, totalCodeFiles - sampled.length);

    // Resolve API key
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

    type PerFile = {
      file_id: string;
      path: string;
      size_bytes: number;
      score: number;
      summary: string;
      cached: boolean;
    };
    const results: PerFile[] = [];
    const errors: Array<{ path: string; message: string }> = [];

    const explanationType = "analysis:ai_origin";
    const proficiency = "intermediate";

    for (const file of sampled) {
      try {
        // cache lookup
        const { data: cached } = await context.supabase
          .from("explanations")
          .select("content")
          .eq("file_id", file.id)
          .eq("explanation_type", explanationType)
          .eq("proficiency", proficiency)
          .eq("language", data.language)
          .eq("file_sha256", file.sha256)
          .maybeSingle();

        let text: string;
        let wasCached = false;
        if (cached) {
          text = cached.content;
          wasCached = true;
        } else {
          const { data: blob, error: dlErr } = await supabaseAdmin.storage
            .from("repositories")
            .download(file.storage_path);
          if (dlErr || !blob) throw dlErr ?? new Error("download_failed");
          let content = await blob.text();
          if (content.length > 30_000) content = content.slice(0, 30_000) + "\n…[truncated]";

          const { system, user } = buildAnalysisPrompt({
            kind: "ai_origin",
            language: data.language,
            filePath: file.path,
            fileContent: content,
          });
          text = await callCloudProvider({
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
        }

        const score = parseAiOriginScore(text);
        if (score === null) {
          errors.push({ path: file.path, message: "unparseable_score" });
          continue;
        }
        // first non-SCORE/VERDICT line as summary
        const summary =
          text
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l && !/^(SCORE|VERDICT)\s*[:=]/i.test(l) && !l.startsWith("#")) ?? "";
        results.push({
          file_id: file.id,
          path: file.path,
          size_bytes: file.size_bytes ?? 0,
          score,
          summary: summary.slice(0, 240),
          cached: wasCached,
        });
      } catch (e: any) {
        errors.push({ path: file.path, message: e?.message ?? "error" });
      }
    }

    const repoScore = weightedRepoScore(
      results.map((r) => ({ score: r.score, weight: Math.max(1, r.size_bytes) })),
    );
    const bucket = bucketize(repoScore);
    const distribution = {
      human: results.filter((r) => r.score < 30).length,
      mixed: results.filter((r) => r.score >= 30 && r.score < 70).length,
      ai: results.filter((r) => r.score >= 70).length,
    };

    return {
      repo_score: repoScore,
      bucket,
      distribution,
      per_file: results.sort((a, b) => b.score - a.score),
      total_code_files: totalCodeFiles,
      sampled_count: results.length,
      unsampled_count: unsampled,
      errors,
    };
  });
