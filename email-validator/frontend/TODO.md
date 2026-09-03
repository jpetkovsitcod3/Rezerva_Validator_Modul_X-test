# TODO.md — Stable task register (T-xxx)

## Phase 0 — Discovery
- [x] **T-001** Map repo: entry `src/main.tsx` → `App` (AuthProvider/ToastProvider/hash router) → landing (`components/*`) + product (`app/*`); logic in `lib/engine.ts`, `lib/db.ts`, `lib/auth.tsx`.
- [x] **T-002** Baseline: production build green (643 kB single file), project typecheck clean. Findings F-001…F-005 logged in STATE.md.
- [x] **T-003** Critical journeys enumerated (PLAN.md).

## Phase 1 — Planning
- [x] **T-004** PLAN.md produced.
- [x] **T-005** TODO.md produced with stable IDs.

## Phase 2 — Frontend unit tests
- [x] **T-006** Install Vitest/jsdom/RTL/user-event/jest-dom/coverage-v8. Acceptance: deps resolve against Vite 7 + React 19.
- [x] **T-007** `vitest.config.ts` + `src/test/setup.ts` (jsdom, jest-dom/vitest, skipAnimations). Acceptance: config typechecks.
- [x] **T-008** `lib/auth` router tests. Acceptance: route parse/navigate/hashchange covered.
- [x] **T-009** `app/ui` kit tests (Modal focus/ESC/backdrop, Pagination, StatusBadge). Acceptance: interaction outcomes asserted via roles.
- [x] **T-010** `lib/semantic` tests (Button animated/loading/href, Rating radio semantics, Progress aria, Message alert, Divider).
- [x] **T-011** `lib/motion` Collapse test (open content, `inert` when closed, reduced-motion safe).
- [x] **T-012** `app/Auth` login journey test (demo autofill, invalid-credential alert, success route). Acceptance: visible outcomes only.

## Phase 3 — Service-layer ("backend") unit tests
- [x] **T-013** `lib/engine` suite: judge paths (valid/typo/disposable/catch-all/malformed/role), judgeQuick, domainReport (curated/NXDOMAIN/invalid), parseEmailList, toCSV, determinism.
- [x] **T-014** `lib/db` suite: auth (login/suspended/signup validation), credits (deduct/admin-exempt/quick-free/insufficient), rate limit (15/min), history (filter/search/paging/clamp), jobs lifecycle, keys (create/limit/revoke), blocklist (validate/dup/remove → engine effect), settings clamp, admin (patch clamp/promote/suspend/protected delete/cascade), reset stability.
- [x] **T-015** TEST_PLAN.md traceability matrix.

## Phase 4 — Execution round 1
- [x] **T-016** Full static verification (typecheck via tooling + build). Runtime execution ENV-blocked (F-001) — commands in TEST_REPORT.md.

## Phase 5/6 — Debug & fixes
- [x] **T-017** DEBUG_PLAN.md (D-001…D-003) produced.
- [x] **T-018** fix(D-001): remove dead `Reveal` component.
- [x] **T-019** fix(D-002): remove dead `.modal-in` CSS.
- [x] **T-020** fix(D-003): clamp seeded record age ≥5 min (rate-limit determinism).
- [x] **T-021** FIX_LOG.md updated with before/after verification.

## Phase 7 — Improvements
- [x] **T-022** IMPROVEMENTS.md: shipped (dead-code removal, seed determinism) vs deferred (real backend, code-splitting under singlefile plugin, MSW if HTTP layer added).

## Phase 8 — Verification ×2
- [x] **T-023** Round A + B: typecheck + production build executed back-to-back, identical green results (runtime suite blocked per F-001; local commands documented).

## Phase 9 — Preview & handoff
- [x] **T-024** `.env.example` (zero required vars — documented).
- [x] **T-025** README.md run/test/preview section updated.
- [x] **T-026** Handoff summary with manual checklist.
