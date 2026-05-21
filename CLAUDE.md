# profiltechAppFrontend — Project Guide

Internal Nuxt 4 frontend for Profiltech. Talks to a Laravel API (Sanctum cookie auth) and receives live updates via Laravel Reverb (WebSocket).

## Stack

- **Nuxt 4** (`app/` directory layout — note all source lives under `app/`, not the project root)
- **Nuxt UI v4.7.x** (`@nuxt/ui`) — accessible Vue components on top of Tailwind v4
- **Tailwind v4** (no `tailwind.config.js` — config lives in `assets/css/main.css`)
- **TypeScript** strict mode via `nuxt typecheck`
- **nuxt-auth-sanctum** for auth (cookie mode, not Bearer)
- **laravel-echo + pusher-js** for WebSocket subscriptions to Reverb
- **ESLint** with `@nuxt/eslint` — stylistic rules: no trailing commas, 1tbs brace style

## Directory layout

```
app/
  app.config.ts        # @nuxt/ui theme tokens (primary color, neutral)
  app.vue              # root component (UApp + NuxtLayout + NuxtPage)
  assets/css/          # Tailwind entry, custom CSS
  components/          # Vue components (auto-imported)
  composables/         # use*.ts (auto-imported)
  config/              # static config objects (menu items, status meta, etc.)
  layouts/             # default.vue with sidebar
  pages/               # file-based routing
  plugins/             # *.client.ts (client-only), *.server.ts, plain *.ts (both)
nuxt.config.ts         # runtimeConfig, modules, vite tweaks
.env.example           # documented env vars
```

## Conventions

### Language
- UI / user-facing strings: **Danish** (`Bestillingsordrer`, `Send bestilling`, etc.)
- Code, identifiers, types, comments, commits, env vars: **English**

### Communication
- All interaction with the user (Mattias) happens in Danish.

### Composables
- File name = exported function name: `useCustomOrders.ts` exports `useCustomOrders()`
- Accept reactive inputs as `MaybeRefOrGetter<T>` — unwrap with `toValue()` inside `computed`/`watch`. This lets callers pass refs, getters, or plain values.
- Side-effect composables (subscriptions, timers, listeners) must clean up via `onScopeDispose()` so they work in nested setup scopes (e.g. inside other composables).
- Return refs/computed, not raw values, so consumers stay reactive.

### Components
- Auto-imported — no `import` needed for `app/components/**`. Sub-folder name becomes a prefix: `app/components/custom-orders/SendDialog.vue` → `<CustomOrdersSendDialog>`.
- Props typed with `defineProps<{ ... }>()`. Events with `defineEmits<{ name: [arg] }>()`.
- For dialogs/modals, use `v-model:open` pattern (see `CustomOrdersSendDialog`).

### Config files (`app/config/*.ts`)
- Static, side-effect-free modules: option arrays, status → label/color maps, menu items.
- Imported explicitly (not auto-imported) so the relationship is visible: `import { getSubmissionStatusMeta } from '~/config/submission-status'`.

### Pages
- Use `<UDashboardPanel>` with `#header` (`UDashboardNavbar`) and `#body` slots for dashboard-style pages.
- Page-level state (filters, pagination) lives in the page setup; composables stay generic and accept it as inputs.

## Auth — Sanctum cookie mode

- Mode: `cookie` (configured in `nuxt.config.ts`). The server sets `XSRF-TOKEN` and session cookies; the browser sends them with `credentials: include`. **No Bearer tokens** — do not introduce them.
- Login: `useSanctumAuth().login({ email, password })`. Logout: `useSanctumAuth().logout()`.
- Authenticated fetch helpers:
  - **`useApiFetch`** — wraps `useSanctumFetch`. Use for *page-level* data loading (gets SSR hydration, `refresh()`, `status`, error toast). Returns `AsyncData`.
  - **`useSanctumClient`** — imperative `$fetch`-style. Use for *user-initiated mutations* (POST/PATCH/DELETE) where you await a result inside a handler.
- All endpoints are relative paths (`/custom-orders`) — base URL comes from `runtimeConfig.sanctum.baseUrl` (server-side) and `runtimeConfig.public.sanctum.baseUrl` (browser).

## WebSocket — Reverb + Echo

