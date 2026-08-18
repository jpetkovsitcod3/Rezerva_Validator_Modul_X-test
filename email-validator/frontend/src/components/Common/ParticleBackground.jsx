import { useMemo } from "react";

/**
 * Lightweight animated particle background.
 * Renders a fixed, absolutely-positioned layer of glowing dots.
 */
export default function ParticleBackground({ count = 40 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 1 + Math.random() * 3;
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 6,
        opacity: 0.15 + Math.random() * 0.3,
        color: Math.random() > 0.5 ? "#6366f1" : "#8b5cf6",
      };
    });
  }, [count]);

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
            boxShadow: `0 0 6px ${p.color}`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
