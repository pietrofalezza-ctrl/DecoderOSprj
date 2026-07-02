# Awesome Lists — PR targets

For each list below: fork the repo, add the one-line entry to the relevant section, open a PR with title `Add Decoder – BYOK AI code review with static + malware analysis`.

---

## 1. awesome-static-analysis

**Repo:** https://github.com/analysis-tools-dev/static-analysis
**Section:** `# Multiple languages` (or the `JavaScript / TypeScript` section for the language-specific entry)
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Browser-based static code analysis for 20+ languages with optional BYOK AI explanation (OpenAI, Anthropic, Gemini, Ollama). MIT, no telemetry. ![OSS](oss.svg)
```

---

## 2. awesome-security

**Repo:** https://github.com/sbilly/awesome-security
**Section:** `## Static Analysis`
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Open-source static malware triage (entropy, control-byte ratio, magic mismatch, embedded payload detection) + static code analysis for 20+ languages. Runs offline; AI explanation is opt-in BYOK.
```

---

## 3. awesome-selfhosted

**Repo:** https://github.com/awesome-selfhosted/awesome-selfhosted
**Section:** `## Software Development - Code Review` (or `IDE/Tools`)
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Browser-based code analysis tool: static code + malware analysis (offline) and AI chat via BYOK (OpenAI, Anthropic, Ollama, LM Studio). `MIT` `TypeScript`
```

**Note:** awesome-selfhosted has strict criteria — the app must be self-hostable (it is, as a static build). Include a link to deployment instructions in the PR description.

---

## 4. awesome-malware-analysis

**Repo:** https://github.com/rshipp/awesome-malware-analysis
**Section:** `## Static Analysis`
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Browser-based static malware triage: sliding-window entropy analysis, control-byte ratio, magic-byte validation, embedded payload detection. Fully offline; no binary execution required.
```

---

## 5. awesome-ai-tools (or awesome-ai-devtools)

**Repo:** https://github.com/mahseema/awesome-ai-tools (check for most active fork)
**Section:** `## Code` or `## Developer Tools`
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - BYOK AI code review: chat with your code, AI-origin detection, and natural-language explanation of static analysis reports. Supports OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio. MIT.
```

---

## 6. awesome-privacy

**Repo:** https://github.com/pluja/awesome-privacy
**Section:** `## Developer Tools` (create if missing)
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Code analysis tool with no telemetry, no server-side key handling, and full offline support. BYOK for AI features; static analysis runs entirely in the browser.
```

---

## 7. awesome-devsecops

**Repo:** https://github.com/TaptuIT/awesome-devsecops
**Section:** `## SAST` or `## Secrets Detection / Code Scanning`
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Client-side SAST for 20+ languages plus static malware triage (entropy, magic mismatch, payload detection). Optional BYOK AI explanation layer. MIT, no data egress.
```

---

## 8. awesome-cybersecurity-blueteam

**Repo:** https://github.com/fabacab/awesome-cybersecurity-blueteam
**Section:** `## Malware analysis and reverse engineering`
**Entry to add:**

```
- [Decoder](https://decoderead.dev) - Static malware pre-screening tool: entropy sliding-window analysis, control-byte ratio, magic-byte validation, embedded payload markers. Runs in the browser, fully offline.
```

---

## PR checklist (apply to all)

- [ ] Check the repo's contribution guidelines before opening the PR
- [ ] Confirm the project is listed alphabetically within its section
- [ ] Verify the link resolves and the description matches the list's format conventions
- [ ] Reference the LockBit 3.0 case study in the PR description where relevant (especially for security/malware lists) — link to the LinkedIn post or Dev.to article as supporting material
