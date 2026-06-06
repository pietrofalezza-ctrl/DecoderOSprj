// Browser-side calls to local LLM endpoints. Source code never leaves the
// user's machine — the De-coder server is not involved on the request path.

export type LocalKind = "ollama" | "lmstudio";

export async function callLocalProvider(args: {
  kind: LocalKind;
  baseUrl: string;
  model: string;
  system: string;
  user: string;
}): Promise<string> {
  const base = args.baseUrl.replace(/\/+$/, "");

  if (args.kind === "ollama") {
    const r = await fetch(`${base}/api/chat`, {
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
    });
    if (!r.ok) throw new Error(`Ollama ${r.status}: ${await r.text()}`);
    const j = await r.json();
    return j.message?.content ?? "";
  }

  // LM Studio exposes an OpenAI-compatible /v1/chat/completions
  const r = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: args.model,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
    }),
  });
  if (!r.ok) throw new Error(`LM Studio ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}
