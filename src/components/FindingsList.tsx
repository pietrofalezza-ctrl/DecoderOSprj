import { ChevronRight } from "lucide-react";

import { compareFindings, severityBadgeClass, type Finding } from "@/lib/findings";
import { cn } from "@/lib/utils";

export function FindingsList({
  findings,
  onJump,
  emptyLabel,
  title,
}: {
  findings: Finding[];
  onJump?: (f: Finding) => void;
  emptyLabel?: string;
  title?: string;
}) {
  if (!findings.length) {
    return emptyLabel ? <p className="text-xs text-muted-foreground">{emptyLabel}</p> : null;
  }
  const sorted = [...findings].sort(compareFindings);
  return (
    <div className="space-y-2">
      {title && (
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}{" "}
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
            {findings.length}
          </span>
        </h4>
      )}
      <ul className="divide-y divide-border rounded-md border border-border">
        {sorted.map((f, i) => {
          const range =
            f.start_line === f.end_line ? `L${f.start_line}` : `L${f.start_line}–${f.end_line}`;
          return (
            <li key={i}>
              <button
                onClick={() => onJump?.(f)}
                className={cn(
                  "group flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-accent",
                  onJump ? "cursor-pointer" : "cursor-default",
                )}
                disabled={!onJump}
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    severityBadgeClass(f.severity),
                  )}
                >
                  {f.severity}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-medium text-foreground">{f.title}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                      {range}
                    </span>
                  </div>
                  {f.message && (
                    <p className="text-[11px] leading-snug text-muted-foreground">{f.message}</p>
                  )}
                </div>
                {onJump && (
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
