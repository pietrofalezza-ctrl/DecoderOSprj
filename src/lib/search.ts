export type SearchableFile = {
  id: string;
  path: string;
  language: string | null;
};

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

export function filterFilesBySearch<T extends SearchableFile>(files: T[], query: string): T[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return files;

  const tokens = normalized.split(" ");
  return files.filter((file) => {
    const haystack = `${file.path} ${file.language ?? ""}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

export function shouldPersistSearchQuery(
  query: string,
  lastPersistedQuery: string | null,
): boolean {
  const normalized = normalizeSearchQuery(query);
  return normalized.length >= 2 && normalized !== lastPersistedQuery;
}
