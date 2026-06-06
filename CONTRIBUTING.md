# Contributing to De-coder

Thanks for wanting to help! De-coder is an open-source project; contributions of any size are welcome.

## Dev setup

```bash
bun install
bun run dev
```

The app uses TanStack Start v1 (React 19 + Vite) on the edge runtime. Backend = Supabase (Postgres + Auth + Storage).

## Project conventions

- **Components** live in `src/components/`, **routes** in `src/routes/`, **server functions** in `src/lib/*.functions.ts`, **server-only helpers** in `src/lib/*.server.ts`. Never import a `.server.ts` file from a route or component.
- **Styling**: use the semantic tokens defined in `src/styles.css` (`bg-background`, `text-foreground`, etc.). Do not hard-code colors in components.
- **i18n**: every user-visible string must come from `t("…")`. Add the key to all three locale files (`en`, `it`, `zh`) — PRs missing a translation will not be merged. Use simple, dotted key paths grouped by feature (`workspace.explain`, `settings.byokSection`).
- **Security**: API keys are only ever decrypted inside server functions. Never log a decrypted key, never return one to the browser. Never disable RLS to "make things work".

## Reporting issues

- Don't paste real API keys, JWTs, or proprietary source code in issues.
- Sanitize stack traces before sharing.
- Security issues: open a private security advisory on GitHub, don't file a public issue.

## Pull requests

- One topic per PR.
- Run `bun run build` locally before pushing.
- Add or update tests when changing behaviour.
- Update README / docs / locale files when adding user-visible features.

Thanks ❤️
