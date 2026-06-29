import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";
import {
  normalizeChatMessages,
  type PersistedChatMessage,
} from "@/lib/chat-history";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);
const LocalProvider = z.enum(["ollama", "lmstudio"]);
const Proficiency = z.enum([
  "nontech",
  "junior",
  "intermediate",
  "senior",
  "architect",
  "cto",
]);
const ExplanationType = z.enum(["human", "technical"]);
const UiLanguage = z.enum(["en", "it", "zh"]);

const MAX_FILES = 20;
const MAX_EXCERPT = 4_000;

type FolderSessionRow = {
  id: string;
  title: string;
  provider: string | null;
  model: string | null;
  repository_id: string;
  project_id: string | null;
  folder_path: string;
  created_at: string;
  updated_at: string;
};

function asPersistedMessages(
  messages: Array<{ id: string; role: string; content: string; created_at: string }>,
): PersistedChatMessage[] {
  return normalizeChatMessages(
    messages.map((m) => ({
      id: m.id,
      role: m.role === "assistant" || m.role === "system" ? m.role : "user",
      content: m.content,
      created_at: m.created_at,
    })),
  );
}

export const listFolderChatSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      folder_path: z.string().min(1).max(1000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { data: session, error: sessionError } = await context.supabase
      .from("folder_chat_sessions")
      .select(
        "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
      )
      .eq("repository_id", data.repo_id)
      .eq("folder_path", data.folder_path)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return { session: null, messages: [] };

    const { data: messages, error: messagesError } = await context.supabase
      .from("analysis_chat_messages")
      .select("id, role, content, created_at")
      .eq("folder_session_id", session.id)
      .order("created_at", { ascending: true });
    if (messagesError) throw messagesError;

    return {
      session: session as FolderSessionRow,
      messages: asPersistedMessages(messages ?? []),
    };
  });

async function loadFolderContext(
  supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<
    import("@/integrations/supabase/types").Database
  >,
  repoId: string,
  folderPath: string,
) {
  const prefix = folderPath.replace(/\/+$/, "") + "/";
  const { data: files, error } = await supabaseAdmin
    .from("files")
    .select("id, path, language, storage_path, size_bytes")
    .eq("repository_id", repoId)
    .like("path", `${prefix}%`)
    .order("path");
  if (error) throw error;

  // pick up to MAX_FILES smallest first to stay under prompt budget
  const ordered = (files ?? [])
    .slice()
    .sort((a, b) => (a.size_bytes ?? 0) - (b.size_bytes ?? 0))
    .slice(0, MAX_FILES);

  const snippets = await Promise.all(
    ordered.map(async (f) => {
      try {
        const { data: blob, error: dErr } = await supabaseAdmin.storage
          .from("repositories")
          .download(f.storage_path);
        if (dErr || !blob) return null;
        const text = await blob.text();
        return {
          path: f.path,
          language: f.language,
          excerpt: text.slice(0, MAX_EXCERPT),
        };
      } catch {
        return null;
      }
    }),
  );

  return snippets.filter((s): s is { path: string; language: string | null; excerpt: string } => !!s);
}

