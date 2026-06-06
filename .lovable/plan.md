
# Phase 4 — Manifesto, admin onboarding, landing redesign, no dead-ends, E2E

## 1. Manifesto pubblico
- Nuova route `src/routes/manifesto.tsx` (pubblica, SSR-safe, niente loader protetti).
- Contenuto tri-lingua via `manifesto.*` in `en/it/zh/common.json`: principi (open source, privacy-first, BYOK, local-first, no training su codice utente, multilingua, accessibilità), "Cosa NON faremo", roadmap pubblica.
- SEO: `head()` con title/description/og:title/og:description dedicati per route.
- Link nel header landing + nel footer di `AppShell`.

## 2. Admin onboarding (UX, non solo SQL)
Oggi promuovere il primo admin richiede una query SQL manuale — l'utente non sa come loggarsi da admin. Aggiungo:
- **README + pagina `/docs`**: blocco "Become the first admin" con i due metodi:
  - (a) SQL one-shot: `SELECT public.promote_to_admin('you@example.com');` dall'SQL editor di Lovable Cloud.
  - (b) Bootstrap automatico: se la tabella `user_roles` è vuota, il primo utente loggato vede in `/settings` un banner "Claim admin" che chiama una nuova server fn `claimFirstAdmin()` (server-side controlla `count=0` su `user_roles` con `supabaseAdmin`, atomicamente).
- Nuova server fn `claimFirstAdmin` in `src/lib/admin.functions.ts` con `requireSupabaseAuth`, controllo `count(*)=0` e insert.
- UI: banner condizionale in `src/routes/_authenticated/settings.tsx` mostrato solo se `isAdmin=false` && `noAdminsYet=true` (nuova query `adminBootstrapStatus`).
- Dopo claim, redirect a `/admin`.

## 3. Redesign landing in stile screenshot
Replica del layout dell'immagine, mantenendo i token semantici esistenti (`src/styles.css`, niente classi colore hardcoded):
- **Header**: logo SVG (nuovo `src/components/Logo.tsx` con il monogramma `</>` mostrato in screenshot), nav orizzontale (Funzionalità, Come funziona, Integrazioni, Open Source, Documentazione → ancore in-page + link a `/docs` e `/manifesto`), a destra `LangSwitcher` + `ThemeToggle` + CTA `Inizia ora`.
- **Hero**: titolo grande con due parole in accento gradient (`codice`, `tuo livello`) usando `bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`, sub-headline a 3 righe, doppia CTA "Inizia ora" + "Guarda la demo" (la demo scrolla a sezione "Come funziona" — niente link rotti).
- **Mockup workspace**: componente `src/components/LandingMockup.tsx` puramente decorativo (no rete), riproduce sidebar + code editor + pannello AI come in screenshot, con sintassi statica TS.
- **Provider strip**: riga "Funziona con i provider che preferisci" + loghi inline SVG (OpenAI, Anthropic, Gemini, OpenRouter, Ollama) — solo testo+icona, niente immagini esterne.
- **3 feature card** (Multilingua, Porta la tua AI, Locale e privato) con sparkline SVG decorativa.
- **Strip valori** in fondo (100% Open Source, Privacy First, No Vendor Lock-in, Per tutti).
- **Footer** con link a Manifesto / Docs / GitHub / License.

Token: aggiungo eventuali sfumature mancanti (`--gradient-hero`, `--shadow-elegant`) in `src/styles.css`. Niente nuovi font esterni: resto sui font di sistema attuali per non rompere SSR.

## 4. Niente dead-end / loop di navigazione
Audit + fix mirati:
- Ogni route con `loader` o `beforeLoad` deve avere `errorComponent` + `notFoundComponent` con bottoni `← Indietro` (router.history.back con fallback `/`) e `Vai alla dashboard`. Controllo: `__root.tsx`, `_authenticated/route.tsx`, `_authenticated/admin.tsx`, `_authenticated/projects.$projectId.tsx`, `projects.$projectId.repos.$repoId.tsx`, `settings.tsx`, `auth.tsx`, `docs.tsx`, `manifesto.tsx`.
- `/auth`: se utente già loggato, redirect a `/dashboard` invece di mostrare form (oggi può creare loop se l'utente atterra lì già autenticato).
- `_authenticated/route.tsx`: se non autenticato → redirect a `/auth?redirect=<from>`. Dopo login leggere `redirect` e tornare lì (no atterraggio sempre su `/dashboard`).
- `/admin`: oggi `throw redirect({ to: "/dashboard" })` se non admin — aggiungere toast "Accesso negato" lato target via `search: { denied: 'admin' }` e bottone "Richiedi accesso" per UX comprensibile.
- Breadcrumb `← Back` in tutte le route nested (`projects/$id`, `repos/$id`) con `useRouter().history.back()` + fallback esplicito (mai history.back nudo, che su deep-link diretto non ha storia).
- Bottone home cliccabile sul logo in `AppShell` (già c'è ma punta solo a `/dashboard` se autenticato; aggiungo target `/` se pubblico).

## 5. E2E + debug
- Aggiungo Playwright (`@playwright/test`) come devDep + `playwright.config.ts` + cartella `e2e/`.
- Specs minime ma utili:
  - `landing.spec.ts`: home renders, lingua switch IT→EN→ZH non causa hydration mismatch (controlla console errors), tutti i link header risolvono 200.
  - `auth.spec.ts`: `/auth` mostra form, redirect quando già loggato (mock sessione).
  - `manifesto.spec.ts`: route esiste, SEO tags presenti.
  - `navigation.spec.ts`: visita `/admin` senza login → redirect a `/auth?redirect=/admin`; visita `/dashboard` senza login → idem; back button dopo redirect non rimbalza in loop.
  - `accessibility.spec.ts`: smoke `axe-core` su `/`, `/manifesto`, `/docs`, `/auth`.
- Script: `bun run test:e2e` (avvia preview build + playwright).
- Round di debug: dopo aver girato i test, leggo l'output, leggo `code--read_console_logs` e `code--read_runtime_errors` nella preview live, e correggo solo i rilievi emersi (no refactor speculativi). Riporto al termine la lista test/passati/falliti e le fix applicate.

## Fuori scope (Phase 5)
- GitHub OAuth, sync repo privati, suggested inline comments con diff, analisi architettura/dipendenze, A/B test della landing.

## Domande
1. **Bootstrap admin**: ok l'opzione "claim first admin" automatica via banner in Settings, oppure preferisci solo il path SQL documentato?
2. **Demo button**: la CTA "Guarda la demo" deve scrollare a una sezione "Come funziona" sulla landing, oppure aprire una pagina dedicata `/demo` con uno screencast/mock interattivo?
3. **E2E**: ok Playwright? In alternativa Cypress (più pesante) o solo Vitest + Testing Library (niente browser reale, copertura minore).
