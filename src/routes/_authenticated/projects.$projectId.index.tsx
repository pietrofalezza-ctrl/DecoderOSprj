import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Upload, Github, ScanSearch, Sparkles, Bot, ShieldAlert, FileText, Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProject } from "@/lib/projects.functions";
import { createRepositoryFromZip, deleteRepository } from "@/lib/repos.functions";
import { importFromGitHub } from "@/lib/github.functions";

export const Route = createFileRoute("/_authenticated/projects/$projectId/")({
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getProject);
  const upload = useServerFn(createRepositoryFromZip);
  const removeRepo = useServerFn(deleteRepository);
  const importGh = useServerFn(importFromGitHub);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [ghOpen, setGhOpen] = useState(false);
  const [ghUrl, setGhUrl] = useState("");
  const [ghRef, setGhRef] = useState("");

  const data = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => get({ data: { id: projectId } }),
  });

  const onPick = () => fileRef.current?.click();

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
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
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
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    upMut.mutate(f);
    e.target.value = "";
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{data.data?.project?.name}</h1>
            {data.data?.project?.description && (
              <p className="text-sm text-muted-foreground">{data.data.project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
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
                  <p className="text-xs text-muted-foreground">
                    {t("project.githubOnlyPublic")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("project.retentionNotice")}
                  </p>
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

        {/* Capability chips: surface what's possible BEFORE opening a repo */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <CapabilityChip
            icon={<Sparkles className="h-4 w-4" />}
            title={t("project.capabilityExplain")}
            body={t("project.capabilityExplainBody")}
          />
          <CapabilityChip
            icon={<ShieldAlert className="h-4 w-4" />}
            title={t("project.capabilityQuality")}
            body={t("project.capabilityQualityBody")}
          />
          <CapabilityChip
            icon={<Bot className="h-4 w-4" />}
            title={t("project.capabilityAiOrigin")}
            body={t("project.capabilityAiOriginBody")}
            accent
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t("project.howToHint")}</p>

        <h2 className="mt-8 text-sm font-medium text-muted-foreground">
          {t("project.repos")}
        </h2>
        <div className="mt-3 space-y-2">
          {data.data?.repositories.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("project.noRepos")}</p>
          )}
          {data.data?.repositories.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3 text-sm transition-colors hover:border-primary/60"
            >
              <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                <span className="font-medium truncate">{r.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{r.file_count} files</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" asChild>
                  <Link
                    to="/projects/$projectId/repos/$repoId"
                    params={{ projectId, repoId: r.id }}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    {t("project.openFiles")}
                  </Link>
                </Button>
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
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={t("project.deleteRepo")}
                  title={t("project.deleteRepo")}
                  onClick={async () => {
                    if (!window.confirm(t("project.deleteRepoConfirm", { name: r.name }))) return;
                    try {
                      await removeRepo({ data: { id: r.id } });
                      qc.invalidateQueries({ queryKey: ["project", projectId] });
                      toast.success(t("settings.deleteDone"));
                    } catch (err: any) {
                      toast.error(err?.message ?? t("errors.generic"));
                    }
                  }}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function CapabilityChip({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border p-3 " +
        (accent
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card")
      }
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className={accent ? "text-primary" : "text-foreground"}>{icon}</span>
        {title}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
