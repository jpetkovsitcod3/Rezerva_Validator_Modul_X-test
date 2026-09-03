# PLAN.md — Full-Cycle QA & Hardening Strategy

## Scope

BRIDGE Modul X — React 19 + TypeScript + Vite 7 + Tailwind 4 + Framer Motion SPA.
**Adaptation note (per R1):** this workspace has **no Node.js server runtime and no Gemini
integration** — the reference repo's FastAPI/Supabase backend was adapted into a client-side
service layer (`src/lib/db.ts`) over `localStorage`, with a pure deterministic engine core
(`src/lib/engine.ts`). The "backend" test target is therefore the service/data layer, tested
as in-process modules (Supertest/MSW are not applicable — there is no HTTP surface and no
external network calls to mock; localStorage is cleared/reseeded per test).

## Core user journeys (critical paths)

1. Landing → signup → seeded credits → dashboard.
2. Login (user/admin) → role-routed dashboard; suspended accounts blocked.
3. Single validation: quick (free) and deep (1 credit), rate-limited to 15/min.
4. Bulk clean: credit pre-check → queued run → persisted job → CSV export.
5. Domain intelligence lookup (MX/SPF/DMARC/DKIM).
6. History: search/filter/paginate/trace/delete/export.
7. API keys: create (secret shown once) / revoke / 5-key limit.
8. Admin: credit adjust, promote, suspend/reactivate, protected-delete, blocklist (feeds
   engine Layer 4 live), engine layer switches, settings clamp, demo reset (stable ids).

## Test architecture

- **Tools:** Vitest 4 (Vite-7 compatible), jsdom, @testing-library/react + user-event,
  @testing-library/jest-dom (vitest entry), @vitest/coverage-v8.
- **Layout:** colocated `*.test.ts(x)` next to source.
- **Naming:** `should <expected> when <condition>`; AAA per test; one behavior per test.
- **Determinism:** fake timers (`vi.useFakeTimers` + `advanceTimersByTimeAsync`) for all
  db-layer latency; `resetDemoData()` in `beforeEach`; factories for users/emails; no network.
- **Queries:** accessible roles first (`getByRole`), labels, `role="alert"`/`progressbar`/`radio`.
- **Framer Motion in jsdom:** `MotionGlobalConfig.skipAnimations = true` in setup.
- **Targets:** ≥80% line / ≥75% branch on business-logic modules (`lib/engine`, `lib/db`,
  `lib/auth` router); meaningful behavior coverage on UI primitives. View-only presentation
  components (Hero, Pipeline, marketing sections) are exercised through the build + typecheck
  gate — full DOM coverage there is low-value/high-churn; gap justified in TEST_PLAN.md.

## Debugging approach

Evidence sources: tooling typecheck (project-wide on every file op), production build,
code audit for state-sync/CLS/console hazards. Issues tracked as D-xxx with severity,
root cause, fix, and verification method (see DEBUG_PLAN.md / FIX_LOG.md).

## Execution order

Phase 0 audit → 1 plan/todo → 2+3 tests (frontend + service layer) → 4 static execution
round (ENV-blocked for runtime, see STATE.md F-001) → 5 debug plan → 6 fixes → 7
improvements → 8 verification rounds (static + build) → 9 preview & handoff.

## Risks

- Vitest 4 ↔ Vite 7 peer compatibility (mitigated: latest majors aligned).
- jsdom lacks IntersectionObserver/canvas (mitigated: library guards already present;
  marketing canvas components excluded from DOM tests).
- No shell in sandbox → suite cannot be executed here; delivered with exact run commands
  and full static verification (documented as F-001, not hidden).
