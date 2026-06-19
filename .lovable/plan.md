
# Decoder — Community Update (carosello + stories + caption)

Riscrittura completa dei materiali social mantenendo lo stile editoriale già approvato (sfondo crema, palette sobria, font CrimsonPro / JetBrains Mono / WorkSans, bracket nero in basso). La narrativa non introduce più Decoder da zero: comunica un **aggiornamento del progetto nato da una pull request della community** (Gabriele Tita).

Posizionamento ribadito in ogni asset:
**Code Understanding + Explainable Static Analysis + Optional AI Assistance.**
Mai "malware scanner", "antivirus", "threat intelligence", "audit certificato".

## 1. Carosello LinkedIn — 6 slide 1080×1350

Script: `/tmp/make_carousel.py` (riuso dello scaffolding esistente, helper `draw_sub()` per wrap multi-riga, max 920 px). Output: `marketing/social/carousel-community-update/static_slide_{1..6}.png`.

- **Slide 1 — Community update (cover)**
  Kicker `[COMMUNITY UPDATE] → [DECODER]`
  Titolo: "Nuove funzionalità. Nuovi contributori."
  Sottotitolo: "Grazie a una pull request di Gabriele Tita, Decoder introduce nuove capacità di analisi statica e supporto avanzato agli artefatti software."
  Mini-elenco "UPDATE HIGHLIGHTS": Static Malware Analysis · Supporto avanzato ai binari · Analisi multi-formato · Nuovi indicatori di rischio · Miglioramenti UX.
  Footer: "Community contribution by Gabriele Tita".

- **Slide 2 — Perché questa feature**
  Kicker `[CONTESTO]`
  Titolo: "Capire un file sconosciuto non dovrebbe essere un rischio."
  Tre righe brevi: eseguirlo compromette la macchina · caricarlo su servizi esterni espone dati · leggerlo in modo statico è spesso il primo passo.
  Diagramma testuale verticale: `File → Analisi statica → Comprensione`.

- **Slide 3 — Cosa c'è di nuovo**
  Kicker `[NUOVE CAPACITÀ]`
  Titolo: "Da un singolo file a un intero repository."
  Bullet a due colonne: file singoli · archivi ZIP · binari · configurazioni · repository · stringhe e indicatori · anomalie · osservazioni di sicurezza · multi-formato.

- **Slide 4 — BYOK & local-first**
  Kicker `[BYOK]`
  Titolo: "La tua chiave. Le tue regole."
  Corpo: funziona anche senza modelli generativi; se li usi, provider e chiave sono tuoi; nessun lock-in, nessun intermediario.
  Riga di pillole testuali: Open Source · MIT · BYOK · Local-first.

- **Slide 5 — Caso di studio LockBit 3.0**
  Kicker `[CASO DI STUDIO] → [LOCKBIT 3.0]`
  Titolo: "Triage statico di un artefatto associato a LockBit 3.0."
  **Lo screenshot reale fornito viene incorporato al centro della slide** (riquadro con bordo sottile e ombra delicata, margini sicuri rispetto al bracket).
  Sotto: "Caso di studio reale proposto dalla community. Decoder evidenzia indicatori e anomalie senza eseguire il file."
  Nota piccola: "Nessun binario è stato eseguito. Nessun campione è stato distribuito."
  Footer micro-tipografico: riferimenti pubblici documentati in Italia (ACN — supporto ai soggetti impattati, dicembre 2023; impatti documentati in Veneto, es. ULSS 6 Euganea — Padova; PMI del trevigiano). Contributo open source di Gabriele Tita.

- **Slide 6 — Dove sta andando Decoder**
  Kicker `[ROADMAP]`
  Titolo: "Capire prima. Eseguire dopo."
  Corpo: "Decoder continua a evolversi come piattaforma open source per la comprensione del software."
  Bullet finali: Code Understanding · Explainable Static Analysis · AI opzionale · BYOK · Local-first · Multi-formato · Community-driven.
  Footer: "Grazie ai contributori della community — Gabriele Tita." CTA `→ decoderead.dev`.

