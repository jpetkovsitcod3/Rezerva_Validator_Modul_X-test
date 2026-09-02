import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useActiveInView } from "../lib/ui";
import { SlidingNumber, PulseDot } from "../lib/motion";

/* ============================================================
   MapHero — premium animated global packet-exchange board
   All heavy animation is imperative DOM (zero per-frame React).
   ============================================================ */

/* looping live-validation feed */
const EVENTS = [
  { who: "maya@stripe.com", what: "96/100 · safe to send", tone: "var(--palette-teal-400)", region: "us-east" },
  { who: "james@gmial.com", what: "8/100 · hard bounce", tone: "#D45B3D", region: "eu-west" },
  { who: "promo@mailinator.com", what: "4/100 · disposable", tone: "#D45B3D", region: "ap-south" },
  { who: "info@megacorp.com", what: "58/100 · review", tone: "var(--palette-teal-400)", region: "us-west" },
  { who: "ops@beacon.dev", what: "91/100 · safe to send", tone: "var(--palette-teal-400)", region: "eu-central" },
  { who: "cto@rival.io", what: "72/100 · risky domain", tone: "var(--palette-teal-400)", region: "ap-east" },
  { who: "hello@freshmail.co", what: "99/100 · pristine", tone: "var(--palette-teal-400)", region: "sa-east" },
  { who: "noreply@shadow.net", what: "2/100 · spam trap", tone: "#D45B3D", region: "af-north" },
];

/* hub cities — major validation relay points */
const HUBS: { x: number; y: number; label: string; region: string }[] = [
  { x: 22, y: 36, label: "US-E", region: "Virginia" },
  { x: 15, y: 38, label: "US-W", region: "Oregon" },
  { x: 44, y: 30, label: "EU-W", region: "Frankfurt" },
  { x: 50, y: 28, label: "EU-C", region: "Amsterdam" },
  { x: 56, y: 32, label: "EU-E", region: "Warsaw" },
  { x: 70, y: 38, label: "AP-S", region: "Mumbai" },
  { x: 80, y: 34, label: "AP-E", region: "Singapore" },
  { x: 85, y: 42, label: "AP-NE", region: "Tokyo" },
  { x: 28, y: 62, label: "SA-E", region: "São Paulo" },
  { x: 50, y: 48, label: "AF-N", region: "Johannesburg" },
  { x: 76, y: 56, label: "OC-E", region: "Sydney" },
];

/* arc routes — realistic intercontinental paths (0–100 SVG space) */
const ARCS: { d: string; from: string; to: string; weight: number }[] = [
  { d: "M22 36 Q30 18 44 30", from: "US-E", to: "EU-W", weight: 1.0 },
  { d: "M44 30 Q52 20 70 38", from: "EU-W", to: "AP-S", weight: 0.85 },
  { d: "M70 38 Q78 30 85 42", from: "AP-S", to: "AP-NE", weight: 0.7 },
  { d: "M22 36 Q18 50 28 62", from: "US-E", to: "SA-E", weight: 0.6 },
  { d: "M44 30 Q42 42 50 48", from: "EU-W", to: "AF-N", weight: 0.5 },
  { d: "M80 34 Q82 48 76 56", from: "AP-E", to: "OC-E", weight: 0.55 },
  { d: "M15 38 Q18 28 22 36", from: "US-W", to: "US-E", weight: 0.9 },
  { d: "M50 28 Q58 26 70 38", from: "EU-C", to: "AP-S", weight: 0.65 },
  { d: "M22 36 Q50 12 85 42", from: "US-E", to: "AP-NE", weight: 0.4 },
  { d: "M28 62 Q40 58 50 48", from: "SA-E", to: "AF-N", weight: 0.35 },
  { d: "M44 30 Q36 24 22 36", from: "EU-W", to: "US-E", weight: 0.95 },
  { d: "M85 42 Q72 44 56 32", from: "AP-NE", to: "EU-E", weight: 0.45 },
];

