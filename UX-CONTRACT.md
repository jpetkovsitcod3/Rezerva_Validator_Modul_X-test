# Bridge Modul X — UX Contract (UX-CONTRACT.md)

> Authoritative for **observable frontend behavior**. `DESIGN.md` is authoritative for visual intent. When they collide, behavior wins for product correctness, visuals win for taste; escalate conflicts instead of silently choosing.

Scope: every screen in `email-validator/frontend/src/app/*` and the marketing site in `email-validator/frontend/src/landing/*`. Tests live in `src/app/*.test.tsx`, `src/lib/*.test.tsx`.

---

## 1. Global rules

1. **Native semantics first.** A real `<button>` for actions, a real `<a href>` for navigation, a real `<table>` for read-oriented tabular data, a real `<form>` for submissions. Do not turn `<div>` into a clickable target.
2. **Every enabled pointer target has visible keyboard focus, hover, active, and disabled/busy states.** Hover must never be the only way to discover content.
3. **No native `alert()` / `confirm()` / `prompt()`.** Use `Modal` / `Confirm` from `app/ui.tsx` only.
4. **One toast system.** `useToast()` only. Placement: bottom-right, 16px inset, z-index `--z-toast`. Max 4 stacked. 3.8s auto-dismiss. Toasts acknowledge — they never contain the only copy of critical information.
5. **No hard-coded z-index** in component code. Use the `--z-*` tokens.
6. **No hard-coded surface colors** (`#111111`, `#FFFFFF`, `#EAEAEA`, `#F7F6F3`, `bg-white`) in component code. Use the `--color-*` tokens or their Tailwind v4 utilities (`bg-canvas`, `text-ink`, `border-hairline`).
7. **No `reportValidity()`.** App-owned validation in `Field` and `Form`; first invalid field gets focus + `aria-invalid="true"` on submit.
8. **All transitions honor `prefers-reduced-motion: reduce`.** Already enforced by `usePrefersReducedMotion` and the inert CSS rules in `index.css`.
9. **Auth is a hard gate.** `Guard` redirects unauthenticated users to `/login`, non-admin users hitting `/admin/*` to `/app`. `booting` shows `BootSplash`, never blank.
10. **Theme switch is instant, no flash.** Theme is applied on `<html data-theme="…">` before React mounts (in `index.html` script, see §6).

## 2. Consistency contract (cross-screen)

The same operation MUST keep the same label, component, state model, feedback, and navigation outcome everywhere unless the business process genuinely differs.

| Operation                | Label         | Component                  | Pending                | Success destination                       | Success feedback                | Failure recovery                                   |
|--------------------------|---------------|----------------------------|------------------------|-------------------------------------------|---------------------------------|----------------------------------------------------|
| Save (any form)          | `Save`        | `PrimaryButton`            | button label → busy    | back to owning list (preserve list state) | toast `Saved`                   | inline `Field` error, focus first invalid          |
| Cancel                   | `Cancel`      | `SecondaryButton`          | none                   | back, no save                             | none                            | n/a                                                |
| Create                   | `Create`      | `PrimaryButton`            | button label → busy    | back to owning list                       | toast `Created`                 | inline error                                       |
| Edit                     | `Save`        | `PrimaryButton`            | button label → busy    | back to detail (or list if came from list) | toast `Saved`                   | inline error                                       |
| Hard delete              | `Delete`      | `DangerButton` in `Confirm`| confirm dialog open    | back to list, preserve state              | toast `Deleted`                 | cancel closes dialog                               |
| Bulk delete              | `Delete N`    | `DangerButton` in `Confirm`| confirm names count    | back to list, selections cleared          | toast `Deleted N`               | cancel preserves selections                        |
| Copy                     | `Copy`        | `CopyBtn`                  | inline "Copied" 1.6s   | n/a                                       | inline copy state + toast       | fallback to `execCommand("copy")`                  |
| Sign out                 | `Sign out`    | menu item in Shell         | redirect               | `/`                                       | none (intentional)              | cancel not applicable                              |

If a new operation does not fit this matrix, add a row. Do not invent a parallel pattern.

## 3. API ↔ UI contract

