## Contesto

Dopo il merge della PR su GitHub, il preview crasha con:

```
TypeError: (0 , __vite_ssr_import_0__.createCsrfMiddleware) is not a function
```

Causa: `src/start.ts` importa `createCsrfMiddleware` da `@tanstack/react-start`, ma quella funzione non esiste nella versione installata. Finché l'errore resta, il sito pubblicato non può essere aggiornato (il build fallisce).

## Cosa farò

### 1. Sistemare `src/start.ts`

Rimuovere l'import e l'uso di `createCsrfMiddleware` (non disponibile) e ripristinare la configurazione middleware funzionante:

- Tolgo `createCsrfMiddleware` dall'import
- Rimuovo il blocco `const csrfMiddleware = createCsrfMiddleware({...})`
- In `createStart` lascio solo `requestMiddleware: [errorMiddleware]`
- `functionMiddleware: [attachSupabaseAuth]` resta invariato (necessario per le server functions autenticate)

Se in futuro serve davvero la protezione CSRF, andrà implementata con un middleware custom (verifica `Origin`/`Referer` o token sincronizzato) — fuori scope adesso.

### 2. Verificare che il preview torni verde

Dopo il fix, controllo lo stato del preview (`preview_control--get_preview_health`) per confermare che non ci siano altri errori introdotti dalla PR.

### 3. Aggiornare il sito pubblicato (produzione)

Una volta verde il preview, tu puoi pubblicare in 2 modi:

- **Desktop**: pulsante **Publish** in alto a destra → **Update**
- **Mobile**: in modalità Preview, `⋯` in basso a destra → **Publish** → **Update**

Note importanti:
- Solo le modifiche **frontend** richiedono il click su "Update"
- Le modifiche **backend** (database, edge functions, auth) sono già live automaticamente dal momento del merge
- Il dominio personalizzato `decoderead.dev` si aggiorna automaticamente dopo "Update"

Se preferisci, posso lanciare io la pubblicazione dopo il fix (richiede una conferma da parte tua).

## File modificati

- `src/start.ts` — rimozione `createCsrfMiddleware`
