# BRIDGE Modul X — 7-Layer Email Validation Platform

A dark-first marketing site **plus** a full product application (user dashboard + admin console),
powered by a deterministic 7-layer validation engine. Adapted from the reference
`Rezerva_Validator_INTEGRATION_DataFINAL-prod` (FastAPI/Supabase) implementation into a
Vite + React 19 + Tailwind 4 + Framer Motion codebase with a client-side data layer that
mirrors the reference API contracts.

## Demo access

| Role  | Email               | Password   | Capabilities |
| ----- | ------------------- | ---------- | ------------ |
| User  | `user@bridge.demo`  | `demo1234` | 74 credits · quick/deep single checks · bulk clean with persisted jobs · domain intelligence · history · API keys · profile/security |
| Admin | `admin@bridge.demo` | `demo1234` | Unlimited validations · admin console: users (credits/promote/suspend/delete + workspace inspector), global logs, blocklist (feeds Layer 4 live), engine layer switches, credits-on-signup, platform health, demo-data reset |

One-click autofill on the login page. New signups get 25 credits (admin-configurable).

## Reference functionality integrated

| Reference feature | Where it lives |
| --- | --- |
| 7-layer engine (syntax → DNS → MX → disposable → catch-all → SMTP → scoring) | `src/lib/engine.ts` — shared by landing demo + app |
| `POST /validate/single` (`?deep=true`) | Validator → Single → **Deep** (1 credit) |
| `GET /validate/quick/{email}` | Validator → Single → **Quick** (free, syntax + DNS) |
| `POST /validate/bulk` + `GET /bulk/status/{id}` | Validator → Bulk clean; jobs persist and survive reloads |
| `GET /domain/{domain}` (MX/SPF/DMARC/DKIM) | Validator → Domain intel tab |
| `GET /history`, `GET /stats` | History, Overview, Admin logs/overview |
| Rate limiting middleware | 15 checks/min per user, surfaced as an error state |
| Supabase persistence (`validation_results`, `bulk_jobs`) | Versioned `localStorage` store — same contracts |
| Health check | Admin overview platform-health strip |

## Architecture

```
src/
├── lib/
│   ├── engine.ts      # pure deterministic 7-layer engine + domain intelligence + CSV utils
│   ├── db.ts          # simulated backend: sessions, credits, rate limits, records, jobs, keys, blocklist, settings
│   ├── auth.tsx       # auth context, hash router (#/app, #/admin), route guards
│   ├── ui.tsx         # icons (30+), hooks (reveal/count-up/in-view), SectionHeader, Spinner
│   ├── motion.tsx     # spring motion kit: MReveal, Stagger/MItem, KineticText, Magnetic, Tilt, Collapse, modal choreography, PageFade
│   └── semantic.tsx   # Semantic-UI-derived elements: Button(animated), Label/Ribbon, Statistic, Progress, Rating, Message, Divider
├── landing/           # marketing site: Sidebar rail, MapHero (live world-map validation grid), PipelineScene (7-station conveyor), Architecture bento, PricingBand, FooterLanding
└── app/               # product: Shell, Auth, Overview, Validator (single/bulk/domain), History, Account (keys+settings), Admin (5 pages), shared UI kit
```

**Note on Semantic UI:** `semantic-ui-react` requires React ≤ 18 (ERESOLVE on React 19),
so its theme-compatible elements were ported natively in `src/lib/semantic.tsx` instead of
importing the framework and its light-theme CSS.

## Motion system (60 FPS budget)

- Every animation is `transform`/`opacity`/`filter` only; `will-change` + `translateZ(0)` on heavy layers.
- Pointer physics (Magnetic/Tilt) run on MotionValues outside React's render loop; gated on fine pointers.
- Canvases/intervals pause off-screen and in background tabs; all rAF loops clean up on unmount.
- `prefers-reduced-motion`: CSS stills every loop; the motion kit renders final states; pointer physics disabled.

## Run

```bash
npm install     # no additional setup, zero env vars required (see .env.example)
npm run dev     # local development (live preview)
npm run build   # → dist/index.html (single file, deployable anywhere static)
```

## Tests

Vitest 4 + jsdom + Testing Library, colocated as `*.test.ts(x)` (67 tests across 7 files:
engine, data layer, router, UI kit, Semantic elements, motion primitives, login journey).
All latency is fake-timer driven and every test reseeds — order-independent, network-free.

```bash
npx vitest run                 # full suite
npx vitest run --coverage      # v8 coverage (scoped to src/lib + src/app)
```

Traceability, targets and justified gaps: `TEST_PLAN.md`. Round results: `TEST_REPORT.md`.
Issue register & fixes: `DEBUG_PLAN.md`, `FIX_LOG.md`. Decisions: `DECISIONS.md`.

- No env vars, server, or migrations — the dataset self-seeds on first load
  (8 users, ~170 records, API keys, one completed bulk job, 12-domain blocklist).
- **Reset the demo:** Admin → Engine → Danger zone → *Reset demo data*
  (seeded ids are stable, so demo logins keep working).
- **Routing:** hash-based so the static single-file build works everywhere; landing anchors stay native.

## Limitations / missing context

- `[MISSING CONTEXT: the reference repo's private source — exact Pydantic schemas, Celery task
  semantics, proxy-rotation and SMTP timeout configuration]` — behavior reconstructed from its
  public README/API contract.
- Backend is client-simulated (demo salted digest, not Argon2id; SMTP/DNS probes deterministic).
  Production swaps `src/lib/db.ts` for the real FastAPI client without touching the UI.
- Bulk job rows stored compact; record store rotates at 600 rows (retention behavior).
