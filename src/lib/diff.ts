/** Extract the first ```diff fenced block from a model response; falls back to the full text. */
export function extractDiffBlock(text: string): string {
  if (!text) return "";
  const m = text.match(/```diff\s*([\s\S]*?)```/i);
  return (m?.[1] ?? text).trim();
}

export function extractNotes(text: string): string {
  if (!text) return "";
  const idx = text.search(/```diff/i);
  if (idx < 0) return "";
  const after = text.slice(idx);
  const closing = after.indexOf("```", 5);
  if (closing < 0) return "";
  return after.slice(closing + 3).trim();
}
