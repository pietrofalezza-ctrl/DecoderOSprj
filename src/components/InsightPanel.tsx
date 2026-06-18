import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, MapPin, MessageSquarePlus, Sparkles, Wrench } from "lucide-react";

import {
  categoryBadgeClass,
  compareFindings,
  severityBadgeClass,
  type Finding,
  type InsightCategory,
  type UnmappedInsight,
} from "@/lib/findings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InsightAction =
  | { kind: "show"; finding: Finding }
  | { kind: "explain"; finding: Finding }
  | { kind: "comment"; finding: Finding }
  | { kind: "patch"; finding: Finding };

type Props = {
  findings: Finding[];
  unmapped?: UnmappedInsight[];
  activeId?: string | null;
  onAction?: (action: InsightAction) => void;
  emptyLabel?: string;
  canPatch?: boolean;
  defaultCategory?: InsightCategory;
};

const ALL_CATEGORIES: InsightCategory[] = [
  "summary",
  "quality",
  "security",
  "architecture",
  "ai_origin",
  "comment",
];

export function InsightPanel({
  findings,
  unmapped = [],
  activeId,
  onAction,
  emptyLabel,
  canPatch,
  defaultCategory,
}: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<InsightCategory | "all">("all");

  const enriched = useMemo(
    () =>
      findings.map((f) => ({
        ...f,
        category: f.category ?? defaultCategory,
      })),
    [findings, defaultCategory],
  );
  const enrichedUnmapped = useMemo(
    () =>
      unmapped.map((u) => ({
        ...u,
        category: u.category ?? defaultCategory,
      })),
    [unmapped, defaultCategory],
  );

  const presentCategories = useMemo(() => {
    const set = new Set<InsightCategory>();
    enriched.forEach((f) => f.category && set.add(f.category));
    enrichedUnmapped.forEach((u) => u.category && set.add(u.category));
    return ALL_CATEGORIES.filter((c) => set.has(c));
  }, [enriched, enrichedUnmapped]);

  const visibleFindings = useMemo(() => {
    const list = filter === "all" ? enriched : enriched.filter((f) => f.category === filter);
    return [...list].sort(compareFindings);
  }, [enriched, filter]);

  const visibleUnmapped = useMemo(() => {
    return filter === "all"
      ? enrichedUnmapped
      : enrichedUnmapped.filter((u) => u.category === filter);
  }, [enrichedUnmapped, filter]);

  const total = findings.length + unmapped.length;

  if (total === 0) {
    return emptyLabel ? <p className="text-xs text-muted-foreground">{emptyLabel}</p> : null;
  }

  return (
    <div className="space-y-3">
      {/* Outline header */}
      <div className="rounded-md border border-border bg-card/40 p-2.5">
        <p className="text-[11px] text-muted-foreground">
          {t("insights.outline.summary", {
            total,
            mapped: findings.length,
            unmapped: unmapped.length,
          })}
        </p>
        {presentCategories.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <FilterChip
              label={t("insights.filter.all")}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {presentCategories.map((c) => (
              <FilterChip
                key={c}
                label={t(`insights.category.${c}`)}
                active={filter === c}
                onClick={() => setFilter(c)}
                className={categoryBadgeClass(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mapped insights */}
      {visibleFindings.length > 0 && (
        <ul className="space-y-2">
          {visibleFindings.map((f, i) => (
            <InsightCard
              key={f.id ?? `f-${i}-${f.start_line}`}
              finding={f}
              active={!!f.id && f.id === activeId}
              onAction={onAction}
              canPatch={canPatch}
            />
          ))}
        </ul>
      )}

      {/* Unmapped (file-level) */}
      {visibleUnmapped.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("insights.unmapped.title")}
          </h4>
          <ul className="space-y-2">
            {visibleUnmapped.map((u, i) => (
              <UnmappedCard key={u.id ?? `u-${i}`} insight={u} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
        className && !active && "opacity-80",
      )}
    >
      {label}
    </button>
  );
}

function InsightCard({
  finding,
  active,
  onAction,
  canPatch,
}: {
  finding: Finding;
  active: boolean;
  onAction?: (a: InsightAction) => void;
  canPatch?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const cat = finding.category ?? "summary";
  const range =
    finding.start_line === finding.end_line
      ? `${finding.start_line}`
      : `${finding.start_line}–${finding.end_line}`;
  const isLong = finding.message.length > 220;
  const showFull = expanded || !isLong;

  return (
    <li
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-md border bg-card p-2.5 transition",
        active
          ? "border-primary/60 ring-1 ring-primary/40"
          : "border-border hover:border-muted-foreground/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            categoryBadgeClass(cat),
          )}
        >
          {t(`insights.category.${cat}`)}
        </span>
        {finding.severity && finding.severity !== "info" && (
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              severityBadgeClass(finding.severity),
            )}
          >
            {t(`insights.severity.${finding.severity}`)}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {t("insights.lineRange", { range })}
        </span>
      </div>
      <h5 className="mt-1.5 text-xs font-semibold text-foreground">{finding.title}</h5>
      {finding.message && (
        <p className="mt-1 whitespace-pre-wrap text-[11px] leading-snug text-muted-foreground">
          {showFull ? finding.message : finding.message.slice(0, 220) + "…"}
        </p>
      )}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              {t("insights.collapse")}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              {t("insights.expand")}
            </>
          )}
        </button>
      )}
      {finding.suggested_action && (
        <p className="mt-1 rounded border border-dashed border-border bg-muted/30 px-2 py-1 text-[10px] text-foreground">
          <span className="font-semibold">{t("insights.suggestedAction")}: </span>
          {finding.suggested_action}
        </p>
      )}
      {onAction && (
        <div className="mt-2 flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-[10px]"
            onClick={() => onAction({ kind: "show", finding })}
          >
            <MapPin className="mr-1 h-3 w-3" />
            {t("insights.actions.show")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px]"
            onClick={() => onAction({ kind: "explain", finding })}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            {t("insights.actions.explain")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px]"
            onClick={() => onAction({ kind: "comment", finding })}
          >
            <MessageSquarePlus className="mr-1 h-3 w-3" />
            {t("insights.actions.comment")}
          </Button>
          {canPatch && (cat === "quality" || cat === "security") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px]"
              onClick={() => onAction({ kind: "patch", finding })}
            >
              <Wrench className="mr-1 h-3 w-3" />
              {t("insights.actions.patch")}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function UnmappedCard({ insight }: { insight: UnmappedInsight }) {
  const { t } = useTranslation();
  const cat = insight.category ?? "summary";
  return (
    <li className="rounded-md border border-dashed border-border bg-muted/20 p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            categoryBadgeClass(cat),
          )}
        >
          {t(`insights.category.${cat}`)}
        </span>
        <span className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {t("insights.fileLevel")}
        </span>
      </div>
      <h5 className="mt-1.5 text-xs font-semibold text-foreground">{insight.title}</h5>
      {insight.message && (
        <p className="mt-1 whitespace-pre-wrap text-[11px] leading-snug text-muted-foreground">
          {insight.message}
        </p>
      )}
      {insight.reason_not_mapped && (
        <p className="mt-1 text-[10px] italic text-muted-foreground/80">
          {t("insights.reasonNotMapped")}: {insight.reason_not_mapped}
        </p>
      )}
    </li>
  );
}
