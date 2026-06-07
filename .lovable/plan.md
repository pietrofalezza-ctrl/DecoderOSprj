## Obiettivo

Rafforzare la narrazione open source di Decoder, posizionandolo esplicitamente come **guardrail comunitario** — uno strumento in mano agli utenti, in evoluzione continua, per interrogare in modo critico le sorgenti AI (Copilot, Cursor, Lovable, ChatGPT, ecc.). Coerente con lo scope: Decoder già esiste per leggere/auditare codice AI; manca la cornice valoriale chiara.

## Cosa cambia in UI

### 1. Landing (`src/routes/index.tsx`)
- **Nuova sezione "Guardrail" tra hero e "Why now"**: titolo forte (es. *"Il tuo guardrail open source nell'era dell'AI"*), pittogramma a tre colonne con la metafora `AI sorgente → Decoder (guardrail) → tu`, e tre punti chiave:
  - *Verifica, non fiducia cieca* — ogni risposta AI è interrogabile
  - *In mano agli utenti* — codice aperto, ispezionabile, forkabile
  - *In evoluzione continua* — la community estende le regole di audit
- **Aggiornamento "Why now"**: il terzo card diventa esplicitamente "Guardrail collettivo" invece di "Eye"
- **Strip "Open Source" subito sotto l'hero**: badge GitHub + stelle live (link) + licenza MIT + link "Contribuisci"
- **Sezione "Community-driven" prima del footer**: 3 CTA — *Apri un'issue*, *Proponi una regola di analisi*, *Traduci Decoder* — con link diretti a GitHub

### 2. Manifesto (`src/routes/manifesto.tsx`)
- Nuovo **principio "Guardrail in evoluzione"** in cima alla lista (prima di `open`): definisce la missione
- Nuova sezione **"Perché serve un guardrail"** tra intro e principi: 2-3 paragrafi sul rischio dell'AI come oracolo, sulla necessità di strumenti di verifica indipendenti e community-owned
- Nuova sezione **"Come contribuire"** prima della roadmap: link a repo, guida CONTRIBUTING, governance leggera (issue → discussione → PR), elenco aree di contribuzione (regole di analisi, traduzioni, provider locali, prompt)
- Aggiornare il blocco "Cosa non faremo mai" con un punto in più: *"Non sostituiremo mai il tuo giudizio — siamo un guardrail, non un oracolo"*

### 3. Nuova pagina `/open-source` (route `src/routes/open-source.tsx`)
Pagina dedicata, linkata dalla nav header (sostituisce o affianca "Manifesto"), con:
- **Hero**: missione guardrail in una frase
- **Sezione "Cosa è aperto"**: codice, prompt di analisi, regole di scoring, traduzioni, design tokens — ognuno con link diretto al file/cartella su GitHub
- **Sezione "Roadmap pubblica"**: estratto delle prossime milestone (statico per ora, alimentato dalle stringhe i18n)
- **Sezione "Contributors"**: griglia statica con avatar GitHub via `https://github.com/{user}.png` (lista iniziale curata, espandibile)
- **Sezione "Estendi le regole"**: spiegazione che le prompt di analisi (`src/lib/analysis-prompt.ts`) sono modificabili dalla community, con esempio di PR
- **Footer CTA**: GitHub, Discord/Discussions, contatto

### 4. Header / Nav
- Sostituire la voce attuale `landing.nav.openSource` (che oggi punta a `/manifesto`) con due voci: **"Open Source"** → `/open-source`, **"Manifesto"** → `/manifesto`
- Aggiornare anche i footer di tutte le pagine pubbliche per coerenza

## Aggiornamenti i18n

In `src/i18n/locales/{it,en,zh}/common.json`:
- Nuove chiavi `landing.guardrail.*` (kicker, title, intro, 3 punti)
- Nuove chiavi `landing.community.*` (titolo + 3 CTA)
- Nuove chiavi `manifesto.guardrail.*`, `manifesto.whyGuardrail.*`, `manifesto.contributing.*`
- Nuovo namespace `openSource.*` per la nuova pagina (hero, sezioni, CTA, contributors label)
- Aggiornare `landing.whyNow3*` con tono "guardrail collettivo"

## SEO

- `<title>` e meta della nuova pagina `/open-source` ottimizzati per "open source AI code review guardrail"
- JSON-LD `SoftwareApplication` su `/open-source` con `license` e `codeRepository`
- Aggiungere link `<link rel="alternate">` alle 3 lingue se non già presenti

## Dettagli tecnici

- Tutte le nuove sezioni usano i token semantici esistenti (`border-border`, `bg-card`, `text-primary`, `font-display`) — nessun colore custom
- Nessun nuovo pacchetto: icone Lucide già installate (`ShieldCheck`, `GitFork`, `Users`, `MessageSquare`, `Languages`, `Bot`)
- Avatar contributors: `<img>` con `loading="lazy"` da `github.com/{user}.png?size=80` — nessuna chiamata API runtime
- Nessuna modifica al backend, all'auth o ai server functions — è lavoro puramente di frontend/contenuto
- Compatibilità totale con i contenuti esistenti: nulla viene rimosso, solo esteso

## File toccati

- modificati: `src/routes/index.tsx`, `src/routes/manifesto.tsx`, `src/i18n/locales/it/common.json`, `src/i18n/locales/en/common.json`, `src/i18n/locales/zh/common.json`
- creati: `src/routes/open-source.tsx`, eventualmente `src/components/GuardrailDiagram.tsx` (componente decorativo riutilizzabile)
