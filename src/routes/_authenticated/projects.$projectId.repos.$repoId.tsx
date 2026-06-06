import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Sparkles, Copy, Download, ShieldCheck, FileDown, BugPlay, Bot, ScanSearch } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { FileTree } from "@/components/FileTree";
import { CodeViewer } from "@/components/CodeViewer";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { AiOriginPanel, type RepoAiOriginResult } from "@/components/AiOriginPanel";
import { getRepository, getFileContent } from "@/lib/repos.functions";
import { listProviders } from "@/lib/credentials.functions";
import { explainFile, saveLocalExplanation } from "@/lib/explain.functions";
import { runAnalysis, saveLocalAnalysis, analyzeRepoAiOrigin } from "@/lib/analysis.functions";
import { exportRepoMarkdown } from "@/lib/export.functions";
import { callLocalProvider, type LocalKind } from "@/lib/local-ai";
import { buildPrompt, type Proficiency } from "@/lib/prompt";
import { buildAnalysisPrompt, type AnalysisKind } from "@/lib/analysis-prompt";

type CloudProvider = "openai" | "anthropic" | "gemini" | "openrouter";
type ProviderValue = `cloud:${CloudProvider}` | `local:${LocalKind}`;
type MainTab = "summary" | "quality" | "security" | "ai_origin";
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
  const getRepo = useServerFn(getRepository);
  const getContent = useServerFn(getFileContent);
  const providersFn = useServerFn(listProviders);
  const explain = useServerFn(explainFile);
  const saveLocal = useServerFn(saveLocalExplanation);
  const analyze = useServerFn(runAnalysis);
  const saveLocalA = useServerFn(saveLocalAnalysis);
  const exportFn = useServerFn(exportRepoMarkdown);
  const repoAiOriginFn = useServerFn(analyzeRepoAiOrigin);
  const search = Route.useSearch();

  const repo = useQuery({ queryKey: ["repo", repoId], queryFn: () => getRepo({ data: { id: repoId } }) });
  const provs = useQuery({ queryKey: ["providers"], queryFn: () => providersFn() });

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [proficiency, setProficiency] = useState<Proficiency>("intermediate");
  const [providerValue, setProviderValue] = useState<ProviderValue | "">("");
  const [mainTab, setMainTab] = useState<MainTab>("summary");
  const [summarySub, setSummarySub] = useState<SummarySub>("human");
  const [qualityKind, setQualityKind] = useState<Exclude<AnalysisKind, "ai_origin" | "security">>("smells");

  const [summaryText, setSummaryText] = useState<string>("");
  const [qualityText, setQualityText] = useState<string>("");
  const [securityText, setSecurityText] = useState<string>("");
  const [aiOriginText, setAiOriginText] = useState<string>("");

  const [repoSheetOpen, setRepoSheetOpen] = useState(false);
  const [repoAiResult, setRepoAiResult] = useState<RepoAiOriginResult | null>(null);


  const cloudKeys = provs.data?.keys ?? [];
  const localEndpoints = provs.data?.endpoints ?? [];
  const hasAny = cloudKeys.length > 0 || localEndpoints.length > 0;

  useEffect(() => {
    if (providerValue) return;
    if (cloudKeys[0]) setProviderValue(`cloud:${cloudKeys[0].provider as CloudProvider}`);
    else if (localEndpoints[0])
      setProviderValue(`local:${localEndpoints[0].kind as LocalKind}`);
  }, [provs.data, providerValue, cloudKeys, localEndpoints]);

  const fileQ = useQuery({
    enabled: !!selectedFileId,
    queryKey: ["file", selectedFileId],
    queryFn: () => getContent({ data: { file_id: selectedFileId! } }),
  });

  // Reset all outputs when context changes
  useEffect(() => {
    setSummaryText("");
    setQualityText("");
    setSecurityText("");
    setAiOriginText("");
  }, [selectedFileId, providerValue]);

  // Open the repo-level AI-origin sheet if landed via ?view=analyze
  useEffect(() => {
    if (search.view === "analyze") setRepoSheetOpen(true);
  }, [search.view]);


  const isLocal = providerValue.startsWith("local:");
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
          },
        });
        return r.content;
      }
      const kind = providerValue.slice(6) as LocalKind;
      const endpoint = localEndpoints.find((e) => e.kind === kind);
      if (!endpoint || !fileQ.data) throw new Error("not_ready");
      const { system, user } = buildPrompt({
        proficiency,
        explanationType: summarySub,
        language: lang,
        filePath: fileQ.data.path,
        fileContent: fileQ.data.content,
      });
      const text = await callLocalProvider({
        kind,
        baseUrl: endpoint.base_url,
        model: endpoint.default_model || (kind === "ollama" ? "llama3.2" : "local-model"),
        system,
        user,
      });
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
      return text;
    },
    onSuccess: (text) => setSummaryText(text),
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
    onSuccess: (r) => setRepoAiResult(r as RepoAiOriginResult),
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

  const activeText = useMemo(() => {
    if (mainTab === "summary") return summaryText;
    if (mainTab === "quality") return qualityText;
    if (mainTab === "ai_origin") return aiOriginText;
    return securityText;
  }, [mainTab, summaryText, qualityText, securityText, aiOriginText]);

  const mdFilename = useMemo(() => {
    const base = fileQ.data?.path?.split("/").pop() ?? "explanation";
    const suffix =
      mainTab === "summary"
        ? `${summarySub}.${proficiency}`
        : mainTab === "quality"
          ? `quality.${qualityKind}`
          : mainTab === "ai_origin"
            ? `ai-origin`
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
    else securityMut.mutate();
  };
  const isRunning =
    (mainTab === "summary" && explainMut.isPending) ||
    (mainTab === "quality" && qualityMut.isPending) ||
    (mainTab === "ai_origin" && aiOriginMut.isPending) ||
    (mainTab === "security" && securityMut.isPending);

  const canRunRepoAi = providerValue.startsWith("cloud:");

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={20} minSize={14}>
            <div className="flex h-full flex-col border-r border-border bg-sidebar">
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                <span className="truncate text-xs font-medium uppercase text-muted-foreground">
                  {repo.data?.repository?.name ?? t("workspace.files")}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Sheet open={repoSheetOpen} onOpenChange={setRepoSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2 text-[11px]"
                        title={t("workspace.analyzeWholeRepo")}
                      >
                        <ScanSearch className="mr-1 h-3.5 w-3.5" />
                        {t("workspace.analyzeWholeRepo")}
                      </Button>
                    </SheetTrigger>
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
                      onSelect={(f) => setSelectedFileId(f.id)}
                    />
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full">
              {fileQ.data ? (
                <CodeViewer content={fileQ.data.content} language={fileQ.data.language} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t("workspace.selectFile")}
                </div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} minSize={22}>
            <div className="flex h-full flex-col border-l border-border bg-sidebar">
              <div className="space-y-2 border-b border-border p-3">
                <div className="grid grid-cols-2 gap-2">
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
                </div>
                {!hasAny && (
                  <p className="text-xs text-muted-foreground">{t("workspace.noProvider")}</p>
                )}
                {isLocal && (
                  <p className="flex items-center gap-1 text-[11px] text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {t("workspace.localPledge")}
                  </p>
                )}
                {mainTab === "quality" && (
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
                <Button
                  size="sm"
                  className="w-full"
                  onClick={runMain}
                  disabled={!selectedFileId || !providerValue || isRunning}
                >
                  {mainTab === "summary" ? (
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                  ) : (
                    <BugPlay className="mr-2 h-3.5 w-3.5" />
                  )}
                  {isRunning
                    ? mainTab === "summary"
                      ? t("workspace.explaining")
                      : t("workspace.analyzing")
                    : mainTab === "summary"
                      ? t("workspace.explain")
                      : t("workspace.analyze")}
                </Button>
              </div>
              <Tabs
                value={mainTab}
                onValueChange={(v) => setMainTab(v as MainTab)}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-2 pt-2">
                  <TabsList>
                    <TabsTrigger value="summary">{t("workspace.tabs.summary")}</TabsTrigger>
                    <TabsTrigger value="quality">{t("workspace.tabs.quality")}</TabsTrigger>
                    <TabsTrigger value="security">{t("workspace.tabs.security")}</TabsTrigger>
                    <TabsTrigger value="ai_origin" className="gap-1">
                      <Bot className="h-3 w-3" />
                      {t("workspace.tabs.aiOrigin")}
                    </TabsTrigger>
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
                <TabsContent value="summary" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <Tabs value={summarySub} onValueChange={(v) => setSummarySub(v as SummarySub)}>
                    <TabsList className="mt-2">
                      <TabsTrigger value="human">{t("workspace.tabs.human")}</TabsTrigger>
                      <TabsTrigger value="technical">{t("workspace.tabs.technical")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="human" className="m-0 pt-2">
                      <ExplanationView text={summaryText} />
                    </TabsContent>
                    <TabsContent value="technical" className="m-0 pt-2">
                      <ExplanationView text={summaryText} />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                <TabsContent value="quality" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <ExplanationView text={qualityText} placeholder={t("analysis.empty")} />
                </TabsContent>
                <TabsContent value="security" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <ExplanationView text={securityText} placeholder={t("analysis.empty")} />
                </TabsContent>
                <TabsContent value="ai_origin" className="m-0 flex-1 overflow-auto px-4 pb-4">
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
              </Tabs>
              <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
                {t("footer.ownership")}
              </div>
            </div>
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