QA visiva: rendering di tutti e 6 i PNG, ispezione singola per overflow/clipping/contrasto/posizione screenshot, iterazione finché puliti.

## 2. Instagram Stories — 6 storie 1080×1920

Script: `/tmp/make_stories.py`. Output: `marketing/social/stories-community-update/story_{1..6}.png`. Max 10–15 parole per story, struttura verticale (kicker piccolo in alto, titolo grande, corpo breve, CTA in basso).

1. **Community update** — "Nuovo update della community." Visual: bracket + logo. CTA: "Powered by Gabriele Tita's PR".
2. **Perché** — "Capire un file sconosciuto non dovrebbe essere un rischio." Visual: blocco mono con `!`. CTA: "Read before you run".
3. **Cosa c'è di nuovo** — "File, ZIP, binari, repository. Analisi statica." Visual: lista a icone testuali. CTA: "Multi-format".
4. **BYOK** — "La tua chiave. Le tue regole." Visual: pittogramma chiave + `BYOK`. CTA: "Local-first".
5. **Caso di studio** — "LockBit 3.0: triage statico, senza eseguire." Visual: **crop dello screenshot reale** del pannello Static code/Malware con overlay scuro e didascalia "No binary executed". CTA: "Case study".
6. **Chiusura** — "Open source · MIT · Community-driven." Visual: bracket + URL `decoderead.dev`. CTA: "Star on GitHub · Grazie a Gabriele Tita".

## 3. Caption LinkedIn + alternative

File: `marketing/social/linkedin-post-03-community-update.md`.

Caption IT (≈ 1.300–1.700 caratteri): apre con "Decoder evolve grazie alla community", presenta la PR di Gabriele Tita e cosa porta (Static Malware Analysis, supporto avanzato ai binari, nuovi indicatori), spiega in due righe cos'è l'analisi statica e perché conta, contestualizza LockBit 3.0 citando ACN e impatti documentati in Italia/Veneto senza toni allarmistici, ricorda multi-formato, BYOK, local-first, MIT. Chiusura con domanda: "Qual è il primo controllo che fai su un file sconosciuto prima di aprirlo?".

Allegati nel file:
- 3 **hook** alternativi (community-driven / contributo open source / "da un file a un intero repository").
- 3 **CTA** alternative (try it / read the PR / star on GitHub).
- 5 **hashtag** (#OpenSource #StaticAnalysis #Cybersecurity #DevTools #AppSec — finalizzati nel file).
- Note di impaginazione del carosello (slide 1 cover, slide 5 con screenshot reale).
- Linee guida per valorizzare Gabriele Tita senza scivolare nel promozionale: una sola menzione in caption, footer slide 1 + slide 6, attribuzione esplicita come "community contribution / pull request".

## 4. Verifica finale

Sezione in coda al markdown con checklist:
- Decoder ≠ malware scanner, ≠ GitHub analyzer.
- Posizionamento "Code Understanding + Explainable Static Analysis + Optional AI Assistance" presente in ogni asset.
- Blacklist termini rispettata (no "malware detection", "antivirus", "threat intelligence", "protezione garantita", "audit certificato").
- Caso LockBit raccontato come esempio reale di comprensione preventiva, non come fear marketing.

## Fuori scope

- Nessuna modifica al codice dell'app (componenti, routes, i18n, server functions).
- Nessuna ridistribuzione di binari LockBit: usiamo solo lo screenshot già caricato dall'utente, copiato in `marketing/social/carousel-community-update/assets/lockbit-decoder.jpg`.
- I post `linkedin-post-01-launch.md` e `linkedin-post-02-static-analysis.md` restano invariati; questo update vive in `linkedin-post-03-community-update.md`.

## Note tecniche

- Pillow + font già in `/tmp/fonts/` (CrimsonPro, JetBrains Mono, WorkSans).
- Stesso sistema di griglia/palette delle slide precedenti per coerenza visiva.
- Lo screenshot LockBit nel carosello viene inserito mantenendo proporzioni e leggibilità del pannello "Static code / Malware" (decisione BLOCK, RISK 75/100, signals).
