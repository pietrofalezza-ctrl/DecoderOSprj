import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appendAnalysisActivity } from "@/lib/analysis-activities";
import {
  buildFileChatPrompt,
  chatSessionTitle,
  normalizeChatMessages,
  type PersistedChatMessage,
} from "@/lib/chat-history";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);
const LocalProvider = z.enum(["ollama", "lmstudio"]);

type ChatSessionRow = {
  id: string;
  title: string;
  provider: string | null;
  model: string | null;
  file_id: string | null;
  repository_id: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

function asPersistedMessages(
  messages: Array<{
    id: string;
    role: string;
    content: string;
    created_at: string;
  }>,
): PersistedChatMessage[] {
  return normalizeChatMessages(
    messages.map((message) => ({
      id: message.id,
      role: message.role === "assistant" || message.role === "system" ? message.role : "user",
      content: message.content,
      created_at: message.created_at,
    })),
  );
}

export const listFileChatSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { data: file, error: fileError } = await context.supabase
      .from("files")
      .select("id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fileError) throw fileError;
    if (!file) throw new Error("file_not_found");

    const { data: session, error: sessionError } = await context.supabase
      .from("analysis_chat_sessions")
      .select(
        "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
      )
      .eq("file_id", data.file_id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return { session: null, messages: [] };

    const { data: messages, error: messagesError } = await context.supabase
      .from("analysis_chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });
    if (messagesError) throw messagesError;

    return {
      session: session as ChatSessionRow,
      messages: asPersistedMessages(messages ?? []),
    };
  });

export const sendFileChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      session_id: z.string().uuid().optional(),
      provider: Provider,
      model: z.string().trim().max(120).optional(),
      message: z.string().trim().min(1).max(8_000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callCloudProvider } = await import("./ai-providers.server");
    const { decryptSecret } = await import("./crypto.server");

    await assertByokAckAccepted(context.supabase, context.userId);

    const { data: file, error: fileError } = await context.supabase
      .from("files")
      .select("id, path, language, storage_path, repository_id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fileError || !file) throw fileError ?? new Error("file_not_found");

    const { data: repository, error: repoError } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", file.repository_id)
      .maybeSingle();
    if (repoError) throw repoError;

    const { data: cred, error: credError } = await supabaseAdmin
      .from("user_ai_credentials")
      .select("encrypted_key")
      .eq("owner_id", context.userId)
      .eq("provider", data.provider)
      .maybeSingle();
    if (credError || !cred) throw new Error("no_credential_for_provider");
    const apiKey = decryptSecret(cred.encrypted_key);

    let session: ChatSessionRow | null = null;
    if (data.session_id) {
      const { data: existingSession, error: sessionError } = await context.supabase
        .from("analysis_chat_sessions")
        .select(
          "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
        )
        .eq("id", data.session_id)
        .eq("file_id", file.id)
        .maybeSingle();
      if (sessionError) throw sessionError;
      if (!existingSession) throw new Error("chat_session_not_found");
      session = existingSession as ChatSessionRow;
    } else {
      const { data: latestSession, error: latestSessionError } = await context.supabase
        .from("analysis_chat_sessions")
        .select(
          "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
        )
        .eq("file_id", file.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestSessionError) throw latestSessionError;
      session = latestSession as ChatSessionRow | null;
    }

    if (!session) {
      const { data: createdSession, error: createError } = await context.supabase
        .from("analysis_chat_sessions")
        .insert({
          owner_id: context.userId,
          project_id: repository?.project_id ?? null,
          repository_id: file.repository_id,
          file_id: file.id,
          title: chatSessionTitle(data.message),
          provider: data.provider,
          model: data.model ?? null,
        })
        .select(
          "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
        )
        .single();
      if (createError) throw createError;
      session = createdSession as ChatSessionRow;
    }

    const { data: priorRows, error: priorError } = await context.supabase
      .from("analysis_chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(100);
    if (priorError) throw priorError;
    const priorMessages = asPersistedMessages(priorRows ?? []);

    const { data: blob, error: downloadError } = await supabaseAdmin.storage
      .from("repositories")
      .download(file.storage_path);
    if (downloadError || !blob) throw downloadError ?? new Error("download_failed");

    const fileContent = await blob.text();
    const prompt = buildFileChatPrompt({
      filePath: file.path,
      language: file.language,
      fileContent,
      previousMessages: priorMessages,
      question: data.message,
    });

    const { data: userMessage, error: userMessageError } = await context.supabase
      .from("analysis_chat_messages")
      .insert({
        owner_id: context.userId,
        session_id: session.id,
        role: "user",
        content: data.message,
      })
      .select("id, role, content, created_at")
      .single();
    if (userMessageError) throw userMessageError;

    const assistantText = await callCloudProvider({
      provider: data.provider,
      apiKey,
      model: data.model,
      system: prompt.system,
      user: prompt.user,
    });

    const { data: assistantMessage, error: assistantMessageError } = await context.supabase
      .from("analysis_chat_messages")
      .insert({
        owner_id: context.userId,
        session_id: session.id,
        role: "assistant",
        content: assistantText || "(empty response)",
      })
      .select("id, role, content, created_at")
      .single();
    if (assistantMessageError) throw assistantMessageError;

    const { data: updatedSession, error: updateSessionError } = await context.supabase
      .from("analysis_chat_sessions")
      .update({
        provider: data.provider,
        model: data.model ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select(
        "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
      )
      .single();
    if (updateSessionError) throw updateSessionError;

    const messages = asPersistedMessages([...priorMessages, userMessage, assistantMessage]);

    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repository?.project_id ?? null,
      repositoryId: file.repository_id,
      fileId: file.id,
      activity_kind: "llm_explanation",
      status: "ok",
      provider: data.provider,
      model: data.model ?? null,
      query_text: data.message,
      result_summary: "file chat response",
      result_content: assistantText,
      result_metadata: {
        source: "file_chat",
        session_id: session.id,
        message_count: messages.length,
      },
    });

    return {
      session: updatedSession as ChatSessionRow,
      messages,
    };
  });

export const saveLocalFileChatTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file_id: z.string().uuid(),
      session_id: z.string().uuid().optional(),
      provider_kind: LocalProvider,
      model: z.string().trim().max(160).optional(),
      user_message: z.string().trim().min(1).max(8_000),
      assistant_message: z.string().trim().min(1).max(60_000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { data: file, error: fileError } = await context.supabase
      .from("files")
      .select("id, path, repository_id")
      .eq("id", data.file_id)
      .maybeSingle();
    if (fileError || !file) throw fileError ?? new Error("file_not_found");

    const { data: repository, error: repoError } = await context.supabase
      .from("repositories")
      .select("project_id")
      .eq("id", file.repository_id)
      .maybeSingle();
    if (repoError) throw repoError;

    let session: ChatSessionRow | null = null;
    if (data.session_id) {
      const { data: existingSession, error: sessionError } = await context.supabase
        .from("analysis_chat_sessions")
        .select(
          "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
        )
        .eq("id", data.session_id)
        .eq("file_id", file.id)
        .maybeSingle();
      if (sessionError) throw sessionError;
      if (!existingSession) throw new Error("chat_session_not_found");
      session = existingSession as ChatSessionRow;
    } else {
      const { data: latestSession, error: latestSessionError } = await context.supabase
        .from("analysis_chat_sessions")
        .select(
          "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
        )
        .eq("file_id", file.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestSessionError) throw latestSessionError;
      session = latestSession as ChatSessionRow | null;
    }

    if (!session) {
      const { data: createdSession, error: createError } = await context.supabase
        .from("analysis_chat_sessions")
        .insert({
          owner_id: context.userId,
          project_id: repository?.project_id ?? null,
          repository_id: file.repository_id,
          file_id: file.id,
          title: chatSessionTitle(data.user_message),
          provider: data.provider_kind,
          model: data.model ?? null,
        })
        .select(
          "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
        )
        .single();
      if (createError) throw createError;
      session = createdSession as ChatSessionRow;
    }

    const { error: userMessageError } = await context.supabase
      .from("analysis_chat_messages")
      .insert({
        owner_id: context.userId,
        session_id: session.id,
        role: "user",
        content: data.user_message,
      });
    if (userMessageError) throw userMessageError;

    const { error: assistantMessageError } = await context.supabase
      .from("analysis_chat_messages")
      .insert({
        owner_id: context.userId,
        session_id: session.id,
        role: "assistant",
        content: data.assistant_message,
      });
    if (assistantMessageError) throw assistantMessageError;

    const { data: updatedSession, error: updateSessionError } = await context.supabase
      .from("analysis_chat_sessions")
      .update({
        provider: data.provider_kind,
        model: data.model ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select(
        "id, title, provider, model, file_id, repository_id, project_id, created_at, updated_at",
      )
      .single();
    if (updateSessionError) throw updateSessionError;

    const { data: messages, error: messagesError } = await context.supabase
      .from("analysis_chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });
    if (messagesError) throw messagesError;

    const normalizedMessages = asPersistedMessages(messages ?? []);

    await appendAnalysisActivity({
      supabase: context.supabase,
      ownerId: context.userId,
      projectId: repository?.project_id ?? null,
      repositoryId: file.repository_id,
      fileId: file.id,
      activity_kind: "llm_explanation",
      status: "ok",
      provider: data.provider_kind,
      model: data.model ?? null,
      query_text: data.user_message,
      result_summary: "local file chat response",
      result_content: data.assistant_message,
      result_metadata: {
        source: "file_chat",
        session_id: session.id,
        message_count: normalizedMessages.length,
        local: true,
      },
    });

    return {
      session: updatedSession as ChatSessionRow,
      messages: normalizedMessages,
    };
  });