export const sendFolderChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      folder_path: z.string().min(1).max(1000),
      session_id: z.string().uuid().optional(),
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      message: z.string().trim().min(1).max(8_000),
      proficiency: Proficiency.default("intermediate"),
      explanation_type: ExplanationType.default("human"),
      ui_language: UiLanguage.default("en"),
    }),
  )
  .handler(async ({ context, data }) => {
    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { decryptSecret } = await import("./crypto.server");
    const { buildFolderChatPrompt, folderChatSessionTitle } = await import("./folder-chat-prompt");

    await assertByokAckAccepted(context.supabase, context.userId);

    const { data: repo, error: repoError } = await context.supabase
      .from("repositories")
      .select("id, project_id")
      .eq("id", data.repo_id)
      .maybeSingle();
    if (repoError || !repo) throw repoError ?? new Error("repo_not_found");

    const { data: cred, error: credError } = await supabaseAdmin
      .from("user_ai_credentials")
      .select("encrypted_key")
      .eq("owner_id", context.userId)
      .eq("provider", data.provider)
      .maybeSingle();
    if (credError || !cred) throw new Error("no_credential_for_provider");
    const apiKey = decryptSecret(cred.encrypted_key);

    // session
    let session: FolderSessionRow | null = null;
    if (data.session_id) {
      const { data: existing, error } = await context.supabase
        .from("folder_chat_sessions")
        .select(
          "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
        )
        .eq("id", data.session_id)
        .eq("repository_id", repo.id)
        .maybeSingle();
      if (error) throw error;
      if (!existing) throw new Error("folder_chat_session_not_found");
      session = existing as FolderSessionRow;
    } else {
      const { data: latest } = await context.supabase
        .from("folder_chat_sessions")
        .select(
          "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
        )
        .eq("repository_id", repo.id)
        .eq("folder_path", data.folder_path)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      session = (latest as FolderSessionRow) ?? null;
    }

    if (!session) {
      const { data: created, error } = await context.supabase
        .from("folder_chat_sessions")
        .insert({
          owner_id: context.userId,
          project_id: repo.project_id ?? null,
          repository_id: repo.id,
          folder_path: data.folder_path,
          title: folderChatSessionTitle(data.message),
          provider: data.provider,
          model: data.model ?? null,
        })
        .select(
          "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
        )
        .single();
      if (error) throw error;
      session = created as FolderSessionRow;
    }

    // prior messages
    const { data: priorRows, error: priorErr } = await context.supabase
      .from("analysis_chat_messages")
      .select("id, role, content, created_at")
      .eq("folder_session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(100);
    if (priorErr) throw priorErr;
    const prior = asPersistedMessages(priorRows ?? []);

    const fileSnippets = await loadFolderContext(supabaseAdmin, repo.id, data.folder_path);

    const prompt = buildFolderChatPrompt({
      folderPath: data.folder_path,
      files: fileSnippets,
      previousMessages: prior,
      question: data.message,
      proficiency: data.proficiency,
      explanationType: data.explanation_type,
      uiLanguage: data.ui_language,
    });

    const { data: userMsg, error: userErr } = await context.supabase
      .from("analysis_chat_messages")
      .insert({
        owner_id: context.userId,
        folder_session_id: session.id,
        role: "user",
        content: data.message,
      })
      .select("id, role, content, created_at")
      .single();
    if (userErr) throw userErr;

    const assistantText = await callCloudProvider({
      provider: data.provider,
      apiKey,
      model: data.model,
      system: prompt.system,
      user: prompt.user,
    });

    const { data: asstMsg, error: asstErr } = await context.supabase
      .from("analysis_chat_messages")
      .insert({
        owner_id: context.userId,
        folder_session_id: session.id,
        role: "assistant",
        content: assistantText || "(empty response)",
      })
      .select("id, role, content, created_at")
      .single();
    if (asstErr) throw asstErr;

    const { data: updated, error: updErr } = await context.supabase
      .from("folder_chat_sessions")
      .update({
        provider: data.provider,
        model: data.model ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select(
        "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
      )
      .single();
    if (updErr) throw updErr;

    const messages = asPersistedMessages([...prior, userMsg, asstMsg]);

    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repo.project_id ?? null,
      repositoryId: repo.id,
      activity_kind: "folder_chat",
      status: "ok",
      provider: data.provider,
      model: data.model ?? null,
      language: data.ui_language,
      query_text: data.message,
      result_summary: `folder chat: ${data.folder_path}`,
      result_content: assistantText,
      result_metadata: {
        source: "folder_chat",
        session_id: session.id,
        folder_path: data.folder_path,
        proficiency: data.proficiency,
        explanation_type: data.explanation_type,
        files_in_context: fileSnippets.length,
      },
    });

    return { session: updated as FolderSessionRow, messages };
  });

export const saveLocalFolderChatTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      repo_id: z.string().uuid(),
      folder_path: z.string().min(1).max(1000),
      session_id: z.string().uuid().optional(),
      provider_kind: LocalProvider,
      model: z.string().trim().max(160).optional(),
      user_message: z.string().trim().min(1).max(8_000),
      assistant_message: z.string().trim().min(1).max(60_000),
      proficiency: Proficiency.default("intermediate"),
      explanation_type: ExplanationType.default("human"),
      ui_language: UiLanguage.default("en"),
    }),
  )
  .handler(async ({ context, data }) => {
    const { folderChatSessionTitle } = await import("./folder-chat-prompt");
    const { data: repo, error: repoError } = await context.supabase
      .from("repositories")
      .select("id, project_id")
      .eq("id", data.repo_id)
      .maybeSingle();
    if (repoError || !repo) throw repoError ?? new Error("repo_not_found");

    let session: FolderSessionRow | null = null;
    if (data.session_id) {
      const { data: existing, error } = await context.supabase
        .from("folder_chat_sessions")
        .select(
          "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
        )
        .eq("id", data.session_id)
        .eq("repository_id", repo.id)
        .maybeSingle();
      if (error) throw error;
      session = (existing as FolderSessionRow) ?? null;
    } else {
      const { data: latest } = await context.supabase
        .from("folder_chat_sessions")
        .select(
          "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
        )
        .eq("repository_id", repo.id)
        .eq("folder_path", data.folder_path)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      session = (latest as FolderSessionRow) ?? null;
    }

    if (!session) {
      const { data: created, error } = await context.supabase
        .from("folder_chat_sessions")
        .insert({
          owner_id: context.userId,
          project_id: repo.project_id ?? null,
          repository_id: repo.id,
          folder_path: data.folder_path,
          title: folderChatSessionTitle(data.user_message),
          provider: data.provider_kind,
          model: data.model ?? null,
        })
        .select(
          "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
        )
        .single();
      if (error) throw error;
      session = created as FolderSessionRow;
    }

    const inserts = [
      { role: "user" as const, content: data.user_message },
      { role: "assistant" as const, content: data.assistant_message },
    ];
    for (const m of inserts) {
      const { error } = await context.supabase
        .from("analysis_chat_messages")
        .insert({
          owner_id: context.userId,
          folder_session_id: session.id,
          role: m.role,
          content: m.content,
        });
      if (error) throw error;
    }

    const { data: updated, error: updErr } = await context.supabase
      .from("folder_chat_sessions")
      .update({
        provider: data.provider_kind,
        model: data.model ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select(
        "id, title, provider, model, repository_id, project_id, folder_path, created_at, updated_at",
      )
      .single();
    if (updErr) throw updErr;

    const { data: messages, error: mErr } = await context.supabase
      .from("analysis_chat_messages")
      .select("id, role, content, created_at")
      .eq("folder_session_id", session.id)
      .order("created_at", { ascending: true });
    if (mErr) throw mErr;

    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repo.project_id ?? null,
      repositoryId: repo.id,
      activity_kind: "folder_chat",
      status: "ok",
      provider: data.provider_kind,
      model: data.model ?? null,
      language: data.ui_language,
      query_text: data.user_message,
      result_summary: `folder chat (local): ${data.folder_path}`,
      result_content: data.assistant_message,
      result_metadata: {
        source: "folder_chat",
        session_id: session.id,
        folder_path: data.folder_path,
        local: true,
        proficiency: data.proficiency,
        explanation_type: data.explanation_type,
      },
    });

    return {
      session: updated as FolderSessionRow,
      messages: asPersistedMessages(messages ?? []),
    };
  });
