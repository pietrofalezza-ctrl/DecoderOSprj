## Obiettivo

Spostare il registro di `/manifesto` da "startup che promette" a "progetto personale di studio, gratuito, open source, senza scopo di lucro", propagare la stessa qualifica nei T&C e nelle pagine collegate, e sfruttare le esenzioni che la normativa italiana/UE riconosce a un progetto di questo tipo per ridurre gli obblighi formali assunti.

---

## 1. Riqualifica del progetto (testo guida, riusato ovunque)

Frase di posizionamento da usare in landing, manifesto, terms, contact, footer, README, llms.txt:

> "Decoder è un progetto personale di studio, gratuito e open source (licenza MIT), senza scopo di lucro e senza organizzazione commerciale dietro. È un esperimento didattico mantenuto a tempo perso da un singolo autore con il contributo della community. Non è un prodotto, non è un servizio professionale, non è un SaaS commerciale."

Conseguenza di tono: niente "promettiamo", "garantiamo", "mai", "i nostri utenti", "la nostra missione". Si usa "questo progetto", "l'autore", "best effort", "senza garanzie", "come esperimento".

---

## 2. `/manifesto` — abbassare la temperatura

In `src/routes/manifesto.tsx` non serve cambiare la struttura: si riscrivono solo le stringhe i18n in `manifesto.*`.

Interventi sulle chiavi (`en`, `it`, `zh`):

- `manifesto.kicker` → "Note di progetto" / "Project notes" / 项目说明 (al posto di "Manifesto" che suona da brand).
- `manifesto.title` → da "Crediamo che il codice debba essere comprensibile" a qualcosa tipo "Un esperimento per leggere il codice insieme all'IA". Tono descrittivo, non dichiarazione di valori.
- `manifesto.intro` → riformulare come "Decoder è un progetto personale di studio, open source e gratuito. Queste note spiegano come è pensato e cosa non fa."
- `manifesto.whyGuardrailTitle` / `Body` → togliere "contropotere", "guardrail in mano agli utenti". Sostituire con "perché l'autore ha fatto questo esperimento": "L'IA generativa può sbagliare; questo progetto serve come esercizio personale per studiare come un secondo livello di lettura possa aiutare a capirla. Non sostituisce strumenti professionali."
- `manifesto.principles.*` → riscritti come "scelte di progetto" anziché "principi":
  - `guardrail`: "Strumento di studio, non di verifica certificata." Eliminare "cresce con la community".
  - `open`: mantenere MIT, togliere "per davvero".
  - `privacy`: togliere "by design" come claim; descrivere le misure tecniche esistenti come fatto ("le chiavi sono cifrate AES-256-GCM"), senza prometterne il livello.
  - `byok`: descrittivo, niente "nessun lock-in" come slogan.
  - `localFirst`: descrittivo.
  - `multilang`: descrittivo, "le lingue disponibili oggi sono…".
  - `accessible`: ridimensionare ("livelli di profondità diversi", senza "a tutti i livelli").
- `manifesto.wontTitle` ("Cosa NON faremo") → rinominare in "Limiti del progetto" / "Project limits". Tradurre le 6 voci da promesse ("Non faremo mai…") in **descrizioni di cosa il progetto non è**:
  - w1 → "Il codice caricato non viene usato per addestrare modelli (l'autore non ha né accesso né infrastruttura per farlo)."
  - w2 → "Non c'è vendita di dati né integrazioni di marketing: non esiste un'attività commerciale dietro il progetto."
  - w3 → "Non sono previsti meccanismi di lock-in sui provider AI (il progetto è BYOK)."
  - w4 → "L'export delle spiegazioni in Markdown è una funzionalità presente; resta soggetta alla disponibilità del progetto."
  - w5 → "I file caricati possono essere cancellati automaticamente dopo periodi di inattività; l'autore non garantisce conservazione a lungo termine."
  - w6 → "L'output va sempre verificato da una persona competente: non è un parere professionale."
- `manifesto.contributingBody` → eliminare "co-mantenuto da chi lo usa", "governance leggera". Tono: "contributi benvenuti via GitHub; l'autore valuta tempo per mano".
- `manifesto.roadmapBody` → già neutro, lasciare. Aggiungere "senza impegno di scadenze".

Nessuna modifica strutturale al componente; solo i testi i18n.

