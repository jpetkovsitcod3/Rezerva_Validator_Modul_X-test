# DEBUG_PLAN.md — whole-app issue register

Evidence sources: project typecheck, production build warnings, test-authoring review,
runtime-state audit, a11y/CLS sweep. Ordered P0 → P3; none at P0/P1.

## D-003 — Seeded records can theoretically land inside the rate-limit window · **P2**

- **Module:** `src/lib/db.ts` (seed)
- **Symptom:** right after a fresh seed, `apiValidate` could reject a *first-ever* call with
  `rate` if seeded timestamps fell within the trailing 60 s.
- **Evidence:** `db.ts` seed: `ts = now - floor(rand*14d) - floor(rand*0.9d)` — both terms can
  round to ~0.
- **Root cause:** no minimum-age floor on seeded records.
- **Fix:** add a 300 000 ms floor (`now - 300000 - …`).
- **Regression risk:** none (history ordering/relative times unaffected at 14-day scale).
- **Verification:** `db.test.ts` rate-limit test starts from a fresh signup (0 records) and
  asserts the 16th call fails — deterministic regardless of seed; clamp proven by code.

## D-001 — Dead `Reveal` component + `.reveal` CSS · **P3**

- **Module:** `src/lib/ui.tsx`, `src/index.css`
- **Symptom:** exported component with zero consumers after the Framer Motion migration.
- **Evidence:** project-wide grep matched only the definition (`lib/ui.tsx:97`).
- **Fix:** removed the component, its CSS rules, and the orphaned reduced-motion reference.
- **Verification:** typecheck clean; build green; no import references remain.

## D-002 — Dead `.modal-in` CSS keyframes · **P3**

- **Module:** `src/index.css`
- **Symptom:** modal entrance migrated to `MPanel` springs; old keyframes unreferenced.
- **Evidence:** grep for `modal-in` across `src/**` → zero matches (already absent).
- **Fix:** none required — recorded as pre-resolved during the motion migration.
- **Verification:** grep + build.

## Deferred / environment

- **F-001 (ENV):** runtime test execution unavailable in sandbox — workaround: exact local
  commands in TEST_REPORT.md; suite designed deterministic for parallel CI runs.
- No console-warning sources, unhandled-rejection paths, or XSS vectors found in audit
  (no `dangerouslySetInnerHTML`, no inline user HTML, clipboard writes guarded).
