# Piano pre-lancio Decoder

Tre protezioni minime prima di promuovere il progetto su LinkedIn/Instagram.

## 1. Rate limit sul provider gratuito Lovable AI

Obiettivo: garantire **usabilità reale** a un utente medio, evitando che un singolo account bruci il budget condiviso.

**Limite proposto: 20 spiegazioni / 24h per utente** sul provider `lovable`.
Razionale: con proficiency + tipo + lingua già in cache per file (la stessa spiegazione non ricalcola), 20 spiegazioni nuove al giorno coprono comodamente l'esplorazione di un repo medio (≈ 1 sessione di studio approfondito). Provider BYOK (`openai`, `anthropic`, `gemini`, `openrouter`) e provider locali (`ollama`, `lmstudio`): **nessun limite** — paga l'utente o gira in locale.

Implementazione:
- Nuovo file `src/lib/rate-limit.server.ts` con funzione `assertLovableQuota(supabase, userId)` che fa `count` su `explanations` dove `owner_id = userId AND provider = 'lovable' AND created_at > now() - interval '24 hours'` e lancia un errore tipizzato se ≥ 20.
- In `src/lib/explain.functions.ts`, dentro `explainFile.handler`, chiamare `assertLovableQuota` **solo se `data.provider === 'lovable'` e prima della chiamata al gateway** (dopo il cache lookup, così le cache hit non contano).
- Errore lanciato: `Error("rate_limit_exceeded")` con messaggio i18n `errors.rateLimitExceeded` ("Hai raggiunto 20 spiegazioni AI gratuite nelle ultime 24h. Aggiungi la tua chiave API in Impostazioni per continuare senza limiti, o usa Ollama/LM Studio in locale.").
- Gestire l'errore nei componenti che chiamano `explainFile` (toast + CTA verso `/settings`).
- Aggiungere chiave i18n in `it/en/zh` `common.json`.

Niente tabella nuova, niente Redis: contiamo righe `explanations` esistenti (sono già ownership-scoped via RLS).

## 2. Email di contatto GDPR

Email confermata: **pietro@codecoder.com**.

Implementazione:
- Aggiungere chiave i18n `contact.email = "pietro@codecoder.com"` in `it/en/zh`.
- Aggiornare `terms.gdpr.contact` per includere l'email cliccabile: "Per esercitare i tuoi diritti GDPR (accesso, rettifica, cancellazione, portabilità, opposizione), scrivi a pietro@codecoder.com. Risponderemo entro 30 giorni."
- Nuova route pubblica `src/routes/contact.tsx` con:
  - Titolo "Contatti"
  - Sezione "Privacy & GDPR" con `mailto:pietro@codecoder.com?subject=GDPR%20-%20Decoder`
  - Sezione "Bug & feedback" con link al repo GitHub (issues)
  - Sezione "Sicurezza" con `mailto:pietro@codecoder.com?subject=Security%20-%20Decoder`
  - Tempi di risposta dichiarati (30gg GDPR, best-effort per il resto)
  - Head/meta SEO + og tags
- Aggiungere link "Contatti" al footer in `terms.tsx`, `manifesto.tsx`, `index.tsx`, `docs.tsx` (la nav del footer è ripetuta in ognuno).

Niente form, niente backend email: solo `mailto:`. Sufficiente per GDPR.

## 3. Retention automatica dei file caricati

Obiettivo: i ZIP caricati non restano per sempre sul server.

Regola: cancellare `repositories` (e cascading di `files` + `explanations` legate + oggetti storage) se:
- `repositories.created_at < now() - interval '60 days'` **AND**
- nessuna `explanations` collegata negli ultimi 30 giorni (via `files.repository_id`).

Implementazione (migration SQL):
1. Funzione `public.cleanup_stale_repositories()` SECURITY DEFINER che:
   - Seleziona `repositories.id` "stale" secondo la regola sopra.
   - Per ogni repo: lista `files.storage_path`, chiama `storage.delete_object('repositories', path)` (oppure raccoglie le path e logga; vedi nota sotto).
   - `DELETE FROM public.explanations WHERE file_id IN (SELECT id FROM public.files WHERE repository_id = ANY(stale_ids))`.
   - `DELETE FROM public.files WHERE repository_id = ANY(stale_ids)`.
   - `DELETE FROM public.repositories WHERE id = ANY(stale_ids)`.
   - Ritorna count.
2. `pg_cron` job giornaliero alle **03:00 UTC**: `SELECT public.cleanup_stale_repositories();`.

Nota tecnica: la cancellazione degli oggetti in Supabase Storage da SQL puro richiede `storage.objects` delete (RLS bypassata con SECURITY DEFINER). In alternativa più sicura: la funzione SQL cancella solo le righe DB + righe `storage.objects` con quel `bucket_id = 'repositories'` e `name = ANY(paths)`. Da decidere in fase di scrittura migration; preferisco la via "delete da `storage.objects`" perché evita una serverFn schedulata.

Comunicazione all'utente:
- Nuova chiave i18n `upload.retentionNotice = "I file restano sul server fino a 60 giorni dall'upload; dopo l'ultima spiegazione, vengono cancellati automaticamente. Esporta sempre quello che ti serve."` mostrata sotto il pulsante di upload (modali upload ZIP e import GitHub).
- Aggiornare `terms.dataCollected.content` per riflettere la retention 60gg.
- Aggiornare manifesto IT/EN/ZH con una riga "Retention 60 giorni sui file caricati" nella sezione `localFirst` o `privacy`.

## Cosa NON faccio

- Niente captcha, niente rate limit per IP (utenti dietro NAT/VPN si bloccherebbero a vicenda).
- Niente email transazionali (solo `mailto:`).
- Niente soft-delete o cestino: i file scaduti vengono cancellati definitivamente.
- Niente dashboard admin per gestire il rate limit (per ora).
- Niente modifiche al provider Lovable AI o ai modelli: solo conteggio chiamate.

## File toccati

**Nuovi**
- `src/lib/rate-limit.server.ts`
- `src/routes/contact.tsx`
- Migration SQL: funzione `cleanup_stale_repositories` + pg_cron job

**Modificati**
- `src/lib/explain.functions.ts` (chiamata al rate limit per `lovable`)
- `src/i18n/locales/{it,en,zh}/common.json` (chiavi `errors.rateLimitExceeded`, `contact.*`, `upload.retentionNotice`, manifesto retention)
- `src/routes/terms.tsx` (footer + `gdpr.contact` + `dataCollected.content`)
- `src/routes/manifesto.tsx` (footer)
- `src/routes/index.tsx` + `src/routes/docs.tsx` (footer)
- Componenti di upload (ZIP/GitHub) per mostrare `retentionNotice` — da identificare in build mode tra `repos.functions.ts` callers
- Componenti che chiamano `explainFile` per gestire l'errore `rate_limit_exceeded` con toast + CTA

## Domanda

Confermi il limite **20 spiegazioni/24h** sul gratuito (con cache esclusa dal conteggio) e la retention **60 giorni**? Se sì procedo in build.
