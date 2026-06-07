## Obiettivo

Togliere l'email pubblica e gli impegni di tempi di risposta dalla pagina `/contact`, convogliare tutto su GitHub (Issues + Security Advisories privati), valutare il banner cookie e chiarire chi fa cosa sul versante "ispezioni".

---

## 1. Pagina `/contact` — rimuovere email e SLA

In `src/routes/contact.tsx`:

- Eliminare i blocchi `mailto:` (Privacy/GDPR e Security): niente indirizzo in chiaro, niente link email.
- Sostituire ogni CTA con un link a GitHub:
  - **Privacy & GDPR** → link a una nuova issue template `gdpr-request` su `common.repoUrl` (`/issues/new?labels=gdpr&template=gdpr-request.md`). Testo: "Apri una richiesta su GitHub (anche in forma riservata via Security Advisory se contiene dati personali)".
  - **Sicurezza** → link a GitHub Security Advisories (`/security/advisories/new`), che è il canale privato standard. Nessun indirizzo email esposto.
  - **Bug/feedback** → resta GitHub Issues (già così).
- Rimuovere completamente la riga `contact.responseTimes` (nessuna promessa di SLA finché non c'è obbligo formale).
- Mantenere il tono: "canale unico, pubblico e tracciabile = GitHub; per segnalazioni riservate usa Security Advisories".

Aggiornare le 3 locali (`en`, `it`, `zh`):

- `contact.privacyBody` → testo senza email, rimanda a GitHub.
- `contact.securityBody` → testo senza email, rimanda a Security Advisories privati.
- `contact.bugsBody` → invariato salvo togliere riferimenti a tempi.
- Cancellare `contact.responseTimes`.
- Aggiungere chiavi nuove: `contact.privacyCta` ("Apri richiesta GDPR su GitHub"), `contact.securityCta` ("Apri Security Advisory privato"), `contact.bugsCta` ("Apri Issue").
- In `landing` / `footer.contact` (riga 172 di `it/common.json`): togliere l'email e il "30 giorni", rimandare a `/contact`.

Stessa pulizia in qualunque altra pagina che cita l'email: rapida grep su `pietro@codecoder.com` nei locali per non lasciare residui.

---

## 2. Cookie banner

Stato attuale: l'app **non usa** analytics, tag manager, pixel marketing o tracker terzi. L'unico cookie tecnico è `sidebar_state` (preferenza UI, strettamente necessario).

Conseguenza GDPR/ePrivacy: **non è obbligatorio** un banner di consenso. Basta una menzione nella pagina `/terms` (o nuova sezione "Cookie" dentro Terms) che spieghi: "usiamo solo cookie tecnici strettamente necessari; nessun tracciamento, nessun consenso richiesto".

Proposta: **non aggiungere il banner ora**. Aggiungere invece un breve paragrafo "Cookie" dentro `/terms` (3 righe x 3 lingue). Se in futuro si attiva un'analytics, allora si introduce il banner.

---

## 3. "Chi si occupa di queste ispezioni?" — risposta sintetica

Non un capitolo del piano, è una chiarificazione per te (non genera codice):

- **GDPR (privacy, diritti dell'interessato, data breach):** il Titolare del trattamento sei tu (o la società che pubblica Decoder). In Italia l'autorità di controllo è il **Garante per la protezione dei dati personali**. Senza dipendenti/utenti su larga scala non sei obbligato a nominare un DPO. Le ispezioni vere e proprie le fa il Garante solo su segnalazione o audit programmati: per un open source senza tracking il rischio operativo è basso, ma sei comunque tu a dover rispondere se arriva una richiesta.
- **Sicurezza applicativa:** non c'è un ente che "ispeziona" il codice. La responsabilità è del maintainer. Il canale standard è GitHub Security Advisories + eventuale CVE tramite GitHub stesso (CNA).
- **Marketplace/host (Lovable, Supabase, Cloudflare):** ognuno ha le proprie policy e può sospendere il progetto se viola i ToS, ma non sono "ispettori GDPR".
- **Audit volontari:** se vuoi un bollino, puoi farti certificare ISO 27001 / SOC 2 da auditor terzi, ma è oneroso e non richiesto per un progetto open source senza clienti enterprise.

Quindi: oggi le "ispezioni" coincidono di fatto con le segnalazioni della community via GitHub — coerente con la scelta di rimuovere l'email e centralizzare tutto là.

---

## File toccati

- `src/routes/contact.tsx` (rimozione card email, nuovi CTA GitHub, no responseTimes)
- `src/i18n/locales/{en,it,zh}/common.json` (testi contact.*, rimozione email in `landing.footer.contact`, aggiunta paragrafo cookie in `terms.*`)
- `src/routes/terms.tsx` (sezione "Cookie" — solo se la struttura usa stringhe i18n già pronte; altrimenti aggiungo blocco statico minimale)

Nessuna modifica a logica backend, RLS, o credenziali.
