import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { listDrafts } from "@/lib/knowledge-engine.functions";

export const Route = createFileRoute("/_authenticated/admin/knowledge/drafts")({
  component: DraftsPage,
});

type Row = {
  id: string;
  slug: string;
  type: string;
  status: string;
  lang_default: string;
  updated_at: string;
  published_at: string | null;
};

function DraftsPage() {
  const matches = useMatches();
  const hasChild = matches.some((m) =>
    m.routeId.startsWith("/_authenticated/admin/knowledge/drafts/"),
  );
  if (hasChild) return <Outlet />;
  return <DraftsList />;
}

function DraftsList() {
  const list = useServerFn(listDrafts);
  const q = useQuery({ queryKey: ["knowledge-drafts"], queryFn: () => list(), retry: false });
  const rows = (q.data?.rows ?? []) as Row[];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Slug</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Lang</th>
            <th className="px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-xs">
                <Link
                  to="/admin/knowledge/drafts/$id"
                  params={{ id: r.id }}
                  className="hover:underline"
                >
                  {r.slug}
                </Link>
              </td>
              <td className="px-3 py-2">{r.type}</td>
              <td className="px-3 py-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{r.status}</span>
              </td>
              <td className="px-3 py-2">{r.lang_default}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {new Date(r.updated_at).toLocaleString()}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                {q.isLoading ? "Loading…" : "No drafts yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
