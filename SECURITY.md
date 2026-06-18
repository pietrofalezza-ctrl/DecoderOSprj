# Security

De-coder is an **open-source educational case study**, not a certified
security product. The notes below describe how the code is built today, not a
warranty.

## 1. You own your code

- Uploaded ZIPs are stored in a private bucket. Row-Level Security restricts read/write to the owner.
- Generated documentation, summaries and suggested comments belong to the user who produced them.
- We never use user repositories or generated content to train any model.

## 2. BYOK API keys are encrypted at rest

- Keys are encrypted server-side with AES-256-GCM (`src/lib/crypto.server.ts`) using a server-only `DECODER_ENCRYPTION_KEY` secret.
- The `user_ai_credentials` table has **no `SELECT` policy** — keys are only ever decrypted inside trusted server functions to forward a request to the chosen provider.
- Only a short hint (e.g. `sk-…abcd`) is exposed to the UI so users can recognize the key.
- The Supabase `service_role` key is server-only and never imported into client-reachable modules (`src/integrations/supabase/client.server.ts` is loaded with `await import(...)` inside `.handler()` bodies).

## 3. Local AI mode keeps the file body off the De-coder server

- When Ollama / LM Studio is selected, the browser calls the local endpoint directly. The source file body is not sent to the De-coder server for AI inference.
- **Uploaded files still live in your private Lovable Cloud storage**. "Local mode" refers to AI inference, not to storage. Use the demo only with non-sensitive code.

## 4. Row-Level Security

All `public` tables (`profiles`, `projects`, `repositories`, `files`, `explanations`, `user_ai_credentials`, `user_local_endpoints`, `user_roles`, `user_acknowledgements`) enable RLS with policies scoped to `auth.uid()`.

## 5. AI-generated security observations are not a security audit

The "Security" analysis runs an LLM over your code and surfaces patterns it
recognises. It is **not** SAST, DAST or a certified audit. Outputs may be
incomplete or wrong and must be reviewed by a qualified person before any
remediation decision.

## 6. Reporting a vulnerability

- **Where**: open a private security advisory on the GitHub repository
  (`Security` tab → `Report a vulnerability`).
- **What to include**: affected URL/route, reproduction steps, impact, and
  (if possible) a minimal proof-of-concept.
- **Response**: this is a personal OSS project maintained in spare time;
  best-effort acknowledgement within a few days. There is no bug-bounty.
- **Out of scope**: third-party AI providers (report to them directly),
  user misconfiguration of local models, denial-of-service via large
  uploads, and findings that require physical access or a compromised
  end-user machine.

## 7. Repository hygiene

- `.env` and `.env.*` are git-ignored; only `.env.example` (placeholders) is
  committed. If a real `.env` was ever pushed publicly, rotate the keys —
  even the publishable Supabase key is best regenerated as a precaution.