Source: `email-validator/backend/app/api/routes.py`. The frontend treats the following as the **public contract**; everything else is implementation detail.

| Endpoint                                          | UI behavior                                                                                                  |
|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `POST /api/v1/validate/single`                    | `useSingleValidation` hook. Debounce 300ms. Cancels stale responses (request id). On `>=400` show inline.   |
| `POST /api/v1/validate/bulk`                      | `useBulkValidation` hook. Polls `/bulk/status/{task_id}` every 2s while `status` is `PENDING` or `STARTED`.   |
| `GET  /api/v1/validate/bulk/status/{id}`          | Returns `TaskStatusResponse`. `progress` is 0..total. UI shows progress bar + segment counts.               |
| `GET  /api/v1/validate/quick/{email}`             | `quickValidate` — used for live-typing, debounced 300ms, IME-safe.                                          |
| `GET  /api/v1/domain/{domain}`                    | `getDomainInfo` — used in `DomainInfo` panel.                                                                |
| `GET  /api/v1/history?limit=50`                   | `apiHistory` — used by `Overview`, `History`. Server-side limit; client requests `limit=50` maximum.        |
| `GET  /api/v1/stats`                              | `apiStats` — used by Overview, Validator, History. Treat 0 as "no data", not "error".                       |
| `GET  /api/v1/db/status`                          | Read-only health indicator. Not surfaced to end users.                                                       |
| `GET  /api/v1/health`                             | Read-only health indicator. Not surfaced to end users.                                                       |

**Stale-response cancellation rule:** any hook that fires on input change MUST compare its `requestId` to the latest before calling `setState`. Older responses must not overwrite newer ones. The `useSingleValidation` hook already implements this; any new hook that calls the API MUST do the same.

## 4. Page-by-page behavior

### 4.1 Shell (`/app/*`, `/admin/*`)

- One shell for both areas. `area="user" | "admin"` switches the nav, brand label, and the workspace switcher.
- Sidebar collapses below `lg` into a slide-in drawer (max-width 320px, focus trapped while open, `Esc` closes, focus returns to the hamburger button).
- Header: title, area subtitle, "Core Stable" status pill, user menu.
- User menu: opens on click, `Esc` closes, focus returns to trigger. Contains "Profile & security" + "Sign out". No destructive action without an explicit `Confirm`.
- Workspace switcher (admin only): shows "User view" inside `/admin/*` and "Admin console" inside `/app/*` for `role === "admin"`. No implicit redirect.

### 4.2 `/app` Overview

- Loads `apiStats` + `apiHistory(50)` on mount. Both have a `loading` shimmer, never a spinner that blocks the whole page.
- Empty state: "No validations yet" with `EmptyState` + a CTA to `/app/validator`. Never a blank card.
- Error state: `SuiMessage tone="danger"` at the top of the page, with the exact error message from the API.
- Sparkline: shows last 24h validations; uses `tokens` from `lib/motion` for animation, never `setInterval` (uses `useActiveInView`).

### 4.3 `/app/validator` Validation Engine

- Single email input with debounce (300ms, IME-safe).
- "Deep" toggle: SMTP-layer. Adds visual chip when active.
- "Example chips" populate the input on click; never auto-submit.
- Result card appears on the same page; never navigates away.
- History list below: last 10 single validations, click restores the email into the input. No delete from this list (history is canonical).
- Long-running validation: button shows `Spinner` + `Working…`, never changes width.
- Errors: inline `Field` error; the API message is shown verbatim; never an alert.

### 4.4 `/app/history` Analytics

- Table with column sort (email, verdict, score, time). Sort header is a real `<button>`, not a `<div>`.
- Pagination: 25 per page. Page, sort, and filter persist in URL hash. Back button restores.
- Empty state: `EmptyState` with "Run your first validation" CTA to `/app/validator`.
- Bulk-export button disabled if `results.length === 0`.

### 4.5 `/app/keys` Pipeline Control (API keys)

- Copy buttons use `CopyBtn` only.
- Creating a key: `Modal` opens, on submit shows the new key **once** in a `SuiMessage tone="info"` with a `CopyBtn`. The key is never shown again; the UI says so explicitly.
- Revoking a key: `Confirm` dialog, names the key, default `danger`, focus on Cancel.

