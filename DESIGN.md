# Bridge Modul X — Design System (DESIGN.md)

> Project: `Validator_Modul_X-test`
> Stack: React 19 · Vite 7 · Tailwind CSS v4 · Framer Motion 13 · Phosphor Icons
> Status: **canonical taste + token source for both light and dark themes**
> Owner: `frontend-design-premium` skill (composition over `frontend-design` upstream)

This file is the **durable taste memory** for the product. Every visual change MUST trace back to a token here or a documented exception. The companion `UX-CONTRACT.md` is authoritative for behavior; this file is authoritative for visual intent.

---

## 1. Brand

**Bridge Modul X** is a 7-layer email validation engine sold to platform engineers and growth teams who care about sender reputation. The visual language is **premium utilitarian minimalism**: a precise instrument panel, not a consumer app.

- **Tone:** calm, exact, serious, slightly editorial.
- **Personality reference:** Linear meets Stripe meets a Bauhaus instruction manual. Not "playful SaaS".
- **What we are not:** neon, glassmorphism, gradient text, glow, oversized rounded shapes, marketing-fluff hero copy, decorative particles, drop shadows that look like depth fakery.

## 2. Aesthetic principles

1. **One accent, used for meaning, not decoration.** Ink (`#111111` light) / off-white (`#F5F4EF` dark) is the only "ink" you can lean on for emphasis. Champagne (`#956400`) is reserved for **status / warning** and must never appear in a non-semantic role. Green / red are status only.
2. **Hairline borders, never double-up.** 1px at the lowest visible contrast. No two border colors stacked. No shadows + borders on the same surface — pick one.
3. **Borders carry information; backgrounds stay flat.** Status is communicated by *color + label + shape*, never by color alone (WCAG 1.4.1).
4. **Type does the heavy lifting.** Three-register editorial system (display serif / body sans / mono data). No webfonts.
5. **Motion is functional, not theatrical.** Stagger 55–100ms, easings from the canonical set in `motion-tokens.ts`, no bouncing on structural transitions, no motion on first paint beyond opacity ≤ 200ms.
6. **Two themes, one design.** Light and dark are peer registers of the *same* design. Layout, spacing, type, motion, component shape are identical. Only color roles flip. The dark theme is **not** a "recolor" — it has its own accent restraint and its own panel metaphor.

## 3. Theme registers

Both themes share the same token names; only the values flip.

| Role                | Light                              | Dark                                  | Notes                                   |
|---------------------|------------------------------------|---------------------------------------|-----------------------------------------|
| canvas              | `#FBFBFA` paper                    | `#0B0B0D` deep ink                    | body / page background                  |
| surface             | `#FFFFFF`                          | `#141418`                             | cards, panels, inputs                   |
| surface-raised      | `#F9F9F8`                          | `#1B1B20`                             | hover, subtle elevation                 |
| surface-sunken      | `#F1EFEA`                          | `#0F0F12`                             | code blocks, recessed wells             |
| ink                 | `#111111`                          | `#F2F1EC`                             | primary text                            |
| ink-2               | `#5E5C57`                          | `#B7B5AC`                             | secondary text                          |
| ink-3               | `#787774`                          | `#7E7C75`                             | tertiary text / labels                  |
| hairline            | `#EAEAEA`                          | `rgba(242,241,236,0.08)`              | structural border                       |
| accent-ink          | `#111111`                          | `#F2F1EC`                             | primary action / brand mark             |
| accent-ink-hover    | `#333333`                          | `#FFFFFF`                             |                                       |
| accent-warm         | `#956400`                          | `#C99553`                             | **status only** — warning, never decor  |
| success             | `#346538`                          | `#5FA46A`                             | valid / commit                          |
| danger              | `#9F2F2D`                          | `#D8665F`                             | destructive / hard-fail                 |
| info                | `#1F6C9F`                          | `#6FAFD8`                             | neutral info                            |
| focus-ring          | `#111111` (2px solid, 2px offset)  | `#F2F1EC` (2px solid, 2px offset)     | single global `:focus-visible` rule     |

**Status pairings are mandatory:** every status must pair foreground with a label, icon, or shape change. Color alone never signals state.

