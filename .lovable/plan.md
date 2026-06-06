## Problema

Dallo screenshot della pagina progetto:
1. Il **logout** esiste ma è nascosto dietro un pulsante `⋯` senza etichetta in alto a destra (`src/components/AppShell.tsx`, riga 67). Non è riconoscibile come menu account.
2. I **commenti / analisi per singolo file** (riassunti umano/tecnico, qualità, sicurezza, AI origin) esistono nella workspace del repo (`projects.$projectId.repos.$repoId.tsx`), ma dalla pagina progetto l'unica CTA visibile è "Analizza la codebase", che apre direttamente il pannello AI-origin a livello di repo. Non c'è un invito esplicito ad aprire i file e leggerne i commenti.

## Modifiche (solo frontend / i18n)

### 1. `src/components/AppShell.tsx` — menu account riconoscibile
- Sostituire il trigger `⋯` con un pulsante avatar: cerchio con le iniziali dell'utente (prima lettera dell'email) + icona `ChevronDown`.
- Tooltip con email completa sull'avatar.
- Header del dropdown con email utente in piccolo (non cliccabile), poi le voci esistenti (Dashboard, Impostazioni, eventuale Admin) seguite da un separatore e dalla voce **Esci** evidenziata (icona `LogOut` + testo, variante destructive sul testo).
- Leggere l'email da `supabase.auth.getUser()` con un piccolo `useQuery` (`["me","email"]`).

### 2. `src/routes/_authenticated/projects.$projectId.tsx` — accesso ai commenti per file
- Nella riga di ogni repository, accanto al conteggio file, aggiungere una CTA primaria **"Apri file e commenti"** (icona `FileText`) che naviga a `/projects/$projectId/repos/$repoId` (senza `?view=analyze`), così l'utente atterra sull'albero file + tab analisi del singolo file.
- Mantenere "Analizza la codebase" come azione secondaria (per il punteggio AI a livello di repo).
- Sotto le capability chip ("Spiega ogni file", "Qualità & sicurezza", "Probabilità AI") aggiungere una micro-istruzione: *"Apri un repository, seleziona un file e leggi i commenti generati nelle tab Riassunto / Qualità / Sicurezza / Origine AI."*

### 3. `src/i18n/locales/{en,it,zh}/common.json`
- Nuove chiavi:
  - `nav.account` → "Account" / "Account" / "账户"
  - `nav.signedInAs` → "Signed in as" / "Connesso come" / "登录身份"
  - `project.openFiles` → "Open files & comments" / "Apri file e commenti" / "打开文件与注释"
  - `project.howToHint` → testo della micro-istruzione sopra.
- Riutilizzare `nav.signOut` esistente.

## Fuori scope
- Nessun cambio a backend, schema DB, RLS, server functions o logica di analisi.
- Nessuna modifica al flusso `/auth` o al gate `_authenticated/route.tsx`.
- Nessuna nuova dipendenza.
