export type FolderFixPart = {
  path: string;
  diff: string;
  notes: string;
};

export function formatFolderFixActivityContent(parts: FolderFixPart[]): string {
  const combined = parts
    .filter((part) => part.diff)
    .map((part) => (part.diff.endsWith("\n") ? part.diff : part.diff + "\n"))
    .join("\n");
  const notesAll = parts
    .map((part) => `### ${part.path}\n${part.notes || "(no notes)"}`)
    .join("\n\n");

  return notesAll ? `${combined}\n${notesAll}`.trim() : combined;
}
