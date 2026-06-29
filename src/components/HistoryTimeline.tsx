import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Bot, FileBadge2, FileCode, Filter, History, MessageSquare, ScanSearch, ShieldAlert, Sparkles, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type HistoryActivity = {
  id: string;
  created_at: string;
  activity_kind: string;
  status: string;
  provider: string | null;
  model: string | null;
  language: string | null;
  query_text: string | null;
  result_summary: string | null;
  result_content: string | null;
  result_metadata: unknown;
  file_id: string | null;
  repository_id: string | null;
  project_id: string | null;
};

const KIND_ICON: Record<string, typeof Sparkles> = {
  llm_explanation: MessageSquare,
  llm_quality_analysis: ScanSearch,
  llm_security_analysis: ShieldAlert,
  llm_ai_origin_analysis: Bot,
  llm_folder_analysis: FileCode,
  llm_fix_generation: Wrench,
  static_scan: FileBadge2,
  static_verbalize: Sparkles,
  folder_chat: MessageSquare,
};

const KIND_LABEL: Record<string, string> = {
  llm_explanation: "Explanation",
  llm_quality_analysis: "Quality",
  llm_security_analysis: "Security",
  llm_ai_origin_analysis: "AI origin",
  llm_folder_analysis: "Folder analysis",
  llm_fix_generation: "Fix",
  static_scan: "Static scan",
  static_verbalize: "Static (verbalized)",
  folder_chat: "Folder chat",
};

export const HISTORY_KIND_OPTIONS = Object.keys(KIND_LABEL);

function fmtDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : locale === "it" ? "it-IT" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function metadataPath(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const folder = (metadata as Record<string, unknown>).folder_path;
  if (typeof folder === "string" && folder.length > 0) return `${folder}/`;
  return null;
}

export function HistoryTimeline({
  activities,
  loading,
  emptyHint,
  nextCursor,
  onLoadMore,
  loadingMore,
  kind,
  onKindChange,
  buildFileHref,
}: {
  activities: HistoryActivity[];
  loading?: boolean;
  emptyHint: string;
  nextCursor?: string | null;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  kind?: string;
  onKindChange?: (kind: string) => void;
  buildFileHref?: (a: HistoryActivity) => { to: string; params?: Record<string, string>; search?: Record<string, string> } | null;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <div className="flex h-full flex-col">
      {onKindChange && (
        <div className="flex items-center gap-2 border-b border-border bg-sidebar/40 px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] uppercase text-muted-foreground">
            {t("history.filterKind")}
          </span>
          <Select value={kind ?? "all"} onValueChange={(v) => onKindChange(v === "all" ? "" : v)}>
            <SelectTrigger className="h-7 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("history.allKinds")}</SelectItem>
              {HISTORY_KIND_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" /> {t("common.loading", "Loading…")}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <History className="h-6 w-6 opacity-50" />
            <p>{emptyHint}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((a) => {
              const Icon = KIND_ICON[a.activity_kind] ?? Sparkles;
              const link = buildFileHref ? buildFileHref(a) : null;
              const folder = metadataPath(a.result_metadata);
              const preview = (a.result_content ?? "").slice(0, 220).replace(/\s+/g, " ").trim();
              const card = (
                <div className="space-y-1.5 p-3 hover:bg-muted/30">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">
                        {KIND_LABEL[a.activity_kind] ?? a.activity_kind}
                      </span>
                      {a.provider && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                          {a.provider}
                          {a.model ? `:${a.model}` : ""}
                        </span>
                      )}
                    </span>
                    <span>{fmtDate(a.created_at, locale)}</span>
                  </div>
                  {folder && (
                    <p className="font-mono text-[11px] text-muted-foreground">{folder}</p>
                  )}
                  {a.query_text && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      &gt; {a.query_text}
                    </p>
                  )}
                  {preview && <p className="line-clamp-2 text-sm">{preview}</p>}
                </div>
              );
              if (link) {
                return (
                  <li key={a.id}>
                    <Link
                      to={link.to}
                      params={link.params as never}
                      search={link.search as never}
                      className="block"
                    >
                      {card}
                    </Link>
                  </li>
                );
              }
              return <li key={a.id}>{card}</li>;
            })}
          </ul>
        )}
        {nextCursor && onLoadMore && (
          <div className="flex justify-center p-3">
            <Button size="sm" variant="outline" onClick={onLoadMore} disabled={loadingMore}>
              {loadingMore ? t("common.loading", "Loading…") : t("history.loadMore")}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
