Creo un nuovo **carosello Instagram di 5 slide** nello stesso stile editoriale del set `ig_slide_*_v2.png` (sfondo crema, kicker rosso mono, brackets `[ … ]`, headline serif grande, sub gray, "swipe →" in basso a destra), dedicato al rilascio odierno: **static malware analysis senza chiave AI + benchmark LockBit 3.0**.

Output in `/mnt/documents/launch/static-carousel/`, ogni slide 1080×1080, scaricabile dalla vista file.

### Le 5 slide

1. **01 / 05 — Hook**
   `[ STATIC ] → [ ANALYSIS ]`  ·  `× cloud`
   Headline: *Leggi un malware. Senza accenderlo. Senza un LLM.*
   Sub: Modalità static-only di Decoder.

2. **02 / 05 — Cosa fa**
   `[ ENTROPIA ] · [ MAGIC ] · [ PAYLOAD ]`
   Headline: *Cinque euristiche. Zero esecuzione.*
   Sub: Entropia, control-byte ratio, magic mismatch, payload embedded, path policy.

3. **03 / 05 — Benchmark LockBit (include lo screenshot)**
   `[ BENCHMARK ] → [ LOCKBIT 3.0 ]`
   Headline grande sopra, sotto inserisco lo screenshot del builder in cornice macOS (versione ridotta).
   Pills in basso: `DECISION: BLOCK · RISK 75/100 · ENTROPY 6.877`.

4. **04 / 05 — Linguaggi**
   `[ +20 LINGUAGGI ]`  ·  `× solo JS/TS`
   Headline: *Java, Go, Rust, Ruby, C/C++, Swift, Kotlin, Shell, SQL…*
   Sub: La static code analysis ora copre 20+ ecosistemi.

5. **05 / 05 — CTA**
   `[ DECODER ] → [ TU ]`
   Headline: *Open-source. MIT. Nessuna telemetria.*
   Sub: decoderead.dev — grazie a Gabriele Tita per la PR.

### Implementazione

- Script Python con PIL, riusa Inter (display serif → uso **EB Garamond** o **Playfair Display** scaricato da Google Fonts via CDN per la headline serif del template, JetBrains Mono per kicker/brackets, Inter Regular per la sub).
- Palette: bg `#F5F1E8` crema, ink `#0A0A0A`, accent red `#D9302A`, muted `#6B6B6B` — replicata dallo screenshot di riferimento.
- Layout: top 100px kicker rosso `DECODER · NN / 05`, blocco brackets sotto, hairline separator, headline grande, sub piccola, footer `swipe →` (tranne ultima che mostra `→ decoderead.dev`).
- Slide 03 ospita lo screenshot LockBit già preparato (`/tmp/lockbit_framed.png`), scalato e con cornice scura per stare nel layout chiaro.

### QA

Per ciascuna delle 5 PNG: nessun testo tagliato dai bordi, headline che non va a capo male, paginazione `NN / 05` corretta, screenshot dentro i margini, contrasto sufficiente. Se serve aggiusto e ri-renderizzo.

### Fuori scope

Nessuna modifica al codice dell'app. Niente di committato in repo: solo artifact scaricabili in `/mnt/documents/launch/static-carousel/`.