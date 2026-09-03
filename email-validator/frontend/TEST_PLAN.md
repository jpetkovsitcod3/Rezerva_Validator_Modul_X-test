# TEST_PLAN.md — Traceability Matrix

Suite: Vitest 4 + jsdom + @testing-library/react/user-event + jest-dom(vitest) + coverage-v8.
Run: `npx vitest run` · Coverage: `npx vitest run --coverage`.

## Service / business-logic layer (the app's "backend")

| Module | Test file | Covered |
| --- | --- | --- |
| `lib/engine.ts` — 7-layer judge | `lib/engine.test.ts` | determinism; healthy pass path; typo-domain DNS fail + early exit; disposable blocklist fail; catch-all warn → risky band; malformed syntax fail; disabled-layer `off`; admin blocklist additions |
| `lib/engine.ts` — judgeQuick | `lib/engine.test.ts` | syntax+DNS-only pass (score 62); DNS fail → invalid (score 6); deep layers skipped |
| `lib/engine.ts` — domainReport | `lib/engine.test.ts` | curated gmail/outlook records; strict SPF + reject DMARC; typo suggestion; NXDOMAIN; invalid input; determinism |
| `lib/engine.ts` — csv utils | `lib/engine.test.ts` | parse/dedupe/lowercase; CSV escaping of quotes & commas |
| `lib/db.ts` — auth | `lib/db.test.ts` | seeded login + session persistence; wrong password (`auth`); suspended lockout; logout; signup validation ×4 + duplicate; signup credits; profile update; password change with current-password verification |
| `lib/db.ts` — credits & rate limit | `lib/db.test.ts` | deep deducts 1; quick free; admin exempt; zero-credit reject (quick still free); 15/min limit enforced on 16th call |
| `lib/db.ts` — history | `lib/db.test.ts` | user/status/search filters; page size; pages math; page clamp |
| `lib/db.ts` — bulk jobs | `lib/db.test.ts` | running → completed lifecycle; counts; rows; finishedAt |
| `lib/db.ts` — api keys | `lib/db.test.ts` | seed state; 5-active cap; label validation; revoke frees slot; `bx_live_` prefix |
| `lib/db.ts` — blocklist ↔ engine | `lib/db.test.ts` | domain validation; duplicate reject; **added domain fails Layer 4 in the real engine**; removal |
| `lib/db.ts` — settings | `lib/db.test.ts` | creditsOnSignup clamp (50000→10000) applied to signups; layer-switch persistence |
| `lib/db.ts` — admin | `lib/db.test.ts` | credit clamp at 0; promote/suspend/reactivate (login blocked while suspended); protected admin delete; cascade delete (records+keys); stable-id reset survival |

## Frontend

| Module | Test file | Covered |
| --- | --- | --- |
| `lib/auth.tsx` router | `lib/auth.test.ts` | default route; `#/app/*` parsing; landing anchors → `/`; navigate writes hash; `useRoute` hashchange subscription |
| `app/ui.tsx` Modal | `app/ui.test.tsx` | open render; closed unmount; ESC close; backdrop close; body scroll lock |
| `app/ui.tsx` Pagination | `app/ui.test.tsx` | first/last page button states; onPage arg; single-page null render |
| `app/ui.tsx` StatusBadge | `app/ui.test.tsx` | all three verdict labels |
| `lib/semantic.tsx` | `lib/semantic.test.tsx` | Button animated-hidden layer (decorative), loading disabled + no-click, href→link; Rating radio semantics + selection; Progress aria-valuenow + clamp; Message alert + dismiss; Divider separator |
| `lib/motion.tsx` | `lib/motion.test.tsx` | Collapse open content; closed content `inert` + aria-hidden (tab-order safety); MReveal/Stagger/MItem render |
| `app/Auth.tsx` LoginPage | `app/Auth.test.tsx` | labeled fields; one-click demo autofill; invalid-credential visible alert; admin success → `#/admin`; user success → `#/app` |

## Coverage targets & justified gaps

- **Targets:** ≥80% line / ≥75% branch on `lib/engine`, `lib/db`, `lib/auth` (all decision branches enumerated above are asserted).
- **Gap — presentation components** (`components/Hero`, `Pipeline`, `DemoVideo`, marketing sections): view-only, animation-heavy, no decision logic; covered by the typecheck + production-build gate and manual smoke checklist. DOM-testing canvas/WebGL-adjacent code in jsdom is low-value/high-churn.
- **Gap — `app/Admin|Overview|History|Validator|Account` pages:** their logic lives in the tested service layer; pages are thin views. The login journey test covers the auth critical path end-to-end through providers.

## Determinism guarantees

Fake timers for all db latency (`settle` helper, ≤1s advances keep the rate-limit window coherent); `resetDemoData()` + `localStorage.clear()` per test; `MotionGlobalConfig.skipAnimations`; no network anywhere (there is none to mock); order-independent (each test reseeds).
