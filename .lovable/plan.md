
# Sostituire favicon e logo con il nuovo mark Instagram

## Cosa faccio

1. **Copia asset**: `decoder-instagram-logo.png` → `public/favicon.png` (versione 512px per icon), `public/apple-touch-icon.png` (180px), `public/og-image.png` (1200×630 con padding su fondo nero).
2. **Rimuovo default**: `rm public/favicon.ico` (Lovable default) e `public/favicon.svg` obsoleto.
3. **Aggiorno `src/routes/__root.tsx`**: sostituisco il link `favicon.svg` con `favicon.png` (type `image/png`) + `apple-touch-icon`.
4. **Aggiorno `public/manifest.webmanifest`**: sostituisco entries `icons[]` con nuovo PNG (192/512).
5. **Aggiorno `src/components/Logo.tsx`**: il componente attuale usa SVG inline — lo sostituisco con `<img src="/favicon.png">` mantenendo dimensioni e alt esistenti, in modo che header/AppShell mostrino il nuovo mark ovunque venga usato `<Logo />`.
6. **Verifica**: build e ispezione visuale header su desktop + mobile.

## File toccati
- `public/favicon.png` (nuovo)
- `public/apple-touch-icon.png` (nuovo)
- `public/og-image.png` (nuovo)
- `public/favicon.ico` (delete)
- `public/favicon.svg` (delete se presente)
- `public/manifest.webmanifest`
- `src/routes/__root.tsx`
- `src/components/Logo.tsx`

## Note
- Non tocco `src/components/LangSwitcher`, `PublicHeaderAuthSlot`, o altri componenti che consumano `<Logo />` — l'aggiornamento si propaga automaticamente.
- OG image di default resta su leaf routes che già la definiscono; aggiorno solo il file `/og-image.png` se referenziato dal root, altrimenti lo lascio come asset disponibile.
