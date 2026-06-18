## Obiettivo

Aggiornare la slide 5 del carousel statico (`launch/static-carousel/static_slide_5.png`) sostituendo il messaggio finale attuale con:

1. Un ringraziamento esplicito a **Gabriele Tita**
2. Il contesto: il contributo è arrivato come **Pull Request da un utente** (non è codice malevolo "fresco" — il builder di LockBit 3.0 è leakato pubblicamente da ~4 anni)
3. Un reminder che **decoderead è open source**

## Contenuto proposto per la slide 5

- **Kicker**: `[THANKS] → [CONTRIBUTORS]`
- **Headline**: `Grazie a Gabriele Tita.`
- **Subtext** (2-3 righe):
  > Il benchmark su LockBit 3.0 nasce da una sua **Pull Request**.
  > Il builder è leakato pubblicamente da ~4 anni — qui lo usiamo solo come banco di prova per l'analisi statica.
- **Footer / CTA**: `decoderead.dev · Open-source · MIT`

(Le frasi esatte si possono ritoccare in implementazione per stare nei limiti di larghezza già usati nelle altre slide.)

## Implementazione

1. Aprire lo script Python che ha generato il carousel (in `launch/static-carousel/` o working dir associata) e individuare la sezione che disegna `static_slide_5.png`.
2. Sostituire kicker / headline / subtext / footer con i testi sopra, mantenendo:
   - stessa palette (cream, red, gray, black)
   - stessi font (EB Garamond/Playfair per headline, JetBrains Mono per kicker, Inter per body)
   - stesso layout, padding e gerarchia delle altre 4 slide (per coerenza visiva)
3. Rigenerare **solo** `static_slide_5.png`.
4. QA: nessun testo tagliato, headline che va a capo correttamente, contrasto ok, "Pull Request" ben leggibile.

## Fuori scope

- Le slide 1–4 non vengono toccate.
- I post Instagram/LinkedIn in `marketing/` e i file `launch/ig_slide_*` non vengono modificati (se vuoi li aggiorno in un secondo giro).
