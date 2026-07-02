import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Download, Search } from "lucide-react";

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
import { listConsents, exportConsentsCsv } from "@/lib/admin-consents.functions";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/consents")({
  component: AdminConsentsPage,
});

type Filters = {
  search: string;
  type: string;
  from: string;
  to: string;
};

const DEFAULT_FILTERS: Filters = { search: "", type: "all", from: "", to: "" };

function AdminConsentsPage() {
  const navigate = useNavigate();
  const list = useServerFn(listConsents);
  const exportCsv = useServerFn(exportConsentsCsv);
  const [forbidden, setForbidden] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

  const payload = useMemo(() => {
    const p: Record<string, unknown> = { limit: 200, offset: 0 };
    if (applied.search.trim()) p.search = applied.search.trim();
    if (applied.type && applied.type !== "all") p.type = applied.type;
    if (applied.from) p.from = new Date(applied.from).toISOString();
    if (applied.to) p.to = new Date(applied.to).toISOString();
    return p;
  }, [applied]);

  const consents = useQuery({
    queryKey: ["admin-consents", payload],
    queryFn: () => list({ data: payload }),
    retry: false,
  });

  useEffect(() => {
    const msg = consents.error instanceof Error ? consents.error.message : "";
    if (msg.toLowerCase().includes("forbidden")) setForbidden(true);
  }, [consents.error]);

  const exportMut = useMutation({
    mutationFn: () => exportCsv({ data: payload }),
    onSuccess: ({ csv, count }) => {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decoder-consents-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${count} consent record(s).`);
    },
    onError: (e) => toast.error(getErrorMessage(e, "Export failed")),
  });

  if (forbidden) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl p-6 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold">Admin only</h1>
          <p className="mt-1 text-sm text-muted-foreground">You don't have access to this area.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
            Go home
          </Button>
        </div>
      </AppShell>
    );
  }

  const rows = consents.data?.rows ?? [];
  const total = consents.data?.total ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Consent records</h1>
            <p className="text-sm text-muted-foreground">
              Audit log of every BYOK / onboarding acknowledgement, with versioned terms, language,
              IP and user-agent. Read-only — for compliance and authority requests.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <a href="/admin">← Back to admin</a>
          </Button>
        </header>

        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="search" className="text-xs">
                Search (email or user id)
              </Label>
              <Input
                id="search"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select
                value={filters.type}
                onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="onboarding">onboarding</SelectItem>
                  <SelectItem value="byok">byok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from" className="text-xs">
                From
              </Label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to" className="text-xs">
                To
              </Label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setApplied(filters)}>
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Apply filters
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  setApplied(DEFAULT_FILTERS);
                }}
              >
                Reset
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportMut.mutate()}
              disabled={exportMut.isPending || rows.length === 0}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {exportMut.isPending ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Records
            </h2>
            <span className="text-xs text-muted-foreground">
              {consents.isLoading ? "Loading…" : `${rows.length} shown · ${total} total`}
            </span>
          </div>
          {rows.length === 0 && !consents.isLoading ? (
            <p className="text-xs text-muted-foreground">No consent records match the filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1.5 pr-3">When</th>
                    <th className="py-1.5 pr-3">Email</th>
                    <th className="py-1.5 pr-3">Type</th>
                    <th className="py-1.5 pr-3">Version</th>
                    <th className="py-1.5 pr-3">Lang</th>
                    <th className="py-1.5 pr-3">IP</th>
                    <th className="py-1.5 pr-3">User-Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border align-top">
                      <td className="py-1.5 pr-3 text-muted-foreground whitespace-nowrap">
                        {new Date(r.accepted_at).toLocaleString()}
                      </td>
                      <td className="py-1.5 pr-3">
                        <div className="font-medium">{r.email ?? "—"}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {r.user_id.slice(0, 8)}…
                        </div>
                      </td>
                      <td className="py-1.5 pr-3 font-mono">{r.acknowledgement_type}</td>
                      <td className="py-1.5 pr-3 font-mono">{r.accepted_terms_version}</td>
                      <td className="py-1.5 pr-3 uppercase text-muted-foreground">
                        {r.accepted_language}
                      </td>
                      <td className="py-1.5 pr-3 font-mono text-muted-foreground">
                        {r.ip_address ?? "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-muted-foreground max-w-[260px] truncate">
                        {r.user_agent ?? "—"}
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
