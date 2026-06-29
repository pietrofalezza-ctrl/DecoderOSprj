# Fix misleading "Gratis · senza chiave" copy + plain-language pass on the inputs section

## Why it's wrong today

Hai ragione. Sulle tre card di input (Singolo file · ZIP · URL Git) compaiono badge "GRATIS · SENZA CHIAVE" e "BYOK · CHIAVE TUA". Il messaggio è fuorviante: la gratuità non dipende dal **tipo di upload**, ma dal **tipo di analisi**.

In realtà:
- **Caricare è sempre gratis** (file, ZIP, URL Git — tutti uguali).
- **Analisi statica e antimalware** non richiedono chiavi, su tutti e tre i tipi di upload.
- **Spiegazioni AI, AI-origin e chat sul codice** richiedono BYOK o un modello locale, su tutti e tre i tipi di upload.

Il badge "BYOK" sulla card URL Git è proprio sbagliato (le scansioni statica/antimalware girano gratis anche su un repo).

## What changes

### 1. Inputs section in `src/routes/index.tsx`
- Rimuovo i badge per-card (`freeBadge` / `byokBadge`).
- Aggiungo una **singola riga esplicativa sotto i tre cards** che chiarisce su quale asse è la gratuità:
  - IT: "Caricare è sempre gratuito su tutti e tre i tipi. Le analisi statica e antimalware funzionano senza chiavi. Le funzioni AI (spiegazioni, AI-origin, chat sul codice) richiedono una tua chiave (BYOK) o un modello locale."
  - EN: "Uploading is always free for all three inputs. Static and malware checks run without any key. The AI features (explanations, AI-origin, chat) need your own provider key (BYOK) or a local model."
  - ZH: equivalent.
- Riscrivo i body delle card in linguaggio non tecnico, niente elenco di estensioni nel corpo (sposto i 20+ linguaggi in un sottotitolo neutro):
  - IT — "Singolo file": "Trascina un file di codice singolo. Decoder lo apre subito, anche se non sai cosa contiene."
  - IT — "Archivio ZIP": "Carica una cartella zippata. Decoder conserva la struttura del progetto."
  - IT — "URL repository Git": "Incolla il link di un progetto pubblico su GitHub o GitLab. Niente login richiesto."
- Le stesse rese in EN/ZH con tono accessibile e coerente con T&C e privacy policy (stesso lessico: "tua chiave", "modello locale", "scansione statica", "antimalware").

### 2. i18n strings — `src/i18n/locales/{en,it,zh}/common.json`
- Sostituisco `landing.inputs.freeBadge` / `byokBadge` con una nuova chiave `landing.inputs.pricingNote` (la riga unica esplicativa).
- Aggiorno `fileBody` / `zipBody` / `urlBody` con i nuovi copy semplificati.
- Aggiungo `landing.inputs.languagesNote` per "Riconosce oltre 20 linguaggi" come riga sussidiaria sotto le card, in modo da non perdere il segnale di copertura.

### 3. Coerenza con T&C e Privacy
- Allineo il vocabolario a quello già usato in `/terms` e `/privacy`: "tua chiave (BYOK)", "inferenza locale", "scansione statica", "scansione antimalware". Non introduco termini nuovi che non compaiono già nei documenti legali.

## What does NOT change

- Nessuna logica di business, nessun gate di funzionalità, nessuna modifica a auth/database.
- Solo testo nel landing + i18n. Niente nuovi route, niente nuove dipendenze.

## Files touched

- `src/routes/index.tsx` — rimozione badge per-card, aggiunta riga esplicativa sotto la griglia.
- `src/i18n/locales/it/common.json`
- `src/i18n/locales/en/common.json`
- `src/i18n/locales/zh/common.json`

Confermi e procedo.