# Product Hunt — Launch

**Product name:** Decoder
**Website:** https://decoderead.dev

---

## Tagline (≤60 chars)

`BYOK code review: static analysis + malware triage + AI chat`

*(58 chars)*

---

## Description

Decoder is an open-source, non-profit tool to read, explain and audit code — including code written by AI.

**Static code analysis** and **static malware analysis** work offline with no key: entropy windows, control-byte ratio, magic mismatch, embedded payload detection, 20+ languages.

**AI features are opt-in and BYOK**: bring your own key for OpenAI, Anthropic, Google Gemini or OpenRouter — or connect a local Ollama / LM Studio instance. Keys stay in your browser session, nothing is stored server-side.

**What you can do:**
- Run a static triage on any source file or binary in seconds
- Chat with a file or diff in plain language
- Get a natural-language explanation of the static report
- Detect likely AI-generated code patterns

MIT licensed. No accounts. No telemetry. EU-friendly by design.

---

## First comment (posted by maker at launch)

Hi PH 👋

I'm the maker of Decoder. A few things worth knowing before you try it:

**Why BYOK instead of a hosted model?**
I didn't want to handle your code server-side. BYOK keeps the architecture simple and the trust model obvious: your key, your requests, your data.

**The static layer is genuinely model-free.**
Entropy analysis, control-byte ratio, magic-byte validation — all computed locally in the browser. We validated this on the publicly leaked LockBit 3.0 builder (2022): 102 high-entropy windows, 66.5% control-byte ratio → DECISION: BLOCK, RISK 75/100. No binary executed, nothing sent to a model. That feature came from a contributor PR by **Gabriele Tita** and shaped the whole offline-first design.

**Local models work out of the box.**
Point it at Ollama or LM Studio and the AI features run entirely on your machine.

The project is MIT licensed, non-profit, and the code is on GitHub. Happy to answer any questions about the architecture, the entropy heuristics or the BYOK UX tradeoffs.

→ https://decoderead.dev
