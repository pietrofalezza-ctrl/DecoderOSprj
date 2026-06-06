// Browser-side calls to local LLM endpoints. Source code never leaves the
// user's machine — the Decoder server is not involved on the request path.

export type LocalKind = "ollama" | "lmstudio";

const DEFAULT_TIMEOUT_MS = 120_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error(`Local LLM timeout after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export async function callLocalProvider(args: {
  kind: LocalKind;
  baseUrl: string;
  model: string;
  system: string;
  user: string;
  timeoutMs?: number;
}): Promise<string> {
  const base = args.baseUrl.replace(/\/+$/, "");

  if (args.kind === "ollama") {
    const r = await fetchWithTimeout(
      `${base}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: args.model,
          stream: false,
          messages: [
            { role: "system", content: args.system },
            { role: "user", content: args.user },
          ],
        }),
      },
      args.timeoutMs,
    );
    if (!r.ok) throw new Error(`Ollama ${r.status}: ${await r.text()}`);
    const j = await r.json();
    return j.message?.content ?? "";
  }

  // LM Studio exposes an OpenAI-compatible /v1/chat/completions
  const r = await fetchWithTimeout(
    `${base}/v1/chat/completions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: args.model,
        messages: [
          { role: "system", content: args.system },
          { role: "user", content: args.user },
        ],
      }),
    },
    args.timeoutMs,
  );
  if (!r.ok) throw new Error(`LM Studio ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

