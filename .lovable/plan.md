## Problema

Nella pagina di un progetto, accanto a ogni repository ci sono due pulsanti — **"Apri file e commenti"** e **"Analizza la codebase"** — che non fanno nulla al click.

## Causa

In `src/routes/_authenticated/projects.$projectId.tsx` (righe ~210–228) ogni pulsante è strutturato così:

```tsx
<Link to="..." params={...}>
  <Button size="sm">…</Button>
</Link>
```

Questo annida un `<button>` dentro un `<a>` (HTML non valido). Il `<button>` cattura il click e impedisce all'`<a>` esterno di navigare → nessuna azione visibile.

## Soluzione

Invertire la composizione usando il pattern `asChild` di shadcn, che fa renderizzare il `Button` come il `Link` figlio (mantenendo gli stili del bottone ma usando l'elemento `<a>` del router):

```tsx
<Button size="sm" asChild>
  <Link to="/projects/$projectId/repos/$repoId" params={{ projectId, repoId: r.id }}>
    <FileText className="mr-1.5 h-3.5 w-3.5" />
    {t("project.openFiles")}
  </Link>
</Button>

<Button size="sm" variant="secondary" asChild>
  <Link
    to="/projects/$projectId/repos/$repoId"
    params={{ projectId, repoId: r.id }}
    search={{ view: "analyze" }}
  >
    <ScanSearch className="mr-1.5 h-3.5 w-3.5" />
    {t("project.analyzeCodebase")}
  </Link>
</Button>
```

## File modificati

- `src/routes/_authenticated/projects.$projectId.tsx` — solo il blocco dei due pulsanti per repository (righe ~210–228).

Nessuna modifica a backend, i18n o altri componenti.
