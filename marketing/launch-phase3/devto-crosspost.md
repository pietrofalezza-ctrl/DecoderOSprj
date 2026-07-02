# Dev.to — Article

**Title:** Building a BYOK AI code review tool: lessons learned
**Tags:** opensource, webdev, security, ai
**Canonical URL:** https://decoderead.dev/blog/byok-code-review-lessons (set this before publishing)

---

<!-- Article body — target 800-1200 words -->

# Building a BYOK AI code review tool: lessons learned

I've spent the last several months building **Decoder** (https://decoderead.dev) — an open-source, non-profit code analysis tool. It combines static code analysis, static malware triage and an AI chat layer.

This post is about the decisions I got right, the ones I got wrong, and the one architectural constraint that turned out to be the most important.

---

## The original problem

AI coding tools write code fast. Copilot, Cursor, Claude Code — they're genuinely useful. But reading and auditing that output is still manual work, and most of the tooling I found either required a central server (meaning your code leaves your machine) or was locked to a single provider.

I wanted something that could do a real first-pass review without phoning home.

---

## Decision 1: BYOK from day one

The first real design decision was whether to host a model myself or go BYOK (bring your own key).

Running a hosted model means:

- Handling API keys server-side
- Storing or proxying code snippets
- Building a billing system
- Becoming responsible for what the model does with user data

BYOK sidesteps all of that. Your key, your API call, your data. The application is a static frontend; it never sees your key in a server context.

The tradeoff is friction: users have to have an API key to use AI features. For a non-profit project targeting developers, I decided that was acceptable. Developers have API keys. And for the privacy-conscious or self-hosted crowd, Ollama and LM Studio work as drop-in alternatives.

**Lesson:** BYOK is underrated. It shrinks the trust surface to almost nothing and eliminates a whole class of compliance questions.

---

## Decision 2: The static layer must work without any model

This one came later, and it came from a contributor.

**Gabriele Tita** opened a PR adding static malware analysis — entropy sliding-window detection, control-byte ratio, magic-byte validation, embedded payload markers. All computed locally, all model-free.

To validate it, we ran it against the publicly leaked LockBit 3.0 builder (a well-documented 2022 leak, referenced by BleepingComputer and vx-underground). The results:

```
High-entropy windows:  102  (entropy ≥ 7.2)
Control-byte ratio:    66.5%
Magic mismatch:        yes

DECISION: BLOCK — RISK 75/100
```

No binary executed. Nothing sent to a model.

That PR forced a clarification I should have made earlier: the static and malware analysis layers are in the critical path. The AI layer is not. "Explain with AI" is a button, not a prerequisite.

I refactored the UI to make this explicit. The static report is always generated first. AI explanation is opt-in on top of it.

**Lesson:** don't make the AI layer load-bearing. It's an interpretation tool, not an analysis tool.

---

## Decision 3: 20+ languages through rule-based analysis

The code analysis engine started with JavaScript and Python. Getting to 20+ languages (Java, Kotlin, Go, Rust, C/C++, C#, Swift, Scala, Ruby, Shell, PowerShell, Perl, Lua, Dart, HTML, CSS, SQL, YAML, JSON and more) was mostly a question of writing per-language rule sets.

Rule-based analysis isn't glamorous. It misses things that a proper AST parser or a trained model would catch. But it's:

- Fast (runs in the browser, no server round-trip)
- Deterministic (same input, same output, every time)
- Auditable (the rules are readable source code)
- Offline

For a triage tool, those properties matter more than recall.

I did experiment with using an LLM for the code analysis step. The results were inconsistent — the model would sometimes catch subtle issues and sometimes hallucinate entire vulnerability classes. For security-relevant output, inconsistency is worse than limited coverage.

**Lesson:** use the right tool for the job. LLMs are good at explanation and summarization. Rule-based engines are good at deterministic pattern matching. Don't conflate them.

---

## Decision 4: AI-origin detection as a heuristic, not a verdict

One of the more controversial features is AI-origin detection — flagging code that's likely AI-generated.

I want to be clear about what this is and isn't:

**It is:** a set of heuristics (comment density, naming pattern uniformity, structural repetition, certain idiomatic patterns) that correlate with AI-generated output.

**It is not:** a reliable classifier. There are no reliable classifiers for this problem. The features that look "AI-like" today shift as models improve and as developers adopt AI-assisted workflows.

The feature exists because some teams want a first-pass signal, not a verdict. It's labeled accordingly in the UI.

**Lesson:** be honest about what heuristics are. Ship them as signals, document their limits, and don't let marketing copy overclaim.

---

## What I'd do differently

**Start with a sharper scope.** The first version tried to do too much at once. I should have shipped the static analysis layer alone, gotten feedback, then added malware triage and AI features sequentially. The current architecture is cleaner because of contributor pressure (Gabriele's PR forced a separation I should have built in earlier), not because I planned it well.

**Document the offline-first property earlier.** The privacy angle — no telemetry, no server-side key handling, EU-friendly, works airgapped — is the most distinctive thing about the tool. I buried it in the README for too long.

**Invite contributors with concrete asks.** The best contribution came from someone who saw a specific gap (malware triage) and had the domain knowledge to fill it. A vague "contributions welcome" is less effective than "we're missing X, here's the shape of what it should do."

---

## What's next

- Diff-level analysis (review a PR, not just a file)
- Structured output for the static report (JSON export for CI integration)
- More language rules, especially for infrastructure-as-code (Terraform, Helm)

If any of this is interesting to you — as a user, a contributor, or just someone with opinions about code analysis tooling — the project is MIT licensed and on GitHub.

→ https://decoderead.dev
