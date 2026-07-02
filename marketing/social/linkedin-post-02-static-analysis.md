# LinkedIn — Post #2: Static analysis senza AI + use case LockBit 3.0

**Pubblicare da:** profilo founder + pagina Decoder
**Quando:** sera del rilascio o mattina successiva (9–11 CET)
**Asset suggerito:** screenshot allegato (triage statico del builder LockBit 3.0 in modalità _Static-only_ — decisione BLOCK, RISK 75/100)
**Link:** https://decoderead.dev
**Tag:** @Gabriele Tita (autore della PR — sostituire con l'handle reale al momento del post)

**Note operative**

- Ringraziare Gabriele Tita nel corpo del post e taggarlo.
- Il sample LockBit 3.0 è citato a scopo **didattico e difensivo**: nessun binario distribuito, solo screenshot dell'output del triage.
- Riferimenti pubblici al leak del builder LockBit 3.0 (settembre 2022): BleepingComputer, vx-underground — citarli nei commenti se serve approfondire.

---

## Versione IT (principale)

L'analisi statica non ha bisogno di un LLM per dirti che qualcosa puzza.

Oggi su **Decoder** è arrivata una PR firmata da **Gabriele Tita** che chiude un cerchio importante: ora puoi fare **static code analysis** e **static malware analysis** completamente **offline, senza inserire nessuna chiave AI**.

Cosa cambia:
• **Modalità Static-only**: l'app rileva entropia, control-byte ratio, magic mismatch, payload embedded, policy di path sospette — tutto in locale, zero round-trip verso un modello.
• **Static code analysis estesa a 20+ linguaggi**: Java, Kotlin, Go, Ruby, Rust, C/C++, C#, Swift, Scala, Shell, PowerShell, Perl, Lua, Dart, HTML, CSS, SQL, YAML, JSON e altri.
• **"Spiega con AI" è opzionale**: se hai una chiave (cloud o locale via Ollama / LM Studio) puoi verbalizzare il report tecnico in linguaggio naturale. Ma è opt-in, non un requisito.
• Tutto **pubblicato dalla repo GitHub** e già live sul deploy.

**Use case reale** (screenshot in allegato): triage statico del **builder leakato di LockBit 3.0** — il sample di ransomware più analizzato degli ultimi anni (leak pubblico del 2022, fonti: BleepingComputer, vx-underground). Decoder lo apre in modalità Static-only e in pochi secondi segnala:
→ _Suspicious high-entropy region_ (102 finestre con entropia ≥ 7.2)
→ _High control-byte ratio_ (66.5%)
→ **DECISION: BLOCK — RISK 75/100**

Senza eseguire il binario. Senza spedire un byte a un LLM.

Grazie a Gabriele per il contributo — è esattamente il tipo di lavoro per cui Decoder esiste: dare strumenti di lettura del codice a chi non vuole (o non può) appoggiarsi a un modello esterno.

Provalo → https://decoderead.dev
Codice → GitHub (link nei commenti)

#MalwareAnalysis #StaticAnalysis #OpenSource #DFIR #BYOK #DeveloperTools #Ransomware

---

## Versione EN (variante)

Static analysis doesn't need an LLM to tell you something is off.

A PR from **Gabriele Tita** just landed on **Decoder** and closes an important loop: you can now run **static code analysis** and **static malware analysis** fully **offline, with no AI key required**.

What's new:
• **Static-only mode**: entropy windows, control-byte ratio, magic mismatch, embedded payloads, path policy — all computed locally, zero round-trips to a model.
• **Static code analysis extended to 20+ languages**: Java, Kotlin, Go, Ruby, Rust, C/C++, C#, Swift, Scala, Shell, PowerShell, Perl, Lua, Dart, HTML, CSS, SQL, YAML, JSON and more.
• **"Explain with AI" is optional**: if you have a key (cloud, or local via Ollama / LM Studio) you can verbalize the technical report in plain language. Opt-in, never required.
• Shipped from the **public GitHub repo** and already live in production.

**Real use case** (screenshot attached): static triage of the **leaked LockBit 3.0 builder** — one of the most studied ransomware samples of the last few years (2022 public leak, refs: BleepingComputer, vx-underground). Decoder opens it in Static-only mode and within seconds flags:
→ _Suspicious high-entropy region_ (102 windows with entropy ≥ 7.2)
→ _High control-byte ratio_ (66.5%)
→ **DECISION: BLOCK — RISK 75/100**

Binary never executed. Not a single byte sent to an LLM.

Big thanks to Gabriele for the contribution — this is exactly what Decoder is built for: code-reading tools for people who don't want (or can't) lean on an external model.

Try it → https://decoderead.dev
Code → GitHub (link in comments)

#MalwareAnalysis #StaticAnalysis #OpenSource #DFIR #BYOK #DeveloperTools #Ransomware
