# Fix navigation flash & stability pass

## Root cause

The dark-blue flash on every click inside the authenticated area comes from TanStack Router's default empty pending state:

1. `src/routes/_authenticated/route.tsx` runs `supabase.auth.getUser()` in `beforeLoad` on **every** navigation. `getUser()` is a network call (hits `/auth/v1/user`), 200–800 ms.
2. The router has no `defaultPendingComponent`, no `defaultPendingMs`, and `defaultPreloadStaleTime: 0`. While the loader runs, the current Outlet unmounts and the browser shows the bare `<body>` (which is `bg-background`, deep dark) → perceived as a "blue flash".
3. Preload-on-intent isn't enabled, so hovering a Link doesn't warm the loader.

## Changes

### 1. `src/router.tsx` — smarter pending + preload
- `defaultPendingMs: 200` (don't render pending UI for fast navs).
- `defaultPendingMinMs: 400` (avoid flicker once shown).
- `defaultPreloadStaleTime: 30_000` (reuse preload data on actual nav).
- `defaultPreload: "intent"` (warm loaders on hover/focus).
- `defaultPendingComponent`: minimal top-of-page progress bar (semi-transparent overlay), **not** a full-screen background swap — keeps current UI visible underneath.

### 2. `src/routes/_authenticated/route.tsx` — use cached session
- Replace `supabase.auth.getUser()` (network) with `supabase.auth.getSession()` (reads local storage, sync-ish, instant).
- Still redirect to `/auth` when no session. The existing `onAuthStateChange` in `__root.tsx` already invalidates the router on sign-in/out, so the gate stays correct.

### 3. `src/routes/__root.tsx` — keep shell mounted during pending
- Add a lightweight `<RouterPendingIndicator />` (uses `useRouterState({select: s => s.status})`) inside `RootComponent` so the AppShell/Outlet doesn't visually disappear during transitions.

### 4. Small stability fixes found while auditing
- Add `errorComponent` to the `_authenticated` layout route so a failed auth check renders the styled error card instead of bubbling to root (avoids second flash).
- Ensure `Toaster` is rendered outside the `<Outlet />` (already true) so toasts survive route transitions — verify no regressions.

## Out of scope
- No copy, design-token, or backend changes.
- No new dependencies.

## Technical details

```text
Before:  click → unmount Outlet → blank bg-background → loader resolves → mount
After:   click → Outlet stays mounted → top progress bar after 200ms (only if needed) → swap
```

`defaultPreloadStaleTime: 30_000` means a route preloaded on hover is reused for 30s when actually clicked; combined with cached-session auth check, most intra-app navigations resolve synchronously.
