## Obiettivo
1. Rendere l'onboarding più visivamente accattivante e mostrare chiaramente cosa si può fare **senza BYOK / senza LLM** (analisi statica, malware scan, AI-origin detector, upload ZIP/file singolo, history).
2. Permettere all'admin di consultare i consensi (terms/BYOK acks) raccolti dal DB, in caso di richiesta da parte di autorità (GDPR / audit).

---

## 1) Onboarding più accattivante + "Free, no key required"

**File:** `src/components/onboarding/OnboardingDialog.tsx` + locali i18n (`en/it/zh/common.json`)

- **Visual refresh** dello step 1 (Welcome): hero più ricco con gradient sottile coerente col brand, badge "100% free · no key required · privacy-first", micro-statistiche (lingue supportate, formati, modalità).
- **Nuovo Step "Free features"** (inserito tra `s2` Modes e `s3` Provider) che elenca con icone e card colorate ciò che funziona **senza chiave**:
  - Static code analysis (20+ linguaggi)
  - Malware / LockBit-style pattern scan
  - AI-origin heuristics
  - Upload ZIP **e file singolo**
  - History & re-open delle analisi
  - Multilingua (EN/IT/ZH) e tone-of-voice
  Con badge "No API key" verde su ciascuna card.
- **Step Provider (s3)**: aggiunta riga "Skip — continua senza chiave" che porta direttamente all'ack/dashboard, evidenziando che le feature AI (chat, spiegazioni, sintesi) restano opzionali via BYOK o LLM locale.
- **Step finale (s9)**: CTA primaria diventa "Prova senza chiave" (porta a `/dashboard`); secondarie "Configura provider" e "Vedi documentazione".
- Animazioni leggere (fade/scale Tailwind) sui cambi step, progress bar con label "Step X di N".
- Tutti i copy nuovi tradotti in EN/IT/ZH.

Numero step passa da 9 a 10 (aggiunta "Free features"); array `TOTAL_STEPS` aggiornato.

---

## 2) Admin: visualizzazione consensi (audit-ready)

**Migration:**
- Aggiungere policy RLS `SELECT` su `public.user_acknowledgements` per gli admin tramite `public.has_role(auth.uid(), 'admin')`. La policy esistente per gli utenti resta invariata (vedono solo i propri).
- Index su `accepted_at DESC` per ricerche temporali.

**Server function:** `src/lib/admin-consents.functions.ts`
- `listConsents({ search?, type?, from?, to?, limit, offset })` con `requireSupabaseAuth` + verifica `has_role admin` (403 altrimenti); join con `auth.users` via `supabaseAdmin` (caricato dentro l'handler) per arricchire ogni riga con email/created_at.
- `exportConsentsCsv(filters)` che ritorna CSV per consegna ad autorità (user_id, email, type, version, accepted_at, language, ip, user_agent).

**UI admin:** nuova rotta `src/routes/_authenticated/admin.consents.tsx`
- Tabella paginata con filtri (tipo, range date, ricerca email/user_id).
- Colonne: email, tipo (`onboarding_v1`, `byok_v1`, …), versione, data, lingua, IP, user-agent.
- Bottone "Export CSV" (per richiesta autorità).
- Link da `admin.tsx` sezione "Compliance / Consensi" che apre la nuova pagina.

**Audit trail:** ogni export viene loggato in `maintenance_audit_log` con `job_name='consents_export'` e stats (count righe, filtri usati) per tracciare chi ha estratto dati personali.

---

## Dettagli tecnici
- Nessuna modifica al flusso di scrittura dei consensi (resta quello attuale che già salva IP e user-agent — già conforme).
- L'admin **non** può modificare/cancellare consensi: solo lettura ed export.
- Pagina admin gated dalla layout `_authenticated/` + check `has_role` server-side.
- CSV generato server-side con escape corretto, scaricato via `Response` da un server route `/api/public/...` no — meglio un server function che ritorna stringa e il client crea il blob (no esposizione pubblica).

## Out of scope
- Modifiche al wording legale dei consensi.
- Notifiche email all'utente quando l'admin consulta i suoi consensi (può essere aggiunto in futuro).
