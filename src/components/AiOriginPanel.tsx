import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, Bot, User2, AlertTriangle, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { bucketColorClass, bucketize, type AiOriginBucket } from "@/lib/ai-origin";

export type RepoAiOriginResult = {
  repo_score: number;
  bucket: AiOriginBucket;
  distribution: { human: number; mixed: number; ai: number };
  per_file: Array<{
    file_id: string;
    path: string;
    score: number;
    summary: string;
    cached: boolean;
  }>;
  total_code_files: number;
  sampled_count: number;
  unsampled_count: number;
  errors: Array<{ path: string; message: string }>;
};

export function AiOriginPanel({
  result,
  isRunning,
  onRun,
  canRun,
}: {
  result: RepoAiOriginResult | null;
  isRunning: boolean;
  onRun: () => void;
  canRun: boolean;
}) {
  const { t } = useTranslation();

  if (!result && !isRunning) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">{t("aiOrigin.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("aiOrigin.intro")}</p>
        <p className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("aiOrigin.disclaimer")}
        </p>
        {canRun ? (
          <Button onClick={onRun} disabled={isRunning}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            {t("aiOrigin.run")}
          </Button>
        ) : (
          <div className="w-full space-y-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {t("aiOrigin.needsCloudLong")}
            </p>
            <p className="text-[11px] text-muted-foreground">{t("aiOrigin.needsCloud")}</p>
            <Button asChild size="sm" variant="secondary">
              <Link to="/settings" hash="byok">
                <KeyRound className="mr-2 h-4 w-4" />
                {t("aiOrigin.configureKey")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 animate-pulse text-primary" />
          <h3 className="text-base font-semibold">{t("aiOrigin.running")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("aiOrigin.runningHint")}</p>
        <Progress value={undefined} className="w-full" />
      </div>
    );
  }

  if (!result) return null;

  // Total scan failure: every sampled file errored (BYOK invalid, rate limit, network, etc.)
  if (result.sampled_count === 0 && result.errors.length > 0) {
    const first = result.errors[0];
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-base font-semibold">{t("aiOrigin.scanFailedTitle")}</h3>
        </div>
        <div className="w-full space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-xs font-medium text-destructive">
            {t("aiOrigin.scanFailedIntro", { count: result.errors.length })}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground break-all">
            {first.path}: {first.message}
          </p>
          <p className="text-[11px] text-muted-foreground">{t("aiOrigin.scanFailedHint")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link to="/settings" hash="byok">
              <KeyRound className="mr-2 h-4 w-4" />
              {t("aiOrigin.configureKey")}
            </Link>
          </Button>
          {canRun && (
            <Button size="sm" onClick={onRun} disabled={isRunning}>
              {t("aiOrigin.rerun")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const bucketLabel = t(`aiOrigin.bucket.${result.bucket}`);
  const colorCls = bucketColorClass(result.bucket);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("aiOrigin.repoScore")}
          </h3>
          <Button size="sm" variant="ghost" onClick={onRun} disabled={!canRun}>
            {t("aiOrigin.rerun")}
          </Button>
        </div>
        <div className="flex items-end gap-3">
          <div className="text-5xl font-bold tabular-nums">{result.repo_score}</div>
          <div className="pb-1.5">
            <span
              className={
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                colorCls
              }
            >
              {bucketLabel}
            </span>
          </div>
        </div>
        <Progress value={result.repo_score} className="h-2" />
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User2 className="h-3 w-3" /> {t("aiOrigin.human")}: {result.distribution.human}
          </span>
          <span>
            {t("aiOrigin.mixed")}: {result.distribution.mixed}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bot className="h-3 w-3" /> {t("aiOrigin.ai")}: {result.distribution.ai}
          </span>
          <span className="ml-auto">
            {t("aiOrigin.sampled", {
              sampled: result.sampled_count,
              total: result.total_code_files,
            })}
          </span>
        </div>
        {result.unsampled_count > 0 && (
          <p className="text-[11px] text-muted-foreground">
            {t("aiOrigin.unsampledNote", { count: result.unsampled_count })}
          </p>
        )}
        {result.errors.length > 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            {t("aiOrigin.partialErrors", { count: result.errors.length })}
          </p>
        )}
        <p className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          {t("aiOrigin.disclaimer")}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <ul className="divide-y divide-border">
          {result.per_file.map((f) => {
            const b = bucketize(f.score);
            return (
              <li key={f.file_id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-mono text-foreground">{f.path}</span>
                  <span
                    className={
                      "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums " +
                      bucketColorClass(b)
                    }
                  >
                    {f.score}
                  </span>
                </div>
                {f.summary && <p className="mt-1 text-xs text-muted-foreground">{f.summary}</p>}
              </li>
            );
          })}
          {result.per_file.length === 0 && (
            <li className="p-5 text-sm text-muted-foreground">{t("aiOrigin.noResults")}</li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}
