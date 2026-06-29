import { createServerFn } from "@tanstack/react-start";

export type Contributor = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
};

export type MergedPr = {
  number: number;
  title: string;
  htmlUrl: string;
  mergedAt: string;
  author: { login: string; avatarUrl: string; htmlUrl: string } | null;
};

export type ContributorsData = {
  repo: { owner: string; name: string; htmlUrl: string };
  contributors: Contributor[];
  mergedPrs: MergedPr[];
  fetchedAt: string;
  warning?: string;
};

const OWNER = "pietrofalezza-ctrl";
const REPO = "DecoderOSprj";
const TTL_MS = 10 * 60 * 1000;

let cache: { at: number; data: ContributorsData } | null = null;

async function ghFetch(path: string, token: string | undefined) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "decoderead-dev",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!r.ok) throw new Error(`GitHub ${path} ${r.status}`);
  return r.json();
}

export const getContributors = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContributorsData> => {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

    const token = process.env.GITHUB_TOKEN;
    const repoMeta = {
      owner: OWNER,
      name: REPO,
      htmlUrl: `https://github.com/${OWNER}/${REPO}`,
    };

    try {
      const [contribRaw, prsRaw] = await Promise.all([
        ghFetch(`/repos/${OWNER}/${REPO}/contributors?per_page=100`, token),
        ghFetch(
          `/repos/${OWNER}/${REPO}/pulls?state=closed&per_page=100&sort=updated&direction=desc`,
          token,
        ),
      ]);

      const contributors: Contributor[] = (contribRaw as Array<Record<string, unknown>>)
        .filter((c) => c.type !== "Bot")
        .map((c) => ({
          login: String(c.login),
          avatarUrl: String(c.avatar_url),
          htmlUrl: String(c.html_url),
          contributions: Number(c.contributions ?? 0),
        }));

      const mergedPrs: MergedPr[] = (prsRaw as Array<Record<string, unknown>>)
        .filter((p) => p.merged_at)
        .map((p) => {
          const u = p.user as Record<string, unknown> | null;
          return {
            number: Number(p.number),
            title: String(p.title),
            htmlUrl: String(p.html_url),
            mergedAt: String(p.merged_at),
            author: u
              ? {
                  login: String(u.login),
                  avatarUrl: String(u.avatar_url),
                  htmlUrl: String(u.html_url),
                }
              : null,
          };
        })
        .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));

      const data: ContributorsData = {
        repo: repoMeta,
        contributors,
        mergedPrs,
        fetchedAt: new Date().toISOString(),
      };
      cache = { at: Date.now(), data };
      return data;
    } catch (err) {
      console.error("[contributors] github fetch failed", err);
      if (cache) return { ...cache.data, warning: "GitHub temporarily unavailable — showing cached data." };
      return {
        repo: repoMeta,
        contributors: [],
        mergedPrs: [],
        fetchedAt: new Date().toISOString(),
        warning: "GitHub temporarily unavailable.",
      };
    }
  },
);
