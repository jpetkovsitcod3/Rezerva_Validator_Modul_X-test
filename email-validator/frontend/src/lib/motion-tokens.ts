import type { Transition } from "framer-motion";

type CubicBezier = [number, number, number, number];

const easing: Record<string, CubicBezier> = {
  default: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
  smooth: [0.16, 1, 0.3, 1],
  cinematic: [0.22, 1, 0.36, 1],
};

/** Shared motion values for Framer Motion patterns. Keep component values here. */
export const motionTokens = {
  duration: {
    instant: 0.05,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    slower: 0.6,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  scale: {
    subtle: 0.98,
    press: 0.96,
    start: 0.98,
    pop: 1.02,
  },
  stagger: {
    tight: 0.055,
    default: 0.08,
    loose: 0.1,
  },
  easing,
  interaction: {
    magneticStrength: 0.28,
    tiltMax: 5,
    perspective: 1100,
  },
  physics: {
    magnetic: { stiffness: 190, damping: 14, mass: 0.35 },
    tilt: { stiffness: 170, damping: 18, mass: 0.6 },
  },
  fallbackTimeoutMs: 2500,
  countUpDurationMs: 1200,
  indicatorSize: 6,
} as const;

export const springs = {
  gentle: { type: "spring", stiffness: 150, damping: 22, mass: 0.8 },
  snappy: { type: "spring", stiffness: 340, damping: 30, mass: 0.6 },
  heavy: { type: "spring", stiffness: 90, damping: 20, mass: 1 },
  kinetic: { type: "spring", stiffness: 130, damping: 24, mass: 0.9 },
  bouncy: { type: "spring", stiffness: 400, damping: 15, mass: 0.5 },
  smooth: { type: "spring", stiffness: 200, damping: 26, mass: 0.7 },
} satisfies Record<string, Transition>;
