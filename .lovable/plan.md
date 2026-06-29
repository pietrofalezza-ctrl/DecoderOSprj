## Goal
Harden maintenance cron endpoints, add operator visibility, and give admins a guided rotation flow.

## 1. E2E/CI test for cleanup auth
- Add `src/routes/api/public/hooks/__tests__/cleanup-stale-repositories.test.ts` (vitest) that imports the route handler and asserts:
  - No `Authorization` header → 401
  - `Authorization: Bearer wrong` → 401
  - `Authorization: Bearer <CLEANUP_CRON_SECRET>` (env stubbed) → 200 with stats JSON
  - Length-mismatched bearer is rejected without throwing (timing-safe path)
- Mock `@/integrations/supabase/client.server` so no real DB call happens.
- The test runs under the existing `bunx vitest run` pipeline (no new CI wiring needed).

## 2. Server-side audit log for cleanup runs
- New table `public.maintenance_audit_log` via migration:
  - `job_name text`, `started_at timestamptz`, `finished_at timestamptz`, `status text` (`ok`/`error`), `stats jsonb` (scanned/deleted/files/objects), `error text`, `request_id text`.
  - GRANT `SELECT` to `authenticated` (RLS gates it), `ALL` to `service_role`.
  - RLS: only `public.has_role(auth.uid(), 'admin')` may SELECT; no INSERT/UPDATE/DELETE for clients (writes go through service role).
- Modify `cleanup-stale-repositories.ts` to insert one row per run (success or failure) using `supabaseAdmin`, capturing a generated `request_id` and returning it in the response.

## 3. Admin UI: audit log + credentials status + rotation wizard
- New protected route `src/routes/_authenticated/admin.tsx` gated by `has_role('admin')` server check (redirect to `/` otherwise).
- Sections:
  - **Maintenance audit log** — table of last 50 runs from `maintenance_audit_log`, with timestamps, status, repos removed, and `request_id`. Backed by `listMaintenanceAudit` server fn (admin-only via `has_role` check).
  - **Rotate cleanup secret** — button + confirmation dialog. Calls `rotateCleanupCronSecret` server fn that:
    1. Verifies caller is admin.
    2. Generates 48-char random secret server-side.
    3. Updates `CLEANUP_CRON_SECRET` via Lovable secret store (note: requires manual `secrets--update_secret` flow — see Open question).
    4. Reschedules `cron.unschedule` + `cron.schedule` with the new bearer.
    5. Logs the rotation into `maintenance_audit_log` (`job_name='rotate-cleanup-secret'`).

## 4. Credentials status panel in Settings
- Extend `src/routes/_authenticated/settings.tsx` with a new "Credentials status" card:
  - For each supported provider, show: configured (Yes/No), key hint, last updated.
  - If `listProviders` throws or returns empty when the user expects a key, show a clear warning: *"Una chiave risulta salvata ma non è leggibile — contatta il supporto o reinseriscila."*
  - Add a server fn `getCredentialsStatus` returning `{ provider, configured, key_hint, updated_at, readable }[]` so the UI can distinguish "missing" from "unreadable" (e.g. decryption probe failure).

## 5. Apply same protection schema to all maintenance cron endpoints
- Inventory: today only `cleanup-stale-repositories` and the email-queue processor under `/api/public/hooks/*`. Audit each handler and ensure:
  - Reads a dedicated `*_CRON_SECRET` (no `VITE_` prefix, never the anon key).
  - Uses `timingSafeEqual` bearer comparison.
  - Writes a `maintenance_audit_log` row.
- Email-queue processor: introduce `EMAIL_QUEUE_CRON_SECRET` if it currently uses the anon key, and reschedule its pg_cron with the new bearer.

## Technical notes
- `pg_cron` rescheduling done via `supabase--insert` SQL (`cron.unschedule` + `cron.schedule`) inside the rotation server fn — runs with service role.
- `maintenance_audit_log` writes use `supabaseAdmin` so they bypass RLS; reads use the user-scoped client and rely on the RLS policy + `has_role` check.
- All admin server fns verify `has_role(context.userId, 'admin')` before touching admin data, matching the pattern in existing privileged fns.

## Open question
The Lovable secret store can't be mutated from runtime server code — `CLEANUP_CRON_SECRET` rotation needs the `secrets--update_secret` tool, which prompts the user. Two options for the "rotation wizard":
- **(A)** UI generates+displays a new secret, admin pastes it into the secret-rotation prompt, then clicks "Reschedule cron" which sends the new value to the rescheduler. Fully guided, no secret persisted in DB.
- **(B)** Store the active cron secret in a new admin-only table (`cron_secrets`), rotate purely server-side, and have the cron endpoint compare against the DB value instead of `process.env`. Single-click rotation but adds a DB-hosted secret.

Which do you prefer? I'll default to **(A)** unless you say otherwise.