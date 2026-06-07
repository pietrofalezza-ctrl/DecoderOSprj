## Obiettivo

1. Eliminare la ridondanza tra **Funzionalità** e **Come funziona** sulla landing.
2. Risolvere i crash ricorrenti della preview (errore di parsing del code-splitter di TanStack Router su `src/routes/index.tsx` riga 599, che si manifesta come "SSR rendering failed" / "Failed to fetch dynamically imported module").

## 1. Consolidare le sezioni della landing (`src/routes/index.tsx`)

- Rimuovere completamente la sezione `#features` (righe ~363–382) e il relativo helper `Feature` (righe ~606+) — i tre punti (Multi-provider, BYOK, Privacy) sono già coperti da:
  - la **Values strip** (4 valori, inclusi BYOK/Privacy/Open),
  - la sezione **Integrations** (multi-provider esplicito),
  - **Come funziona** (i 3 step operativi).
- Rimuovere la voce **Funzionalità** dalla nav (`landing.nav.features`) e dai link footer; mantenere "Come funziona", "Integrazioni", "Open Source", "Manifesto".
- Rinominare l'ancora di navigazione principale del flusso operativo come **"Come funziona"** (resta `#how-it-works`).
- Pulire le chiavi i18n inutilizzate (`landing.feature1*`–`feature3*`, `landing.nav.features`) in `it/en/zh common.json`.

Risultato: landing più lineare → Hero → Open Source strip → Guardrail → Why now → **Come funziona** → Integrazioni → Values → Community → Footer.

## 2. Stabilizzare la pagina (fix crash)

L'errore `Unexpected token (599:2)` viene dal `router-code-splitter-plugin` quando trasforma `index.tsx`. La causa probabile è la dimensione/complessità del file unita ai due blocchi vuoti (righe 594–596) e ai numerosi helper JSX inline nel file di route. Interventi:

- Estrarre gli helper di presentazione in un file dedicato `src/components/landing/` (uno per file o un `landing-bits.tsx`):
  - `GuardrailDiagram`, `CommunityCard`, `ProviderChip`, `WhyNowCard`, `Step`, `Value`, `OpenSourceStripItem` (quelli effettivamente usati dopo la pulizia).
- Lasciare in `src/routes/index.tsx` solo il `createFileRoute`, l'`head()`, il componente `Landing` e gli import. Questo riduce drasticamente il file e elimina i pattern che mandano in crash il code-splitter.
- Rimuovere le righe vuote anomale e verificare il bilanciamento JSX dopo l'estrazione.

## 3. Verifica

- Hard reload della preview, controllo `daemon_logs` Vite per assenza di `Internal server error` sul file.
- Verifica visiva: nav senza "Funzionalità", una sola sezione operativa ("Come funziona"), nessun salto di ancora rotto.

## File toccati

- `src/routes/index.tsx` (snellito)
- nuovo `src/components/landing/landing-bits.tsx` (helper estratti)
- `src/i18n/locales/{it,en,zh}/common.json` (pulizia chiavi)