/* scattered validation nodes (smaller relay points) */
const NODES: { x: number; y: number }[] = [
  { x: 24, y: 42 }, { x: 19, y: 34 }, { x: 27, y: 30 },
  { x: 38, y: 28 }, { x: 47, y: 34 }, { x: 52, y: 36 },
  { x: 60, y: 30 }, { x: 65, y: 42 }, { x: 74, y: 36 },
  { x: 78, y: 44 }, { x: 82, y: 38 }, { x: 88, y: 46 },
  { x: 30, y: 55 }, { x: 35, y: 65 }, { x: 48, y: 52 },
  { x: 55, y: 58 }, { x: 68, y: 50 }, { x: 72, y: 60 },
  { x: 80, y: 52 }, { x: 25, y: 48 }, { x: 42, y: 40 },
];

/* ============================================================
   Imperative packet system
   ============================================================ */

interface Packet {
  el: HTMLDivElement;
  trail: HTMLDivElement;
  arcIdx: number;
  t: number;        // 0..1 progress along arc
  speed: number;    // units per second
  born: number;
  ttl: number;
  alive: boolean;
}

function buildArcLUT(svgEl: SVGSVGElement, arcPaths: SVGPathElement[]) {
  return arcPaths.map((p) => {
    const L = p.getTotalLength();
    const N = 200;
    const xs = new Float32Array(N + 1);
    const ys = new Float32Array(N + 1);
    for (let i = 0; i <= N; i++) {
      const pt = p.getPointAtLength((i / N) * L);
      xs[i] = pt.x;
      ys[i] = pt.y;
    }
    return { xs, ys, L, N };
  });
}

function pointOnArc(lut: { xs: Float32Array; ys: Float32Array; N: number }, t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const f = clamped * lut.N;
  const i = Math.min(lut.N - 1, Math.floor(f));
  const frac = f - i;
  return {
    x: lut.xs[i] + (lut.xs[i + 1] - lut.xs[i]) * frac,
    y: lut.ys[i] + (lut.ys[i + 1] - lut.ys[i]) * frac,
  };
}

/* ============================================================ */

