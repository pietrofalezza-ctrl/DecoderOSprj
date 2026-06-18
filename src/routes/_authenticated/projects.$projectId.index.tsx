import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Bot,
  FileBadge2,
  FileText,
  Github,
  KeyRound,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProject, updateProjectAnalysisMode } from "@/lib/projects.functions";
import { createRepositoryFromZip, deleteRepository } from "@/lib/repos.functions";
import { importFromGitHub } from "@/lib/github.functions";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/projects/$projectId/")({
  component: ProjectPage,
});

type AnalysisMode = "static" | "llm" | "both";
type ActivityKind =
  | "llm_explanation"
  | "llm_quality_analysis"
  | "llm_security_analysis"
  | "llm_ai_origin_analysis"
  | "llm_folder_analysis"
  | "llm_fix_generation"
  | "static_scan"
  | "search_query";

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const projectFn = useServerFn(getProject);
  const updateModeFn = useServerFn(updateProjectAnalysisMode);
  const upload = useServerFn(createRepositoryFromZip);
  const removeRepo = useServerFn(deleteRepository);
  const importGh = useServerFn(importFromGitHub);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [ghOpen, setGhOpen] = useState(false);
  const [ghUrl, setGhUrl] = useState("");
  const [ghRef, setGhRef] = useState("");
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("both");

  const data = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectFn({ data: { id: projectId } }),
  });

  useEffect(() => {
    const nextMode = (data.data?.project?.analysis_mode as AnalysisMode | undefined) ?? "both";
    setAnalysisMode(nextMode);
  }, [data.data?.project?.analysis_mode]);

  const onPick = () => fileRef.current?.click();

  const modeMut = useMutation({
    mutationFn: (mode: AnalysisMode) =>
      updateModeFn({ data: { id: projectId, analysis_mode: mode } }),
    onSuccess: (_, mode) => {
      setAnalysisMode(mode);
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success(t("settings.saved"));
    },
    onError: (e) => toast.error(getErrorMessage(e, t("errors.generic"))),
  });

  const upMut = useMutation({
    mutationFn: async (file: File) => {
      const buf = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunk)));
      }
      const b64 = btoa(binary);
      return upload({
        data: {
          project_id: projectId,
          name: file.name.replace(/\.zip$/i, ""),
          zip_base64: b64,
        },
      });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      navigate({
        to: "/projects/$projectId/repos/$repoId",
        params: { projectId, repoId: r.repository_id },
      });
    },
    onError: (e) => toast.error(getErrorMessage(e, t("errors.generic"))),
    onSettled: () => setUploading(false),
  });

  const ghMut = useMutation({
    mutationFn: () =>
      importGh({
        data: {
          project_id: projectId,
          url: ghUrl.trim(),
          ref: ghRef.trim() || undefined,
        },
      }),
    onSuccess: (r) => {
      setGhOpen(false);
      setGhUrl("");
      setGhRef("");
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      navigate({
        to: "/projects/$projectId/repos/$repoId",
        params: { projectId, repoId: r.repository_id },
      });
    },
    onError: (e) => toast.error(getErrorMessage(e, t("errors.generic"))),
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    upMut.mutate(f);
    e.target.value = "";
  };

  const modeDescription = useMemo(() => {
    if (analysisMode === "static") return t("project.modeDescriptions.static");
    if (analysisMode === "llm") return t("project.modeDescriptions.llm");
    return t("project.modeDescriptions.both");
  }, [analysisMode, t]);

  const repositoryChartData = useMemo(
    () =>
      (data.data?.repositories ?? []).map((repo) => {
        const s = repo.static_scan_summary ?? {
          total: 0,
          pending: 0,
          scanning: 0,
          safe: 0,
          warn: 0,
          block: 0,
          entropySum: 0,
          entropyCount: 0,
          entropyWindowSum: 0,
          entropyWindowCount: 0,
          entropyWindowMax: 0,
        };
        return {
          name: repo.name,
          safe: s.safe ?? 0,
          warn: s.warn ?? 0,
          block: s.block ?? 0,
          pending: s.pending ?? 0,
          entropy:
            s.entropyCount && s.entropyCount > 0
              ? Number((s.entropySum / s.entropyCount).toFixed(2))
              : 0,
        };
      }),
    [data.data?.repositories],
  );

  const activityChartData = useMemo(() => {
    const counts = new Map<ActivityKind, number>();
    for (const item of data.data?.recent_activities ?? []) {
      counts.set(
        item.activity_kind as ActivityKind,
        (counts.get(item.activity_kind as ActivityKind) ?? 0) + 1,
      );
    }
    return Array.from(counts.entries()).map(([kind, count]) => ({
      kind,
      label: activityLabel(kind, t),
      count,
    }));
  }, [data.data?.recent_activities, t]);

  const metrics = data.data?.metrics;

  const staticChartConfig = {
    safe: { label: t("project.staticChart.safe"), color: "hsl(142 72% 45%)" },
    warn: { label: t("project.staticChart.warn"), color: "hsl(38 92% 50%)" },
    block: { label: t("project.staticChart.block"), color: "hsl(0 84% 60%)" },
    pending: { label: t("project.staticChart.pending"), color: "hsl(215 20% 65%)" },
  };

  const activityChartConfig = {
    count: { label: t("project.activityChart.count"), color: "hsl(221 83% 53%)" },
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">{data.data?.project?.name}</h1>
              {data.data?.project?.description && (
                <p className="max-w-3xl text-sm text-muted-foreground">
                  {data.data.project.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                {t("project.modeLabel")}:{" "}
                <span className="font-medium text-foreground">
                  {t(`project.modeOptions.${analysisMode}`)}
                </span>
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary">
                {modeDescription}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {t("project.modeLabel")}
              </Label>
              <Select
                value={analysisMode}
                onValueChange={(v) => modeMut.mutate(v as AnalysisMode)}
                disabled={modeMut.isPending}
              >
                <SelectTrigger className="mt-1 h-9 w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["static", "llm", "both"] as const).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {t(`project.modeOptions.${mode}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <input ref={fileRef} type="file" accept=".zip" hidden onChange={onFile} />
              <Button variant="outline" onClick={onPick} disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? t("project.uploading") : t("project.uploadZip")}
              </Button>
              <Dialog open={ghOpen} onOpenChange={setGhOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Github className="mr-2 h-4 w-4" />
                    {t("project.importGithub")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("project.importGithub")}</DialogTitle>
                    <DialogDescription>{t("project.importGithubDescription")}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="ghUrl">{t("project.githubUrl")}</Label>
                      <Input
                        id="ghUrl"
                        value={ghUrl}
                        onChange={(e) => setGhUrl(e.target.value)}
                        placeholder={t("project.githubUrlPlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ghRef">{t("project.githubRef")}</Label>
                      <Input
                        id="ghRef"
                        value={ghRef}
                        onChange={(e) => setGhRef(e.target.value)}
                        placeholder={t("project.githubRefPlaceholder")}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t("project.githubOnlyPublic")}</p>
                    <p className="text-xs text-muted-foreground">{t("project.retentionNotice")}</p>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => ghMut.mutate()}
                      disabled={ghMut.isPending || !ghUrl.trim()}
                    >
                      {ghMut.isPending ? t("project.importing") : t("project.import")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Sparkles className="h-4 w-4" />}
            label={t("project.metricProjects")}
            value={String(metrics?.repository_count ?? 0)}
            detail={t("project.metricProjectsBody")}
          />
          <MetricCard
            icon={<FileBadge2 className="h-4 w-4" />}
            label={t("project.metricFiles")}
            value={String(metrics?.total_files ?? 0)}
            detail={t("project.metricFilesBody")}
          />
          <MetricCard
            icon={<ShieldAlert className="h-4 w-4" />}
            label={t("project.metricStatic")}
            value={String(
              (metrics?.safe_files ?? 0) + (metrics?.warn_files ?? 0) + (metrics?.block_files ?? 0),
            )}
            detail={t("project.metricStaticBody")}
          />
          <MetricCard
            icon={<Bot className="h-4 w-4" />}
            label={
              analysisMode === "static" ? t("project.metricNoLlm") : t("project.metricRecentRuns")
            }
            value={
              analysisMode === "static"
                ? t("project.metricStaticOnly")
                : String(data.data?.recent_activities?.length ?? 0)
            }
            detail={
              analysisMode === "static"
                ? t("project.metricNoLlmBody")
                : t("project.metricRecentRunsBody")
            }
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("project.staticChart.title")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("project.staticChart.body")}</p>
            {analysisMode === "llm" ? (
              <div className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t("project.staticChart.llmOnly")}
              </div>
            ) : repositoryChartData.length > 0 ? (
              <ChartContainer config={staticChartConfig} className="mt-4 h-[320px] w-full">
                <BarChart
                  data={repositoryChartData}
                  layout="vertical"
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="safe" stackId="a" fill="var(--color-safe)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="warn" stackId="a" fill="var(--color-warn)" />
                  <Bar dataKey="block" stackId="a" fill="var(--color-block)" />
                  <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t("project.staticChart.empty")}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("project.activityChart.title")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("project.activityChart.body")}</p>
            {analysisMode === "static" ? (
              <div className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t("project.activityChart.staticOnly")}
              </div>
            ) : activityChartData.length > 0 ? (
              <ChartContainer config={activityChartConfig} className="mt-4 h-[320px] w-full">
                <BarChart
                  data={activityChartData}
                  layout="vertical"
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={170}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t("project.activityChart.empty")}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("project.activitiesTitle")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("project.activitiesBody")}</p>
            <div className="mt-4 space-y-2">
              {(data.data?.recent_activities ?? []).length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {t("project.activitiesEmpty")}
                </div>
              ) : (
                (data.data?.recent_activities ?? []).map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("project.repos")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("project.repoSectionBody")}</p>
            <div className="mt-4 space-y-2">
              {data.data?.repositories.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("project.noRepos")}</p>
              )}
              {data.data?.repositories.map((r) => {
                const summary = r.static_scan_summary ?? {
                  total: 0,
                  pending: 0,
                  scanning: 0,
                  safe: 0,
                  warn: 0,
                  block: 0,
                  entropySum: 0,
                  entropyCount: 0,
                  entropyWindowSum: 0,
                  entropyWindowCount: 0,
                  entropyWindowMax: 0,
                };
                return (
                  <div
                    key={r.id}
                    className="rounded-md border border-border bg-background p-3 text-sm transition-colors hover:border-primary/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {r.file_count} {t("project.filesLabel")}
                          {analysisMode !== "static" && r.source ? ` · ${r.source}` : ""}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1">
                        <StatusChip
                          label={`${summary.safe}`}
                          tone="green"
                          title={t("project.staticChart.safe")}
                        />
                        <StatusChip
                          label={`${summary.warn}`}
                          tone="amber"
                          title={t("project.staticChart.warn")}
                        />
                        <StatusChip
                          label={`${summary.block}`}
                          tone="red"
                          title={t("project.staticChart.block")}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" asChild>
                        <Link
                          to="/projects/$projectId/repos/$repoId"
                          params={{ projectId, repoId: r.id }}
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5" />
                          {t("project.openFiles")}
                        </Link>
                      </Button>
                      {analysisMode !== "static" && (
                        <Button size="sm" variant="secondary" asChild>
                          <Link
                            to="/projects/$projectId/repos/$repoId"
                            params={{ projectId, repoId: r.id }}
                            search={{ view: "analyze" }}
                          >
                            <ScanSearch className="mr-1.5 h-3.5 w-3.5" />
                            {t("project.analyzeCodebase")}
                          </Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={t("project.deleteRepo")}
                        title={t("project.deleteRepo")}
                        onClick={async () => {
                          if (!window.confirm(t("project.deleteRepoConfirm", { name: r.name })))
                            return;
                          try {
                            await removeRepo({ data: { id: r.id } });
                            qc.invalidateQueries({ queryKey: ["project", projectId] });
                            toast.success(t("project.deleteRepoDone"));
                          } catch (err) {
                            toast.error(getErrorMessage(err, t("errors.generic")));
                          }
                        }}
                        className="ml-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {analysisMode === "static" && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("project.staticOnlyRepoHint")}
                      </p>
                    )}
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {t("project.entropyLabel")}:{" "}
                      {summary.entropyCount > 0
                        ? (summary.entropySum / summary.entropyCount).toFixed(2)
                        : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function StatusChip({
  label,
  tone,
  title,
}: {
  label: string;
  tone: "green" | "amber" | "red";
  title: string;
}) {
  return (
    <span
      title={title}
      className={
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums " +
        (tone === "green"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : tone === "amber"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300")
      }
    >
      {label}
    </span>
  );
}

function ActivityRow({
  activity,
}: {
  activity: {
    id: string;
    created_at: string;
    activity_kind: string;
    status: string;
    provider: string | null;
    model: string | null;
    language: string | null;
    query_text: string | null;
    result_summary: string | null;
  };
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono">
          {activityLabel(activity.activity_kind as ActivityKind, t)}
        </span>
        <span
          className={
            "rounded-full border px-2 py-0.5 font-medium " +
            (activity.status === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
              : activity.status === "warn"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")
          }
        >
          {activity.status}
        </span>
        <span className="ml-auto text-muted-foreground">
          {new Date(activity.created_at).toLocaleString()}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium">{activity.result_summary ?? "—"}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {activity.query_text ? `${activity.query_text}` : "—"}
        {activity.provider ? ` · ${activity.provider}` : ""}
        {activity.model ? ` · ${activity.model}` : ""}
        {activity.language ? ` · ${activity.language}` : ""}
      </div>
    </div>
  );
}

function activityLabel(
  kind: ActivityKind,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (kind === "static_scan") return t("project.activityLabels.static_scan");
  if (kind === "search_query") return t("project.activityLabels.search_query");
  if (kind === "llm_folder_analysis") return t("project.activityLabels.llm_folder_analysis");
  if (kind === "llm_fix_generation") return t("project.activityLabels.llm_fix_generation");
  if (kind === "llm_ai_origin_analysis") return t("project.activityLabels.llm_ai_origin_analysis");
  if (kind === "llm_security_analysis") return t("project.activityLabels.llm_security_analysis");
  if (kind === "llm_quality_analysis") return t("project.activityLabels.llm_quality_analysis");
  return t("project.activityLabels.llm_explanation");
}
