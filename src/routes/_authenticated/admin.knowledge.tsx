import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/admin/knowledge")({
  component: KnowledgeAdminLayout,
});

function KnowledgeAdminLayout() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Knowledge Engine</h1>
            <p className="text-sm text-muted-foreground">
              Editorial workspace — AI proposals, draft review, publishing.
            </p>
          </div>
          <nav className="flex flex-wrap gap-1 text-sm">
            {[
              { to: "/admin/knowledge", label: "Dashboard", exact: true },
              { to: "/admin/knowledge/opportunities", label: "Opportunities" },
              { to: "/admin/knowledge/drafts", label: "Drafts" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={l.exact ? { exact: true } : undefined}
                className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground bg-muted" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>
        <Outlet />
      </div>
    </AppShell>
  );
}
