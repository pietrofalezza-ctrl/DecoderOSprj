# Launch content kit — Decoder

Deliverables for the very first social posts announcing Decoder (https://decoderead.dev), plus a square logo for the Instagram profile picture.

## 1. LinkedIn — first post

**File name:** `marketing/social/linkedin-post-01-launch.md`

**Tone:** professional, non-profit, no hype. Italian primary + English variant in the same file (LinkedIn is bilingual-friendly).

**Copy outline (~900 chars, 3 short paragraphs + 1 CTA + hashtags):**
- Hook: "Sempre più codice è scritto (anche) dall'AI. Sempre meno viene davvero letto."
- What Decoder is: open-source, non-profit, leggi/spieghi/auditi codice generato da Copilot, Cursor, Claude Code e dal tuo team. BYOK o 100% locale (Ollama / LM Studio).
- Why it matters: niente lock-in, niente telemetria, MIT, multilingua.
- CTA: "Provalo → https://decoderead.dev · Codice → GitHub"
- Hashtags: #OpenSource #AI #DeveloperTools #CodeReview #BYOK

## 2. Instagram — first post

**File name:** `marketing/social/instagram-post-01-launch.md`

**Format:** carosello 1080×1350 (6 slide) + caption.

**Slides (testo on-image, minimale):**
1. "Capisci il codice che l'AI scrive per te."
2. "Open source. Non-profit. MIT."
3. "BYOK · OpenAI · Anthropic · Google · OpenRouter"
4. "O 100% locale con Ollama / LM Studio."
5. "Multilingua · Nessuna telemetria"
6. "decoderead.dev"

**Caption (~300 chars):** breve manifesto + link in bio. Hashtag set: #opensource #ai #coding #developer #softwareengineering #aitools #codereview #indiedev #nonprofit.

## 3. Logo per Instagram (profilo)

**File:** `marketing/brand/instagram-avatar-1080.png` (1080×1080, sfondo pieno per leggibilità nel cerchio IG).

**Direzione visiva:** riprende esattamente il `LogoMark` esistente (`src/components/Logo.tsx`) — quadrato arrotondato con simbolo `{=}`, gradient navy `#0F172A → #1E293B`, glifi `{` e `}` in gradient ciano-teal `#22D3EE → #2DD4BF`, segni `=` bianchi `#F8FAFC`. Versione scalata per avatar: marchio centrato con ~12% di padding interno, niente wordmark (illeggibile nel cerchio IG).

**Generazione:** una sola immagine 1080×1080 (premium) per garantire nitidezza del simbolo, salvata sopra.

## Out of scope (chiedere se serve)
- Copy in inglese/cinese per gli stessi post.
- Grafiche delle 6 slide IG (per ora solo testo + logo profilo).
- Variante "story" 1080×1920.

Confermi e passo in build per creare i 3 file?