export default function MapHero() {
  const { ref, active } = useActiveInView<HTMLDivElement>(0.1);
  const [validated, setValidated] = useState(2412806);
  const [evIdx, setEvIdx] = useState(0);

  /* imperative refs */
  const svgRef = useRef<SVGSVGElement>(null);
  const arcPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const packetsRef = useRef<Packet[]>([]);
  const lutRef = useRef<ReturnType<typeof buildArcLUT>>([]);
  const sizeRef = useRef({ w: 1, h: 1 });
  const spawnAccRef = useRef(0);
  const ripplePoolRef = useRef<HTMLDivElement[]>([]);
  const frameRef = useRef(0);

  /* counter */
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (!document.hidden) setValidated((v) => v + 3 + Math.floor(Math.random() * 7));
    }, 1200);
    return () => clearInterval(id);
  }, [active]);

  /* event feed */
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (!document.hidden) setEvIdx((i) => (i + 1) % EVENTS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [active]);

  /* build LUTs once */
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = arcPathRefs.current.filter(Boolean) as SVGPathElement[];
    lutRef.current = buildArcLUT(svg, paths);
  }, []);

  /* measure container */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* spawn a ripple at a hub position */
  const spawnRipple = (px: number, py: number, color: string) => {
    const ov = overlayRef.current;
    if (!ov) return;
    let ripple = ripplePoolRef.current.pop();
    if (!ripple) {
      ripple = document.createElement("div");
      ripple.className = "map-ripple";
      ov.appendChild(ripple);
    }
    ripple.style.left = `${px}px`;
    ripple.style.top = `${py}px`;
    ripple.style.borderColor = color;
    ripple.style.opacity = "1";
    ripple.style.transform = "translate(-50%, -50%) scale(0.3)";
    ripple.style.transition = "none";
    // force reflow
    void ripple.offsetWidth;
    ripple.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
    ripple.style.transform = "translate(-50%, -50%) scale(2.5)";
    ripple.style.opacity = "0";
    setTimeout(() => {
      ripplePoolRef.current.push(ripple!);
    }, 850);
  };

  /* main animation loop — imperative, zero React renders */
  useEffect(() => {
    if (!active) return;
    const ov = overlayRef.current;
    if (!ov) return;
    const luts = lutRef.current;
    if (luts.length === 0) return;

    let raf = 0;
    let last = performance.now();

    const createPacketEl = () => {
      const el = document.createElement("div");
      el.className = "map-packet";
      const glow = document.createElement("div");
      glow.className = "map-packet-glow";
      const core = document.createElement("div");
      core.className = "map-packet-core";
      const hi = document.createElement("div");
      hi.className = "map-packet-hi";
      el.appendChild(glow);
      el.appendChild(core);
      el.appendChild(hi);
      return el;
    };

    const createTrailEl = () => {
      const trail = document.createElement("div");
      trail.className = "map-trail";
      return trail;
    };

    const spawnPacket = (now: number) => {
      const arcIdx = Math.floor(Math.random() * luts.length);
      const arc = ARCS[arcIdx];
      const el = createPacketEl();
      const trail = createTrailEl();

      // color based on arc weight — heavier routes get brighter packets
      const brightness = 0.5 + arc.weight * 0.5;
      el.style.opacity = String(brightness);
      trail.style.opacity = String(brightness * 0.6);

      ov.appendChild(trail);
      ov.appendChild(el);

      const pkt: Packet = {
        el,
        trail,
        arcIdx,
        t: 0,
        speed: 0.12 + Math.random() * 0.18, // variable speed
        born: now,
        ttl: 4000 + Math.random() * 3000,
        alive: true,
      };
      packetsRef.current.push(pkt);
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { w, h } = sizeRef.current;

      // spawn packets at a natural rate
      spawnAccRef.current += dt;
      const spawnInterval = 0.25; // seconds between spawns
      while (spawnAccRef.current >= spawnInterval && packetsRef.current.length < 30) {
        spawnPacket(now);
        spawnAccRef.current -= spawnInterval;
      }

      // update packets
      for (let i = packetsRef.current.length - 1; i >= 0; i--) {
        const pkt = packetsRef.current[i];
        if (!pkt.alive) continue;

        pkt.t += pkt.speed * dt;

        // reached end of arc
        if (pkt.t >= 1) {
          pkt.alive = false;
          // spawn ripple at destination hub
          const arc = ARCS[pkt.arcIdx];
          const destHub = HUBS.find((h) => h.label === arc.to);
          if (destHub) {
            const px = (destHub.x / 100) * w;
            const py = (destHub.y / 100) * h;
            const isFail = Math.random() < 0.25;
            spawnRipple(px, py, isFail ? "rgba(248,113,113,0.6)" : "rgba(212,175,55,0.5)");
          }
          // fade out
          pkt.el.style.transition = "opacity 0.3s ease-out";
          pkt.el.style.opacity = "0";
          pkt.trail.style.transition = "opacity 0.4s ease-out";
          pkt.trail.style.opacity = "0";
          setTimeout(() => {
            pkt.el.remove();
            pkt.trail.remove();
            packetsRef.current = packetsRef.current.filter((p) => p !== pkt);
          }, 400);
          continue;
        }

        // position packet
        const lut = luts[pkt.arcIdx];
        const pt = pointOnArc(lut, pkt.t);
        const px = (pt.x / 100) * w;
        const py = (pt.y / 100) * h;

        pkt.el.style.transform = `translate3d(${px - 4}px, ${py - 4}px, 0)`;

        // trail — position at slightly earlier point
        const trailT = Math.max(0, pkt.t - 0.06);
        const tp = pointOnArc(lut, trailT);
        const tpx = (tp.x / 100) * w;
        const tpy = (tp.y / 100) * h;

        // trail stretches between current and previous position
        const dx = px - tpx;
        const dy = py - tpy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        pkt.trail.style.transform = `translate3d(${tpx}px, ${tpy}px, 0) rotate(${angle}deg) scaleX(${dist / 20})`;
        pkt.trail.style.width = `20px`;
        pkt.trail.style.height = `2px`;
        pkt.trail.style.transformOrigin = "0 50%";

        // fade in/out at arc endpoints
        const edgeFade = pkt.t < 0.1 ? pkt.t / 0.1 : pkt.t > 0.85 ? (1 - pkt.t) / 0.15 : 1;
        pkt.el.style.opacity = String(edgeFade * (0.5 + ARCS[pkt.arcIdx].weight * 0.5));
      }

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frameRef.current);
      // cleanup all packets
      packetsRef.current.forEach((p) => {
        p.el.remove();
        p.trail.remove();
      });
      packetsRef.current = [];
    };
  }, [active]);

  const ev = EVENTS[evIdx];

  return (
    <div ref={ref} className="relative m-2 overflow-hidden rounded-lg border border-[rgba(212,175,55,.08)] bg-[#0c0c0c] sm:m-3">
      {/* ambient orbs */}
      <div aria-hidden className="ambient-orb pointer-events-none absolute -top-32 -right-24 h-[420px] w-[560px]" style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,.18), transparent 65%)", filter: "blur(40px)" }} />
      <div aria-hidden className="ambient-orb pointer-events-none absolute -bottom-24 -left-16 h-[300px] w-[400px]" style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,.1), transparent 65%)", filter: "blur(50px)", animationDelay: "-4s" }} />
      <div aria-hidden className="ambient-orb pointer-events-none absolute top-1/3 left-1/3 h-[200px] w-[300px]" style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,.06), transparent 65%)", filter: "blur(60px)", animationDelay: "-8s" }} />

      {/* map image */}
      <img src="img/world-map.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-[0.85]" />
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(7,11,10,.65) 100%)" }} />

      {/* subtle grid overlay */}
      <div aria-hidden className="hero-grid absolute inset-0 opacity-40" />

      {/* radar sweep */}
      <div aria-hidden className="lz-sweep pointer-events-none absolute top-1/2 left-1/2 aspect-square h-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50" style={{ background: "conic-gradient(from 0deg, rgba(212,175,55,.12), transparent 22%)" }} />

      {/* SVG arc layer */}
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <filter id="map-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--palette-teal-400)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--palette-teal-400)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--palette-teal-400)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* arc paths — static glow layer */}
        {ARCS.map((arc, i) => (
          <g key={i}>
            {/* wide glow */}
            <path
              ref={(el) => { arcPathRefs.current[i] = el; }}
              d={arc.d}
              fill="none"
              stroke="rgba(212,175,55,.08)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            {/* core line */}
            <path
              d={arc.d}
              fill="none"
              stroke="url(#arc-grad)"
              strokeWidth={0.6 + arc.weight * 0.6}
              strokeDasharray="3 6"
              className="lz-dash"
              vectorEffect="non-scaling-stroke"
              filter="url(#map-glow)"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          </g>
        ))}
      </svg>

      {/* hub markers */}
      {HUBS.map((hub, i) => (
        <div
          key={hub.label}
          aria-hidden
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
        >
          {/* outer ring */}
          <div className="map-hub-ring absolute -inset-2 rounded-full border border-[rgba(212,175,55,.2)]" style={{ animationDelay: `${i * 0.3}s` }} />
          {/* core dot */}
          <div className="relative size-2 rounded-full bg-[var(--palette-teal-400)] shadow-[0_0_8px_rgba(212,175,55,.6)]" />
          {/* label */}
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap">
            <span className="font-data text-[7px] font-bold tracking-[0.12em] text-[rgba(94,234,212,.7)] uppercase">{hub.label}</span>
          </div>
        </div>
      ))}

      {/* scattered relay nodes */}
      {NODES.map((n, i) => (
        <span key={i} aria-hidden className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <span className="pulse-green absolute inset-0 rounded-full bg-[var(--palette-teal-400)] opacity-60" style={{ animationDelay: `${(i % 9) * 0.4}s` }} />
        </span>
      ))}

      {/* imperative packet + ripple layer */}
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-20" />

      {/* top-left: region chip */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 24 }}
        className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2"
      >
        <span className="font-data flex items-center gap-2 rounded-md border border-[rgba(212,175,55,.12)] bg-[rgba(12,12,12,.8)] px-3 py-1.5 text-[9px] font-semibold tracking-[0.18em] text-[#B8AD7A] uppercase backdrop-blur-sm">
          <PulseDot color="var(--palette-teal-400)" size={5} />
          Global mesh · {HUBS.length} hubs · {ARCS.length} routes
        </span>
      </motion.div>

      {/* top-right: live counter */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 24 }}
        className="absolute top-4 right-4 z-30"
      >
        <span className="font-data flex items-baseline gap-1.5 rounded-md border border-[rgba(212,175,55,.25)] bg-[rgba(12,12,12,.8)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-1)] backdrop-blur-sm">
          <SlidingNumber value={validated} className="text-[11px]" />
          <span className="font-semibold text-[var(--text-3)]">validated today</span>
        </span>
      </motion.div>

      {/* bottom-left: live event feed */}
      <div className="absolute bottom-14 left-4 z-30 hidden md:block">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={evIdx}
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex items-center gap-3 rounded-lg border border-[rgba(212,175,55,.15)] bg-[rgba(12,12,12,.88)] px-3.5 py-2.5 backdrop-blur-md"
          >
            <span className="font-data flex size-7 items-center justify-center rounded-md text-[9px] font-bold" style={{ color: ev.tone, background: `color-mix(in srgb, ${ev.tone} 14%, transparent)` }}>
              {ev.tone === "#D45B3D" ? "✕" : "✓"}
            </span>
            <span className="min-w-0">
              <span className="font-data block truncate text-[10.5px] font-semibold text-[var(--text-1)]">{ev.who}</span>
              <span className="font-data flex items-center gap-1.5 text-[9px] tracking-[0.08em]" style={{ color: ev.tone }}>
                {ev.what}
                <span className="text-[7px] text-[var(--text-3)]">· {ev.region}</span>
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* bottom-right: throughput sparkline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 24 }}
        className="absolute bottom-14 right-4 z-30 hidden lg:block"
      >
        <ThroughputSpark />
      </motion.div>

      {/* bottom-center: status pill */}
      <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 24 }}
          className="font-data flex items-center gap-2.5 rounded-full border border-[rgba(212,175,55,.3)] bg-[rgba(12,12,12,.85)] px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--text-1)] uppercase backdrop-blur-sm"
        >
          <PulseDot color="var(--palette-teal-400)" size={6} />
          System Operational · 99.999% Uptime
        </motion.span>
      </div>

      {/* aspect ratio spacer */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.15/1]" />

      {/* inline styles for imperative elements */}
      <style>{`
        .map-packet {
          position: absolute;
          top: 0;
          left: 0;
          width: 8px;
          height: 8px;
          pointer-events: none;
          will-change: transform, opacity;
          z-index: 25;
        }
        .map-packet-glow {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(94,234,212,0.5), transparent 70%);
          filter: blur(3px);
        }
        .map-packet-core {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--text-1);
          box-shadow: 0 0 6px rgba(94,234,212,0.8), 0 0 12px rgba(94,234,212,0.4);
        }
        .map-packet-hi {
          position: absolute;
          top: 1px;
          left: 1px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(240,253,250,0.9);
        }
        .map-trail {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 2px;
          pointer-events: none;
          will-change: transform, opacity;
          background: linear-gradient(90deg, transparent, rgba(94,234,212,0.4));
          border-radius: 1px;
          z-index: 24;
        }
        .map-ripple {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid rgba(212,175,55,0.5);
          pointer-events: none;
          will-change: transform, opacity;
          z-index: 23;
        }
        .map-hub-ring {
          animation: hub-ring-pulse 3s ease-in-out infinite;
        }
        @keyframes hub-ring-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .map-packet, .map-trail, .map-ripple { display: none; }
          .map-hub-ring { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   Throughput sparkline — live mini-chart
   ============================================================ */

function ThroughputSpark() {
  const [series, setSeries] = useState<number[]>(() =>
    Array.from({ length: 20 }, (_, i) => 1100 + Math.round(Math.sin(i / 2.5) * 120 + (i % 3) * 30))
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setSeries((s) => {
        const last = s[s.length - 1];
        const next = Math.max(800, Math.min(1800, last + Math.round((Math.random() - 0.47) * 160)));
        return [...s.slice(1), next];
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const min = Math.min(...series);
  const max = Math.max(...series);
  const rate = series[series.length - 1];
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 64},${18 - ((v - min) / (max - min || 1)) * 14}`).join(" ");

  return (
    <div className="rounded-md border border-[rgba(212,175,55,.12)] bg-[rgba(12,12,12,.8)] p-2.5 backdrop-blur-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-data text-[7.5px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">Throughput</span>
        <span className="font-data flex items-baseline text-[11px] font-bold text-[var(--text-1)]">
          <SlidingNumber value={rate} />
          <span className="ml-1 text-[7px] font-semibold text-[var(--text-3)]">req/s</span>
        </span>
      </div>
      <svg viewBox="0 0 64 18" className="mt-1.5 h-[18px] w-[64px]" aria-hidden>
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--palette-teal-400)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--palette-teal-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* fill area */}
        <polygon points={`0,18 ${pts} 64,18`} fill="url(#spark-fill)" />
        {/* line */}
        <polyline points={pts} fill="none" stroke="var(--palette-teal-400)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      </svg>
    </div>
  );
}