---

## 3. Allineamento delle altre pagine pubbliche

Solo testi i18n, nessuna logica.

- `landing.heroSubtitle` (riga 32 IT) e `landing.heroBadge*`: già parlano di "case study", ma "Case study OS · No profit" si può sostituire con "Progetto personale · Open source · Gratuito". Stessa rimozione di "esperimento didattico LLM + codice" → "esperimento didattico personale".
- `openSource.intro` / `openSource.title` ("Un guardrail aperto per interrogare l'IA") → toni meno militanti: "Codice, prompt e regole pubblici, perché il progetto è un esperimento di studio aperto."
- Footer (`footer.ownership`, `landing.footer.*`): assicurarsi che indichi "Progetto personale open source · MIT" e non frasi tipo "© Decoder" che evocano un'entità.
- `brand.tagline` ("Trasforma il codice sorgente in conoscenza leggibile"): si può lasciare; non è un claim aggressivo.

---

## 4. Termini e condizioni — riqualifica formale

In `src/i18n/locales/{en,it,zh}/common.json`, sezione `terms.*`. Niente nuove sezioni di codice in `terms.tsx` salvo eventuale rinomina kicker.

Modifiche di sostanza:

1. **`terms.intro`** → nuova versione esplicita:
   "Decoder è un progetto personale, gratuito e open source, mantenuto a titolo non professionale da un singolo autore con il contributo volontario della community. Non costituisce un servizio commerciale, non comporta corrispettivo e non instaura alcun rapporto contrattuale di fornitura tra l'autore e l'utente. L'uso del software è regolato esclusivamente dalla licenza MIT e dalle presenti note informative."
2. **Nuova chiave `terms.natureTitle` / `terms.natureBody`** ("Natura del progetto"): ribadisce che non c'è attività economica organizzata, che il "servizio web" eventualmente esposto è una demo dimostrativa fornita "as is" e che l'autore può sospenderla in qualunque momento senza preavviso. Rendere visibile come prima sezione dopo `intro`.
3. **`terms.licenseBody`** → rafforzare: "L'intero rapporto utente/autore è regolato dalla licenza MIT, che esclude esplicitamente garanzie e responsabilità nei limiti consentiti dalla legge."
4. **`terms.managedAiBody`** → aggiungere che il provider gestito ("Lovable AI") è offerto come cortesia, soggetto a quote, e può essere disattivato senza obbligo di preavviso o continuità.
5. **`terms.dataCollected.*`** → invariato nei contenuti tecnici, ma intro riformulata: "i dati sotto elencati sono trattati nella misura strettamente necessaria al funzionamento della demo".
6. **`terms.gdpr*`** → vedi sezione 5 sotto.
7. **`terms.aiAct*`** → vedi sezione 5 sotto.
8. **`terms.disclaimerBody`** e **`terms.liability.*`** → invariati nella sostanza (già pesanti), ma far precedere da una riga: "Trattandosi di software libero offerto senza corrispettivo, si applica il regime di responsabilità attenuata previsto dall'art. 1411 ss. c.c. e dai principi generali sui contratti gratuiti, oltre alla totale esclusione di garanzia della MIT."

Nessuna modifica al componente `terms.tsx` salvo l'aggiunta di un blocco JSX per la nuova sezione "Natura del progetto" (4-5 righe, stesso pattern delle altre `<section>`).

---

## 5. Esenzioni e attenuazioni normative UE/IT applicabili

Queste sono le leve concrete che giustificano i testi più morbidi. Vanno citate (in modo sintetico, non come scappatoia) nei T&C per chiarire perché il regime è quello di un progetto gratuito.

### 5.1 GDPR (Reg. UE 2016/679)
- Il GDPR si applica comunque appena tratti dati personali (email di login, contenuti caricati), **anche senza scopo di lucro**: l'esenzione dell'art. 2.2.c (uso "personale o domestico") **non copre** un sito pubblico aperto a terzi. Quindi non si può eliminare la sezione GDPR.
- Però, mancando attività economica organizzata e profilazione, **non sei tenuto a nominare un DPO** (art. 37) né a tenere il registro dei trattamenti in forma estesa (art. 30.5: deroga per soggetti < 250 dipendenti che non fanno trattamenti rischiosi/sistematici — applicabile).
- **Non serve un cookie banner** finché si usano solo cookie tecnici (provv. Garante 10 giugno 2021): la nota dentro `/terms` è sufficiente. Confermare nel testo.
- Modifica testo `terms.gdpr.contact`: chiarire che il Titolare è l'autore in qualità di persona fisica non professionale, contattabile **solo** tramite GitHub Issues/Security Advisories. Citare il diritto di reclamo al Garante.

