/* ============================================================
   Motion kit — spring-physics primitives (Framer Motion)
   Every primitive degrades gracefully under prefers-reduced-motion
   and coarse pointers, and animates transform/opacity only.
   ============================================================ */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../utils/cn";
import { motionTokens, springs } from "./motion-tokens";

/* ---------------- springs ---------------- */

export { motionTokens, springs } from "./motion-tokens";
export const springSoft: Transition = springs.gentle;
export const springSnappy: Transition = springs.snappy;
export const springHeavy: Transition = springs.heavy;
export const springKinetic: Transition = springs.kinetic;
export const springBouncy: Transition = springs.bouncy;
export const springSmooth: Transition = springs.smooth;

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(mq.matches);
    const on = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

/* ---------------- scroll reveals ---------------- */

export function MReveal({
  children,
  delay = 0,
  y = motionTokens.distance.lg,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const prm = useReducedMotion();
  const [fallback, setFallback] = useState(false);

  // Safety net: if IntersectionObserver never fires (e.g. automated captures,
  // very slow devices, ad-blockers), reveal after a timeout so content
  // is never permanently invisible.
  useEffect(() => {
    const t = setTimeout(() => setFallback(true), motionTokens.fallbackTimeoutMs);
    return () => clearTimeout(t);
  }, []);

  if (fallback) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={prm ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={prm ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px 0px" }}
      transition={{ ...springSoft, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- stagger groups ---------------- */

export function Stagger({
  children,
  className,
  stagger = motionTokens.stagger.default,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const prm = useReducedMotion();
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFallback(true), motionTokens.fallbackTimeoutMs);
    return () => clearTimeout(t);
  }, []);
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: prm ? 0 : stagger, delayChildren: delay } },
  };
  if (fallback) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function MItem({
  children,
  className,
  y = motionTokens.distance.lg,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  scale?: number;
}) {
  const prm = useReducedMotion();
  const variants: Variants = {
    hidden: prm ? { opacity: 0 } : { opacity: 0, y, scale },
    show: prm
      ? { opacity: 1, transition: { duration: motionTokens.duration.normal } }
      : { opacity: 1, y: 0, scale: 1, transition: springSoft },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/* ---------------- kinetic headline text ---------------- */

export function KineticText({
  text,
  className,
  delay = 0,
  per = "word",
}: {
  text: string;
  className?: string;
  delay?: number;
  per?: "word" | "line";
}) {
  const prm = useReducedMotion();
  if (prm || per === "line") {
    return (
      <span className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
        <motion.span
          className={cn("inline-block will-change-transform", className)}
          initial={prm ? false : { y: "112%" }}
          whileInView={prm ? undefined : { y: "0%" }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ ...springHeavy, delay }}
        >
          {text}
        </motion.span>
      </span>
    );
  }
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "112%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-40px 0px" }}
             transition={{ ...springHeavy, delay: delay + i * motionTokens.stagger.tight }}
          >
            {w}
          </motion.span>
        </span>
      ))}{" "}
    </span>
  );
}

/* ---------------- magnetic draw ---------------- */

export function Magnetic({
  children,
  strength = motionTokens.interaction.magneticStrength,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const prm = useReducedMotion();
  const fine = useFinePointer();
  const enabled = !prm && fine;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, motionTokens.physics.magnetic);
  const sy = useSpring(y, motionTokens.physics.magnetic);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("magnetic inline-block will-change-transform", className)}
      style={enabled ? { x: sx, y: sy } : undefined}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- parallax tilt + glare ---------------- */

export function Tilt({
  children,
  max = motionTokens.interaction.tiltMax,
  className,
  glare = true,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
  glare?: boolean;
}) {
  const prm = useReducedMotion();
  const fine = useFinePointer();
  const enabled = !prm && fine;

  const rx = useSpring(useMotionValue(0), motionTokens.physics.tilt);
  const ry = useSpring(useMotionValue(0), motionTokens.physics.tilt);
  const gx = useMotionValue(50);
  const gy = useMotionValue(40);
  const bg = useTransform(
    [gx, gy],
    (latest) =>
      `radial-gradient(420px circle at ${latest[0]}% ${latest[1]}%, rgba(45,212,191,0.13), transparent 65%)`
  );

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * max * 2);
    ry.set(px * max * 2);
    gx.set((px + 0.5) * 100);
    gy.set((py + 0.5) * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      className={cn("tilt-wrap relative", className)}
       style={enabled ? { rotateX: rx, rotateY: ry, transformPerspective: motionTokens.interaction.perspective } : undefined}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
    >
      {children}
      {glare && enabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ background: bg }}
        />
      )}
    </motion.div>
  );
}

