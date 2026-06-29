import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, RotateCw, AlertTriangle, Download } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { listMaintenanceAudit, rescheduleMaintenanceCron } from "@/lib/maintenance.functions";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type AuditEntry = {
  id: string;
  job_name: string;
  request_id: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  stats: Record<string, unknown> | null;
  error: string | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listMaintenanceAudit);
  const reschedule = useServerFn(rescheduleMaintenanceCron);
  const [forbidden, setForbidden] = useState(false);

  const audit = useQuery({
    queryKey: ["maintenance-audit"],
    queryFn: () => list(),
    retry: false,
  });

  useEffect(() => {
    const msg = audit.error instanceof Error ? audit.error.message : "";
    if (msg.toLowerCase().includes("forbidden")) setForbidden(true);
  }, [audit.error]);

  const rotateMut = useMutation({
    mutationFn: () => reschedule({ data: { job: "cleanup-stale-repositories" } }),
    onSuccess: () => {
      toast.success("Cron job rescheduled with the current secret.");
      qc.invalidateQueries({ queryKey: ["maintenance-audit"] });
    },
    onError: (e) => toast.error(getErrorMessage(e, "Reschedule failed")),
  });

  if (forbidden) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl p-6 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold">Admin only</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You don't have access to this area.
          </p>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>Go home</Button>
        </div>
      </AppShell>
    );
  }

  const entries = (audit.data?.entries ?? []) as AuditEntry[];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <header>
          <h1 className="text-xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Maintenance jobs, audit log, and cron-secret rotation.
          </p>
        </header>

        <section className="space-y-3 rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Rotate CLEANUP_CRON_SECRET
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                1. Open Lovable Cloud → Backend → Secrets and update
                {" "}<code className="rounded bg-muted px-1">CLEANUP_CRON_SECRET</code>{" "}
                with a fresh random value (48+ chars).
                <br />
                2. Click <em>Reschedule now</em> — the cron job will be re-registered with
                the new bearer (the secret value never leaves the backend).
              </p>
            </div>
            <Button
              onClick={() => rotateMut.mutate()}
              disabled={rotateMut.isPending}
              size="sm"
            >
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              {rotateMut.isPending ? "Rescheduling…" : "Reschedule now"}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Maintenance audit log
          </h2>
          {audit.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">No runs recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1.5 pr-3">When</th>
                    <th className="py-1.5 pr-3">Job</th>
                    <th className="py-1.5 pr-3">Status</th>
                    <th className="py-1.5 pr-3">Duration</th>
                    <th className="py-1.5 pr-3">Stats</th>
                    <th className="py-1.5 pr-3">Request</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="py-1.5 pr-3 text-muted-foreground">
                        {new Date(e.started_at).toLocaleString()}
                      </td>
                      <td className="py-1.5 pr-3 font-mono">{e.job_name}</td>
                      <td className="py-1.5 pr-3">
                        {e.status === "ok" ? (
                          <span className="text-emerald-600 dark:text-emerald-400">ok</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> error
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 text-muted-foreground">
                        {e.duration_ms != null ? `${e.duration_ms} ms` : "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-muted-foreground">
                        {e.stats ? JSON.stringify(e.stats) : "—"}
                      </td>
                      <td className="py-1.5 pr-3 font-mono text-[10px] text-muted-foreground">
                        {e.request_id ? e.request_id.slice(0, 8) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
