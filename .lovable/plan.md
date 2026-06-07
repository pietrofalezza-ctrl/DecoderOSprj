## Obiettivo
Correggere le affermazioni tecnicamente imprecise nel manifesto di Decoder, mantenendo lo stile e il tono attuali.

## Modifiche

### 1. `localFirst` — Italiano (`src/i18n/locales/it/common.json`)
Attuale: "Modalità locale con Ollama o LM Studio: il sorgente non lascia mai la tua macchina. Il browser parla direttamente con il tuo localhost."
Problema: in locale i file ZIP vengono comunque caricati e salvati nel server (Supabase Storage, RLS). Il sorgente *esce* dalla macchina anche se l'inferenza IA è locale.

Sostituire con qualcosa come:
"Modalità locale con Ollama o LM Studio: l'inferenza AI gira sul tuo localhost. I file caricati sono salvati in modo sicuro sul server e accessibili solo a te (RLS)."

### 2. `localFirst` — Inglese (`src/i18n/locales/en/common.json`)
Stesso problema, stessa correzione in inglese.

### 3. `privacy` (entrambe le lingue)
Rimuovere o ammorbidire "Non addestriamo modelli sul tuo codice. Non vendiamo i tuoi dati." perché sono promesse organizzative, non verificabili dal codice.
Sostituire con qualcosa di più tecnico e dimostrabile, es.:
"Le tue chiavi API sono cifrate AES-256-GCM e mai restituite al browser. I tuoi file sono isolati per utente tramite Row Level Security. Non profilazione comportamentale."

## Nota
Le stringhe del manifesto sono in `src/i18n/locales/{it,en}/common.json` sotto la chiave `manifesto`. Non servono modifiche a `src/routes/manifesto.tsx`.