### 5.2 EU AI Act (Reg. UE 2024/1689)
- L'art. 2 par. 12 esclude espressamente dall'ambito di applicazione i **sistemi e modelli IA rilasciati con licenze libere e open source**, salvo che siano immessi sul mercato come modelli GPAI con rischio sistemico o usati per pratiche vietate (art. 5) o ad alto rischio (Allegato III). Decoder non è un modello: è un'**applicazione downstream** che usa modelli di terzi.
- Quindi gli obblighi formali dell'AI Act sui fornitori (documentazione tecnica art. 11, sistema di gestione qualità art. 17, marcatura CE) **non si applicano** all'autore di Decoder.
- Resta solo l'**obbligo di trasparenza ex art. 50**: dichiarare che l'output è generato da IA. Già presente.
- Riscrivere `terms.aiActIntro` in questo senso: "Decoder è un'applicazione open source che richiama modelli IA di terze parti. In quanto progetto rilasciato con licenza libera e non immesso sul mercato come modello, beneficia dell'esclusione prevista dall'art. 2 par. 12 del Regolamento (UE) 2024/1689. Si applica l'obbligo di trasparenza ex art. 50."

### 5.3 Direttiva 2019/770 (contenuti digitali) e Codice del Consumo
- Si applicano ai contratti tra **professionista e consumatore**. L'autore di un progetto open source non professionale **non è "professionista"** ai sensi dell'art. 3 Cod. Cons.: quindi le garanzie di conformità (artt. 135-octies ss. Cod. Cons.) **non si applicano**.
- Esplicitarlo in `terms.natureBody` evita che l'utente assuma di avere garanzie da consumatore.

### 5.4 Direttiva e-commerce / DSA
- Il DSA (Reg. UE 2022/2065) impone obblighi di trasparenza, notice-and-action, punti di contatto, ecc. solo a "intermediari" e "piattaforme online" con attività organizzata. Un sito demo personale open source **non rientra** nelle definizioni operative.
- Nessun obbligo di registro trasparenza pubblicità, niente DSA SoR. Da menzionare implicitamente con la qualifica "non costituisce piattaforma online ai sensi del DSA".

### 5.5 Responsabilità civile (diritto italiano)
- Per i contratti gratuiti la giurisprudenza riconosce un dovere di diligenza attenuato (art. 1710 c.c. richiamato analogicamente, oltre a 1681/2236). La MIT esclude ogni garanzia: combinandole, la responsabilità dell'autore è limitata a dolo e colpa grave.
- Citarlo nella sezione disclaimer come motivazione delle limitazioni, non come slogan.

---

## 6. File toccati

- `src/i18n/locales/{en,it,zh}/common.json`: blocco `manifesto.*` (riscrittura), blocco `terms.*` (intro, nuova `nature*`, gdpr, aiAct, managedAi, dataCollected.intro, disclaimer prefisso), `landing.heroBadge*`, `landing.heroSubtitle`, `openSource.intro/title`, eventuale `footer.*`.
- `src/routes/terms.tsx`: solo aggiunta di un `<section>` "Natura del progetto" che legge `terms.natureTitle` / `terms.natureBody` (4-5 righe, nessuna logica).
- `src/routes/manifesto.tsx`: nessuna modifica strutturale.
- Eventuale aggiornamento minore di `SECURITY.md` e `README.md` per coerenza ("progetto personale di studio"). Opzionale, non bloccante.

Nessuna modifica a backend, schema DB, RLS, server functions, autenticazione, integrazioni AI.

---

## 7. Cosa NON è in piano

- Niente cambi a `/contact` (già allineato nel turno precedente).
- Niente cookie banner (non necessario: solo cookie tecnici).
- Nessuna nuova lingua, nessun refactor componenti.
- Nessuna registrazione/nomina (DPO, registro trattamenti completo, marcatura CE): non dovute per come è qualificato il progetto.
