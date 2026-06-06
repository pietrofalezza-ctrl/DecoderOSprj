## Diagnosi

L'utente **non viene realmente sloggato**. La sessione Supabase resta valida (persistita in `localStorage`). Il problema è puramente di UX/percezione:

- `/manifesto` e `/` sono route **pubbliche** e usano un loro header (non `AppShell`).
- Entrambi gli header mostrano **sempre** il CTA "Inizia" → `/auth`, indipendentemente dallo stato di sessione.
- Quando un utente autenticato clicca "Manifesto" dall'`AppShell`, atterra su un layout senza nav autenticata, nessun avatar/menu, nessun link a `/dashboard`. Visivamente sembra essere stato sloggato.
- Cliccando "Home" dal manifesto va a `/` (stesso layout pubblico) → conferma la percezione di logout + "redirect alla home".

Anche `auth.tsx` ha lo stesso pattern: se già loggato, redirige a `/dashboard`, quindi l'utente che clicca "Inizia" finisce sulla dashboard — ma è confondente.

## Piano di intervento

### 1. Rendere gli header pubblici "session-aware"

Nuovo componente `src/components/PublicHeaderAuthSlot.tsx`:
- Hook leggero che legge `supabase.auth.getSession()` al mount + si sottoscrive a `onAuthStateChange` per `SIGNED_IN`/`SIGNED_OUT`/`USER_UPDATED`.
- Stato `signed-in | signed-out | loading` (loading = skeleton 1 bottone, no flicker).
- **Se signed-out**: bottone "Inizia" → `/auth` (comportamento attuale).
- **Se signed-in**: due bottoni → "Dashboard" (`/dashboard`) + DropdownMenu con avatar (Settings, Sign out). Riusa pattern di `AppShell`.

Inserirlo in:
- `src/routes/index.tsx` (header)
- `src/routes/manifesto.tsx` (header + footer-like CTA in fondo che oggi dice "Inizia")
- `src/routes/terms.tsx` e `src/routes/docs.tsx` (per coerenza)

### 2. Migliorare la nav dell'`AppShell` verso /manifesto

Quando un utente loggato clicca "Manifesto" da `AppShell`, ora perde completamente la chrome autenticata. Opzioni:
- **Scelta**: mantenere il manifesto come route pubblica (necessario per SEO/condivisione) ma con header session-aware (vedi punto 1). Questo è sufficiente: l'utente vede "Dashboard" + avatar in alto, non si sente sloggato.

### 3. Test E2E di usability (browser tool)

Eseguo il flow reale come utente:
1. `view_preview /` → screenshot stato logged-out.
2. Vado su `/auth`, simulo login con credenziali email/password di un **account di test** (creo via `supabase--insert` un utente in `auth.users` non è possibile direttamente — uso invece `supabase.auth.signUp` via UI, accettando T&C, con un email tipo `e2e-test-<timestamp>@decoder.local`).
   - Se la signup richiede email confirmation, uso `supabase--configure_auth` per verificarne lo stato; se attiva, considero un account già esistente fornito o disabilito temporaneamente il flag in dev.
3. Verifico atterraggio su `/dashboard`.
4. Clicco link "Manifesto" dall'`AppShell`.
5. **Verifica**: header mostra "Dashboard" + avatar (post-fix), non "Inizia".
6. Clicco "Home" (logo o link).
7. **Verifica**: su `/` header sempre session-aware; nessun redirect forzato a `/auth`; sessione intatta (controllo console / `localStorage`).
8. Clicco "Dashboard" dal header pubblico → torno su `/dashboard` senza re-login.
9. Logout esplicito dal menu → verifico che ORA gli header mostrino "Inizia".
10. Screenshot finale + report.

### 4. File da toccare

- **Nuovo**: `src/components/PublicHeaderAuthSlot.tsx`
- **Modifica**: `src/routes/index.tsx`, `src/routes/manifesto.tsx`, `src/routes/terms.tsx`, `src/routes/docs.tsx` (sostituire il bottone CTA fisso con `<PublicHeaderAuthSlot />`)
- **i18n**: nuove chiavi `nav.dashboard` (già esistente in `common.json`), eventualmente `nav.openDashboard` in `en/it/zh`

### Fuori scope

- Nessuna modifica al backend, RLS, server functions, schema DB.
- Nessuna modifica alla logica di `/auth` o `_authenticated/route.tsx`.
- Nessuna nuova dipendenza.

### Domanda di conferma

Per il test e2e ho bisogno di un account. Preferisci:
- **(a)** che crei al volo un account di test via signup email/password (rimane in DB), oppure
- **(b)** mi fornisci credenziali di un account esistente da usare, oppure
- **(c)** salto il login reale e simulo solo il flow client-side mockando la sessione?
