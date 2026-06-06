## Obiettivo
Cambiare il testo dell’H1 della hero in italiano da “Sempre più codice è scritto dall’ IA. Tu devi ancora capirlo.” a “ma, tu hai ancora bisogno di comprenderlo”, con solo la parola **ma** in evidenzia gradiente. Ristrutturare il componente in modo che ogni lingua possa controllare autonomamente quali parole ricevono l’accento.

## Cosa viene modificato

### `src/routes/index.tsx`
- Sostituire le 4 chiavi `landing.heroLine1` / `heroLine1Accent` / `heroLine2` / `heroLine2Accent` con una singola chiave `landing.hero` gestita tramite `<Trans>` di `react-i18next`.
- L’H1 renderà la stringa i18n interpretando i tag `<1>` … `</1>`, `<2>` … `</2>` come span con lo stile gradiente esistente (`bg-clip-text text-transparent` + `var(--gradient-accent)`).
- Il punto finale rimane dentro la stringa i18n, non hardcoded nel componente.

### `src/i18n/locales/it/common.json`
- Nuova chiave: `landing.hero`: `"<1>ma</1>, tu hai ancora bisogno di comprenderlo."`
- Rimozione delle vecchie chiavi `heroLine1`, `heroLine1Accent`, `heroLine2`, `heroLine2Accent`.

### `src/i18n/locales/en/common.json`
- Nuova chiave: `landing.hero`: `"More and more code is written by <1>AI</1>. You still need to <2>understand it</2>."`
- Rimozione delle vecchie chiavi.

### `src/i18n/locales/zh/common.json`
- Nuova chiave: `landing.hero`: (traduzione cinese con marcatori per le parole accentuate)
- Rimozione delle vecchie chiavi.

## Note tecniche
- `react-i18next` è già usato nel progetto (hook `useTranslation`), quindi `<Trans>` è disponibile senza installare dipendenze.
- Nessuna modifica al backend, RLS o schema.
