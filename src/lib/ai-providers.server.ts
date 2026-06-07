export type CloudProvider =
  | "lovable"
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter";

const DEFAULT_MODELS: Record<CloudProvider, string> = {
  lovable: "google/gemini-3-flash-preview",
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
  if (r.status === 401 || r.status === 403) {
    throw new Error(`${label} rejected the request (${r.status}). Check that your API key is valid and has access to this model.`);
  }
  if (r.status === 429) {
    throw new Error(`${label} rate limit reached (429). Wait a moment and retry.`);
  }
  if (r.status === 402) {
    throw new Error(`${label} reports insufficient credits or quota (402).`);
  }
  if (r.status >= 500) {
    throw new Error(`${label} is currently unavailable (${r.status}). Try again shortly.`);
  }
  throw new Error(`${label} request failed (${r.status}).`);
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

  if (provider === "lovable") {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    if (!r.ok) await failSafe("Managed AI", r);
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? "";
  }

  if (provider === "openai") {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
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
    const r = await fetch("https://api.anthropic.com/v1/messages", {
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
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
      }),
    });
    if (!r.ok) await failSafe("Gemini", r);
    const j = await r.json();
    return j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  }

  if (provider === "openrouter") {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
