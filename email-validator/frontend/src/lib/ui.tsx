import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import * as Phosphor from "@phosphor-icons/react";
import { cn } from "../utils/cn";
import { MReveal } from "./motion";

/* ============================== hooks ============================== */

export function usePrefersReducedMotion() {
  const [prm, setPrm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrm(mq.matches);
    const fn = (e: MediaQueryListEvent) => setPrm(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return prm;
}

export function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    const fallback = setTimeout(() => setInView(true), 2500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [threshold]);
  return { ref, inView };
}

/** true while element is in viewport — gates intervals/canvases/video. */
export function useActiveInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setActive(!!entries[0]?.isIntersecting), {
      threshold,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, active };
}

export function useCountUp(target: number, start: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  const prm = usePrefersReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (prm) {
      setVal(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, prm]);
  return val;
}

export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/* ============================== glow card ============================== */

export function GlowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: ReactPointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={cn("glow-card", className)}>
      {children}
    </div>
  );
}

/* ============================== section header ============================== */

export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <MReveal delay={0.02} y={18}>
        <span className="eyebrow inline-flex items-center gap-2.5">
          <span className="pulse-blue size-1.5 rounded-full bg-[var(--blue)]" aria-hidden />
          {eyebrow}
        </span>
      </MReveal>
      <MReveal delay={0.1} y={24}>
        <h2 className="mt-4 text-[clamp(1.65rem,3.4vw,2.15rem)] leading-[1.15] font-extrabold tracking-tight text-[var(--text-1)]">
          {title}
        </h2>
      </MReveal>
      {sub && (
        <MReveal delay={0.18} y={20}>
          <p className="mt-3.5 text-[14px] leading-[1.7] text-[var(--text-2)]">{sub}</p>
        </MReveal>
      )}
    </div>
  );
}

/* ============================== scroll progress ============================== */

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={barRef} style={{ viewTransitionName: "scroll-progress" }} className="scroll-progress" aria-hidden />;
}

/* ============================== spinner ============================== */

export function Spinner({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "spin inline-block rounded-full border-2 border-[rgba(160,160,184,.2)] border-t-[var(--cyan)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/* ============================== icons (Phosphor-only) ============================== */

export type IconName = keyof typeof PHOSPHOR_ICONS;

export const PHOSPHOR_ICONS = {
  mail: Phosphor.Envelope,
  send: Phosphor.PaperPlaneTilt,
  search: Phosphor.MagnifyingGlass,
  refresh: Phosphor.ArrowClockwise,
  close: Phosphor.X,
  alert: Phosphor.Warning,
  check: Phosphor.Check,
  arrowRight: Phosphor.ArrowRight,
  arrowDown: Phosphor.ArrowDown,
  arrowUp: Phosphor.ArrowUp,
  chevronDown: Phosphor.CaretDown,
  menu: Phosphor.List,
  database: Phosphor.Database,
  download: Phosphor.Download,
  code: Phosphor.Code,
  shield: Phosphor.Shield,
  lock: Phosphor.Lock,
  key: Phosphor.Key,
  users: Phosphor.Users,
  trash: Phosphor.Trash,
  sparkles: Phosphor.Sparkle,
  server: Phosphor.DesktopTower,
  globe: Phosphor.Globe,
  ban: Phosphor.Prohibit,
  layers: Phosphor.Stack,
  clock: Phosphor.Clock,
  activity: Phosphor.Pulse,
  chart: Phosphor.ChartLineUp,
  gauge: Phosphor.Gauge,
  star: Phosphor.Star,
  copy: Phosphor.Copy,
  network: Phosphor.ShareNetwork,
  file: Phosphor.FileCsv,
  flask: Phosphor.Flask,
  gear: Phosphor.Gear,
  gem: Phosphor.Diamond,
  lifebuoy: Phosphor.Lifebuoy,
  target: Phosphor.Target,
  list: Phosphor.List,
  eye: Phosphor.Eye,
  bolt: Phosphor.Lightning,
  plus: Phosphor.Plus,
  pause: Phosphor.Pause,
  play: Phosphor.Play,
  rocket: Phosphor.RocketLaunch,
  signOut: Phosphor.SignOut,
  zap: Phosphor.Lightning,
  logout: Phosphor.SignOut,
  flag: Phosphor.Flag,
  book: Phosphor.BookOpen,
  link: Phosphor.PaperPlaneTilt,
} as const satisfies Record<string, Phosphor.Icon>;

export type PhosphorIcon = Phosphor.Icon;

export function Icon({
  name,
  size = 20,
  className,
  weight = "regular",
  color,
}: {
  name: IconName;
  size?: number;
  className?: string;
  weight?: Phosphor.IconWeight;
  color?: string;
}) {
  const Glyph = PHOSPHOR_ICONS[name] ?? Phosphor.Sparkle;
  return (
    <Glyph
      size={size}
      weight={weight}
      color={color}
      className={className}
      aria-hidden
    />
  );
}
