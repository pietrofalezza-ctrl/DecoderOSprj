# Show HN: Decoder – BYOK AI code review with static + malware analysis

**URL:** https://decoderead.dev
**GitHub:** https://github.com/decoder-dev/decoder (link in comments)

---

## Body

Hi HN,

I built Decoder — an open-source, non-profit tool to read, explain and audit code, including what AI writes for you.

**What it does:**

- **Static code analysis** — 20+ languages (Python, JS/TS, Go, Rust, Java, C/C++, C#, Swift, Kotlin, Ruby, Shell, PowerShell, Lua, Dart, SQL, YAML, JSON and more). No key needed.
- **Static malware analysis** — entropy windows, control-byte ratio, magic-byte mismatch, embedded payload detection. Runs fully offline.
- **AI-origin detection** — heuristics to flag likely AI-generated code patterns.
- **Chat with your code** — ask questions about a file or diff in plain language.
- **BYOK** — bring your own key for OpenAI, Anthropic, Google Gemini or OpenRouter. Or point it at a local Ollama / LM Studio instance. Nothing is sent anywhere without your explicit key.

The static and malware analysis layers are free and offline by design. AI features are opt-in.

**Real case tested:** the leaked LockBit 3.0 builder (2022 public leak, refs: BleepingComputer, vx-underground). Static-only mode flagged 102 high-entropy windows (≥7.2), a 66.5% control-byte ratio, magic mismatch — and returned DECISION: BLOCK, RISK 75/100. Binary never executed, nothing sent to a model.

That feature came from a contributor PR by Gabriele Tita — worth calling out because it drove the architecture decision to keep static analysis fully local and model-free.

**Stack:** TypeScript / React. MIT licensed. No telemetry, no accounts required.

Happy to answer questions about the entropy detection approach, the BYOK UX tradeoffs, or the AI-origin detection heuristics.

→ https://decoderead.dev