**What is banned in dark** (kept as inert flat rules so historical class names don't re-introduce them): `glass-1/2/3`, `glow-0..4`, `text-glow*`, `metallic-panel::before/::after`, `vignette`, `pulse-blue` neon box-shadow, `grad-text` rainbow text, `grad-pan`, `node-active` glow, `breathe` glow.

## 4. Typography

System stacks only, never Inter/Roboto/Open Sans. (We do not load webfonts; the brand is document-like.)

- **Display (serif):** `Georgia, "Palatino Linotype", "Times New Roman", serif` — used for `<h1>`, `<h2>`, `SectionHeader h2`, page titles in Shell.
- **Body (sans):** system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif`).
- **Data (mono):** `ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, monospace` — counters, log lines, meta chips, `eyebrow` chips, all `font-data` usage.

Size scale (1rem = 16px): xs 11px / sm 13px / base 15px / md 17px / lg 20px / xl 24px / 2xl 30px / 3xl 40px / 4xl `clamp(44px, 7vw, 96px)`.

## 5. Spacing & layout

4px base. Density levels:

- **Compact:** 8 / 12 / 16 — admin tables, settings, lists.
- **Default:** 16 / 24 / 32 — primary screens, the Shell content.
- **Comfortable:** 24 / 32 / 48 — landing, hero, auth.

Layout primitives:

- `max-w-content` 70ch, `max-w-wide` 72rem, `max-w-page` 90rem.
- Shell uses a **256 px** left rail (previously hardcoded `w-64`); the token is `--layout-sidebar`.
- Page padding on mobile: 16px; ≥`md`: 24px; ≥`lg`: 32px.

## 6. Radii, borders, shadows

- `radius-sm` 6px, `md` 10px, `lg` 14px, `xl` 20px, `full` 9999px.
- Default panel radius: 12px (`--radius`).
- Borders: 1px, color `var(--line)`. **No 2px borders.**
- Shadows: only `--shadow-sm` / `md` / `lg` (subtle, ≤5% black in light / ≤30% black in dark). No glow, no neon, no color shadows.

## 7. Motion

Single source: `src/lib/motion-tokens.ts`. All component-level duration/easing/distance MUST come from this file or the CSS custom property aliases. Do not invent new easings in components.

- Durations: instant 50ms, fast 150ms, normal 250ms, slow 400ms, slower 600ms.
- Easings: `default`, `in`, `out`, `bounce`, `smooth`, `cinematic`.
- Stagger: 55/80/100ms.
- Springs: gentle / snappy / heavy / kinetic / bouncy / smooth.
- All structural transitions honor `prefers-reduced-motion: reduce` (already in `usePrefersReducedMotion`).

## 8. Z-index scale

Single source: `--z-*` CSS variables. Use the token, do not hardcode `z-[…]`.

- `--z-base` 0
- `--z-raised` 10
- `--z-sticky` 40
- `--z-dropdown` 50
- `--z-toast` 60
- `--z-modal` 70
- `--z-scroll-progress` 80
- `--z-tooltip` 90

## 9. Iconography

Phosphor Icons only. Default weight: `bold`. Color inherits currentColor. Icon-only buttons must have an accessible name.

## 10. Token-to-runtime ownership

- **Single source of truth:** `src/index.css` (`:root` for light, `[data-theme="dark"]` for dark, both expose the same `--*` names).
- **Tailwind v4 exposure:** `@theme` block at the top of `src/index.css` mirrors the tokens as Tailwind utilities (`bg-canvas`, `text-ink`, `border-hairline`, etc.).
- **TypeScript alias:** `src/lib/theme.tsx` re-exports the resolved token set for runtime use (focus ring color, motion values).
- **Anti-drift rule:** if a component hard-codes `#111111`, `#FFFFFF`, `#EAEAEA`, `#F7F6F3`, or `bg-white` outside the design-system files, it is a bug. Use the token. (See `UX-CONTRACT.md §5` for the migration backlog.)

## 11. Components that are part of the system

These are the **canonical** components. New work must extend or compose them — never create a parallel primitive with the same role.

- `lib/ui.tsx` — `Icon`, `Spinner`, `ScrollProgress`, `SectionHeader`, `useCountUp`, `usePrefersReducedMotion`, `useInViewOnce`, `useActiveInView`.
- `lib/semantic.tsx` — `SuiButton`, `SuiLabel`, `RibbonCorner`, `SuiStatistic`, `SuiProgress`, `SuiRating`, `SuiMessage`, `SuiDivider`.
- `app/ui.tsx` — `ToastProvider` / `useToast`, `Modal`, `Confirm`, `Card`, `StatTile`, `EmptyState`, `Pagination`, `Field`, `CopyBtn`, `PrimaryButton`, `SecondaryButton`, `DangerButton`, `GhostButton`, `StatusBadge`.
- `app/Shell.tsx` — single canonical app shell, used by both `/app/*` and `/admin/*`.

## 12. What is explicitly out of scope for the design system

- Marketing copy. The brief owns that, the design system only owns how it's presented.
- Backend API shape. The contract is in `UX-CONTRACT.md §3`.
- Per-customer theming. White-label is not a product capability.
- Animations longer than 600ms. Anything beyond that is "cinematic" and must be approved.
