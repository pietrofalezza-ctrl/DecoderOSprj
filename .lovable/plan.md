## Piano

1. **Sbloccare i pulsanti “Apri file e commenti” e “Analizza codebase”**
   - Correggere l’architettura delle route: oggi il click cambia URL verso `/projects/:projectId/repos/:repoId`, ma la pagina del progetto resta visibile perché la route parent del progetto non renderizza i figli.
   - Trasformare `projects.$projectId.tsx` in layout con `<Outlet />`.
   - Spostare l’attuale contenuto della pagina progetto in una nuova route index dedicata (`projects.$projectId.index.tsx`).
   - Mantenere invariati i due pulsanti già corretti con `Button asChild + Link`.

2. **Verificare la pagina repository**
   - Dopo la correzione, “Apri file e commenti” dovrà mostrare workspace, file tree, viewer codice e pannello commenti/analisi.
   - “Analizza codebase” dovrà aprire la stessa pagina repo con il pannello di analisi codebase già visibile tramite `?view=analyze`.

3. **Rendere BYOK e uso locale più evidenti dopo il login**
   - Aggiungere una sezione/banner operativo nella dashboard o pagina progetto: “Scegli come usare l’AI”.
   - Evidenziare tre modalità:
     - Lovable AI predefinita senza configurazione.
     - BYOK: aggiungi la tua chiave in Impostazioni → Chiavi API.
     - Locale: usa Ollama / LM Studio dal tuo computer.
   - Inserire CTA dirette verso Impostazioni, già nella zona in cui l’utente lavora dopo il login.

4. **Chiarire dove “scaricare” o installare la web app**
   - Aggiungere testo e/o card “Installa Decoder” nella documentazione e/o impostazioni.
   - Spiegare che Decoder è una web app installabile dal browser, non un file da scaricare: su Chrome/Edge tramite icona installa nella barra indirizzi; su iOS tramite Condividi → Aggiungi alla schermata Home.
   - Mantenere il manifest già presente e correggere solo se serve per l’installabilità.

5. **Aggiornare le traduzioni**
   - Aggiornare almeno italiano, inglese e cinese per i nuovi testi BYOK/locale/installazione.

## Dettagli tecnici

- Modifiche principali previste:
  - `src/routes/_authenticated/projects.$projectId.tsx`
  - nuovo `src/routes/_authenticated/projects.$projectId.index.tsx`
  - possibile update a `src/routes/_authenticated/dashboard.tsx`, `src/routes/_authenticated/settings.tsx` o `src/routes/docs.tsx`
  - `src/i18n/locales/*/common.json`
- Non sono previste modifiche al backend o al database.