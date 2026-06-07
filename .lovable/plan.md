# Revisione tono degli speech

## Obiettivo
Allineare tutti i testi rivolti all'utente a un tono **sobrio, descrittivo e onesto**, coerente con la natura del progetto (esperimento personale, open source, gratuito). Eliminare formule da pitch startup, slogan enfatici e claim "forti".

## Linee guida di tono
- Niente claim assoluti o promesse ("colma il divario", "guardrail per l'era dell'IA", "in mano agli utenti, non dell'IA").
- Niente contrapposizioni a effetto ("Generare codice è facile. Capirlo no.", "Verifica, non fiducia cieca", "Niente scatole nere").
- Niente etichette identitarie ("Community-driven", "Privacy First", "Per tutti").
- Verbi descrittivi al posto di verbi-manifesto ("aiuta a leggere" invece di "interroga riga per riga").
- Mantenere il messaggio: è uno strumento di studio personale, BYOK o locale, codice e prompt pubblici.

## File da modificare (solo copy)
Tutti e tre i locale, mantenuti allineati semanticamente:
- `src/i18n/locales/it/common.json`
- `src/i18n/locales/en/common.json`
- `src/i18n/locales/zh/common.json`

## Sezioni interessate

**1. Tagline globale** (`tagline`)
- Da: "Trasforma il codice sorgente in conoscenza leggibile"
- A: "Uno strumento open source per leggere il codice insieme all'IA"

**2. Landing hero** (`landing.hero*`)
- Hero: togliere l'enfasi del "ma" contrapposto. Es.: "Una parte crescente del codice è scritta dall'IA. Decoder aiuta a leggerla."
- heroSubtitle: ridurre, togliere "Mantenuto a tempo perso", restare fattuali: progetto personale, open source MIT, BYOK o inferenza locale.
- Badge: rimuovere "Esperimento didattico personale" (ridondante) e ammorbidire i restanti.

**3. Sezione "Perché ora"** (`landing.whyNow*`)
- Titolo: da "Generare codice è facile. Capirlo no." → "Leggere codice generato dall'IA richiede tempo."
- Intro: rimuovere "colma quel divario"; descrivere cosa fa lo strumento.
- whyNow3: rimuovere "guardrail collettivo"; parlare di prompt e regole pubbliche.

**4. Strip open source** (`landing.osStrip`)
- Titolo: rimuovere la formula "guardrail nelle tue mani, non in quelle dell'IA".
- Body: descrittivo (codice pubblico, ispezionabile, contributi aperti).
- Rimuovere etichetta "Comunitario" se troppo identitaria → "Contributi aperti".

**5. Missione / guardrail** (`landing.guardrail`)
- Rinominare concettualmente da "La missione" a "Cosa fa Decoder".
- Sostituire "guardrail open source per l'era dell'IA generativa" con descrizione neutra ("Uno strumento aperto per leggere il codice generato dall'IA").
- Punti: togliere "Verifica, non fiducia cieca", "In mano agli utenti", "In evoluzione continua" → titoli descrittivi (es. "Output da verificare", "Codice e prompt pubblici", "Estendibile dalla community").

**6. Community** (`landing.community`)
- Kicker "Community-driven" → "Contributi"
- Titolo "Costruito da chi lo usa" → "Aperto ai contributi"
- Body più asciutto.

**7. Value props** (`landing.value*`)
- "Privacy First" → "Privacy"
- "Nessun Vendor Lock-in" → "BYOK"
- "Per tutti" → "Più livelli di lettura" (più aderente)

**8. Manifesto** (`manifesto.*`)
- Già in tono "note di progetto"; solo piccole limature: rimuovere residui enfatici ("nasconde bug, scelte discutibili o vulnerabilità" → "può contenere bug o scelte non ottimali").

**9. Open source page** (`openSource.*`)
- Intro: togliere "è solo così che ha senso condividere"; restare descrittivi.
- Roadmap: rimuovere "guardrail" dal punto VS Code.

## Vincoli
- Solo modifiche di copy nei tre file di locale.
- Nessuna modifica a componenti, logica, chiavi i18n (preservare struttura JSON e nomi chiave).
- Mantenere parità semantica IT / EN / ZH.
- Non rimuovere disclaimer legali o tecnici.

## Verifica
- Diff sui tre `common.json`, rilettura sezioni `landing`, `manifesto`, `openSource`, `tagline`.
- Nessuna chiave aggiunta o rinominata → nessun impatto sui componenti.
