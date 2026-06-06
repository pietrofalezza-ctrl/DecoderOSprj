import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { FileTree } from "@/components/FileTree";
import { CodeViewer } from "@/components/CodeViewer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { explainFile } from "@/lib/explain.functions";

type Provider = "openai" | "anthropic" | "gemini" | "openrouter";
type Proficiency = "nontech" | "junior" | "intermediate" | "senior" | "architect" | "cto";

export const Route = createFileRoute("/_authenticated/projects/$projectId/repos/$repoId")({
  component: WorkspacePage,
});

function WorkspacePage() {
  const { repoId } = Route.useParams();
  const { t, i18n } = useTranslation();
  const getRepo = useServerFn(getRepository);
  const getContent = useServerFn(getFileContent);
  const providers = useServerFn(listProviders);
  const explain = useServerFn(explainFile);

  const repo = useQuery({ queryKey: ["repo", repoId], queryFn: () => getRepo({ data: { id: repoId } }) });
  const provs = useQuery({ queryKey: ["providers"], queryFn: () => providers() });

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [proficiency, setProficiency] = useState<Proficiency>("intermediate");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [tab, setTab] = useState<"human" | "technical">("human");
  const [explanation, setExplanation] = useState<string>("");

  useEffect(() => {
    if (provider) return;
    const first = provs.data?.keys?.[0]?.provider as Provider | undefined;
    if (first) setProvider(first);
  }, [provs.data, provider]);

  const fileQ = useQuery({
    enabled: !!selectedFileId,
    queryKey: ["file", selectedFileId],
    queryFn: () => getContent({ data: { file_id: selectedFileId! } }),
  });

  // Clear explanation when file/type/level changes
  useEffect(() => {
    setExplanation("");
  }, [selectedFileId, tab, proficiency]);

  const explainMut = useMutation({
    mutationFn: async () => {
      if (!selectedFileId || !provider) throw new Error("missing");
      return explain({
        data: {
          file_id: selectedFileId,
          provider,
          proficiency,
          explanation_type: tab,
          language: (i18n.resolvedLanguage as "en" | "it" | "zh") || "en",
        },
      });
    },
    onSuccess: (r) => setExplanation(r.content),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const hasAnyProvider = (provs.data?.keys?.length ?? 0) > 0;

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanelGroup direction="horizontal">
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
              <div className="border-b border-border p-3 space-y-2">
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
                      value={provider ?? ""}
                      onValueChange={(v) => setProvider(v as Provider)}
                      disabled={!hasAnyProvider}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {provs.data?.keys.map((k) => (
                          <SelectItem key={k.provider} value={k.provider}>
                            {t(`settings.providers.${k.provider}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!hasAnyProvider && (
                  <p className="text-xs text-muted-foreground">{t("workspace.noProvider")}</p>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => explainMut.mutate()}
                  disabled={!selectedFileId || !provider || explainMut.isPending}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {explainMut.isPending ? t("workspace.explaining") : t("workspace.explain")}
                </Button>
              </div>
              <Tabs value={tab} onValueChange={(v) => setTab(v as "human" | "technical")} className="flex flex-1 flex-col overflow-hidden">
                <TabsList className="m-2 self-start">
                  <TabsTrigger value="human">{t("workspace.tabs.human")}</TabsTrigger>
                  <TabsTrigger value="technical">{t("workspace.tabs.technical")}</TabsTrigger>
                </TabsList>
                <TabsContent value="human" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <ExplanationView text={explanation} />
                </TabsContent>
                <TabsContent value="technical" className="m-0 flex-1 overflow-auto px-4 pb-4">
                  <ExplanationView text={explanation} />
                </TabsContent>
              </Tabs>
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
