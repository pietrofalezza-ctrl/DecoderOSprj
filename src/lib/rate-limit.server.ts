// Server-side rate limiting for the managed Lovable AI provider.
// We cap free-tier usage to a sensible per-user daily quota so that one
// account can't drain the shared gateway budget for everyone else.

const LOVABLE_DAILY_LIMIT = 20;
const WINDOW_HOURS = 24;

type SupabaseLike = {
  from: (table: string) => {
    select: (cols: string, opts: { count: "exact"; head: true }) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          gte: (col: string, val: string) => Promise<{ count: number | null; error: unknown }>;
        };
      };
    };
  };
};

type Lang = "en" | "it" | "zh";

const messages: Record<Lang, string> = {
  it: `Hai raggiunto ${LOVABLE_DAILY_LIMIT} spiegazioni AI gratuite nelle ultime 24 ore. Aggiungi la tua chiave API in Impostazioni per continuare senza limiti, oppure usa Ollama / LM Studio in locale.`,
  en: `You've reached ${LOVABLE_DAILY_LIMIT} free AI explanations in the last 24 hours. Add your own API key in Settings to keep going without limits, or use Ollama / LM Studio locally.`,
  zh: `过去 24 小时内你已使用了 ${LOVABLE_DAILY_LIMIT} 次免费 AI 解释。请在“设置”中添加自己的 API 密钥以继续无限制使用，或在本地使用 Ollama / LM Studio。`,
};

export class LovableQuotaError extends Error {
  constructor(language: Lang) {
    super(messages[language] ?? messages.en);
    this.name = "LovableQuotaError";
  }
}

export async function assertLovableQuota(
  supabase: SupabaseLike,
  userId: string,
  language: Lang,
): Promise<void> {
  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("explanations")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("provider", "lovable")
    .gte("created_at", since);

  if (error) {
    // Fail open: a count failure must not block legitimate usage.
    console.error("[rate-limit] count failed", error);
    return;
  }
  if ((count ?? 0) >= LOVABLE_DAILY_LIMIT) {
    throw new LovableQuotaError(language);
  }
}

export const LOVABLE_QUOTA = {
  limit: LOVABLE_DAILY_LIMIT,
  windowHours: WINDOW_HOURS,
};
