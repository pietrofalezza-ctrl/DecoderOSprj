## Obiettivo

Tre interventi distinti, tutti nel frontend/presentazione (nessun cambio di logica, DB o server fn):

1. **SEO**: avviare la review SEO integrata di Lovable e migliorare i meta tag.
2. **T&C evidenti al login Google**: rendere visivamente ovvio che la checkbox è obbligatoria anche per il login con Google (non solo email/password).
3. **Claim potenziato**: posizionare De-coder come strumento essenziale in un mondo dove sempre più codice è generato da IA.

---

## 1. SEO

- Avviare la review SEO Lovable (`seo_chat--trigger_scan`) — richiede approvazione utente, mostra i risultati nel pannello SEO dopo ~1 minuto.
- In parallelo, migliorare i meta sitewide in `src/routes/__root.tsx`:
  - `title`: "De-coder — Capisci il codice generato dall'IA, in qualsiasi linguaggio"
  - `description`: orientata al positioning anti-AI-slop, ~155 char, con keyword "AI-generated code", "code understanding", "open source".
  - Aggiungere `og:url`, `twitter:title`, `twitter:description`.
- Aggiungere `head()` con meta dedicati ai route pubblici che oggi non li hanno (verificare `index.tsx`, `manifesto.tsx` — `terms.tsx` e `docs.tsx` già coperti). Ogni route avrà titolo e description unici (no duplicati).
- Canonical: aggiungere `<link rel="canonical">` per-route sui leaf (non in `__root.tsx`, regola TanStack).
- Aggiungere JSON-LD `SoftwareApplication` su `index.tsx` (nome, descrizione, applicationCategory: DeveloperApplication, offers free, license MIT).
- Dopo il fix, marcare i finding risolti tramite `seo_chat--update_findings`.

## 2. Checkbox T&C evidente per Google login

Problema: oggi la checkbox è in basso vicino al pulsante "Accedi" email; il pulsante Google sta sotto e visualmente sembra slegato. Utenti non capiscono perché Google è grigio.

Modifiche a `src/routes/auth.tsx`:
- **Spostare il blocco checkbox T&C in cima al form**, sopra entrambe le sezioni (email/password e Google), con stile più visibile: bordo `border-primary/40` invece di `border/60`, background `bg-primary/5`, label leggermente più grande.
- Aggiungere accanto al pulsante Google (e al submit email) un **hint dinamico**: quando `!accepted`, mostrare sotto i pulsanti il testo "↑ Accetta prima i Termini per continuare" in colore `text-destructive/muted-foreground`.
- Quando l'utente clicca Google senza accettare, oltre al toast attuale, **far lampeggiare/evidenziare brevemente la checkbox** (animazione 2s con ring-destructive) tramite uno stato `highlightDisclaimer`.
- Aggiungere `aria-describedby` sui pulsanti che puntano al testo della checkbox per accessibilità.
- Aggiungere nuove chiavi i18n in EN/IT/ZH:
  - `auth.disclaimerRequiredHint`: "Accetta prima i Termini per continuare ↑"
  - `auth.disclaimerHeader`: "Prima di continuare" (titolo del box T&C)

## 3. Claim "Capire il codice nell'era dell'IA"

Riposizionamento del messaging in `src/routes/index.tsx` e i18n:
- **Nuovo hero (heroLine1/Accent/Line2/Accent)** in IT/EN/ZH:
  - IT: "Sempre più codice è scritto dall'**IA**. Tu devi ancora **capirlo**."
  - EN: "More and more code is written by **AI**. You still need to **understand it**."
  - ZH: "越来越多的代码由**AI**编写。你仍然需要**理解它**。"
- **Nuovo heroSubtitle**: enfasi su review di codice AI-generated, audit di sicurezza su PR di Copilot/Cursor/Lovable, onboarding su codebase scritte parzialmente da agenti.
- **Nuovo badge hero** sostituire `heroBadgeAI` ("AI Powered") con `heroBadgeAiEra` ("Per l'era del codice IA") — più sull'utilità che sulla buzzword.
- **Nuova sezione "Perché ora"** (componente `WhyNow`) inserita tra Hero e Features:
  - 3 bullet con icone: "Il 40%+ del codice nei nuovi progetti è generato da IA", "Le PR si moltiplicano, le review umane no", "Capire ≠ generare: serve un layer di comprensione".
  - Tono fattuale, niente claim numerici non verificabili: riformulare in modo qualitativo ("una porzione crescente", "un volume crescente").
- **Aggiornare le 3 Feature card** mantenendo le icone ma riallineando i body al nuovo claim (feature2Body cita esplicitamente "spiegare codice generato da agenti IA").
- Aggiornare la meta description sitewide (vedi punto 1) per coerenza.

---

## File toccati

- `src/routes/__root.tsx` — meta SEO sitewide
- `src/routes/index.tsx` — nuovo claim, sezione "Perché ora", head() per-route, JSON-LD
- `src/routes/manifesto.tsx` — head() per-route con meta dedicati
- `src/routes/auth.tsx` — checkbox riposizionata, hint, animazione highlight
- `src/i18n/locales/{en,it,zh}/common.json` — nuove chiavi hero, whyNow, disclaimer hint/header

Nessuna migrazione DB, nessun nuovo server fn, nessuna dipendenza nuova.

## Fuori scope

- Generazione `og:image` (può essere aggiunta dopo con imagegen se l'utente lo richiede).
- Modifiche al copy del manifesto (resta com'è — già allineato).
- Cambio del flusso di autenticazione (la checkbox resta blocking come deciso in precedenza).
