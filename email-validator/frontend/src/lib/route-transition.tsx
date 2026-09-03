import { ViewTransition } from "react";
import type { ReactNode } from "react";

/* Wrap every routed page component (never a layout) in this.
   Transition types are attached in useRoute (lib/auth.tsx):
   - nav-forward / nav-back: hierarchical navigation (landing <-> auth <-> app <-> admin)
   - nav-lateral: tab-to-tab inside an area (crossfade, no depth implied)
   default:"none" keeps every other transition silent. */
export function RouteTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-lateral": "fade-in",
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-lateral": "fade-out",
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
