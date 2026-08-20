import { useMemo, useEffect, useState } from "react";

/**
 * Lightweight animated particle background.
 * Respects prefers-reduced-motion. Adds subtle X drift + 3 cyan tints.
 */
export default function ParticleBackground({ count = 30 }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e) => setReduce(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const particles = useMemo(() => {
    if (reduce) return [];
    return Array.from({ length: count }, (_, i) => {
      const size = 1 + Math.random() * 2.5;
      const tints = ["#2CC9E8", "#56D6EF", "#38BDF8"];
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 8,
        opacity: 0.08 + Math.random() * 0.18,
        color: tints[Math.floor(Math.random() * tints.length)],
        // subtle horizontal drift
        drift: (Math.random() - 0.5) * 3,
      };
    });
  }, [count, reduce]);

  if (reduce || particles.length === 0) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      overflow: "hidden",
    }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 8px ${p.color}`,
            transform: `translateX(${p.drift}px)`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}