import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  Sparkles,
  Copy,
  Download,
  ShieldCheck,
  FileDown,
  BugPlay,
  Bot,
  ScanSearch,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Play,
  Wrench,
  ShieldAlert,
  FileBadge2,
  AlertTriangle,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { FileTree } from "@/components/FileTree";
import { CodeViewer, type CodeSelection, type CodeViewerHandle } from "@/components/CodeViewer";
import { InsightPanel, type InsightAction } from "@/components/InsightPanel";
import { DiffViewer, extractDiffBlock, extractNotes } from "@/components/DiffViewer";
import { FolderAnalysisPanel } from "@/components/FolderAnalysisPanel";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AiOriginPanel, type RepoAiOriginResult } from "@/components/AiOriginPanel";
import { getRepository, getFileContent } from "@/lib/repos.functions";
import { listProviders } from "@/lib/credentials.functions";
import { explainFile, saveLocalExplanation } from "@/lib/explain.functions";
import { runAnalysis, saveLocalAnalysis, analyzeRepoAiOrigin } from "@/lib/analysis.functions";
import { proposeFileFix } from "@/lib/fix.functions";
import { exportRepoMarkdown } from "@/lib/export.functions";
import { callLocalProvider, type LocalKind } from "@/lib/local-ai";
import { buildPrompt, type Proficiency } from "@/lib/prompt";
import { buildAnalysisPrompt, type AnalysisKind } from "@/lib/analysis-prompt";
import {
  extractInsightBundle,
  stripFindingsBlock,
  severityBadgeClass,
  type Finding,
} from "@/lib/findings";
import { runStaticMalwareScan, type StaticMalwareAssessment } from "@/lib/static-malware.functions";

type CloudProvider = "openai" | "anthropic" | "gemini" | "openrouter";
type ProviderValue = `cloud:${CloudProvider}` | `local:${LocalKind}`;
type MainTab = "summary" | "quality" | "security" | "ai_origin" | "malware" | "fix";
type SummarySub = "human" | "technical";

const SearchSchema = z.object({
  view: z.enum(["analyze"]).optional(),
});

