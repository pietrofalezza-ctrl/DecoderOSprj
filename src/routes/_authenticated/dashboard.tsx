import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, FolderGit2, Sparkles, KeyRound, Cpu, Download, Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProject, deleteProject, listProjects } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const list = useServerFn(listProjects);
  const create = useServerFn(createProject);
  const remove = useServerFn(deleteProject);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const projects = useQuery({ queryKey: ["projects"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: async () => create({ data: { name: name.trim(), description: desc.trim() || undefined } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      setDesc("");
      navigate({ to: "/projects/$projectId", params: { projectId: r.id } });
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("dashboard.newProject")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("dashboard.newProject")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t("dashboard.projectNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Textarea
                  placeholder={t("dashboard.projectDescPlaceholder")}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={!name.trim() || mut.isPending}
                  onClick={() => mut.mutate()}
                >
                  {t("dashboard.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <section className="mt-6 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("howToUse.title")}</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("howToUse.intro")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <KeyRound className="h-4 w-4" />
                {t("howToUse.byokTitle")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("howToUse.byokBody")}</p>
              <Link
                to="/settings"
                hash="byok"
                className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
              >
                {t("howToUse.byokCta")} →
              </Link>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Cpu className="h-4 w-4 text-primary" />
                {t("howToUse.localTitle")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("howToUse.localBody")}</p>
              <Link
                to="/settings"
                className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
              >
                {t("howToUse.localCta")} →
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-2 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            <Download className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p>
              <span className="font-medium text-foreground">{t("howToUse.installTitle")}: </span>
              {t("howToUse.installBody")}
            </p>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data?.projects.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              {t("dashboard.empty")}
            </p>
          )}
          {projects.data?.projects.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60"
            >
              <Link
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                className="block"
              >
                <div className="flex items-center gap-2 pr-8 text-sm font-medium">
                  <FolderGit2 className="h-4 w-4 text-primary" />
                  <span className="truncate">{p.name}</span>
                </div>
                {p.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                )}
              </Link>
              <button
                type="button"
                aria-label={t("dashboard.deleteProject")}
                title={t("dashboard.deleteProject")}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!window.confirm(t("dashboard.deleteProjectConfirm", { name: p.name }))) return;
                  try {
                    await remove({ data: { id: p.id } });
                    qc.invalidateQueries({ queryKey: ["projects"] });
                    toast.success(t("settings.deleteDone"));
                  } catch (err: any) {
                    toast.error(err?.message ?? t("errors.generic"));
                  }
                }}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
