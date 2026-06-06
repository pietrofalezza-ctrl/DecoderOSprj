import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { getProject } from "@/lib/projects.functions";
import { createRepositoryFromZip } from "@/lib/repos.functions";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getProject);
  const upload = useServerFn(createRepositoryFromZip);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const data = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => get({ data: { id: projectId } }),
  });

  const onPick = () => fileRef.current?.click();

  const upMut = useMutation({
    mutationFn: async (file: File) => {
      const buf = new Uint8Array(await file.arrayBuffer());
      // base64 encode (chunked)
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
        to: "/_authenticated/projects/$projectId/repos/$repoId",
        params: { projectId, repoId: r.repository_id },
      });
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
    onSettled: () => setUploading(false),
  });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    upMut.mutate(f);
    e.target.value = "";
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{data.data?.project?.name}</h1>
            {data.data?.project?.description && (
              <p className="text-sm text-muted-foreground">{data.data.project.description}</p>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              hidden
              onChange={onFile}
            />
            <Button onClick={onPick} disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? t("project.uploading") : t("project.uploadZip")}
            </Button>
          </div>
        </div>

        <h2 className="mt-8 text-sm font-medium text-muted-foreground">
          {t("project.repos")}
        </h2>
        <div className="mt-3 space-y-2">
          {data.data?.repositories.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("project.noRepos")}</p>
          )}
          {data.data?.repositories.map((r) => (
            <Link
              key={r.id}
              to="/_authenticated/projects/$projectId/repos/$repoId"
              params={{ projectId, repoId: r.id }}
              className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-sm hover:border-primary/60"
            >
              <span>{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.file_count} files</span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
