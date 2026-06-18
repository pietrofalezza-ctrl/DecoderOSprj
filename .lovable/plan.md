Creo un piccolo set di grafiche per il post #2, embeddando lo screenshot del triage LockBit 3.0 che hai allegato. Stile coerente con le slide `launch/ig_slide_*.png` già presenti (sfondo scuro, accent, type tight). Output salvato in `/mnt/documents/launch/` così appare subito nella vista file, accanto a quelle che stai già guardando.

### File prodotti

1. `launch/li_post02_lockbit_1200x627.png` — formato **LinkedIn share** (1.91:1). Screenshot LockBit in cornice macOS al centro, headline corta "Static malware analysis. Zero AI key.", piccolo footer "DECISION: BLOCK · RISK 75/100 · decoderead.dev".
2. `launch/ig_post02_lockbit_1080x1350.png` — formato **Instagram portrait 4:5**. Stessa scena, layout verticale con headline sopra e tag "LockBit 3.0 · static triage" sotto.
3. `launch/ig_post02_lockbit_story_1080x1920.png` — formato **Story 9:16** per IG/LinkedIn stories, focus sullo screenshot + CTA "decoderead.dev".

### Come vengono fatti

- Sorgente screenshot: l'immagine che hai caricato (`WhatsApp_Image_2026-06-18_at_20.26.26.jpeg`), copiata in `/tmp/`.
- Skill `product-shot`: la screenshot viene incorniciata in una finestra macOS con ombra; preset gradient `midnight` per restare sul dark coerente col brand Decoder.
- Sopra/sotto la cornice vengo composti headline e footer con PIL (font Inter dal sistema, fallback DejaVu). Niente layout cartoon, solo type sottile e palette ridotta (bianco / accent rosso del badge BLOCK / grigio).
- Disclaimer "Sample LockBit 3.0 — leak pubblico 2022 — uso didattico/difensivo" piccolo in basso sulle versioni LI e IG.

### QA

Dopo il render apro ogni PNG, verifico: nessun testo tagliato dai bordi, screenshot leggibile, contrasto sufficiente, badge "BLOCK 75/100" visibile, hashtag/CTA non sovrapposti alla cornice. Se serve aggiusto padding/posizioni e ri-renderizzo.

### Cosa NON tocco

Nessuna modifica al codice dell'app, nessun nuovo file in `marketing/social/` della repo (solo artifact scaricabili in `/mnt/documents/launch/`). Se poi vuoi anche versioni committate in repo me lo dici e le sposto.