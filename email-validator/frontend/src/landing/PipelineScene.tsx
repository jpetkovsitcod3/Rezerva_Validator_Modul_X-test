import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Gauge,
  Globe,
  Network,
  Satellite,
  ScanLine,
  Server,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { KineticText, MItem, SlidingNumber, Stagger } from "../lib/motion";
import { useActiveInView } from "../lib/ui";

/* ------------------------------------------------------------------ */
/* The seven gates — email validation narrative                        */
/* ------------------------------------------------------------------ */

interface LayerDef {
  id: string;
  title: string;
  short: string;
  detail: string;
  fail: string;
  ms: string;
  icon: LucideIcon;
}

const LAYERS: LayerDef[] = [
  { id: "syntax", title: "Syntax Verification", short: "RFC 5322 grammar", detail: "Parses local part, domain and quoting rules; rejects anything malformed before it wastes a network call.", fail: "malformed address", ms: "0.3ms", icon: ScanLine },
  { id: "dns", title: "DNS Lookup", short: "domain + nameservers", detail: "Resolves the domain against an edge-cached resolver; dead and typo domains die here, cheaply.", fail: "NXDOMAIN — no such domain", ms: "8ms", icon: Globe },
  { id: "mx", title: "MX Record Extraction", short: "mail exchangers", detail: "Locates and priority-orders mail exchangers; domains that exist but can't receive mail are ejected.", fail: "no mail exchanger", ms: "13ms", icon: Server },
  { id: "disposable", title: "Disposable Detection", short: "4,217-domain blocklist", detail: "Scans against the burner-domain blocklist plus heuristics for fresh throwaway services.", fail: "burner domain listed", ms: "0.8ms", icon: Trash2 },
  { id: "catchall", title: "Catch-All Probe", short: "accept-all detection", detail: "Fires randomized non-existent users at the domain; accept-anything domains pass SMTP but still bounce later.", fail: "accepts all addresses", ms: "21ms", icon: Network },
  { id: "smtp", title: "SMTP Handshake", short: "live RCPT TO", detail: "Real EHLO → MAIL FROM → RCPT TO against warm pools, disconnected before DATA. Polite, never a spam trap.", fail: "550 5.1.1 user unknown", ms: "246ms", icon: Satellite },
  { id: "scoring", title: "ML Scoring Gate", short: "41 signals → 0–100", detail: "Gradient-boosted verdict over 41 signals, calibrated weekly on 4B outcomes. Below 40 never ships.", fail: "score below threshold", ms: "2.0ms", icon: Gauge },
];

/* ------------------------------------------------------------------ */
/* Refined belt path — smoother curves, tighter to the isometric scene */
/* ------------------------------------------------------------------ */

/* Station anchors on the 1536×1024 scene, in belt-travel order.
   These are hand-tuned to sit on the conveyor belt in the pipeline.jpg */
const ANCHORS: [number, number][] = [
  [250, 340],  // L1 scanner arch
  [760, 332],  // L2 hologlobe
  [1170, 328], // L3 server rack
  [1232, 712], // L4 bottom-right machine
  [950, 724],  // L5 satellite dish
  [520, 714],  // L6 robotic arm
  [356, 707],  // L7 final gate
];

/* Smoother path with more cubic segments for accurate belt tracking.
   Each segment uses gentle control points to avoid sharp kinks at turns. */
const PATH_D = [
  "M -70 340",
  /* top run: left → right, gentle S-curve following the upper belt */
  "C 40 344, 120 346, 250 340",
  "C 380 334, 560 332, 760 332",
  "C 920 332, 1060 330, 1170 328",
  /* right turnaround: smooth 180° bend, wider radius */
  "C 1280 326, 1380 350, 1420 400",
  "C 1460 450, 1470 510, 1450 560",
  "C 1430 610, 1380 650, 1320 680",
  "C 1280 700, 1250 710, 1232 712",
  /* bottom run: right → left, gentle curve */
  "C 1140 718, 1040 722, 950 724",
  "C 830 726, 660 720, 520 714",
  "C 440 710, 390 708, 356 707",
  /* left turnaround: smooth 180° bend back up */
  "C 280 704, 180 700, 100 680",
  "C 20 650, -40 580, -50 500",
  "C -60 420, -50 370, -70 340",
].join(" ");

