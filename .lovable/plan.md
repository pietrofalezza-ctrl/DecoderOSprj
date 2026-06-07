## Obiettivo
Decoder deve offrire solo due modalità AI:

1. **Locale**: Ollama / LM Studio.
2. **BYOK**: chiavi API dell’utente per OpenAI, Anthropic, Gemini, OpenRouter.

Non deve più esistere una terza opzione “AI gestita”, “gratuita”, “predefinita”, “senza chiave” o basata sulla chiave Lovable.

## Fix previsti

### 1. Rimuovere la modalità AI gestita dalla UI
- Eliminare dalla pagina Impostazioni il riquadro “Provider AI predefinito / AI gestita”.
- Rimuovere il provider `lovable` dalle label traducibili in italiano, inglese e cinese.
- Aggiornare i testi “Come usare Decoder” per mostrare solo:
  - BYOK
  - Locale
- Rimuovere qualsiasi riferimento a quota gratuita, “nessuna chiave richiesta”, “ready to test”, “managed AI”, “AI gestita”, “托管 AI”.

### 2. Rimuovere la modalità AI gestita dalla logica applicativa
- Modificare i tipi `CloudProvider` per escludere `lovable`.
- Rimuovere `lovable` dagli input validator server-side in:
  - explain
  - analysis
  - fix/patch
  - folder analysis
  - repo AI-origin scan
- Rimuovere ogni branch che legge `process.env.LOVABLE_API_KEY` per richieste generate dall’utente.
- Rimuovere il fallback/synthetic provider da `listProviders`: la lista deve contenere solo chiavi BYOK salvate dall’utente e endpoint locali.

### 3. Rimuovere il gateway gestito dal codice AI utente
- Eliminare il ramo `provider === "lovable"` in `ai-providers.server.ts`.
- Eliminare il modello default associato al provider gestito.
- Rimuovere o rendere inutilizzati i file/guard dedicati a hosted AI e quota gratuita (`hosted-ai-guard.server.ts`, `rate-limit.server.ts`) se non più referenziati.

### 4. Aggiornare copy legale/privacy
- Sostituire i testi che dicono che BYOK è opzionale perché esiste un provider gestito.
- Chiarire che le chiamate cloud avvengono solo quando l’utente configura e usa una propria chiave BYOK.
- Nei trasferimenti extra-UE, rimuovere il riferimento al gateway gestito.

### 5. Mantenere le feature esistenti senza regressioni
- Le analisi file, summary, quality, security, AI-origin e patch continueranno a funzionare con BYOK.
- Le analisi locali continueranno a funzionare con Ollama / LM Studio dove già supportate.
- Le schermate che richiedono un provider cloud mostreranno “configura una chiave BYOK” invece di suggerire AI gratuita/gestita.

## Note tecniche
- Non verranno rimossi gli identificatori infrastrutturali non legati all’uso AI da parte dell’utente, come dominio preview/canonical o helper di autenticazione interni, salvo testo visibile all’utente.
- Non serve una migrazione database: eventuali vecchie righe storiche con provider `lovable` possono restare come record legacy, ma non saranno più selezionabili né invocabili dall’app.