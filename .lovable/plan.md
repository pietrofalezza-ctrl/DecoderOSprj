# Esonero di responsabilità al login

## Obiettivo
Esporre all'utente un'esplicita esclusione di responsabilità dell'autore di De-coder, nei limiti consentiti dalla legge, che l'utente deve accettare prima di poter accedere o registrarsi. La clausola copre: output IA, codice analizzato/IP, sicurezza e danni da uso del software, utilizzo illecito o non conforme.

## Modifiche

### 1. `src/routes/auth.tsx` — checkbox obbligatorio
- Aggiungere uno stato `accepted` (boolean, default `false`).
- Nuova `<Checkbox>` (shadcn) posta sopra i pulsanti di submit, con label tradotta che linka a `/terms` (sezione esonero).
- Il pulsante "Accedi"/"Crea account" e il pulsante "Continua con Google" sono disabilitati finché `accepted === false`.
- Le funzioni `submit` e `google` rifiutano l'azione (toast di avviso) se non accettato, come difesa in profondità.
- Persistere l'avvenuta accettazione in `localStorage` (`decoder.disclaimer.acceptedAt = ISO date`) per audit/UX locale. Nessuna scrittura DB (l'utente non è ancora autenticato al primo accesso; per il sign-in non serve consenso server-side perché i T&C valgono per chiunque usi il software).

### 2. `src/routes/terms.tsx` — nuova sezione "Esonero di responsabilità esteso"
- Aggiunta sezione dopo `disclaimerTitle` esistente (che resta come clausola MIT standard) intitolata `liabilityTitle` con 4 sottopunti:
  - Output IA: l'utente è unico responsabile della verifica e dell'uso delle spiegazioni generate.
  - Codice analizzato / IP: l'autore non risponde per violazioni di copyright, licenze o segreti contenuti nel materiale caricato.
  - Sicurezza e danni: nessuna responsabilità per danni diretti/indiretti, perdita dati, malfunzionamenti, vulnerabilità.
  - Uso illecito o non conforme: l'utente è responsabile della conformità a leggi, normative e contratti di terze parti applicabili.
- Tutti i punti chiudono con la formula "nei limiti massimi consentiti dalla legge applicabile".

### 3. Traduzioni — `src/i18n/locales/{it,en,zh}/common.json`
- `auth.disclaimerAccept`: "Ho letto e accetto i [Termini](terms) e l'esonero di responsabilità."
- `auth.disclaimerRequired`: toast "Devi accettare l'esonero di responsabilità per continuare."
- `terms.liabilityTitle`, `terms.liabilityIntro`, `terms.liability.{aiOutput,ipCode,security,unlawful}`.

### 4. Coerenza
- Verificare che nessuna altra view inneschi sign-in scavalcando la checkbox (la pagina `/auth` è l'unico ingresso).
- Il footer e i link da `/manifesto`, `/terms`, `/` continuano a puntare a `/auth` come prima.

## Note tecniche
- Componente `Checkbox` già disponibile in `src/components/ui/checkbox.tsx` (shadcn).
- Nessuna migrazione DB, nessun nuovo server fn.
- Nessun impatto su SSR: la checkbox è puramente client-side nella route pubblica `/auth`.
