import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowRight,
  BugPlay,
  CheckCircle2,
  FileCode,
  Folder,
  Play,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DiffViewer, extractDiffBlock, extractNotes } from "./DiffViewer";
import { FindingsList } from "./FindingsList";

import { runAnalysis } from "@/lib/analysis.functions";
import {
  aggregateFolderAnalysis,
  listFolderFiles,
} from "@/lib/folder-analysis.functions";
import { proposeFolderFix } from "@/lib/fix.functions";
import { extractFindings, stripFindingsBlock, type Finding } from "@/lib/findings";
import type { AnalysisKind } from "@/lib/analysis-prompt";

type CloudProvider = "lovable" | "openai" | "anthropic" | "gemini" | "openrouter";
type FolderKind = Exclude<AnalysisKind, "ai_origin">;

type PerFileEntry = {
  file_id: string;
  path: string;
  status: "pending" | "running" | "ok" | "error";
  content?: string;
  findings?: Finding[];
  error?: string;
};

const MAX_FILES = 20;

export function FolderAnalysisPanel({
  repoId,
  folderPath,
  providerValue,
  language,
  onClose,
  onOpenFile,
}: {
  repoId: string;
  folderPath: string;
  providerValue: string;
  language: "en" | "it" | "zh";
  onClose: () => void;
  onOpenFile: (fileId: string) => void;
}) {
  const { t } = useTranslation();
  const list = useServerFn(listFolderFiles);
  const analyze = useServerFn(runAnalysis);
  const aggregate = useServerFn(aggregateFolderAnalysis);
  const fix = useServerFn(proposeFolderFix);

  const [kind, setKind] = useState<FolderKind>("smells");
  const [entries, setEntries] = useState<PerFileEntry[]>([]);
  const [aggText, setAggText] = useState<string>("");
  const [diffText, setDiffText] = useState<string>("");
  const [diffNotes, setDiffNotes] = useState<string>("");
  const [tab, setTab] = useState<"summary" | "files" | "fix">("summary");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const filesQ = useQuery({
    queryKey: ["folder-files", repoId, folderPath],
    queryFn: () => list({ data: { repo_id: repoId, folder_path: folderPath } }),
  });

  // Reset state when context changes
  useEffect(() => {
    setEntries([]);
    setAggText("");
    setDiffText("");
    setDiffNotes("");
    setTab("summary");
    setProgress({ done: 0, total: 0 });
  }, [folderPath, kind, providerValue]);

  const isCloud = providerValue.startsWith("cloud:");
  const provider = isCloud ? (providerValue.slice(6) as CloudProvider) : null;
  const canRun = !!provider && (filesQ.data?.files.length ?? 0) > 0;

  const filesPlanned = useMemo(() => {
    const all = filesQ.data?.files ?? [];
    return all.slice(0, MAX_FILES);
  }, [filesQ.data]);

  const aggregateMut = useMutation({
    mutationFn: async (oks: PerFileEntry[]) => {
      if (!provider || oks.length === 0) return "";
      const r = await aggregate({
        data: {
          folder_path: folderPath,
          kind,
          language,
          provider,
          items: oks.map((e) => ({
            path: e.path,
            excerpt: stripFindingsBlock(e.content ?? "").slice(0, 6000),
          })),
        },
      });
      return r.content;
    },
    onSuccess: (text) => setAggText(text),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const fixMut = useMutation({
    mutationFn: async () => {
      if (!provider) throw new Error("needs_cloud");
      const oks = entries.filter(
        (e) => e.status === "ok" && (e.findings?.length ?? 0) > 0,
      );
      if (oks.length === 0) throw new Error(t("workspace.fix.noFindings"));
      const r = await fix({
        data: {
          kind,
          language,
          provider,
          items: oks.slice(0, 10).map((e) => ({
            file_id: e.file_id,
            analysis_markdown: stripFindingsBlock(e.content ?? "").slice(0, 12_000),
          })),
        },
      });
      return r;
    },
    onSuccess: (r) => {
      setDiffText(r.combined_diff);
      setDiffNotes(r.notes);
      setTab("fix");
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  async function runBatch() {
    if (!provider) {
      toast.error(t("workspace.folder.needsCloud"));
      return;
    }
    const planned = filesPlanned;
    if (!planned.length) return;
    setRunning(true);
    const initial: PerFileEntry[] = planned.map((f) => ({
      file_id: f.id,
      path: f.path,
      status: "pending",
    }));
    setEntries(initial);
    setProgress({ done: 0, total: planned.length });

    const collected: PerFileEntry[] = [];
    for (let i = 0; i < planned.length; i++) {
      const f = planned[i];
      setEntries((prev) =>
        prev.map((e) => (e.file_id === f.id ? { ...e, status: "running" } : e)),
      );
      try {
        const r = await analyze({
          data: { file_id: f.id, provider, kind, language },
        });
        const findings = extractFindings(r.content);
        const entry: PerFileEntry = {
          file_id: f.id,
          path: f.path,
          status: "ok",
          content: r.content,
          findings,
        };
        collected.push(entry);
        setEntries((prev) => prev.map((e) => (e.file_id === f.id ? entry : e)));
      } catch (e: any) {
        const entry: PerFileEntry = {
          file_id: f.id,
          path: f.path,
          status: "error",
          error: e?.message ?? "error",
        };
        setEntries((prev) => prev.map((x) => (x.file_id === f.id ? entry : x)));
      }
      setProgress({ done: i + 1, total: planned.length });
    }
    setRunning(false);

    const oks = collected.filter((e) => e.status === "ok");
    if (oks.length > 0) {
      aggregateMut.mutate(oks);
    }
  }

  const totalFindings = entries.reduce(
    (acc, e) => acc + (e.findings?.length ?? 0),
    0,
  );
  const okEntries = entries.filter((e) => e.status === "ok");
  const truncated =
    (filesQ.data?.files.length ?? 0) > MAX_FILES
      ? (filesQ.data!.files.length - MAX_FILES)
      : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border bg-sidebar p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Folder className="h-3 w-3" />
              {t("workspace.folder.title")}
            </div>
            <div className="truncate font-mono text-sm font-medium text-foreground">
              {folderPath}/
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            aria-label={t("workspace.folder.close")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-muted-foreground">
            {t("workspace.folder.kind")}
          </label>
          <Select value={kind} onValueChange={(v) => setKind(v as FolderKind)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["smells", "deadcode", "bugs", "security"] as const).map((k) => (
                <SelectItem key={k} value={k}>
                  {t(`analysis.kind.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!isCloud && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-300">
            {t("workspace.folder.needsCloud")}
          </p>
        )}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {t("workspace.folder.fileCount", {
              count: filesPlanned.length,
              total: filesQ.data?.files.length ?? 0,
            })}
          </span>
          {truncated > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              {t("workspace.folder.truncated", { count: truncated })}
            </span>
          )}
        </div>
        <Button
          className="h-10 w-full text-sm font-semibold"
          onClick={runBatch}
          disabled={!canRun || running}
        >
          {running ? (
            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {running
            ? t("workspace.folder.runningLabel", {
                done: progress.done,
                total: progress.total,
              })
            : t("workspace.folder.runAll")}
        </Button>
        {running && <Progress value={(progress.done / Math.max(1, progress.total)) * 100} className="h-1.5" />}
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b border-border px-2 pt-2">
          <TabsList>
            <TabsTrigger value="summary">
              {t("workspace.folder.tabSummary")}
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-1.5">
              {t("workspace.folder.tabFiles")}
              {totalFindings > 0 && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] tabular-nums text-primary">
                  {totalFindings}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="fix" className="gap-1.5">
              <Wrench className="h-3 w-3" />
              {t("workspace.fix.tab")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent forceMount value="summary" className="m-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
          {aggregateMut.isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {t("workspace.folder.aggregating")}
            </div>
          ) : aggText ? (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{aggText}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? t("workspace.folder.emptyHint")
                : t("workspace.folder.aggregatePending")}
            </p>
          )}
        </TabsContent>

        <TabsContent forceMount value="files" className="m-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <ul className="divide-y divide-border">
              {entries.length === 0 && (
                <li className="p-4 text-sm text-muted-foreground">
                  {t("workspace.folder.emptyHint")}
                </li>
              )}
              {entries.map((e) => (
                <li key={e.file_id} className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenFile(e.file_id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left hover:underline"
                    >
                      <FileCode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-mono text-xs">{e.path}</span>
                    </button>
                    <span className="shrink-0">
                      {e.status === "ok" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {e.status === "running" && (
                        <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                      )}
                      {e.status === "error" && (
                        <BugPlay className="h-4 w-4 text-red-500" />
                      )}
                    </span>
                  </div>
                  {e.status === "error" && (
                    <p className="text-[11px] text-red-600 dark:text-red-400">
                      {e.error}
                    </p>
                  )}
                  {e.findings && e.findings.length > 0 && (
                    <FindingsList
                      findings={e.findings}
                      onJump={() => onOpenFile(e.file_id)}
                    />
                  )}
                  {e.status === "ok" && (e.findings?.length ?? 0) === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {t("workspace.folder.noFindings")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>

        <TabsContent forceMount value="fix" className="m-0 flex-1 overflow-hidden p-3 data-[state=inactive]:hidden">
          <div className="flex h-full flex-col gap-2">
            <Button
              size="sm"
              onClick={() => fixMut.mutate()}
              disabled={
                !canRun ||
                fixMut.isPending ||
                okEntries.filter((e) => (e.findings?.length ?? 0) > 0).length === 0
              }
              className="self-start"
            >
              {fixMut.isPending ? (
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {fixMut.isPending
                ? t("workspace.fix.generating")
                : t("workspace.fix.generateFolder")}
            </Button>
            <div className="min-h-0 flex-1">
              <DiffViewer
                diff={diffText}
                notes={diffNotes}
                filename={`${folderPath.replace(/\//g, "_")}.patch`}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
