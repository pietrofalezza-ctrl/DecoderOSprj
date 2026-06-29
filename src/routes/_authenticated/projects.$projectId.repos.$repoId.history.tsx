import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, History } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { HistoryTimeline, type HistoryActivity } from "@/components/HistoryTimeline";
import { listRepositoryAnalysisHistory } from "@/lib/analysis-history.functions";

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/repos/$repoId/history",
)({
  component: RepoHistoryPage,
});

function RepoHistoryPage() {
  const { projectId, repoId } = Route.useParams();
  const { t } = useTranslation();
  const listFn = useServerFn(listRepositoryAnalysisHistory);
  const [kind, setKind] = useState<string>("");

  const q = useInfiniteQuery({
    queryKey: ["repo-history", repoId, kind],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      listFn({
        data: {
          repository_id: repoId,
          limit: 30,
          cursor: pageParam,
          kind: kind || undefined,
        },
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const activities = useMemo<HistoryActivity[]>(
    () => (q.data?.pages ?? []).flatMap((p) => p.activities as HistoryActivity[]),
    [q.data],
  );

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/_authenticated/projects/$projectId/repos/$repoId"
              params={{ projectId, repoId }}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("history.backToWorkspace")}
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <History className="h-5 w-5" />
            {t("history.repoTitle")}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{t("history.repoSubtitle")}</p>

        <div className="flex-1 overflow-hidden rounded-md border border-border bg-card">
          <HistoryTimeline
            activities={activities}
            loading={q.isLoading}
            emptyHint={t("history.empty")}
            nextCursor={q.hasNextPage ? "more" : null}
            onLoadMore={() => q.fetchNextPage()}
            loadingMore={q.isFetchingNextPage}
            kind={kind}
            onKindChange={setKind}
          />
        </div>
      </div>
    </AppShell>
  );
}
