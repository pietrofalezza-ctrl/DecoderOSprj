# r/programming — Self-post

**Title:** Decoder – open-source BYOK code review: static analysis, malware triage and AI chat, all in one tool (MIT, no telemetry)

**Flair:** Project / Show & Tell

---

## Body

I've been building **Decoder** (https://decoderead.dev), an open-source non-profit tool for reading, explaining and auditing code.

The short version: it combines a static analyzer, a malware triage engine and an AI chat layer. The first two work offline with no key. The AI layer is opt-in BYOK.

**What's inside:**

**Static code analysis**
Rule-based checks across 20+ languages. Flags common bug patterns, insecure constructs and style issues without sending code anywhere.

**Static malware analysis**
Entropy sliding-window analysis, control-byte ratio, magic-byte validation, embedded payload detection, suspicious path policies. Runs locally. No sandbox, no detonation.

We tested it on the leaked LockBit 3.0 builder (2022, publicly documented on BleepingComputer / vx-underground). It returned RISK 75/100 / BLOCK in static-only mode — no binary execution, no model call. That feature was contributed by **Gabriele Tita**.

**AI features (BYOK)**

- Chat with your code (file or diff context)
- Natural-language explanation of static reports
- AI-origin detection heuristics

Keys never leave your browser session. Supported: OpenAI, Anthropic, Google Gemini, OpenRouter, Ollama, LM Studio.

**Why BYOK instead of a hosted model?**
I didn't want to handle API keys server-side, store code snippets, or build a billing system. BYOK keeps the surface small and the trust model simple.

MIT licensed. No accounts, no telemetry.

Repo and live demo → https://decoderead.dev

Happy to discuss the entropy detection approach or the AI-origin heuristics if there's interest.
