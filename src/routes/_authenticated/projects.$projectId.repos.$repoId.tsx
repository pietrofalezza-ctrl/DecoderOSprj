import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Sparkles, Copy, Download, ShieldCheck } from "lucide-react";

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
import { getRepository, getFileContent } from "@/lib/repos.functions";
import { listProviders } from "@/lib/credentials.functions";
import { explainFile, saveLocalExplanation } from "@/lib/explain.functions";
import { callLocalProvider, type LocalKind } from "@/lib/local-ai.client";
import { buildPrompt, type Proficiency } from "@/lib/prompt";

type CloudProvider = "openai" | "anthropic" | "gemini" | "openrouter";
// Selector value: "cloud:openai" or "local:ollama"
type ProviderValue = `cloud:${CloudProvider}` | `local:${LocalKind}`;

export const Route = createFileRoute("/_authenticated/projects/$projectId/repos/$repoId")({
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

  const repo = useQuery({ queryKey: ["repo", repoId], queryFn: () => getRepo({ data: { id: repoId } }) });
  const provs = useQuery({ queryKey: ["providers"], queryFn: () => providersFn() });

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [proficiency, setProficiency] = useState<Proficiency>("intermediate");
  const [providerValue, setProviderValue] = useState<ProviderValue | "">("");
  const [tab, setTab] = useState<"human" | "technical">("human");
  const [explanation, setExplanation] = useState<string>("");

  const cloudKeys = provs.data?.keys ?? [];
  const localEndpoints = provs.data?.endpoints ?? [];
  const hasAny = cloudKeys.length > 0 || localEndpoints.length > 0;

  // Auto-pick first available provider
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

  useEffect(() => {
    setExplanation("");
  }, [selectedFileId, tab, proficiency, providerValue]);

  const isLocal = providerValue.startsWith("local:");

  const explainMut = useMutation({
    mutationFn: async () => {
      if (!selectedFileId || !providerValue) throw new Error("missing");
      const lang = (i18n.resolvedLanguage as "en" | "it" | "zh") || "en";

      if (providerValue.startsWith("cloud:")) {
        const provider = providerValue.slice(6) as CloudProvider;
        const r = await explain({
          data: {
            file_id: selectedFileId,
            provider,
            proficiency,
            explanation_type: tab,
            language: lang,
          },
        });
        return r.content;
      }

      // Local mode — call user's machine directly, server never sees the code
      const kind = providerValue.slice(6) as LocalKind;
      const endpoint = localEndpoints.find((e) => e.kind === kind);
      if (!endpoint) throw new Error("no_local_endpoint");
      if (!fileQ.data) throw new Error("file_not_loaded");
      const { system, user } = buildPrompt({
        proficiency,
        explanationType: tab,
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
      // Best-effort cache (ignore failures)
      try {
        await saveLocal({
          data: {
            file_id: selectedFileId,
            proficiency,
            explanation_type: tab,
            language: lang,
            content: text,
            kind,
            model: endpoint.default_model ?? undefined,
          },
        });
      } catch {
        /* non-fatal */
      }
      return text;
    },
    onSuccess: (text) => setExplanation(text),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const mdFilename = useMemo(() => {
    const base = fileQ.data?.path?.split("/").pop() ?? "explanation";
    return `${base}.${tab}.${proficiency}.md`;
  }, [fileQ.data?.path, tab, proficiency]);

  const onCopy = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      toast.success(t("workspace.copied"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const onDownload = () => {
    if (!explanation) return;
    const blob = new Blob([explanation], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mdFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanelGroup orientation="horizontal">

          <ResizablePanel defaultSize={20} minSize={14}>
            <div className="flex h-full flex-col border-r border-border bg-sidebar">
              <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
                {repo.data?.repository?.name ?? t("workspace.files")}
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
          <ResizablePanel defaultSize={30} minSize={20}>
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
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => explainMut.mutate()}
                  disabled={!selectedFileId || !providerValue || explainMut.isPending}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {explainMut.isPending ? t("workspace.explaining") : t("workspace.explain")}
                </Button>
              </div>
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as "human" | "technical")}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-2 pt-2">
                  <TabsList>
                    <TabsTrigger value="human">{t("workspace.tabs.human")}</TabsTrigger>
                    <TabsTrigger value="technical">{t("workspace.tabs.technical")}</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCopy}
                      disabled={!explanation}
                      aria-label={t("workspace.copy")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDownload}
                      disabled={!explanation}
                      aria-label={t("workspace.download")}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <TabsContent value="human" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <ExplanationView text={explanation} />
                </TabsContent>
                <TabsContent value="technical" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <ExplanationView text={explanation} />
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

function ExplanationView({ text }: { text: string }) {
  if (!text) {
    return <p className="text-sm text-muted-foreground">—</p>;
  }
  return (
    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</pre>
  );
}
