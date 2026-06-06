# Coerenza legale + software — fix completo (autore anonimo)

## Decisione
L'autore resta anonimo ("De-coder contributors"). Conseguenza: la clausola **trademark viene rimossa** dai T&C (giuridicamente non difendibile senza titolare identificato né registrazione), sostituita da una clausola più mite di "attribuzione e non-confusione" compatibile con MIT.

## A. Fix incoerenze materiali

### A-1. Badge "Generato da IA" sull'output (EU AI Act art. 50 — I-1)
File: `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`
Aggiungere sopra il `<pre>` dell'output spiegazione un badge fisso:
- icona `Sparkles` + testo `workspace.aiGeneratedBadge` ("Contenuto generato da IA — può contenere errori, verifica sempre")
- visibile sia in modalità cloud che locale
Aggiungere chiave i18n `workspace.aiGeneratedBadge` in EN/IT/ZH.

### A-2. Campo license in package.json (I-2)
Aggiungere `"license": "MIT"` a `package.json`.

### A-3. Anno LICENSE (I-3)
Cambiare `Copyright (c) 2026 De-coder contributors` → `Copyright (c) 2025 De-coder contributors`.

### A-4. Link al repository (I-4 + G-7)
Aggiungere variabile i18n `common.repoUrl` (placeholder `https://github.com/de-coder/de-coder` — l'utente potrà aggiornarla quando il repo sarà pubblico) e usarla in:
- `src/routes/terms.tsx` footer
- `src/routes/manifesto.tsx` footer
- `src/routes/_authenticated/settings.tsx` (link "Contatto GDPR" nella sezione Account)
Sostituire ogni `href="https://github.com"` con la variabile.

### A-5. Riformulazione local pledge (I-5 + G-9)
File: `src/i18n/locales/*/common.json` chiave `workspace.localPledge`.
Nuovo testo (3 lingue): "Modalità locale: l'inferenza IA gira sul tuo localhost. I file caricati restano archiviati nello storage cifrato di De-coder; il sorgente non viene inviato a provider IA esterni."

## B. Allineamento disclosure → realtà (T&C)

### B-1. Estendere `terms.dataCollected` (G-1/2/3/4)
Aggiungere bullet:
- `usage`: "Metadati d'uso: provider e modello IA utilizzati per ogni spiegazione, lingua e livello di proficiency preferiti, ruolo applicativo (es. admin), tipo di sorgente repository (zip o GitHub). Nessun tracciamento comportamentale di terze parti."

### B-2. Estendere il waiver al login con punto su trasferimento codice (G-5 + G-8)
Nuova chiave `terms.liability.dataTransfer` + nuova chiave `auth.disclaimerAcceptSuffix` aggiornata:
- bullet T&C: "Trasmissione del codice: in modalità cloud il sorgente caricato viene trasmesso al provider IA che selezioni (incluso Lovable AI, il provider gestito predefinito che usa una chiave server lato De-coder). Vedi sezione GDPR per i trasferimenti extra-UE. L'autore non risponde delle policy di trattamento dei provider terzi."
- aggiornare `auth.disclaimerAcceptSuffix` per includere "...e sulla trasmissione del codice ai provider IA".

### B-3. Sezione "Lovable AI gestito" esplicita (G-8)
Aggiungere paragrafo dedicato in `terms.tsx` (chiavi `terms.managedAiTitle` / `terms.managedAiBody`): chiarisce che il provider predefinito è gratuito perché la chiave è gestita da De-coder server-side, e che ciò comporta l'invio del codice all'endpoint `ai.gateway.lovable.dev`.

### B-4. Sostituire clausola trademark con "attribuzione" (G-6)
File: `terms.tsx` + i18n.
- Eliminare bullet `terms.forbidden.useTrademark` e `terms.forbidden.presentOfficial` (entrambi presuppongono titolare di marchio identificato).
- Mantenere `claimCreator` (compatibile con MIT — è una norma anti-impersonation).
- Aggiungere nuovo bullet `attribution`: "Indicare chiaramente, in caso di fork o redistribuzione, che si tratta di una versione modificata, non affiliata al progetto originale De-coder."
- Aggiornare `ownershipBody`: rimuovere riferimenti a "marchio" e diritti morali individuali; riformulare come "Il copyright dei contributi originali resta dei rispettivi autori/contributori. La licenza MIT concede i permessi elencati sopra senza trasferire copyright."
- Rimuovere `useTrademark` anche dai principi del manifesto (`manifesto.principles.open.body`: rimuovere "Marchio e denominazione rimangono all'autore").

### B-5. Chiarire identità anonima nel contatto GDPR (G-7 risolto via A-4)
Aggiornare `terms.gdpr.contact`: "Per esercitare i tuoi diritti o segnalare un incidente, apri una issue nel repository GitHub del progetto (vedi link in fondo alla pagina). I maintainer del progetto operano in forma collettiva e anonima; la comunicazione avviene esclusivamente tramite il canale pubblico del repository."

## C. File toccati

- `package.json` (license field)
- `LICENSE` (anno)
- `src/routes/terms.tsx` (sezioni nuove, rimozione trademark)
- `src/routes/manifesto.tsx` (footer link + frase principio "open")
- `src/routes/auth.tsx` (suffix waiver aggiornato — solo se cambia il testo)
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` (badge IA)
- `src/routes/_authenticated/settings.tsx` (link contatto GDPR opzionale)
- `src/i18n/locales/{en,it,zh}/common.json` (tutte le nuove chiavi + revisioni)

Nessuna migrazione DB, nessun nuovo server fn, nessuna dipendenza nuova.

## Fuori scope
- Registrazione marchio (richiede titolare nominato e procedura legale esterna).
- Cifratura dei file utente at-rest oltre quanto già fornito da Supabase Storage.
- Audit di conformità formale (DPIA, ISO).
