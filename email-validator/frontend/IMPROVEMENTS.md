# IMPROVEMENTS.md

## Implemented (this run)

| Area | Improvement | Evidence |
| --- | --- | --- |
| Reliability | Seeded record ages floored at 5 min — rate limiting can never misfire on a fresh workspace | FIX_LOG D-003; `db.test.ts` rate-limit case |
| Code quality | Removed dead `Reveal` component + CSS reveal system + orphaned reduced-motion rule (~30 lines) | FIX_LOG D-001; grep → 0 refs |
| Code quality | Confirmed dead `.modal-in` keyframes absent | FIX_LOG D-002 |
| Testability | Full deterministic test architecture: fake-timer `settle` helper, per-test reseed, motion-skip setup | `vitest.config.ts`, `src/test/setup.ts` |
| Accessibility (carried from prior phases) | `inert` on closed accordions, tab-managed mobile menu, focus-trapped modals, radiogroup rating, progressbar semantics | `motion.test.tsx`, `semantic.test.tsx`, `ui.test.tsx` |
| Performance (carried) | transform/opacity-only animation budget; pointer physics on MotionValues outside React renders; visibility-gated canvases/intervals | prior phase reports; no layout-animated properties remain in `src` (audited) |
| Security posture | No secrets anywhere (zero-env demo; `.env.example` documents it); salted-digest demo auth clearly labeled non-production; no `dangerouslySetInnerHTML`; clipboard writes try/catch-guarded | code audit |

## Deferred (with rationale)

| Item | Rationale |
| --- | --- |
| Real server-side validation (FastAPI/Supabase per reference repo) | Out of scope for a static single-file deliverable; `lib/db.ts` keeps identical contracts so the swap is UI-transparent |
| MSW / Supertest layers | No HTTP surface exists to mock (DECISIONS D-000) |
| Route-level code splitting | `vite-plugin-singlefile` inlines everything by design; splitting would break the single-file artifact |
| Visual-regression tooling (Percy/Chromatic) | Requires external service + shell; substituted with breakpoint smoke checklist in handoff |
| Dependency minor upgrades | All deps current as installed this session; `npm audit` shows 2 advisories in transitive tooling deps (1 low/1 high) — non-runtime, left for a controlled upgrade window |
