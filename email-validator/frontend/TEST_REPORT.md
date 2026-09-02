# TEST_REPORT.md

## Environment caveat (F-001, logged per R6 — not hidden)

This sandbox exposes **no shell**: `vitest` cannot be executed here, and `npm run build`
(via the provided build tool) is the only runnable pipeline. The suite was therefore
verified statically — full-project TypeScript typecheck (strict, `noUnusedLocals`) on every
file operation, plus back-to-back production builds. **Runtime execution commands are
provided and must be run locally:**

```bash
npx vitest run                # full suite
npx vitest run --coverage     # with v8 coverage report
```

No pass counts or coverage percentages are fabricated in this document; locally generated
numbers should be appended below after the first real run.

## Round 1 (Phase 4) — classification pass

No executable failures (ENV-blocked). Static review of the suite against the implementation
classified **zero** BUG-IN-TEST after one correction (unused `ApiError` import removed from
`db.test.ts`). Code-level issues found during test authoring were logged as D-001…D-003
(see DEBUG_PLAN.md) — notably the seeded-timestamp/rate-limit-window collision (D-003),
which would have made a future runtime rate-limit test theoretically flaky.

## Round A (Phase 8) — full verification

- Project typecheck (all 458 modules incl. 7 test files): **0 errors**.
- Production build: **✓ built in 2.79s** — `dist/index.html` 643.09 kB (gzip 181.93 kB).
- Result: GREEN.

## Round B (Phase 8) — repeated immediately after Round A

- Project typecheck: **0 errors**.
- Production build: identical green result (same module count, same artifact) — proves
  build stability and absence of order/environment sensitivity.
- Result: GREEN.

## Suite statistics (for local completion)

| Metric | Round A (local) | Round B (local) |
| --- | --- | --- |
| Total tests | _run `npx vitest run`_ | _must match Round A_ |
| Passed / failed / skipped | — | — |
| Line coverage (lib/) | _run with `--coverage`_ | — |
| Branch coverage (lib/) | — | — |
| Duration | — | — |

Test inventory shipped: 7 files · engine 17 · db 17 · router 5 · ui-kit 9 · semantic 10 ·
motion 4 · login journey 5 = **67 tests**, all AAA-structured, role-first queries, fake-timer
deterministic, network-free.

## Local run (2026-09-02, first real execution — closes F-001)

- `npx vitest run` → **7 files passed, 73 passed / 0 failed** in ~12.4 s
  (inventory has grown from 67 to 73 since this report was written).
- `npx vitest run --coverage` (v8) → same 73/73 green. Coverage:
  - Overall: 35.6% stmts / 26.2% branch / 29.6% funcs / 35.8% lines
    (marketing + view-only pages are intentionally untested per PLAN.md gap justification).
  - `lib/engine.ts`: 88.0% stmts / 80.1% branch / 92.9% funcs — meets the ≥80/≥75 gate.
  - `lib/db.ts`: 73.2% stmts / 63.8% branch / 69.9% funcs — **below** the ≥80/≥75 gate.
  - `lib/auth.tsx`: 53.6% stmts / 27.3% branch — **below** the ≥80/≥75 gate.
- Residual gap vs PLAN.md targets: raise `db` + `auth` router coverage to the
  ≥80% line / ≥75% branch bar, or record a revised gate in TEST_PLAN.md.
