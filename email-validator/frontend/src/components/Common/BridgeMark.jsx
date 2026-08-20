import { motion, useReducedMotion } from "framer-motion";

/**
 * BRIDGE Modul - X — logo mark.
 *
 * A "B" built as a bridge: a west pier (stem), a deck line, and two arches
 * (the bowls of the B) whose keystone gap holds a luminous "X" verification node.
 * Single accent color (Signal Cyan) so it owns a single brand idea.
 *
 * Animation follows the Ant Design Motion spec:
 *  - Natural: stroke "draw-in" with cubic-bezier(0.4,0,0.2,1)
 *  - Performant: sub-second total, one pass only
 *  - Concise: only the X node breathes subtly; nothing else loops
 *  - Honors prefers-reduced-motion.
 */
export default function BridgeMark({ size = 36, animate = true, showGlow = true, stroke = null }) {
  const reduce = useReducedMotion();
  const accent = stroke || "var(--color-primary, #2CC9E8)";
  const ink = "var(--color-text, #E6EDF3)";
  const draw = () =>
    reduce || !animate
      ? { pathLength: 1, opacity: 1 }
      : { pathLength: [0, 1], opacity: [0.3, 1] };

  const transitions = {
    pier:  { duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0 },
    deck:  { duration: 0.4,  ease: [0.4, 0, 0.2, 1], delay: 0.18 },
    upper: { duration: 0.5,  ease: [0.4, 0, 0.2, 1], delay: 0.32 },
    lower: { duration: 0.5,  ease: [0.4, 0, 0.2, 1], delay: 0.44 },
    node:  { type: "spring", stiffness: 260, damping: 16, delay: 0.7 },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BRIDGE Modul - X"
      initial={reduce || !animate ? false : { opacity: 0 }}
      animate={reduce || !animate ? {} : { opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* West pier (B stem) */}
      <motion.line
        x1="11" y1="9" x2="11" y2="39"
        stroke={ink} strokeWidth="3.2" strokeLinecap="round"
        initial={reduce || !animate ? {} : { pathLength: 0 }}
        animate={draw(0)}
        transition={transitions.pier}
      />
      {/* Deck line */}
      <motion.line
        x1="11" y1="9" x2="37" y2="9"
        stroke={ink} strokeWidth="3.2" strokeLinecap="round"
        initial={reduce || !animate ? {} : { pathLength: 0 }}
        animate={draw(0)}
        transition={transitions.deck}
      />
      {/* Upper arch */}
      <motion.path
        d="M11 9 a13 8.5 0 0 1 26 0"
        stroke={ink} strokeWidth="3.2" strokeLinecap="round" fill="none"
        initial={reduce || !animate ? {} : { pathLength: 0 }}
        animate={draw(0)}
        transition={transitions.upper}
      />
      {/* Lower arch */}
      <motion.path
        d="M11 24 a13 8.5 0 0 1 26 0"
        stroke={ink} strokeWidth="3.2" strokeLinecap="round" fill="none"
        initial={reduce || !animate ? {} : { pathLength: 0 }}
        animate={draw(0)}
        transition={transitions.lower}
      />
      {/* Keyston X node — the verification crosshair */}
      {showGlow && (
        <motion.circle
          cx="37" cy="34" r="7"
          fill={accent}
          initial={reduce || !animate ? { opacity: 0.16 } : { scale: 0, opacity: 0.16 }}
          animate={
            reduce || !animate
              ? { opacity: 0.16 }
              : { scale: 1, opacity: [0.0, 0.34, 0.16] }
          }
          transition={transitions.node}
          style={{ filter: "blur(1px)" }}
        />
      )}
      <motion.g
        initial={reduce || !animate ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        animate={reduce || !animate ? {} : { scale: 1, opacity: 1 }}
        transition={transitions.node}
      >
        <line x1="33.5" y1="30.5" x2="40.5" y2="37.5"
          stroke={accent} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="40.5" y1="30.5" x2="33.5" y2="37.5"
          stroke={accent} strokeWidth="2.6" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  );
}