/* ---------------- animated collapse (accordion) ---------------- */

export function Collapse({
  open,
  children,
  className,
  id,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const prm = useReducedMotion();
  return (
    <motion.div
      id={id}
      inert={!open}
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={
        prm
          ? { opacity: open ? 1 : 0 }
          : { height: open ? "auto" : 0, opacity: open ? 1 : 0 }
      }
       transition={springs.gentle}
      style={prm ? undefined : { height: 0 }}
      aria-hidden={!open}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- modal choreography ---------------- */

export function MOverlay({
  className,
  innerRef,
  onClick,
  ariaLabel,
  tabIndex,
}: {
  className?: string;
  innerRef?: Ref<HTMLButtonElement>;
  onClick?: () => void;
  ariaLabel?: string;
  tabIndex?: number;
}) {
  return (
    <motion.button
      ref={innerRef}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.out }}
    />
  );
}

export function MPanel({
  children,
  className,
  innerRef,
  tabIndex,
  role,
  ariaModal,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  innerRef?: Ref<HTMLDivElement>;
  tabIndex?: number;
  role?: string;
  ariaModal?: boolean;
  ariaLabel?: string;
}) {
  const prm = useReducedMotion();
  return (
    <motion.div
      ref={innerRef}
      className={className}
      tabIndex={tabIndex}
      role={role}
      aria-modal={ariaModal}
      aria-label={ariaLabel}
      initial={prm ? { opacity: 0 } : { opacity: 0, y: motionTokens.distance.md, scale: motionTokens.scale.press }}
      animate={prm ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={prm ? { opacity: 0 } : { opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.subtle }}
      transition={springSnappy}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- sliding number (odometer) ---------------- */

export function SlidingNumber({ value, className }: { value: number; className?: string }) {
  const prm = useReducedMotion();
  const text = value.toLocaleString("en-US");
  if (prm) return <span className={className}>{text}</span>;
  return (
    <span className={cn("inline-flex tabular-nums", className)} aria-label={text}>
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom">
            <motion.span
              className="absolute inset-x-0 top-0 flex flex-col"
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={springSmooth}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <span key={d} className="block h-[1em] text-center leading-none">
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block">
            {ch}
          </span>
        )
      )}
    </span>
  );
}

/* ---------------- routed page fade ---------------- */

export function PageFade({ id, children }: { id: string; children: ReactNode }) {
  const prm = useReducedMotion();
  return (
    <motion.div
      key={id}
      initial={prm ? { opacity: 0 } : { opacity: 0, y: motionTokens.distance.md }}
      animate={prm ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={springSmooth}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- count-up number ---------------- */

export function CountUp({
  target,
  duration = motionTokens.countUpDurationMs,
  className,
  suffix = "",
}: {
  target: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const prm = useReducedMotion();
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (prm) { setVal(target); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, prm]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {val.toLocaleString()}{suffix}
    </span>
  );
}

/* ---------------- stagger list (CSS-only, lightweight) ---------------- */

export function StaggerList({
  children,
  className,
  stagger = motionTokens.stagger.default * 1000,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? (children as ReactNode[]).map((child, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: motionTokens.distance.md }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSoft, delay: (i * stagger) / 1000 }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </div>
  );
}

/* ---------------- pulse dot ---------------- */

export function PulseDot({ color = "var(--green)", size = motionTokens.indicatorSize }: { color?: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full"
         style={{ background: color, opacity: 0.4, animation: "ping-soft var(--duration-slower) var(--easing-out) infinite" }}
      />
      <span className="relative inline-flex rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  );
}
