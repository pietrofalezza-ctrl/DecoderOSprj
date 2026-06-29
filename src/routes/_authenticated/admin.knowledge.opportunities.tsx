import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  listOpportunities,
  updateOpportunity,
  convertOpportunityToDraft,
} from "@/lib/knowledge-engine.functions";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/knowledge/opportunities")({
  component: OpportunitiesPage,
});

type Row = {
  id: string;
  title: string;
  rationale: string | null;
  suggested_slug: string | null;
  suggested_type: string | null;
  keywords: string[] | null;
  priority: number | null;
  status: string;
  generated_from: { raw?: { draft_body_md?: string } } | null;
};

function OpportunitiesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const list = useServerFn(listOpportunities);
  const update = useServerFn(updateOpportunity);
  const convert = useServerFn(convertOpportunityToDraft);

  const q = useQuery({
    queryKey: ["knowledge-opps"],
    queryFn: () => list({ data: {} }),
    retry: false,
  });

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status: "accepted" | "dismissed" }) =>
      update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-opps"] }),
    onError: (e) => toast.error(getErrorMessage(e, "Failed")),
  });

  const convertMut = useMutation({
    mutationFn: (v: { id: string; body_md: string }) => convert({ data: v }),
    onSuccess: (r) => {
      toast.success("Draft created.");
      qc.invalidateQueries({ queryKey: ["knowledge-opps"] });
      navigate({ to: "/admin/knowledge/drafts/$id", params: { id: r.entry_id } });
    },
    onError: (e) => toast.error(getErrorMessage(e, "Convert failed")),
  });

  const rows = (q.data?.rows ?? []) as Row[];

  return (
    <div className="space-y-4">
      {q.isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
      {rows.length === 0 && !q.isLoading && (
        <p className="text-xs text-muted-foreground">No opportunities yet.</p>
      )}
      {rows.map((r) => (
        <article key={r.id} className="space-y-2 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium">{r.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.suggested_type ?? "—"} · /{r.suggested_slug ?? "?"} · status:{" "}
                <span className="font-mono">{r.status}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                onClick={() =>
                  convertMut.mutate({
                    id: r.id,
                    body_md: r.generated_from?.raw?.draft_body_md ?? "",
                  })
                }
                disabled={r.status === "converted"}
              >
                Create draft
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateMut.mutate({ id: r.id, status: "dismissed" })}
              >
                Dismiss
              </Button>
            </div>
          </div>
          {r.rationale && <p className="text-sm text-muted-foreground">{r.rationale}</p>}
          {(r.keywords ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(r.keywords ?? []).map((k) => (
                <span key={k} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{k}</span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
