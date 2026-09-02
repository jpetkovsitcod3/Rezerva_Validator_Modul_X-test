import { useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motion-tokens";

/** Provides complete enter, animate, and exit targets with a reduced-motion path. */
export function useSafeMotion(distance = motionTokens.distance.md) {
  const reduced = useReducedMotion();

  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -distance },
  };
}
