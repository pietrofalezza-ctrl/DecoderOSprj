Eseguo in sequenza 5 blocchi. Prima ho bisogno di alcune conferme rapide (vedi fondo), poi procedo.

## 1. Post di lancio (LinkedIn + Instagram)

Output: file Markdown + immagini infografica generate, salvati in `/mnt/documents/launch/` e consegnati come `<presentation-artifact>`.

- **3 post LinkedIn** (manifesto OS, problema/soluzione, BYOK + privacy locale)
- **5 slide carosello Instagram** (hook, problema, cosa fa Decoder, BYOK/locale, CTA repo)
- Copy in italiano (tono divulgativo, taglio "case study open source", no marketing for-profit)
- Infografiche generate con `imagegen` (premium per leggibilità testo), palette coerente col sito

## 2. Tone of voice homepage → "case study OS"

File: `src/routes/index.tsx` (+ locali `it/en/zh`).

- Hero: sostituire claim product-y con framing "case study open source / esperimento didattico"
- Aggiungere badge/sezione "Open source · No profit · BYOK" sopra la piega
- CTA primaria → "Vedi su GitHub" + secondaria "Prova la demo"
- Footer/about: una riga esplicita "Questo progetto non è commerciale, è un case study pubblico su [tema]"
- Rimuovere linguaggio tipo "soluzione", "piattaforma", "azienda" se presente

## 3. Link repo GitHub visibile

Verifica attuale: controllare header/footer/homepage per link a GitHub. Se assente o nascosto:
- Aggiungere icona GitHub in `AppShell` header (top-right, accanto a lingua/tema)
- Aggiungere link nel footer della landing
- Aggiungere CTA "⭐ Star on GitHub" nella hero

(Mi servirà l'URL della repo — vedi domande)

## 4. Security scan + SEO scan

- `security--run_security_scan` → review findings, fix quelli azionabili (RLS, GRANT, policy), aggiornare security memory
- `supabase--linter` per check addizionale DB
- `seo_chat--trigger_scan` → poi indirizzare al pannello SEO

## 5. Review styling ("non sembri un altro sito vibe-coded")

Audit rapido di `src/styles.css` + landing per identificare pattern generici (gradiente viola, Inter, card uguali, hero centrato classico). Poi propongo **3 direzioni di redesign** rendrizzate via `design--create_directions` (richiede screenshot della home — lo catturo io in build mode) e tu scegli. Direzioni candidate:

- **Editoriale/brutalist**: serif display + mono, griglia asimmetrica, tanto bianco, no gradient
- **Terminal/dev-tool**: mono ovunque, palette ad alto contrasto stile IDE, ASCII accents
- **Documentary OS**: tipografia tecnica + colori desaturati + micro-annotazioni stile paper accademico

Una volta scelta, applico tokens (`src/styles.css`) e ricompongo landing + AppShell.

---

## Tecnico (per riferimento)

- I post sono artefatti `/mnt/documents`, NON entrano nel codice
- Gli scan girano in background; per SEO mostro `<presentation-open-seo-review>`
- Il redesign tocca solo presentation (CSS tokens + JSX landing/AppShell), nessuna logica di business

---

## Domande prima di partire

1. **URL repo GitHub** (per link e CTA dei post)?
2. **Tema specifico del case study OS** da menzionare nei post e in homepage (es. "analisi codice locale con LLM", "BYOK privacy-first", altro)?
3. **Lingua post**: solo IT, o anche EN?
4. **Redesign**: procedo subito a generare le 3 direzioni dopo i post, o vuoi vederle separatamente in un turno dedicato?
