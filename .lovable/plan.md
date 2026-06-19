## Problema

I file generati (carosello LinkedIn, stories Instagram, caption) sono stati salvati in `marketing/social/` dentro il repository del progetto. Sono presenti — ma non sono scaricabili/visualizzabili direttamente dalla chat perché non sono stati pubblicati in `/mnt/documents/` (la cartella degli artefatti che vedi e scarichi dall'interfaccia).

## Cosa farò

1. Copiare tutti gli asset già generati in `/mnt/documents/decoder-community-update/`:
   - `carousel-linkedin/static_slide_1.png … static_slide_6.png`
   - `stories-instagram/story_1.png … story_6.png`
   - `linkedin-caption.md` (la caption completa con hook, CTA, hashtag)
   - `lockbit-screenshot.jpg` (lo screenshot originale usato nella slide 5)

2. Creare un piccolo `README.md` indice con la lista dei file e l'uso consigliato (quale slide va dove, ordine di pubblicazione, dove incollare la caption).

3. Emettere un tag `<presentation-artifact>` per ciascun file così potrai aprirli, vederli in anteprima e scaricarli direttamente dalla chat.

## Cosa NON cambia

- I file in `marketing/social/` restano dove sono (versionati nel progetto).
- Nessuna modifica al testo, alle slide o al layout già approvati nel turno precedente — è solo un'operazione di pubblicazione per renderli visibili e scaricabili.

Se invece vuoi anche **rigenerare** qualcosa (testi, layout, una slide specifica), dimmelo e lo includo nello stesso passaggio.