# Preview the new landing page

The VerifAI landing page is wired in as the `#/landing` route inside the
existing Vite + React app. It uses the project's hash router — no extra
build, no extra server.

## Run the dev server

```bash
cd email-validator/frontend
npm install        # only needed once, or after pulling changes
npm run dev
```

Vite serves on **http://localhost:5173** by default (host=true so the
preview is reachable from your phone or another device on the LAN).

## Open the landing page

Two options:

1. **Direct link** — the cleanest path. The route lives at `#/landing`,
   so the full URL is:
   ```
   http://localhost:5173/#/landing
   ```
   The hash form means it works in any static host and survives page
   refreshes (no SPA-rewrite config needed).
2. **From the home page** — click the new "New landing page" link at
   the bottom of the sidebar footer.

## Build for production

```bash
npm run build      # → email-validator/frontend/dist
npm run preview    # serves dist/ on http://localhost:4173
```

The landing page is bundled inside the existing SPA bundle and inherits
the same lazy chunking (vendor-react / vendor-motion manual chunks in
`vite.config.js`).

## How it's wired

- `src/landing/LandingPage.tsx` — the page itself
- `src/App.tsx` — adds `if (route === "/landing") return <LandingPage />;`
  inside `AppRoutes`
- `src/landing/Sidebar.tsx` — adds a "New landing page" link to the
  sidebar footer so it's discoverable from the home view

The page is wrapped in `<RouteTransition>` so it animates in with the
same forward/back transition the rest of the app uses.

## Customising

- Copy lives in `LandingPage.tsx` (Hero, Features, Pricing, FAQ, CTA,
  Footer are all separate functions — edit one without touching the
  rest).
- Feature illustrations are inline SVG — no external assets to manage.
- Brand colour is `violet-600` / `violet-400` / `pink-400` gradients
  throughout. Swap for your own Tailwind palette by find-and-replace.