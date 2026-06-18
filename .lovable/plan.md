## Nuovo post LinkedIn: `marketing/social/linkedin-post-02-static-analysis.md`

Stesso stile del post #1 (apertura punchy a due righe, bullet con •, hashtag finali, doppia versione IT + EN). Nessuna modifica al codice dell'app.

### Contenuti chiave da includere
- **Update odierno di Decoder**, frutto di una PR di **Gabriele Tita** (placeholder tag `@Gabriele Tita` da sostituire con il vero handle LinkedIn al momento della pubblicazione — segnalato in note).
- **Static malware analysis** offline (heuristics: entropia, control-byte ratio, mismatch magic, payload embedded, policy path) — gira **senza chiave AI**.
- **Static code analysis** offline estesa a 20+ linguaggi (Java, Kotlin, Go, Ruby, Rust, C/C++, C#, Swift, Scala, Shell, PowerShell, Perl, Lua, Dart, HTML, CSS, SQL, YAML, JSON…).
- **Use case in evidenza**: triage statico di un sample **LockBit 3.0** (builder leakato 2022, riferimenti pubblici: BleepingComputer / vx-underground) — l'app rileva entropy window suspicious + high control-byte ratio e marca **DECISION: BLOCK, RISK 75/100** senza eseguire il binario e senza inviare nulla a un LLM.
- **"Spiega con AI" opzionale**: se l'utente collega una chiave (cloud o locale BYOK) può verbalizzare il report tecnico in linguaggio naturale — ma è opt-in, non requisito.
- Repo pubblica su GitHub, MIT, deploy aggiornato su https://decoderead.dev.

### Note operative in testa al file
- Pubblicare da profilo founder, taggare Gabriele Tita nel corpo + ringraziamento.
- Allegare lo screenshot fornito (LockBit builder, modalità Static-only, decisione BLOCK).
- Disclaimer: il sample LockBit è citato a scopo didattico/difensivo, non distribuito.

### Struttura del file (mirror del post #1)
```text
# LinkedIn — Post #2: Static analysis senza AI + LockBit 3.0
Metadati (autore, quando, asset = screenshot allegato, link)
---
## Versione IT (principale)
Hook 2 righe → bullet → use case LockBit → CTA
---
## Versione EN (variante)
Stessa struttura tradotta
---
Hashtag: #MalwareAnalysis #StaticAnalysis #OpenSource #DFIR #BYOK #DeveloperTools
```

Nessun altro file toccato.