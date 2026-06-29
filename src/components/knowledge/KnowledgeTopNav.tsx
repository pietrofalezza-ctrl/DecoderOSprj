import { Link } from "@tanstack/react-router";
import { Home, ArrowLeft } from "lucide-react";

export function KnowledgeTopNav() {
  return (
    <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:text-primary"
          aria-label="Decoder — back to homepage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Decoder</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            Home
          </Link>
          <Link
            to="/knowledge"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground bg-muted" }}
            activeOptions={{ exact: true }}
          >
            Knowledge
          </Link>
          <Link
            to="/docs"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            to="/app"
            className="ml-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open app
          </Link>
        </nav>
      </div>
    </div>
  );
}