const VB_W = 1536;
const VB_H = 1024;

/* ------------------------------------------------------------------ */
/* Simulation types                                                    */
/* ------------------------------------------------------------------ */

interface SimCube {
  el: HTMLDivElement;
  trail: HTMLDivElement;
  core: HTMLDivElement;
  tag: number;
  s: number;
  prevS: number;
  speed: number;       // current speed (varies near gates)
  baseSpeed: number;   // base speed for this cube
  valid: boolean;
  failGate: number;
  status: "run" | "gold" | "drop";
  dropAt: number;
  wobblePhase: number; // for subtle lateral wobble
  wobbleAmp: number;
}

interface LogLine {
  t: string;
  label: string;
  msg: string;
  kind: "fail" | "pass";
}

const stamp = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false }) +
  "." +
  String(Math.floor(Math.random() * 99)).padStart(2, "0");

/* ------------------------------------------------------------------ */

export default function PipelineScene() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lutRef = useRef<{ xs: Float32Array; ys: Float32Array; L: number } | null>(null);
  const gateDistRef = useRef<number[]>([]);
  const sizeRef = useRef({ w: 1, h: 1 });
  const cubesRef = useRef<SimCube[]>([]);
  const spawnAtRef = useRef(0);
  const nextIdRef = useRef(1);
  const inspectPrevRef = useRef<boolean[]>(LAYERS.map(() => false));

  const { ref: viewRef, active } = useActiveInView<HTMLDivElement>(0.2);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const running = active && !prefersReducedMotion;
  const [stats, setStats] = useState({ inbound: 0, trusted: 0, rejected: 0 });
  const [log, setLog] = useState<LogLine[]>([]);
  const [gatePos, setGatePos] = useState<{ x: number; y: number }[]>([]);
  const [hoverGate, setHoverGate] = useState<number | null>(null);
  const [lastGate, setLastGate] = useState<number | null>(null);

  /* measure path, build LUT, snap gates to the nearest belt point */
  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const N = 2000; // higher resolution for smoother interpolation
    const xs = new Float32Array(N + 1);
    const ys = new Float32Array(N + 1);
    for (let i = 0; i <= N; i++) {
      const pt = p.getPointAtLength((i / N) * L);
      xs[i] = pt.x;
      ys[i] = pt.y;
    }
    lutRef.current = { xs, ys, L };

    const dists: number[] = [];
    const pos: { x: number; y: number }[] = [];
    for (const [ax, ay] of ANCHORS) {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i <= N; i += 2) {
        const d = (xs[i] - ax) ** 2 + (ys[i] - ay) ** 2;
        if (d < bd) {
          bd = d;
          best = (i / N) * L;
        }
      }
      // refine
      const lo = Math.max(0, best - L / N);
      const hi = Math.min(L, best + L / N);
      for (let s = lo; s <= hi; s += L / 6000) {
        const pt = p.getPointAtLength(s);
        const d = (pt.x - ax) ** 2 + (pt.y - ay) ** 2;
        if (d < bd) {
          bd = d;
          best = s;
        }
      }
      dists.push(best);
      const pt = p.getPointAtLength(best);
      pos.push({ x: pt.x, y: pt.y });
    }
    gateDistRef.current = dists;
    setGatePos(pos);
  }, []);

  /* keep overlay size in sync */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const r = stage.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const pointAt = (s: number) => {
    const lut = lutRef.current!;
    const t = Math.max(0, Math.min(s / lut.L, 1)) * 2000;
    const i = Math.min(1999, Math.floor(t));
    const f = t - i;
    return {
      x: lut.xs[i] + (lut.xs[i + 1] - lut.xs[i]) * f,
      y: lut.ys[i] + (lut.ys[i + 1] - lut.ys[i]) * f,
    };
  };

  /* tangent at a point (for orienting the cube along the belt) */
  const tangentAt = (s: number) => {
    const lut = lutRef.current!;
    const t = Math.max(0, Math.min(s / lut.L, 1)) * 2000;
    const i = Math.min(1998, Math.floor(t));
    const dx = lut.xs[i + 1] - lut.xs[i];
    const dy = lut.ys[i + 1] - lut.ys[i];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { dx: dx / len, dy: dy / len };
  };

  const flashDot = (g: number, kind: "pass" | "fail") => {
    const el = dotRefs.current[g];
    if (!el) return;
    el.classList.remove("flash-pass", "flash-fail");
    void el.offsetWidth;
    el.classList.add(kind === "pass" ? "flash-pass" : "flash-fail");
    setLastGate(g);
  };

  const spawnPing = (x: number, y: number) => {
    const ov = overlayRef.current;
    if (!ov) return;
    const { w, h } = sizeRef.current;
    const ping = document.createElement("span");
    ping.className = "pv-ping";
    ping.style.left = `${(x / VB_W) * w}px`;
    ping.style.top = `${(y / VB_H) * h}px`;
    ping.addEventListener("animationend", () => ping.remove());
    ov.appendChild(ping);
  };

  const spawnCube = () => {
    const ov = overlayRef.current;
    if (!ov) return;
    const valid = Math.random() > 0.28;
    const baseSpeed = 180 + Math.random() * 100; // variable base speed per cube

    const el = document.createElement("div");
    el.className = "pv-cube";
    const core = document.createElement("div");
    core.className = "pv-cube-core";
    core.innerHTML = '<div class="pv-cube-glow"></div><div class="pv-cube-body"></div><div class="pv-cube-hi"></div>';
    el.appendChild(core);

    // trail element
    const trail = document.createElement("div");
    trail.className = "pv-trail";

    ov.appendChild(trail);
    ov.appendChild(el);

    cubesRef.current.push({
      el,
      trail,
      core,
      tag: nextIdRef.current++,
      s: 0,
      prevS: 0,
      speed: baseSpeed,
      baseSpeed,
      valid,
      failGate: valid ? -1 : Math.floor(Math.random() * LAYERS.length),
      status: "run",
      dropAt: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmp: 0.3 + Math.random() * 0.5,
    });
    setStats((s) => ({ ...s, inbound: s.inbound + 1 }));
  };

  const removeCube = (c: SimCube) => {
    c.el.remove();
    c.trail.remove();
    cubesRef.current = cubesRef.current.filter((k) => k !== c);
  };

  /* main loop — imperative DOM writes, zero per-frame React renders */
  useEffect(() => {
    if (!running || !lutRef.current) return;
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { w, h } = sizeRef.current;
      const L = lutRef.current!.L;
      const gates = gateDistRef.current;

      // spawn with slight randomness
      if (now >= spawnAtRef.current && cubesRef.current.length < 12) {
        spawnCube();
        spawnAtRef.current = now + 900 + Math.random() * 500;
      }

      for (const c of [...cubesRef.current]) {
        if (c.status === "run") {
          c.prevS = c.s;

          // dynamic speed: slow down near gates, speed up between them
          let nearestGateDist = Infinity;
          for (const gd of gates) {
            const d = Math.abs(c.s - gd);
            if (d < nearestGateDist) nearestGateDist = d;
          }
          // ease factor: 0.35 at gate center, 1.0 beyond 60 units
          const gateProximity = Math.max(0, 1 - nearestGateDist / 60);
          const easeFactor = 1 - gateProximity * 0.65;
          c.speed = c.baseSpeed * easeFactor;

          c.s += c.speed * dt;

          // wobble (subtle lateral offset perpendicular to belt direction)
          c.wobblePhase += dt * 3.5;
          const wobble = Math.sin(c.wobblePhase) * c.wobbleAmp * easeFactor;

          for (let g = 0; g < gates.length; g++) {
            if (c.prevS < gates[g] && c.s >= gates[g]) {
              if (!c.valid && c.failGate === g) {
                c.status = "drop";
                c.dropAt = now;
                c.core.classList.add("is-drop");
                flashDot(g, "fail");
                const pt = pointAt(gates[g]);
                spawnPing(pt.x, pt.y - 14);
                setStats((s) => ({ ...s, rejected: s.rejected + 1 }));
                setLog((l) =>
                  [
                    { t: stamp(), label: `PKT-${String(c.tag).padStart(4, "0")}`, msg: `L${g + 1} ${LAYERS[g].title.toUpperCase()} ✗ ${LAYERS[g].fail}`, kind: "fail" as const },
                    ...l,
                  ].slice(0, 9)
                );
                break;
              }
              flashDot(g, "pass");
            }
          }

          if (c.status === "run" && c.s >= L) {
            c.status = "gold";
            c.core.classList.add("is-gold");
            setStats((s) => ({ ...s, trusted: s.trusted + 1 }));
            setLog((l) =>
              [
                { t: stamp(), label: `PKT-${String(c.tag).padStart(4, "0")}`, msg: "7/7 gates cleared ✓ routed to trusted output", kind: "pass" as const },
                ...l,
              ].slice(0, 9)
            );
          }

          // position cube with wobble
          if (c.status === "run") {
            const pt = pointAt(Math.min(c.s, L));
            const tan = tangentAt(Math.min(c.s, L));
            // perpendicular offset for wobble
            const nx = -tan.dy * wobble;
            const ny = tan.dx * wobble;
            const px = (pt.x / VB_W) * w + nx;
            const py = (pt.y / VB_H) * h + ny;
            c.el.style.transform = `translate3d(${px - 9}px, ${py - 9}px, 0)`;

            // trail follows behind
            const trailPt = pointAt(Math.max(0, c.s - 18));
            const tpx = (trailPt.x / VB_W) * w;
            const tpy = (trailPt.y / VB_H) * h;
            const dx = px - tpx;
            const dy = py - tpy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            c.trail.style.transform = `translate3d(${tpx}px, ${tpy}px, 0) rotate(${angle}deg) scaleX(${Math.max(0.2, dist / 24)})`;
            c.trail.style.opacity = String(0.3 + easeFactor * 0.4);
          }
        } else if (c.status === "gold") {
          c.s += c.baseSpeed * dt * 1.2;
          const pt = pointAt(Math.min(c.s, L));
          c.el.style.transform = `translate3d(${(pt.x / VB_W) * w - 9}px, ${(pt.y / VB_H) * h - 9}px, 0)`;
          c.trail.style.opacity = "0";
          if (c.s > L + 80) {
            removeCube(c);
            continue;
          }
        } else if (c.status === "drop") {
          c.trail.style.opacity = "0";
          if (now - c.dropAt > 800) {
            removeCube(c);
            continue;
          }
        }
      }

      // gate inspect state
      for (let g = 0; g < gates.length; g++) {
        const inspecting = cubesRef.current.some((c) => c.status === "run" && Math.abs(c.s - gates[g]) < 20);
        if (inspecting !== inspectPrevRef.current[g]) {
          inspectPrevRef.current[g] = inspecting;
          dotRefs.current[g]?.classList.toggle("is-inspect", inspecting);
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const inspected = hoverGate ?? lastGate;
  const layer = inspected !== null ? LAYERS[inspected] : null;
  const LayerIcon = layer?.icon ?? ScanLine;

  return (
    <section id="pipeline" className="relative px-5 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.5rem)] font-bold text-[var(--text-1)]">
            <KineticText text="7-Layer Validation Pipeline" delay={0.05} />
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-[var(--text-3)]">
            A sequential, rigorous process designed to filter invalid data{" "}
            <span className="font-semibold text-[var(--color-status-error)]">with extreme prejudice.</span>
          </p>
        </div>

        {/* ============ the scene ============ */}
        <div ref={viewRef} className="relative mt-10 border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-[0_0_60px_rgba(79,138,255,.08)]">
          {/* corner brackets */}
          {["-left-px -top-px border-l-2 border-t-2", "-right-px -top-px border-r-2 border-t-2", "-bottom-px -left-px border-b-2 border-l-2", "-bottom-px -right-px border-b-2 border-r-2"].map((pos) => (
            <span key={pos} className={`absolute ${pos} z-30 h-4 w-4 border-[var(--color-accent-primary)]/60`} aria-hidden />
          ))}

          <div ref={stageRef} className="relative aspect-[3/2] w-full overflow-hidden">
            <img src="img/pipeline.jpg" alt="Isometric factory scene: a conveyor belt carrying data packets through seven validation stations" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,9,11,.75)] via-transparent to-[rgba(7,9,11,.45)]" aria-hidden />

            {/* station ambience */}
            {gatePos[0] && (
              <div className="pv-sweep absolute w-[26px] bg-gradient-to-t from-transparent via-[rgba(79,138,255,.45)] to-transparent blur-[2px]" style={{ left: `${(gatePos[0].x / VB_W) * 100}%`, top: `${(gatePos[0].y / VB_H) * 100 - 15}%`, height: "15%", transformOrigin: "bottom" }} aria-hidden />
            )}
            {gatePos[1] && (
              <div className="pv-ringpulse absolute" style={{ left: `${(gatePos[1].x / VB_W) * 100}%`, top: `${(gatePos[1].y / VB_H) * 100 - 4}%` }} aria-hidden>
                <div className="h-24 w-24 rounded-full border border-dashed border-[var(--color-accent-primary)]/35 md:h-32 md:w-32" />
              </div>
            )}

            {/* belt track SVG */}
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <defs>
                <filter id="pv-soft" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <filter id="pv-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* invisible reference path for LUT */}
              <path ref={pathRef} d={PATH_D} fill="none" stroke="transparent" />
              {/* wide soft glow */}
              <path d={PATH_D} fill="none" stroke="#7AB7FF" strokeOpacity="0.12" strokeWidth="20" filter="url(#pv-soft)" />
              {/* medium glow */}
              <path d={PATH_D} fill="none" stroke="#7AB7FF" strokeOpacity="0.28" strokeWidth="6" filter="url(#pv-glow)" />
              {/* core dashed belt */}
              <path d={PATH_D} fill="none" stroke="#7AB7FF" strokeOpacity="0.85" strokeWidth="2" strokeDasharray="10 20" className="pv-dashflow" />
              {/* bright center line */}
              <path d={PATH_D} fill="none" stroke="#A8C7FF" strokeOpacity="0.4" strokeWidth="0.8" />
            </svg>

            {/* imperative cube + trail + ping layer */}
            <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-10" />

            {/* gate markers */}
            {gatePos.map((g, i) => {
              const above = g.y < 512;
              return (
                <div
                  key={i}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(g.x / VB_W) * 100}%`, top: `${(g.y / VB_H) * 100}%` }}
                  onMouseEnter={() => setHoverGate(i)}
                  onMouseLeave={() => setHoverGate(null)}
                  onFocus={() => setHoverGate(i)}
                  onBlur={() => setHoverGate(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Layer ${i + 1}: ${LAYERS[i].title} — ${LAYERS[i].short}`}
                >
                  <div className="relative flex flex-col items-center">
                    {above && (
                      <div className="mb-1 flex flex-col items-center">
                        <div className="border border-[var(--color-accent-primary)]/35 bg-[var(--color-bg-primary)]/88 px-2 py-1 text-center backdrop-blur-sm">
                          <div className="font-data text-[9px] font-semibold leading-none text-[var(--palette-teal-300)] md:text-[10px]">L{i + 1}</div>
                          <div className="font-data mt-0.5 hidden text-[8px] uppercase leading-tight tracking-wider text-[var(--text-2)] md:block">{LAYERS[i].title}</div>
                        </div>
                        <div className="h-3 w-px bg-[var(--color-accent-primary)]/55" />
                      </div>
                    )}
                    <span ref={(el) => { dotRefs.current[i] = el; }} className="gate-dot block" />
                    {!above && (
                      <div className="mt-1 flex flex-col items-center">
                        <div className="h-3 w-px bg-[var(--color-accent-primary)]/55" />
                        <div className="border border-[var(--color-accent-primary)]/35 bg-[var(--color-bg-primary)]/88 px-2 py-1 text-center backdrop-blur-sm">
                          <div className="font-data text-[9px] font-semibold leading-none text-[var(--palette-teal-300)] md:text-[10px]">L{i + 1}</div>
                          <div className="font-data mt-0.5 hidden text-[8px] uppercase leading-tight tracking-wider text-[var(--text-2)] md:block">{LAYERS[i].title}</div>
                        </div>
                      </div>
                    )}

                    {hoverGate === i && (
                      <div className={`absolute left-1/2 z-40 w-60 -translate-x-1/2 border border-[var(--color-accent-primary)]/45 bg-[var(--color-bg-canvas)]/96 p-3 shadow-[0_0_30px_rgba(79,138,255,.18)] backdrop-blur ${above ? "top-full mt-2" : "bottom-full mb-2"}`}>
                        <div className="font-display text-xs font-bold uppercase tracking-wider text-[var(--palette-teal-300)]">Layer {i + 1} — {LAYERS[i].title}</div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-2)]">{LAYERS[i].detail}</p>
                        <div className="font-data mt-2 border-t border-[var(--color-border-secondary)] pt-1.5 text-[10px] text-[var(--color-status-error)]">rejects: {LAYERS[i].fail}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* HUD counters */}
            <div className="font-data absolute top-3 left-3 z-30 md:top-5 md:left-5">
              <div className="flex items-center gap-2 border border-[var(--color-border-primary)] bg-[var(--color-bg-canvas)]/85 px-2.5 py-1 backdrop-blur">
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-3)]">inbound</span>
                <SlidingNumber value={stats.inbound} className="text-sm font-semibold text-[var(--text-1)]" />
              </div>
            </div>
            <div className="font-data absolute top-3 right-3 z-30 md:top-5 md:right-5">
              <div className="flex items-center gap-2 border border-[var(--color-error-border)]/70 bg-[var(--color-bg-canvas)]/85 px-2.5 py-1 backdrop-blur">
                <Trash2 className="h-3.5 w-3.5 text-[var(--color-status-error)]" aria-hidden />
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-status-error)]">rejected</span>
                <SlidingNumber value={stats.rejected} className="text-sm font-semibold text-[var(--color-status-error)]" />
              </div>
            </div>
            <div className="font-data absolute bottom-3 left-3 z-30 md:bottom-5 md:left-5">
              <div className="flex items-center gap-2 border border-[var(--color-success-border)]/70 bg-[var(--color-bg-canvas)]/85 px-2.5 py-1 backdrop-blur">
                <Gauge className="h-3.5 w-3.5 text-[var(--color-status-success)]" aria-hidden />
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-status-success)]">trusted</span>
                <SlidingNumber value={stats.trusted} className="text-sm font-semibold text-[var(--color-status-success)]" />
              </div>
            </div>

            {/* legend */}
            <div className="font-data absolute right-3 bottom-3 z-30 hidden flex-col gap-1 border border-[var(--color-border-primary)] bg-[var(--color-bg-canvas)]/85 px-3 py-2 text-[10px] backdrop-blur md:flex md:right-5 md:bottom-5">
              <span className="flex items-center gap-2 text-[var(--text-2)]"><span className="h-2 w-2 bg-[var(--palette-teal-300)] shadow-[0_0_6px_var(--palette-teal-300)]" /> raw packet</span>
              <span className="flex items-center gap-2 text-[var(--text-2)]"><span className="h-2 w-2 bg-[var(--color-status-error)] shadow-[0_0_6px_var(--color-status-error)]" /> filtered</span>
              <span className="flex items-center gap-2 text-[var(--text-2)]"><span className="h-2 w-2 bg-[var(--color-status-success)] shadow-[0_0_6px_var(--color-status-success)]" /> trusted</span>
            </div>
          </div>
        </div>

        {/* ============ log + gate inspector ============ */}
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          <section className="border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] lg:col-span-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border-secondary)] px-4 py-2.5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-1)]">Validation event log</h3>
              <span className="font-data flex items-center gap-1.5 text-[10px] uppercase text-[var(--text-3)]">
                <span className={`h-1.5 w-1.5 rounded-full ${running ? "pv-blink bg-[var(--color-status-success)]" : "bg-[var(--text-3)]"}`} />
                {running ? "streaming" : "scroll to activate"}
              </span>
            </div>
            <div className="font-data h-[230px] overflow-hidden px-4 py-3 text-[11px] leading-relaxed">
              {log.length === 0 ? (
                <p className="text-[var(--text-3)]">awaiting first packet…</p>
              ) : (
                log.map((l, i) => (
                  <p key={`${l.label}-${l.t}`} className="transition-opacity duration-300" style={{ opacity: Math.max(0.35, 1 - i * 0.09) }}>
                    <span className="text-[var(--text-3)]">[{l.t}]</span> <span className="text-[var(--text-2)]">{l.label}</span>{" "}
                    <span className={l.kind === "fail" ? "text-[var(--color-status-error)]" : "text-[var(--color-status-success)]"}>{l.msg}</span>
                  </p>
                ))
              )}
            </div>
          </section>

          <section className="border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-5 lg:col-span-2">
            <p className="font-data text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--palette-teal-300)]">gate inspector</p>
            {layer ? (
              <div key={inspected} className="slide-up mt-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center border border-[var(--color-accent-primary)]/45 bg-[var(--color-accent-primary)]/10 text-[var(--palette-teal-300)]">
                    <LayerIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-bold text-[var(--text-1)]">{layer.title}</h3>
                    <p className="font-data text-[9.5px] uppercase tracking-wider text-[var(--text-3)]">{layer.short} · {layer.ms}</p>
                  </div>
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--text-2)]">{layer.detail}</p>
                <p className="font-data mt-3 border-t border-[var(--color-border-secondary)] pt-2.5 text-[10.5px] text-[var(--color-status-error)]">
                  <span className="text-[var(--text-3)]">eject condition:</span> {layer.fail}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--text-3)]">
                Hover or focus any gate on the belt — or wait for a packet to trigger one — to read its rule here.
              </p>
            )}
          </section>
        </div>

        {/* mobile legend */}
        <div role="list" className="mt-5 grid grid-cols-1 gap-2 lg:hidden">
          {LAYERS.map((s, i) => (
            <MItem key={s.id}>
              <div role="listitem" className="flex items-center gap-3 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-3.5 py-2.5">
                <span className="font-data w-5 text-[10px] text-[var(--text-3)]">{String(i + 1).padStart(2, "0")}</span>
                <s.icon className="h-4 w-4 shrink-0 text-[var(--palette-teal-300)]" aria-hidden />
                <span className="flex-1">
                  <span className="block text-[12.5px] font-semibold text-[var(--text-1)]">{s.title}</span>
                  <span className="font-data block text-[9.5px] text-[var(--text-3)]">{s.ms}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="pulse-green size-1.5 rounded-full bg-[var(--color-status-success)]" />
                  <span className="font-data text-[8px] font-bold tracking-[0.18em] text-[var(--text-2)]">PASS</span>
                </span>
              </div>
            </MItem>
          ))}
        </div>

        <Stagger className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-secondary)] pt-5" stagger={0.08}>
          <MItem>
            <span className="font-data text-[10px] uppercase tracking-widest text-[var(--text-3)]">
              7-layer validation pipeline · data filtered with extreme prejudice
            </span>
          </MItem>
          <MItem>
            <span className="font-data flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-3)]">
              <span className={`pv-blink h-1.5 w-1.5 rounded-full ${running ? "bg-[var(--palette-teal-300)]" : "bg-[var(--text-3)]"}`} />
              {running ? "pipeline nominal" : "awaiting scroll"}
            </span>
          </MItem>
        </Stagger>
      </div>

      {/* inline styles for imperative cube + trail elements */}
      <style>{`
        .pv-trail {
          position: absolute;
          top: 0;
          left: 0;
          width: 24px;
          height: 3px;
          pointer-events: none;
          will-change: transform, opacity;
          background: linear-gradient(90deg, transparent, rgba(79,138,255,0.55));
          border-radius: 2px;
          transform-origin: 0 50%;
          z-index: 9;
          filter: blur(1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .pv-trail { display: none; }
        }
      `}</style>
    </section>
  );
}
