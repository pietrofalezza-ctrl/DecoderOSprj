# Riscrittura carosello statico (5 slide)

Ricreo lo script Python di generazione (le slide attuali vivono in `/mnt/documents/launch/static-carousel/`) mantenendo identici palette, font e impaginazione delle versioni esistenti, e riscrivo solo i testi.

## Linee guida di tono
- Italiano sobrio, niente claim sensazionalistici ("rivoluzionario", "definitivo", "game-changer", "supera tutti").
- Eliminare/tradurre anglicismi non necessari: "static-only" → "solo statico", "offline-first" → "prima offline", "BYOK" resta (è il termine tecnico) ma con glossa, "open-source" si può tenere, "tool" → "strumento", "leak/leaked" → "trapelato/diffuso pubblicamente", "fork/forkato" → "contributo dalla community", "hook/CTA" → rimossi dal copy visibile.
- Niente esclamativi, niente maiuscolo urlato oltre ai kicker già previsti dal layout.

## Testi nuovi per slide

**Slide 1 — Apertura**
- Kicker: `[DECODER] → [ANALISI STATICA]`
- Headline: `Leggere il codice, senza eseguirlo.`
- Sub: `Uno strumento open-source per l'analisi statica di codice sospetto e campioni di malware, anche senza chiavi AI.`
- Footer: `decoderead.dev`

**Slide 2 — Il problema**
- Kicker: `[CONTESTO]`
- Headline: `Aprire un binario sconosciuto è un rischio.`
- Sub: `Eseguirlo in locale può compromettere la macchina. Caricarlo su servizi esterni può esporre dati riservati.`
- Footer: `decoderead.dev`

**Slide 3 — Cosa fa**
- Kicker: `[FUNZIONALITÀ]`
- Headline: `Analisi locale, in modo statico.`
- Bullet (riga per riga):
  - `· Estrazione di stringhe, import e indicatori`
  - `· Regole euristiche su pattern sospetti`
  - `· Supporto a più linguaggi e formati`
  - `· Spiegazione AI opzionale, con chiave propria`
- Footer: `decoderead.dev`

**Slide 4 — Modello AI opzionale (ex "BYOK")**
- Kicker: `[CHIAVE PROPRIA]`
- Headline: `L'AI è opzionale. La chiave è tua.`
- Sub: `Decoder funziona anche senza modelli generativi. Quando li usi, passi la tua chiave: nessun intermediario, nessun lock-in.`
- Footer: `decoderead.dev · MIT`

**Slide 5 — Caso d'uso + ringraziamento**
- Kicker: `[CASO D'USO] → [LOCKBIT 3.0]`
- Headline: `Triage statico del builder di LockBit 3.0.`
- Sub (multi-riga):
  - `Test condotto da Gabriele Tita su Decoder, contribuito alla community con una pull request.`
  - `Il builder di LockBit 3.0 è stato diffuso pubblicamente nel settembre 2022 ed è da allora ampiamente documentato (BleepingComputer, The Record, SOCRadar).`
  - `Nessun binario è stato eseguito né distribuito: solo lettura statica del codice.`
- Footer: `Grazie a Gabriele Tita · decoderead.dev · Open-source MIT`

## Implementazione tecnica
- File: `/tmp/make_carousel.py` (script di generazione, non versionato).
- Output: sovrascrivere `/mnt/documents/launch/static-carousel/static_slide_{1..5}.png` mantenendo dimensioni 1080×1350 (formato IG portrait) e identico sistema di colori/font già usato (crema, rosso accent, grigi, nero; EB Garamond / Playfair per headline, JetBrains Mono per kicker/footer, Inter per body).
- Render multi-riga via helper `draw_sub()` con wrapping a larghezza massima 920 px; verifica che nessuna riga ecceda il viewport.
- QA: dopo la generazione, aprire ciascuna delle 5 PNG e ispezionare overflow / overlap / leggibilità contrasto prima di consegnare.

## Fuori scope
- Slide grafica/illustrazioni invariate (solo testo cambia).
- File `marketing/social/linkedin-post-02-static-analysis.md` e altre creatività IG/LinkedIn non toccati in questo passaggio (eventualmente in un turno successivo).
- Nessuna modifica al codice dell'app.
