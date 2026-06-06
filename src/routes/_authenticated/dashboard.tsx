import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, FolderGit2 } from "lucide-react";

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
import { createProject, listProjects } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const list = useServerFn(listProjects);
  const create = useServerFn(createProject);
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
      navigate({ to: "/_authenticated/projects/$projectId", params: { projectId: r.id } });
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

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data?.projects.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              {t("dashboard.empty")}
            </p>
          )}
          {projects.data?.projects.map((p) => (
            <Link
              key={p.id}
              to="/_authenticated/projects/$projectId"
              params={{ projectId: p.id }}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderGit2 className="h-4 w-4 text-primary" />
                {p.name}
              </div>
              {p.description && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {p.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
