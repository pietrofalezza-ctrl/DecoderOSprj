export type CloudProvider = "openai" | "anthropic" | "gemini" | "openrouter";

const DEFAULT_MODELS: Record<CloudProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.0-flash",
  openrouter: "openai/gpt-4o-mini",
};

export function defaultModelFor(p: CloudProvider): string {
  return DEFAULT_MODELS[p];
}

/**
 * Surface a safe message to the client while logging the raw upstream body
 * server-side. Raw bodies can contain quota IDs, deployment names, and
 * occasionally request fragments — never forward verbatim.
 */
async function failSafe(label: string, r: Response): Promise<never> {
  let body = "";
  try {
    body = await r.text();
  } catch {
    /* ignore */
  }
  console.error(`[ai-providers] ${label} ${r.status}:`, body.slice(0, 2000));

  // Parse provider error envelope (OpenRouter / OpenAI shape)
  let parsedMsg = "";
  try {
    const j = JSON.parse(body) as { error?: { message?: string } };
    parsedMsg = j.error?.message ?? "";
  } catch {
    /* not JSON */
  }

  if (r.status === 401 || r.status === 403) {
    throw new Error(
      `${label} rejected the request (${r.status}). Check that your API key is valid and has access to this model.`,
    );
  }
  if (r.status === 429) {
    const retryAfterRaw = r.headers.get("retry-after") ?? r.headers.get("x-ratelimit-reset");
    let waitHint = "";
    if (retryAfterRaw) {
      const n = Number(retryAfterRaw);
      if (Number.isFinite(n) && n > 0 && n < 86400) waitHint = ` Retry in ~${Math.ceil(n)}s.`;
    }
    const lower = (parsedMsg + " " + body).toLowerCase();
    if (
      label === "OpenRouter" &&
      (lower.includes("free-models-per-day") ||
        lower.includes("free tier") ||
        lower.includes("daily limit"))
    ) {
      throw new Error(
        `OpenRouter free-tier daily limit reached. Add credits at openrouter.ai/credits or switch to a paid model.${waitHint}`,
      );
    }
    if (label === "OpenRouter" && (lower.includes("insufficient") || lower.includes("credit"))) {
      throw new Error(
        `OpenRouter has no available credits on this key. Top up at openrouter.ai/credits.`,
      );
    }
    throw new Error(`${label} rate limit reached (429).${waitHint || " Wait a moment and retry."}`);
  }
  if (r.status === 402) {
    throw new Error(
      label === "OpenRouter"
        ? `OpenRouter reports insufficient credits (402). Top up at openrouter.ai/credits.`
        : `${label} reports insufficient credits or quota (402).`,
    );
  }
  if (r.status >= 500) {
    throw new Error(`${label} is currently unavailable (${r.status}). Try again shortly.`);
  }
  throw new Error(
    parsedMsg
      ? `${label} request failed (${r.status}): ${parsedMsg.slice(0, 200)}`
      : `${label} request failed (${r.status}).`,
  );
}

async function fetchWithRetry(label: string, url: string, init: RequestInit): Promise<Response> {
  let r = await fetch(url, init);
  if (r.status === 429) {
    const retryAfter = Number(r.headers.get("retry-after") ?? "0");
    const waitMs =
      Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 5 ? retryAfter * 1000 : 1500;
    console.warn(`[ai-providers] ${label} 429 — retrying once in ${waitMs}ms`);
    await new Promise((res) => setTimeout(res, waitMs + Math.floor(Math.random() * 300)));
    r = await fetch(url, init);
  }
  return r;
}

export async function callCloudProvider(args: {
  provider: CloudProvider;
  apiKey: string;
  model?: string;
  system: string;
  user: string;
}): Promise<string> {
  const model = args.model || defaultModelFor(args.provider);
  const { provider, apiKey, system, user } = args;

  if (provider === "openai") {
    const r = await fetchWithRetry("OpenAI", "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!r.ok) await failSafe("OpenAI", r);
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? "";
  }

  if (provider === "anthropic") {
    const r = await fetchWithRetry("Anthropic", "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!r.ok) await failSafe("Anthropic", r);
    const j = await r.json();
    return j.content?.[0]?.text ?? "";
  }

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetchWithRetry("Gemini", url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
      }),
    });
    if (!r.ok) await failSafe("Gemini", r);
    const j = await r.json();
    return (
      (
        j as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      ).candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? ""
    );
  }

  if (provider === "openrouter") {
    const r = await fetchWithRetry("OpenRouter", "https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!r.ok) await failSafe("OpenRouter", r);
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? "";
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export { buildPrompt } from "./prompt";
