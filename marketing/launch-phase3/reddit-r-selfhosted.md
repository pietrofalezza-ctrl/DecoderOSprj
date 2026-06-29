# r/selfhosted — Self-post

**Title:** Decoder – self-hostable code review tool with Ollama support: static analysis + AI chat, no cloud required

**Flair:** Tool/Project

---

## Body

I built **Decoder** (https://decoderead.dev) — an open-source tool to analyze, explain and audit code. It runs entirely in the browser, connects to whatever model you point it at, and doesn't send anything to a central server.

For this community the relevant part: **it works fully with Ollama and LM Studio out of the box**.

**Self-hosted / local setup:**

1. Open https://decoderead.dev (or self-host the static app — it's a standard Vite/React build).
2. Run Ollama locally (`ollama serve`, pull whatever model you like).
3. Enter your Ollama base URL in Decoder's settings. That's it.

All AI inference goes directly from your browser to your local Ollama instance. Nothing touches an external API unless you choose a cloud provider.

**What doesn't need a model at all:**

- Static code analysis (20+ languages, rule-based)
- Static malware analysis (entropy, control-byte ratio, magic mismatch, embedded payloads)

These two features are completely offline. Useful even if you're airgapped or just don't want to spin up a model for a quick triage.

**What uses the model (opt-in):**

- Chat with your code — ask questions about a file or diff
- Natural-language explanation of static reports
- AI-origin detection

**Supported providers (all BYOK):** Ollama · LM Studio · OpenAI · Anthropic · Google Gemini · OpenRouter

MIT licensed. No telemetry, no accounts, no call-home.

→ https://decoderead.dev
