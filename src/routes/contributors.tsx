import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Github, GitMerge } from "lucide-react";

import { getContributors } from "@/lib/contributors.functions";
import { Logo } from "@/components/Logo";
import { InstagramIcon } from "@/components/InstagramLink";


const contributorsQuery = queryOptions({
  queryKey: ["contributors"],
  queryFn: () => getContributors(),
  staleTime: 10 * 60 * 1000,
});

export const Route = createFileRoute("/contributors")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contributorsQuery),
  head: () => ({
    meta: [
      { title: "Contributors — Decoder open-source AI code analysis" },
      {
        name: "description",
        content:
          "Everyone who has contributed to Decoder, the open-source AI code analysis tool. Auto-updated from GitHub: contributors, merged pull requests, and credits.",
      },
      {
        property: "og:title",
        content: "Contributors — Decoder open-source AI code analysis",
      },
      {
        property: "og:description",
        content:
          "Auto-updated list of Decoder contributors and merged pull requests on GitHub.",
      },
      { property: "og:url", content: "https://decoderead.dev/contributors" },
    ],
    links: [{ rel: "canonical", href: "https://decoderead.dev/contributors" }],
  }),
  component: ContributorsPage,
});

function ContributorsPage() {
  const { data } = useSuspenseQuery(contributorsQuery);
  const { t } = useTranslation();

  return (

    <div className="min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-30 border-b border-border/60 bg-background sm:bg-background/80 sm:backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link to="/" aria-label="Decoder" className="shrink-0">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Built in the open
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Contributors & merged pull requests
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground">
          Decoder is an MIT-licensed, non-profit project. This page is generated live from{" "}
          <a
            href={data.repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            github.com/{data.repo.owner}/{data.repo.name}
          </a>{" "}
          — every time a pull request is merged, it shows up here automatically.
        </p>

        {data.warning && (
          <p className="mt-6 border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {data.warning}
          </p>
        )}

        {/* Contributors grid */}
        <section className="mt-14">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight">
              People who shipped Decoder
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {data.contributors.length} contributor{data.contributors.length === 1 ? "" : "s"}
            </span>
          </div>
          {data.contributors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contributors loaded yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data.contributors.map((c) => (
                <li key={c.login}>
                  <a
                    href={c.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center gap-3 border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <img
                      src={c.avatarUrl}
                      alt={`${c.login} avatar`}
                      loading="lazy"
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full border border-border"
                    />
                    <span className="truncate text-sm font-medium group-hover:text-primary">
                      {c.login}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {c.contributions} commit{c.contributions === 1 ? "" : "s"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Merged PRs timeline */}
        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Merged pull requests
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {data.mergedPrs.length} merged
            </span>
          </div>
          {data.mergedPrs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No merged pull requests yet.</p>
          ) : (
            <ol className="divide-y divide-border border-y border-border">
              {data.mergedPrs.map((pr) => (
                <li key={pr.number} className="py-4">
                  <a
                    href={pr.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium group-hover:text-primary">
                          {pr.title}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">#{pr.number}</span>
                          {pr.author && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="inline-flex items-center gap-1.5">
                                <img
                                  src={pr.author.avatarUrl}
                                  alt=""
                                  width={16}
                                  height={16}
                                  loading="lazy"
                                  className="h-4 w-4 rounded-full"
                                />
                                {pr.author.login}
                              </span>
                            </>
                          )}
                          <span aria-hidden>·</span>
                          <time dateTime={pr.mergedAt}>
                            {new Date(pr.mergedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="mt-16 border-t border-border pt-8">
          <a
            href={data.repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Open the repository on GitHub
          </a>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Last refreshed {new Date(data.fetchedAt).toLocaleString()}
          </p>
        </div>
      </main>
    </div>
  );
}
