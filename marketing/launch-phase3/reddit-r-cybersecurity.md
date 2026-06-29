# r/cybersecurity — Self-post

**Title:** Static triage of the leaked LockBit 3.0 builder using Decoder — RISK 75/100, BLOCK, no binary execution, no model required

**Flair:** Tool / Research

---

## Body

A contributor named **Gabriele Tita** submitted a PR to **Decoder** (https://decoderead.dev) that added static malware analysis — and we used the leaked LockBit 3.0 builder as the validation target.

For context: the LockBit 3.0 builder was publicly leaked in September 2022. It's been widely documented by BleepingComputer, vx-underground and others. We used the publicly known sample for defensive/educational testing only. No binary was executed.

---

**What Decoder's static malware engine checks:**

- Sliding-window entropy analysis (default window: 256 bytes)
- Control-byte ratio (non-printable / total bytes)
- Magic-byte validation (declared type vs. actual header)
- Embedded payload markers (PE, ELF, class files, archive headers inside the file)
- Suspicious path strings and policy indicators

All computed locally — no sandbox, no detonation, no LLM call.

---

**Results on the LockBit 3.0 builder:**

```
High-entropy windows:   102  (entropy ≥ 7.2)
Control-byte ratio:     66.5%
Magic mismatch:         yes
Embedded payload:       detected

DECISION: BLOCK
RISK:      75 / 100
```

Findings breakdown:
- The 102 high-entropy windows are consistent with a packed or encrypted payload section.
- 66.5% control-byte ratio is well above the ~15–20% typical of source or script files.
- Magic mismatch suggests the declared extension doesn't match the actual binary format.

---

**Why this matters for the tool's design:**

Gabriele's PR drove an explicit architectural decision: the static and malware analysis layers must work with zero model dependency. "Explain with AI" is a separate, opt-in step. You don't need a key, a cloud account or a running model to do a first-pass triage.

The AI layer (BYOK — OpenAI, Anthropic, Gemini, Ollama, etc.) can verbalize the report in plain language afterward, but it's never in the critical path.

---

**Limitations / honest caveats:**

- Static analysis can't catch everything. Polymorphic packers, in-memory-only loaders, and heavily obfuscated code need dynamic analysis.
- The entropy thresholds are heuristics. Legitimate compressed assets will also score high.
- This is a triage tool, not a replacement for a proper sandbox or AV pipeline.

---

If you've built or used similar static pre-screening tools, I'd be interested in comparing notes — especially on entropy threshold tuning and reducing false positives on packed installers.

Tool: https://decoderead.dev — MIT, no telemetry.
