# Security

De-coder is built around three commitments:

## 1. You own your code
- Uploaded ZIPs are stored in a private bucket. Row-Level Security restricts read/write to the owner.
- Generated documentation, summaries and suggested comments belong to the user who produced them.
- We never use user repositories or generated content to train any model.

## 2. BYOK API keys are encrypted at rest
- Keys are encrypted server-side with AES-256-GCM (`src/lib/crypto.server.ts`) using a server-only `DECODER_ENCRYPTION_KEY` secret.
- The `user_ai_credentials` table has **no `SELECT` policy** — keys are only ever decrypted inside trusted server functions to forward a request to the chosen provider.
- Only a short hint (e.g. `sk-…abcd`) is exposed to the UI so users can recognize the key.

## 3. Local AI mode keeps source code on your machine
- When Ollama / LM Studio is selected, the browser calls the local endpoint directly. The source file body never reaches the De-coder server.

## Row-Level Security
All `public` tables (`profiles`, `projects`, `repositories`, `files`, `explanations`, `user_ai_credentials`, `user_local_endpoints`, `user_roles`) enable RLS with policies scoped to `auth.uid()`.

## Reporting a vulnerability
Open a private security advisory on the GitHub repository.