export const Route = createFileRoute("/_authenticated/projects/$projectId/repos/$repoId")({
  validateSearch: (s) => SearchSchema.parse(s),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { repoId } = Route.useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const getRepo = useServerFn(getRepository);
  const getContent = useServerFn(getFileContent);
  const providersFn = useServerFn(listProviders);
  const explain = useServerFn(explainFile);
  const saveLocal = useServerFn(saveLocalExplanation);
  const analyze = useServerFn(runAnalysis);
  const saveLocalA = useServerFn(saveLocalAnalysis);
  const exportFn = useServerFn(exportRepoMarkdown);
  const repoAiOriginFn = useServerFn(analyzeRepoAiOrigin);
  const proposeFix = useServerFn(proposeFileFix);
  const runMalware = useServerFn(runStaticMalwareScan);
  const search = Route.useSearch();

  const repo = useQuery({ queryKey: ["repo", repoId], queryFn: () => getRepo({ data: { id: repoId } }) });
  const provs = useQuery({ queryKey: ["providers"], queryFn: () => providersFn() });
  const analysisMode = repo.data?.project_analysis_mode ?? "both";
  const llmEnabled = analysisMode !== "static";

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const codeRef = useRef<CodeViewerHandle | null>(null);
  const [proficiency, setProficiency] = useState<Proficiency>("intermediate");
  const [providerValue, setProviderValue] = useState<ProviderValue | "">("");
  const [mainTab, setMainTab] = useState<MainTab>("summary");
  const [summarySub, setSummarySub] = useState<SummarySub>("human");
  const [qualityKind, setQualityKind] = useState<Exclude<AnalysisKind, "ai_origin" | "security">>("smells");

  const [summaryText, setSummaryText] = useState<string>("");
  const [qualityText, setQualityText] = useState<string>("");
  const [securityText, setSecurityText] = useState<string>("");
  const [aiOriginText, setAiOriginText] = useState<string>("");
  const [fixText, setFixText] = useState<string>("");
  const [malwareText, setMalwareText] = useState<string>("");
  const [malwareReport, setMalwareReport] = useState<StaticMalwareAssessment | null>(null);

  const [repoSheetOpen, setRepoSheetOpen] = useState(false);
  const [repoAiResult, setRepoAiResult] = useState<RepoAiOriginResult | null>(null);
  const [selection, setSelection] = useState<CodeSelection | null>(null);
  const [useSelection, setUseSelection] = useState(true);




  const cloudKeys = provs.data?.keys ?? [];
  const localEndpoints = provs.data?.endpoints ?? [];
  const hasAny = llmEnabled && (cloudKeys.length > 0 || localEndpoints.length > 0);

  useEffect(() => {
    if (!llmEnabled) {
      setProviderValue("");
      return;
    }
    if (providerValue) return;
    if (cloudKeys[0]) setProviderValue(`cloud:${cloudKeys[0].provider as CloudProvider}`);
    else if (localEndpoints[0])
      setProviderValue(`local:${localEndpoints[0].kind as LocalKind}`);
  }, [llmEnabled, provs.data, providerValue, cloudKeys, localEndpoints]);

  const fileQ = useQuery({
    enabled: !!selectedFileId,
    queryKey: ["file", selectedFileId],
    queryFn: () => getContent({ data: { file_id: selectedFileId! } }),
  });

  // Reset all outputs (and code selection) when context changes
  useEffect(() => {
    setSummaryText("");
    setQualityText("");
    setSecurityText("");
    setAiOriginText("");
    setFixText("");
    setMalwareText("");
    setMalwareReport(null);
    setSelection(null);
  }, [selectedFileId, providerValue]);

  useEffect(() => {
    if (!llmEnabled && mainTab !== "malware") {
      setMainTab("malware");
    }
  }, [llmEnabled, mainTab]);

  useEffect(() => {
    if (!llmEnabled) {
      setSelectedFolderPath(null);
      setRepoSheetOpen(false);
      setRepoAiResult(null);
    }
  }, [llmEnabled]);

  const activeSnippet = useSelection && selection ? selection : null;


  // Open the repo-level AI-origin sheet when ?view=analyze. Use derived state
  // so it works synchronously on first render (no flash, no race with effects).
  const repoSheetOpenDerived = llmEnabled && search.view === "analyze" ? true : repoSheetOpen;
  const onRepoSheetOpenChange = (open: boolean) => {
    setRepoSheetOpen(open);
    if (!open && search.view === "analyze") {
      navigate({ to: ".", search: {}, replace: true });
    }
  };

  // Auto-start the repo scan when the sheet opens via ?view=analyze
  // as soon as a provider is ready and no result yet.
  const [autoStarted, setAutoStarted] = useState(false);
  useEffect(() => {
    if (
      llmEnabled &&
      search.view === "analyze" &&
      provs.isSuccess &&
      !autoStarted &&
      !repoAiResult &&
      providerValue && providerValue.startsWith("cloud:")
    ) {
      setAutoStarted(true);
      repoAiMut.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llmEnabled, search.view, provs.isSuccess, providerValue, autoStarted, repoAiResult]);


  const isLocal = llmEnabled && providerValue.startsWith("local:");
  const lang = (i18n.resolvedLanguage as "en" | "it" | "zh") || "en";

  const explainMut = useMutation({
    mutationFn: async () => {
      if (!selectedFileId || !providerValue) throw new Error("missing");
      if (providerValue.startsWith("cloud:")) {
        const provider = providerValue.slice(6) as CloudProvider;
        const r = await explain({
          data: {
            file_id: selectedFileId,
            provider,
            proficiency,
            explanation_type: summarySub,
            language: lang,
            snippet: activeSnippet
              ? {
                  content: activeSnippet.content,
                  start_line: activeSnippet.startLine,
                  end_line: activeSnippet.endLine,
                }
              : undefined,
          },
        });
        return r.content;
      }
      const kind = providerValue.slice(6) as LocalKind;
      const endpoint = localEndpoints.find((e) => e.kind === kind);
      if (!endpoint || !fileQ.data) throw new Error("not_ready");
      const promptPath = activeSnippet
        ? `${fileQ.data.path} (selezione righe ${activeSnippet.startLine}–${activeSnippet.endLine})`
        : fileQ.data.path;
      const promptContent = activeSnippet ? activeSnippet.content : fileQ.data.content;
      const { system, user } = buildPrompt({
        proficiency,
        explanationType: summarySub,
        language: lang,
        filePath: promptPath,
        fileContent: promptContent,
      });
      const text = await callLocalProvider({
        kind,
        baseUrl: endpoint.base_url,
        model: endpoint.default_model || (kind === "ollama" ? "llama3.2" : "local-model"),
        system,
        user,
      });
      // Cache only full-file explanations.
      if (!activeSnippet) {
        try {
          await saveLocal({
            data: {
              file_id: selectedFileId,
              proficiency,
              explanation_type: summarySub,
              language: lang,
              content: text,
              kind,
              model: endpoint.default_model ?? undefined,
            },
          });
        } catch {}
      }
      return text;
    },
    onSuccess: (text) => { if (text) setSummaryText(text); },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });


  async function runAnalysisKind(kind: AnalysisKind): Promise<string> {
    if (!selectedFileId || !providerValue) throw new Error("missing");
    if (providerValue.startsWith("cloud:")) {
      const provider = providerValue.slice(6) as CloudProvider;
      const r = await analyze({
        data: { file_id: selectedFileId, provider, kind, language: lang },
      });
      return r.content;
    }
    const localKind = providerValue.slice(6) as LocalKind;
    const endpoint = localEndpoints.find((e) => e.kind === localKind);
    if (!endpoint || !fileQ.data) throw new Error("not_ready");
    const { system, user } = buildAnalysisPrompt({
      kind,
      language: lang,
      filePath: fileQ.data.path,
      fileContent: fileQ.data.content,
    });
    const text = await callLocalProvider({
      kind: localKind,
      baseUrl: endpoint.base_url,
      model: endpoint.default_model || (localKind === "ollama" ? "llama3.2" : "local-model"),
      system,
      user,
    });
    try {
      await saveLocalA({
        data: {
          file_id: selectedFileId,
          kind,
          language: lang,
          content: text,
          provider_kind: localKind,
          model: endpoint.default_model ?? undefined,
        },
      });
    } catch {}
    return text;
  }

  const qualityMut = useMutation({
    mutationFn: () => runAnalysisKind(qualityKind),
    onSuccess: (text) => setQualityText(text),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const securityMut = useMutation({
    mutationFn: () => runAnalysisKind("security"),
    onSuccess: (text) => setSecurityText(text),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const malwareMut = useMutation({
    mutationFn: async () => {
      if (!selectedFileId) throw new Error("missing_file");
      const report = await runMalware({ data: { file_id: selectedFileId } });
      setMalwareReport(report);
      setMalwareText(formatMalwareReport(report));
    },
    onSuccess: () => {},
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const aiOriginMut = useMutation({
    mutationFn: () => runAnalysisKind("ai_origin"),
    onSuccess: (text) => setAiOriginText(text),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const repoAiMut = useMutation({
    mutationFn: async () => {
      if (!providerValue.startsWith("cloud:")) throw new Error("needs_cloud_provider");
      const provider = providerValue.slice(6) as CloudProvider;
      return repoAiOriginFn({
        data: { repo_id: repoId, provider, language: lang },
      });
    },
    onSuccess: (r) => {
      if (llmEnabled) setRepoAiResult(r as RepoAiOriginResult);
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const exportMut = useMutation({
    mutationFn: () => exportFn({ data: { repo_id: repoId } }),
    onSuccess: (r) => {
      const bin = atob(r.zip_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const totalLines = fileQ.data?.content ? fileQ.data.content.split("\n").length : 100_000;

  // Per-tab insight bundles (mapped findings + unmapped file-level points).
  const summaryBundle = useMemo(
    () => extractInsightBundle(summaryText, totalLines, "summary"),
    [summaryText, totalLines],
  );
  const qualityBundle = useMemo(
    () => extractInsightBundle(qualityText, totalLines, "quality"),
    [qualityText, totalLines],
  );
  const securityBundle = useMemo(
    () => extractInsightBundle(securityText, totalLines, "security"),
    [securityText, totalLines],
  );

  // Active tab's findings drive the code editor highlights.
  const findings: Finding[] = useMemo(() => {
    if (mainTab === "summary") return summaryBundle.findings;
    if (mainTab === "quality") return qualityBundle.findings;
    if (mainTab === "security") return securityBundle.findings;
    return [];
  }, [mainTab, summaryBundle, qualityBundle, securityBundle]);

  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [patchSourceInsight, setPatchSourceInsight] = useState<Finding | null>(null);

  // Clear active highlight when the active tab no longer contains it.
  useEffect(() => {
    if (!activeFindingId) return;
    if (!findings.some((f) => f.id === activeFindingId)) setActiveFindingId(null);
  }, [findings, activeFindingId]);

  const fixSourceAnalysis = useMemo(() => {
    if (qualityText) return { kind: qualityKind, text: qualityText };
    if (securityText) return { kind: "security" as const, text: securityText };
    return null;
  }, [qualityText, securityText, qualityKind]);

  const fixMut = useMutation({
    mutationFn: async () => {
      if (!selectedFileId) throw new Error("no_file");
      if (!providerValue.startsWith("cloud:")) throw new Error(t("workspace.fix.needsCloud"));
      if (!fixSourceAnalysis) throw new Error(t("workspace.fix.needsAnalysis"));
      const provider = providerValue.slice(6) as CloudProvider;
      const r = await proposeFix({
        data: {
          file_id: selectedFileId,
          kind: fixSourceAnalysis.kind,
          language: lang,
          provider,
          analysis_markdown: fixSourceAnalysis.text,
        },
      });
      return r.content;
    },
    onSuccess: (text) => {
      setFixText(text);
      setMainTab("fix");
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const activeText = useMemo(() => {
    if (mainTab === "summary") return summaryText;
    if (mainTab === "quality") return qualityText;
    if (mainTab === "ai_origin") return aiOriginText;
    if (mainTab === "malware") return malwareText;
    if (mainTab === "fix") return fixText;
    return securityText;
  }, [mainTab, summaryText, qualityText, securityText, aiOriginText, fixText]);

  const mdFilename = useMemo(() => {
    const base = fileQ.data?.path?.split("/").pop() ?? "explanation";
    const suffix =
      mainTab === "summary"
        ? `${summarySub}.${proficiency}`
        : mainTab === "quality"
          ? `quality.${qualityKind}`
          : mainTab === "ai_origin"
            ? `ai-origin`
            : mainTab === "malware"
              ? `malware`
            : mainTab === "fix"
              ? `fix`
              : `security`;
    return `${base}.${suffix}.md`;
  }, [fileQ.data?.path, mainTab, summarySub, proficiency, qualityKind]);


  const onCopy = async () => {
    if (!activeText) return;
    try {
      await navigator.clipboard.writeText(activeText);
      toast.success(t("workspace.copied"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const onDownload = () => {
    if (!activeText) return;
    const blob = new Blob([activeText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mdFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runMain = () => {
    if (mainTab === "summary") explainMut.mutate();
    else if (mainTab === "quality") qualityMut.mutate();
    else if (mainTab === "ai_origin") aiOriginMut.mutate();
    else if (mainTab === "malware") malwareMut.mutate();
    else if (mainTab === "fix") fixMut.mutate();
    else securityMut.mutate();
  };
  const isRunning =
    (mainTab === "summary" && explainMut.isPending) ||
    (mainTab === "quality" && qualityMut.isPending) ||
    (mainTab === "ai_origin" && aiOriginMut.isPending) ||
    (mainTab === "security" && securityMut.isPending) ||
    (mainTab === "malware" && malwareMut.isPending) ||
    (mainTab === "fix" && fixMut.isPending);

  const jumpToFinding = (f: Finding) => {
    setActiveFindingId(f.id ?? null);
    codeRef.current?.revealLine(f.start_line, {
      select: { from: f.start_line, to: f.end_line },
    });
  };

  const handleInsightAction = (action: InsightAction) => {
    const f = action.finding;
    if (!fileQ.data) return;
    if (action.kind === "show") {
      jumpToFinding(f);
      return;
    }
    if (action.kind === "explain" || action.kind === "comment") {
      const lines = fileQ.data.content.split("\n");
      const slice = lines
        .slice(f.start_line - 1, f.end_line)
        .join("\n");
      setSelection({
        content: slice,
        startLine: f.start_line,
        endLine: f.end_line,
      });
      setUseSelection(true);
      setMainTab("summary");
      setSummarySub(action.kind === "comment" ? "human" : "technical");
      jumpToFinding(f);
      // defer so state propagates
      setTimeout(() => explainMut.mutate(), 0);
      return;
    }
    if (action.kind === "patch") {
      setPatchSourceInsight(f);
      jumpToFinding(f);
      if (providerValue.startsWith("cloud:") && fixSourceAnalysis) {
        setMainTab("fix");
        setTimeout(() => fixMut.mutate(), 0);
      } else {
        toast.error(t("workspace.fix.needsAnalysis"));
      }
      return;
    }
  };

  // Toolbar actions triggered from a manual editor selection.
  const runFromSelection = (kind: "explain" | "summarize" | "comment" | "quality" | "security") => {
    if (!selection) return;
    setUseSelection(true);
    if (kind === "explain" || kind === "summarize" || kind === "comment") {
      setMainTab("summary");
      setSummarySub(kind === "comment" || kind === "summarize" ? "human" : "technical");
      setTimeout(() => explainMut.mutate(), 0);
    } else if (kind === "quality") {
      setMainTab("quality");
      setTimeout(() => qualityMut.mutate(), 0);
    } else if (kind === "security") {
      setMainTab("security");
      setTimeout(() => securityMut.mutate(), 0);
    }
  };


  const canRunRepoAi = llmEnabled && providerValue.startsWith("cloud:");

  const tabNeedsProvider =
    llmEnabled &&
    (mainTab === "summary" ||
      mainTab === "quality" ||
      mainTab === "security" ||
      mainTab === "ai_origin" ||
      mainTab === "fix");
  const statusKind: "ready" | "needFile" | "needProvider" =
    !selectedFileId
      ? "needFile"
      : tabNeedsProvider && !providerValue
        ? "needProvider"
        : "ready";

  return (
    <AppShell>
      {llmEnabled && (
        <Sheet open={repoSheetOpenDerived} onOpenChange={onRepoSheetOpenChange}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-xl">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                {t("aiOrigin.title")}
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-4rem)]">
              <AiOriginPanel
                result={repoAiResult}
                isRunning={repoAiMut.isPending}
                onRun={() => repoAiMut.mutate()}
                canRun={canRunRepoAi}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={20} minSize={14}>
            <div className="flex h-full flex-col border-r border-border bg-sidebar">
                <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                  <span className="truncate text-xs font-medium uppercase text-muted-foreground">
                    {repo.data?.repository?.name ?? t("workspace.files")}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                  {llmEnabled ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 px-2 text-[11px]"
                      title={t("workspace.analyzeWholeRepo")}
                      onClick={() => setRepoSheetOpen(true)}
                    >
                      <ScanSearch className="mr-1 h-3.5 w-3.5" />
                      {t("workspace.analyzeWholeRepo")}
                    </Button>
                  ) : (
                    <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-1 text-[11px] text-primary">
                      {t("workspace.staticOnlyMode")}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportMut.mutate()}
                    disabled={exportMut.isPending}
                    aria-label={t("workspace.exportAll")}
                    title={t("workspace.exportAll")}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {repo.data && (
                    <FileTree
                      files={repo.data.files}
                      selectedId={selectedFileId}
                      selectedFolderPath={selectedFolderPath}
                      onSelect={(f) => {
                        setSelectedFileId(f.id);
                        setSelectedFolderPath(null);
                      }}
                      onSelectFolder={llmEnabled ? (p) => {
                        setSelectedFolderPath(p);
                        setSelectedFileId(null);
                      } : undefined}
                    />
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={46} minSize={20}>
            <div className="h-full">
              {selectedFolderPath ? (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="max-w-md space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
                    <ScanSearch className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="text-base font-semibold">
                      {t("workspace.folder.title")}
                    </h3>
                    <p className="font-mono text-sm text-foreground">
                      {selectedFolderPath}/
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("workspace.folder.emptyHint")}
                    </p>
                  </div>
                </div>
              ) : fileQ.data ? (
                <div className="relative h-full">
                  <CodeViewer
                    ref={codeRef}
                    content={fileQ.data.content}
                    language={fileQ.data.language}
                    onSelectionChange={setSelection}
                    findings={findings}
                    activeFindingId={activeFindingId}
                    onMarkerClick={(f) => {
                      setActiveFindingId(f.id ?? null);
                      // surface its tab if the active one doesn't contain it
                      if (f.category === "summary" || f.category === "comment") setMainTab("summary");
                      else if (f.category === "security") setMainTab("security");
                      else if (f.category === "quality") setMainTab("quality");
                    }}
                  />
                  {selection && (
                    <div className="pointer-events-auto absolute right-3 top-3 z-20 flex flex-wrap items-center gap-1 rounded-md border border-border bg-card/95 p-1 shadow-md backdrop-blur">
                      <span className="px-1.5 text-[10px] font-mono text-muted-foreground">
                        {t("insights.lineRange", {
                          range:
                            selection.startLine === selection.endLine
                              ? `${selection.startLine}`
                              : `${selection.startLine}–${selection.endLine}`,
                        })}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => runFromSelection("explain")}>
                        {t("insights.selection.explain")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => runFromSelection("summarize")}>
                        {t("insights.selection.summarize")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => runFromSelection("comment")}>
                        {t("insights.selection.comment")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => runFromSelection("quality")}>
                        {t("insights.selection.quality")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => runFromSelection("security")}>
                        {t("insights.selection.security")}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-base font-semibold">{t("workspace.howTo.title")}</h3>
                    <ol className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">1</span>
                        <span className="flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />{t("workspace.howTo.step1")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">2</span>
                        <span className="flex items-center gap-1.5">{t("workspace.howTo.step2")}<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">3</span>
                        <span className="flex items-center gap-1.5"><Play className="h-3.5 w-3.5 text-primary" />{t("workspace.howTo.step3")}</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={34} minSize={26}>
            {selectedFolderPath ? (
              <FolderAnalysisPanel
                repoId={repoId}
                folderPath={selectedFolderPath}
                providerValue={providerValue}
                language={lang}
                onClose={() => setSelectedFolderPath(null)}
                onOpenFile={(id) => {
                  setSelectedFileId(id);
                  setSelectedFolderPath(null);
                }}
              />
            ) : (
            <div className="flex h-full flex-col border-l border-border bg-sidebar">
              <div className="sticky top-0 z-10 space-y-2 border-b border-border bg-sidebar p-3">
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground">
                      {t("workspace.proficiency")}
                    </label>
                    <Select value={proficiency} onValueChange={(v) => setProficiency(v as Proficiency)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["nontech", "junior", "intermediate", "senior", "architect", "cto"] as const).map((p) => (
                          <SelectItem key={p} value={p}>
                            {t(`proficiency.${p}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {llmEnabled ? (
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground">
                        {t("workspace.provider")}
                      </label>
                      <Select
                        value={providerValue}
                        onValueChange={(v) => setProviderValue(v as ProviderValue)}
                        disabled={!hasAny}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {cloudKeys.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>{t("workspace.cloud")}</SelectLabel>
                              {cloudKeys.map((k) => (
                                <SelectItem key={k.provider} value={`cloud:${k.provider}`}>
                                  {t(`settings.providers.${k.provider}`)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {localEndpoints.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>{t("workspace.local")}</SelectLabel>
                              {localEndpoints.map((e) => (
                                <SelectItem key={e.kind} value={`local:${e.kind}`}>
                                  {t(`settings.endpoints.${e.kind}`)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-[11px] text-primary">
                      <div className="font-medium">{t("workspace.staticOnlyMode")}</div>
                      <p className="mt-1 text-muted-foreground">{t("workspace.staticOnlyBody")}</p>
                    </div>
                  )}
                </div>
                {llmEnabled && !hasAny && (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2">
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">
                      {t("workspace.noProvider")}
                    </span>
                    <Button asChild size="sm" variant="secondary" className="h-7 shrink-0 px-2 text-[11px]">
                      <Link to="/settings" hash="byok">
                        <KeyRound className="mr-1 h-3 w-3" />
                        {t("aiOrigin.configureKey")}
                      </Link>
                    </Button>
                  </div>
                )}
                {llmEnabled && isLocal && (
                  <p className="flex items-center gap-1 text-[11px] text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {t("workspace.localPledge")}
                  </p>
                )}
                {llmEnabled && mainTab === "quality" && (
                  <Select value={qualityKind} onValueChange={(v) => setQualityKind(v as typeof qualityKind)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["smells", "deadcode", "bugs"] as const).map((k) => (
                        <SelectItem key={k} value={k}>
                          {t(`analysis.kind.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {llmEnabled && mainTab === "summary" && selection && (
                  <label className="flex cursor-pointer items-start gap-2 rounded-md border border-primary/40 bg-primary/5 p-2 text-[11px] text-primary">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-3.5 w-3.5 accent-primary"
                      checked={useSelection}
                      onChange={(e) => setUseSelection(e.target.checked)}
                    />
                    <span>
                      {t("workspace.selectionToggle", {
                        from: selection.startLine,
                        to: selection.endLine,
                      })}
                    </span>
                  </label>
                )}
                {/* Status pill */}

                <div
                  className={
                    "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium " +
                    (statusKind === "ready"
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300")
                  }
                >
                  {statusKind === "ready" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {statusKind === "ready" && t("workspace.status.ready")}
                  {statusKind === "needFile" && t("workspace.status.needFile")}
                  {statusKind === "needProvider" && t("workspace.status.needProvider")}
                </div>
                <Button
                  size="default"
                  className="h-10 w-full text-sm font-semibold"
                  onClick={runMain}
                  disabled={
                    !selectedFileId || (tabNeedsProvider && !providerValue) || isRunning
                  }
                >
                  {isRunning ? (
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  ) : mainTab === "summary" ? (
                    <Sparkles className="mr-2 h-4 w-4" />
                  ) : (
                    <BugPlay className="mr-2 h-4 w-4" />
                  )}
                  {isRunning
                    ? mainTab === "summary"
                      ? t("workspace.explaining")
                      : t("workspace.analyzing")
                    : llmEnabled
                      ? t("workspace.runFile")
                      : t("workspace.runStatic")}
                </Button>
              </div>
              <Tabs
                value={mainTab}
                onValueChange={(v) => setMainTab(v as MainTab)}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-2 pt-2">
                  <TabsList>
                    {llmEnabled && <TabsTrigger value="summary">{t("workspace.tabs.summary")}</TabsTrigger>}
                    {llmEnabled && (
                      <TabsTrigger value="quality" className="gap-1">
                        {t("workspace.tabs.quality")}
                        {mainTab !== "quality" && findings.length > 0 && qualityText && (
                          <span className="rounded-full bg-primary/15 px-1.5 text-[10px] tabular-nums text-primary">
                            {findings.length}
                          </span>
                        )}
                      </TabsTrigger>
                    )}
                    {llmEnabled && <TabsTrigger value="security">{t("workspace.tabs.security")}</TabsTrigger>}
                    <TabsTrigger value="malware" className="gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      {t("workspace.tabs.malware")}
                    </TabsTrigger>
                    {llmEnabled && (
                      <>
                        <TabsTrigger value="ai_origin" className="gap-1">
                          <Bot className="h-3 w-3" />
                          {t("workspace.tabs.aiOrigin")}
                        </TabsTrigger>
                        <TabsTrigger value="fix" className="gap-1">
                          <Wrench className="h-3 w-3" />
                          {t("workspace.tabs.fix")}
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCopy}
                      disabled={!activeText}
                      aria-label={t("workspace.copy")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDownload}
                      disabled={!activeText}
                      aria-label={t("workspace.download")}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {llmEnabled && (
                  <TabsContent forceMount value="summary" className="m-0 flex-1 space-y-3 overflow-auto px-4 pb-4 data-[state=inactive]:hidden">
                  <Tabs value={summarySub} onValueChange={(v) => setSummarySub(v as SummarySub)}>
                    <TabsList className="mt-2">
                      <TabsTrigger value="human">{t("workspace.tabs.human")}</TabsTrigger>
                      <TabsTrigger value="technical">{t("workspace.tabs.technical")}</TabsTrigger>
                    </TabsList>
                    <TabsContent forceMount value="human" className="m-0 pt-2 data-[state=inactive]:hidden">
                      <ExplanationView text={stripFindingsBlock(summaryText)} />
                    </TabsContent>
                    <TabsContent forceMount value="technical" className="m-0 pt-2 data-[state=inactive]:hidden">
                      <ExplanationView text={stripFindingsBlock(summaryText)} />
                    </TabsContent>
                  </Tabs>
                  {summaryText && (
                    <InsightPanel
                      findings={summaryBundle.findings}
                      unmapped={summaryBundle.unmapped}
                      activeId={activeFindingId}
                      onAction={handleInsightAction}
                      defaultCategory="summary"
                      emptyLabel={t("workspace.findings.empty")}
                    />
                  )}
                  </TabsContent>
                )}
                {llmEnabled && (
                  <TabsContent forceMount value="quality" className="m-0 flex-1 space-y-3 overflow-auto px-4 pb-4 data-[state=inactive]:hidden">
                  <ExplanationView text={stripFindingsBlock(qualityText)} placeholder={t("analysis.empty")} />
                  {qualityText && (
                    <InsightPanel
                      findings={qualityBundle.findings}
                      unmapped={qualityBundle.unmapped}
                      activeId={activeFindingId}
                      onAction={handleInsightAction}
                      canPatch={providerValue.startsWith("cloud:")}
                      defaultCategory="quality"
                      emptyLabel={t("workspace.findings.empty")}
                    />
                  )}
                  </TabsContent>
                )}
                {llmEnabled && (
                  <TabsContent forceMount value="security" className="m-0 flex-1 space-y-3 overflow-auto px-4 pb-4 data-[state=inactive]:hidden">
                  <ExplanationView text={stripFindingsBlock(securityText)} placeholder={t("analysis.empty")} />
                  {securityText && (
                    <InsightPanel
                      findings={securityBundle.findings}
                      unmapped={securityBundle.unmapped}
                      activeId={activeFindingId}
                      onAction={handleInsightAction}
                      canPatch={providerValue.startsWith("cloud:")}
                      defaultCategory="security"
                      emptyLabel={t("workspace.findings.empty")}
                    />
                  )}
                  </TabsContent>
                )}
                <TabsContent forceMount value="malware" className="m-0 flex-1 space-y-3 overflow-auto px-4 pb-4 data-[state=inactive]:hidden">
                  <ExplanationView text={malwareText || t("analysis.empty")} />
                  {malwareReport && <MalwareReportPanel report={malwareReport} />}
                </TabsContent>
                {llmEnabled && (
                  <TabsContent forceMount value="ai_origin" className="m-0 flex-1 overflow-auto px-4 pb-4 data-[state=inactive]:hidden">
                  {aiOriginText ? (
                    <ExplanationView text={aiOriginText} />
                  ) : (
                    <div className="space-y-2 pt-3">
                      <p className="text-sm text-muted-foreground">{t("aiOrigin.fileEmpty")}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {t("aiOrigin.disclaimer")}
                      </p>
                    </div>
                  )}
                  </TabsContent>
                )}
                {llmEnabled && (
                  <TabsContent forceMount value="fix" className="m-0 flex-1 overflow-hidden p-3 data-[state=inactive]:hidden">
                  <div className="flex h-full min-h-0 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => fixMut.mutate()}
                        disabled={!selectedFileId || !providerValue.startsWith("cloud:") || !fixSourceAnalysis || fixMut.isPending}
                      >
                        {fixMut.isPending ? (
                          <Sparkles className="mr-2 h-3.5 w-3.5 animate-pulse" />
                        ) : (
                          <Wrench className="mr-2 h-3.5 w-3.5" />
                        )}
                        {fixMut.isPending ? t("workspace.fix.generating") : t("workspace.fix.generate")}
                      </Button>
                      {!fixSourceAnalysis && (
                        <span className="text-[11px] text-muted-foreground">
                          {t("workspace.fix.needsAnalysis")}
                        </span>
                      )}
                    </div>
                    {patchSourceInsight && fixText && (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5 text-[11px]">
                        <span className="truncate">
                          <span className="font-semibold text-primary">{t("insights.patchFrom")}: </span>
                          {patchSourceInsight.title}
                          <span className="ml-2 font-mono text-muted-foreground">
                            {t("insights.lineRange", {
                              range:
                                patchSourceInsight.start_line === patchSourceInsight.end_line
                                  ? `${patchSourceInsight.start_line}`
                                  : `${patchSourceInsight.start_line}–${patchSourceInsight.end_line}`,
                            })}
                          </span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => jumpToFinding(patchSourceInsight)}
                        >
                          {t("insights.backToInsight")}
                        </Button>
                      </div>
                    )}
                    <div className="min-h-0 flex-1">
                      <DiffViewer
                        diff={extractDiffBlock(fixText)}
                        notes={extractNotes(fixText)}
                        filename={`${fileQ.data?.path?.split("/").pop() ?? "decoder-fix"}.patch`}
                      />
                    </div>
                  </div>
                  </TabsContent>
                )}

              </Tabs>
              <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
                {t("footer.ownership")}
              </div>
            </div>
            )}
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </AppShell>
  );
}

function ExplanationView({ text, placeholder }: { text: string; placeholder?: string }) {
  if (!text) {
    return <p className="text-sm text-muted-foreground">{placeholder ?? "—"}</p>;
  }
  return (
    <div className="space-y-2">
      <AiBadge />
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</pre>
    </div>
  );
}

function AiBadge() {
  const { t } = useTranslation();
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
      <Sparkles className="h-3 w-3" />
      {t("workspace.aiGeneratedBadge")}
    </div>
  );
}

function formatMalwareReport(report: StaticMalwareAssessment): string {
  const lines = [
    "# Offline static malware scan",
    "",
    `Decision: ${report.decision.toUpperCase()}`,
    `Risk score: ${report.riskScore}/100`,
    `File: ${report.filePath}`,
    `Size: ${report.fileSize} bytes`,
    `Magic signature: ${report.magicDetected} (${report.magicSignature})`,
    `Extension: .${report.fileExt || "(unknown)"}`,
    "",
    `Entropy: global ${report.entropy.global.toFixed(4)}; max 256-byte window ${report.entropy.maxWindow.toFixed(4)} at ${report.entropy.maxWindowOffset}`,
    `Printable ratio: ${(report.metrics.printableRatio * 100).toFixed(1)}%`,
    `Control-char ratio: ${(report.metrics.controlCharRatio * 100).toFixed(1)}%`,
    "",
    "## Signals",
    ...report.findings.map((finding) => `- [${finding.severity}] ${finding.title} (${finding.code})`),
  ];
  return lines.join("\n");
}

function MalwareReportPanel({ report }: { report: StaticMalwareAssessment }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-card/40 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              report.decision === "block"
                ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
                : report.decision === "warn"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            Decision: {report.decision}
          </span>
          <span
            className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          >
            Risk: {report.riskScore}/100
          </span>
          <span className="rounded border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {report.fileSize} bytes
          </span>
          <span className="rounded border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            Entropy global {report.entropy.global.toFixed(3)}
          </span>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/30 p-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <FileBadge2 className="h-4 w-4" />
          Heuristic signals
        </div>
        {report.findings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No suspicious static signals found for this file.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {report.findings.map((finding) => (
              <li
                key={finding.code}
                className="rounded border border-border bg-card/60 p-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityBadgeClass(
                      finding.severity === "low"
                        ? "low"
                        : finding.severity === "medium"
                          ? "medium"
                          : "high",
                    )}`}
                  >
                    {finding.severity}
                  </span>
                  <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {finding.code}
                  </span>
                  <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {finding.decision === "block" ? "block" : "warn"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">{finding.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {finding.description}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Confidence: {finding.confidence}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-dashed border-border p-2.5 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          Interpretation
        </div>
        <p>
          This is a purely offline static heuristic. Use it as a first-pass risk flag, not as a proof
          of malware.
        </p>
      </div>
    </div>
  );
}
