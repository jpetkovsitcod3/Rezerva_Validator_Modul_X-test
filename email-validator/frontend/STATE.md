# STATE.md — resumable checkpoint

**Current phase:** COMPLETE (0→9). Last action: Round B verification build — green.

## Open items

- **F-001 (ENV, unresolved by design):** runtime `vitest` execution unavailable in this
  sandbox (no shell). Local commands: `npx vitest run`, `npx vitest run --coverage`.
  Append real pass/coverage numbers to TEST_REPORT.md after the first local run.

## Closed findings & issues

| ID | Type | Status |
| --- | --- | --- |
| F-002 / D-001 | dead `Reveal` + CSS | fixed |
| F-003 / D-002 | dead `.modal-in` CSS | pre-resolved, verified |
| F-004 / D-003 | seed ts vs rate-limit window | fixed (≥5 min floor) |
| F-005 | test infra absent | resolved (Vitest 4 + RTL + jsdom installed) |

## Key artifacts

PLAN.md · TODO.md · TEST_PLAN.md · TEST_REPORT.md · DEBUG_PLAN.md · FIX_LOG.md ·
DECISIONS.md · IMPROVEMENTS.md · .env.example · README.md (updated) ·
vitest.config.ts · src/test/setup.ts · 7 test files (67 tests).

## Resume instructions

Everything is green; if interrupted mid-local-run, re-run `npx vitest run` — the suite is
order-independent (per-test reseed via `resetDemoData()` + `localStorage.clear()`).