### 4.6 `/app/settings` System Config

- All forms use the `Field` primitive.
- "Save" button is disabled until the form is dirty (not on initial render).
- Success toast `Saved`. Failure shows inline errors with focus on the first invalid field.

### 4.7 `/admin` Overview, Users, Logs, Blocklist, Engine

- Same Shell, admin nav. `area="admin"`.
- Admin-only destructive actions: `Confirm` with `danger`, focus on Cancel, action label uses the real verb (`Delete user`, `Revoke session`).
- Blocklist editor: textarea + paste. The textarea is `resize: none` with auto-grow. Submit `PrimaryButton` with busy state.
- Global logs: read-only table, virtualized for >200 rows. Filter chips above the table are real buttons with `aria-pressed`.

### 4.8 Auth (`/login`, `/signup`)

- One column, 360px max. Server-side errors render as `SuiMessage tone="danger"` above the form, never an `alert`.
- Submit: button shows `Working…`, never widens.
- `Enter` submits; `Tab` cycles through fields.
- On success, redirect to `?next=` or `/app`.

## 5. Migration backlog (token + contract drift)

The current codebase has these known drifts. They are bugs, not preferences. Phase 1 closes the system-level ones.

1. `app/ui.tsx` Modal already traps focus. **Verify** `Confirm` (which is a thin wrapper) and `EmptyState` actions that open a `Modal` also get a trap.
2. `Shell.tsx` hard-codes `w-64` (256px) for the sidebar; promote to a `--layout-sidebar` token. (Phase 1.)
3. `Shell.tsx` z-ordering: hamburger `z-50`, drawer backdrop `z-40`, sidebar `z-50`, main content is unconstrained. Add a documented z-stack and ensure the main content never paints over the drawer.
4. `Toast` is `z-[120]`, `Modal` is `z-[110]`, `ScrollProgress` is `z-90`. Replace with `--z-toast` / `--z-modal` / `--z-scroll-progress`. (Phase 1.)
5. Many components hard-code `bg-white`, `bg-[#111111]`, `border-[#EAEAEA]`, `text-[#111111]`, `text-[var(--text-2)]`. Phase 1 migrates a representative slice (Shell + Overview + Validator page + Auth + Account) onto the new utility set. Phase 2+ migrates the rest in screen-sized PRs.
6. The dark theme is declared in `index.css` (`[data-theme="dark"]`) but its values are identical to light. Phase 1 fills in the real dark palette and adds a `ThemeToggle` to the Shell. (Phase 1.)
7. `metallic-panel` decoration (`screw-bottom`) is theme-coupled in light. In dark it must soften (or be removed). (Phase 1.)

## 6. Bootstrapping the theme without flash

`index.html` includes an inline script (before any stylesheet) that:
1. Reads `localStorage["bmx.theme"]` if present.
2. Else reads `prefers-color-scheme: dark`.
3. Else defaults to `light`.
4. Sets `document.documentElement.dataset.theme` to the resolved value **before** React mounts.

`src/lib/theme.tsx` then:
1. Mirrors the same logic on mount (in case SSR / no-script).
2. Exposes `useTheme() => { theme, setTheme, toggle }`.
3. Persists changes to `localStorage["bmx.theme"]`.
4. Emits a 200ms CSS cross-fade on `<html>` to avoid a flash.

## 7. Tests required

For every screen or shared primitive touched:

- Component-state story (vitest + `@testing-library/react`): renders all five states (loading, empty, error, populated, action).
- Interaction test: `userEvent` covers at least one of (click, keyboard, focus trap) per interactive control.
- A11y: `axe` smoke test on the rendered surface.
- Existing tests in `*.test.tsx` MUST keep passing.

## 8. Out of scope

- Backend implementation. The contract in §3 is the boundary.
- Marketing copy & SEO. The brand file `DESIGN.md §1` is the constraint; the landing components are presentation only.
- i18n. The product is `en-US` only for now; copy is plain text in component files. If a future locale is added, the message store moves to `src/lib/i18n.tsx` and every `SuiMessage` / `SuiButton` reads from it.
