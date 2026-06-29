import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MessageSquare, SendHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  listFolderChatSession,
  sendFolderChatMessage,
} from "@/lib/folder-chat.functions";
import type { PersistedChatMessage } from "@/lib/chat-history";
import { getErrorMessage } from "@/lib/errors";
import type { Proficiency } from "@/lib/prompt";

type CloudProvider = "openai" | "anthropic" | "gemini" | "openrouter";

export function FolderChatPanel({
  repoId,
  folderPath,
  providerValue,
  proficiency,
  explanationType,
  uiLanguage,
}: {
  repoId: string;
  folderPath: string;
  providerValue: string;
  proficiency: Proficiency;
  explanationType: "human" | "technical";
  uiLanguage: "en" | "it" | "zh";
}) {
  const { t } = useTranslation();
  const listFn = useServerFn(listFolderChatSession);
  const sendFn = useServerFn(sendFolderChatMessage);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCloud = providerValue.startsWith("cloud:");
  const provider: CloudProvider | null = isCloud
    ? (providerValue.slice(6) as CloudProvider)
    : null;

  const sessionQ = useQuery({
    queryKey: ["folder-chat-session", repoId, folderPath],
    queryFn: () => listFn({ data: { repo_id: repoId, folder_path: folderPath } }),
  });

  const messages: PersistedChatMessage[] = useMemo(
    () => sessionQ.data?.messages ?? [],
    [sessionQ.data?.messages],
  );
  const session = sessionQ.data?.session ?? null;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const sendMut = useMutation({
    mutationFn: async () => {
      if (!provider) throw new Error(t("workspace.folderChat.needsProvider"));
      if (!draft.trim()) throw new Error("empty");
      return sendFn({
        data: {
          repo_id: repoId,
          folder_path: folderPath,
          session_id: session?.id ?? undefined,
          provider,
          message: draft.trim(),
          proficiency,
          explanation_type: explanationType,
          ui_language: uiLanguage,
        },
      });
    },
    onSuccess: (result) => {
      sessionQ.refetch();
      setDraft("");
      // optimistic-ish: directly update cache
      if (result) {
        // noop: refetch will update
      }
    },
    onError: (e) => toast.error(getErrorMessage(e, t("errors.generic"))),
  });

  const canSend = !!provider && !!draft.trim() && !sendMut.isPending;

  return (
    <div className="flex h-full flex-col">
      {!provider && (
        <p className="m-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-300">
          {t("workspace.folderChat.needsProvider")}
        </p>
      )}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col gap-3 p-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-xs text-muted-foreground">
              <MessageSquare className="h-5 w-5 opacity-60" />
              <p>{t("workspace.folderChat.emptyHint")}</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-8 rounded-lg bg-primary/10 px-3 py-2 text-sm"
                  : "mr-8 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              }
            >
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
                {m.content}
              </pre>
            </div>
          ))}
          {sendMut.isPending && (
            <div className="mr-8 inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {t("workspace.folderChat.thinking")}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-2">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("workspace.folderChat.placeholder")}
            className="min-h-[60px] text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (canSend) sendMut.mutate();
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => sendMut.mutate()}
            disabled={!canSend}
            className="h-10 shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {t("workspace.folderChat.hint")}
        </p>
      </div>
    </div>
  );
}
