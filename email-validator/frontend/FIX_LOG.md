# FIX_LOG.md

> Sandbox note (R4 adaptation): no git VCS is available in this workspace; commit-style
> entries below are the atomic change log.

## fix(D-001): remove dead Reveal component and CSS reveal system

- **Root cause:** superseded by `lib/motion.tsx` spring primitives; never deleted.
- **Files:** `src/lib/ui.tsx` (component removed), `src/index.css` (`.reveal*` rules +
  reduced-motion orphan removed).
- **Verification:** before — grep 1 definition, 0 consumers; after — grep 0 matches,
  typecheck 0 errors, build green (Round A).

## fix(D-002): dead `.modal-in` keyframes

- **Root cause:** removed earlier during modal choreography migration.
- **Files:** none (confirmed absent via grep).
- **Verification:** grep `modal-in` → 0 matches; build green.

## fix(D-003): clamp seeded record age ≥ 5 minutes

- **Root cause:** unbounded `rand()` subtraction allowed near-zero record ages, which the
  60-second rate-limit window counts.
- **Files:** `src/lib/db.ts` (seed: `now - 300000 - …`).
- **Verification:** before — theoretical first-call `rate` rejection after fresh seed;
  after — all seeded records ≥5 min old; `db.test.ts` rate-limit case deterministic from a
  clean signup; typecheck + build green (Rounds A & B).

## Test-suite corrections (R3 — bug-in-test, justified)

- `db.test.ts`: removed unused `ApiError` import (TS `noUnusedLocals` violation caught by
  project typecheck before any run). No assertion weakened.
