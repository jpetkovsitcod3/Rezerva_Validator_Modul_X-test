# DECISIONS.md — engineering decisions log (R1)

| # | Decision | Rationale | Alternatives considered |
| --- | --- | --- | --- |
| D-000 | Treat `src/lib/db.ts` + `src/lib/engine.ts` as the "backend" test target; skip Supertest/MSW | The reference FastAPI/Supabase/Gemini stack was adapted client-side for this static-single-file product — there is no HTTP surface, no LLM calls, and no network I/O to mock | Force a Node server layer solely for test optics (rejected: duplicates logic, breaks single-file delivery) |
| D-001 | Vitest 4 + explicit `import { … } from "vitest"` (no globals) | Matches Vite 7 peer range; explicit imports typecheck without touching `tsconfig.json` (workspace constraint) | Jest (rejected: repo is Vite-native); vitest `globals: true` (rejected: requires tsconfig `types` edit) |
| D-002 | jest-dom via `src/test/setup.ts` with triple-slash reference instead of tsconfig `types` edit | Enables ergonomic DOM assertions while respecting the no-tsconfig-edit constraint; setup registered in `vitest.config.ts` | Skip jest-dom (rejected: weaker assertions); edit tsconfig (constraint) |
| D-003 | Fake timers with ≤1 s advances in the db suite | Real 280–900 ms latencies × 15 rate-limit calls would exceed test timeouts and drift the 60 s window; 1 s advances keep window math coherent | Real timers + raised timeout (rejected: slow, still window-drift) |
| D-004 | `MotionGlobalConfig.skipAnimations = true` in setup | Framer exit/enter animations otherwise defer assertions; reduced-motion code paths are separately covered by CSS audit | Per-test `waitFor` polling (rejected: noisy, flaky) |
| D-005 | Colocated `*.test.ts(x)` | Repo had no `__tests__` convention; colocated files match module boundaries for traceability | Central `__tests__/` (rejected: weaker locality) |
| D-006 | No `package.json` script edits (workspace constraint) — document `npx vitest run` | Constraint forbids direct package.json edits; `npx` invocation is equivalent and documented in README | — |
| D-007 | Coverage measured with `@vitest/coverage-v8` scoped to `src/lib` + `src/app` | Business logic lives there; marketing components excluded per TEST_PLAN gap justification | istanbul provider (no advantage here) |