- Plugin: `app/plugins/echo.client.ts` — client-only (`.client.ts` suffix). Exposes `$echo` via `useNuxtApp()`.
- **Auth uses Sanctum cookies**, not the Bearer-token example from Laravel docs. The plugin's `authorizer` calls `/broadcasting/auth` through `useSanctumClient` so the session cookie flows automatically.
- Subscriptions: use `useSubmissionChannels` (or write similar composables). Channels are named e.g. `orders.{id}.submission`. Event names are exact (prefix with `.`), e.g. `.CustomOrders\\SubmissionStatusUpdated`.
- **Gotcha — channel ownership:** `echo.leave(channelName)` kills the channel entirely, not just one listener. Don't have two composables subscribing to the same channel; pick *one* owner (typically the parent/list view, not the modal).
- **Gotcha — UTable reactivity:** TanStack Table (under `UTable`) only re-renders when the `data` array *reference* changes, not on deep mutation of row objects. For live updates that should reflect in the table, call `refresh()` on the list query rather than mutating individual order objects.
- **Optimistic updates:** if a mutation triggers a state change that another subscription depends on, set the state *before* awaiting any refresh — otherwise the watcher subscribing to that state may miss its window (see `useOrderSendForm.handleSend` setting `submission_status = 'queued'` immediately after `sendOrder` returns).

## Backend response shape

The Laravel API returns Laravel's flat paginator format:
```json
{
  "data": [...],
  "current_page": 1, "from": 1, "last_page": 3,
  "per_page": 20, "to": 20, "total": 56,
  "path": "...", "links": [...]
}
```
**Not** wrapped in `meta`/`links` — adapter lives in `useCustomOrders` (`meta` computed). If a new endpoint follows the same shape, copy the pattern.

### Filter conventions
- Query params use Spatie-style `filter[key]=value` syntax.
- Filter values are normalized in the page (e.g. `'all'` → empty/undefined) before being passed to the composable.

## Nuxt UI v4 conventions

- Light mode only: `ui.colorMode: false` in `nuxt.config.ts` disables `@nuxtjs/color-mode` — do not add dark-mode classes (`dark:*`).
- Primary colors set in `app/app.config.ts` (`ui.colors.primary`, `ui.colors.neutral`). Change theme there, not per-component.
- Component naming: PascalCase with `U` prefix in templates (`<UButton>`, `<UTable>`, `<UDashboardPanel>`).
- Use the design tokens (`text-default`, `text-muted`, `bg-elevated`, `border-default`) rather than raw Tailwind grays — they're theme-aware.
- For table cells use template slots `#{column}-cell="{ row }"`. `row.original` is the typed data object.
- Prefer Nuxt UI components over hand-rolled equivalents (e.g. `USelect` not a custom dropdown). Look it up via `mcp__nuxt-ui-remote` if unsure of the API.

## Environment variables

All public/browser-visible vars are prefixed `NUXT_PUBLIC_*`. Server-only vars use `NUXT_*`. Vars override matching keys in `runtimeConfig` by path (so `NUXT_PUBLIC_REVERB_APP_KEY` → `runtimeConfig.public.reverb.appKey`).

Required:
- `NUXT_SANCTUM_BASE_URL` (server-side / internal — Docker service name in prod)
- `NUXT_PUBLIC_SANCTUM_BASE_URL` (browser — public API domain in prod)
- `NUXT_PUBLIC_REVERB_APP_KEY`, `NUXT_PUBLIC_REVERB_HOST`, `NUXT_PUBLIC_REVERB_PORT`, `NUXT_PUBLIC_REVERB_SCHEME`

**Never** expose `REVERB_APP_SECRET` to the frontend — it stays in backend `.env` only.

## Deploy (Dokploy)

- Builds with `npm ci --ignore-scripts` — the lockfile must stay strictly in sync with `package.json`. If `npm ci` fails locally with `Missing: <pkg> from lock file`, do a clean reinstall:
  ```sh
  rm -rf node_modules package-lock.json && npm install
  ```
  then commit the regenerated lockfile.
- Runtime env vars are injected by Dokploy and override `runtimeConfig` directly — no `.env` file inside the image.

## Anti-patterns

- **Don't** install packages without confirming first (see global CLAUDE.md). Always propose, wait for approval.
- **Don't** add Bearer-token logic anywhere — Sanctum cookie mode handles it.
- **Don't** mutate row objects expecting `UTable` to re-render — call `refresh()` or replace the data array.
- **Don't** subscribe to the same Echo channel from multiple places — `leave()` is global per channel.
- **Don't** introduce dark-mode classes; color mode is disabled.
- **Don't** put secrets in `NUXT_PUBLIC_*` — they end up in the client bundle.
- **Don't** read or write `.env` files (only `.env.example`).
- **Don't** add comments that just restate the code. Comments should explain *why* something non-obvious is there (see global CLAUDE.md).

## Useful commands

```sh
npm run dev          # nuxt dev — http://localhost:3000
npm run build        # production build
npm run typecheck    # nuxt typecheck
npm run lint         # eslint .
```
