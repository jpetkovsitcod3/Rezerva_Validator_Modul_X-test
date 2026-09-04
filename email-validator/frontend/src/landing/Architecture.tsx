import { Icon, useCountUp, useInViewOnce, type IconName } from "../lib/ui";
import { KineticText, MItem, MReveal, Stagger } from "../lib/motion";
import { cn } from "../utils/cn";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";

function CountStat({ value, label }: { value: string; label: string }) {
  const m = /^(\d+)(.*)$/.exec(value);
  const target = m ? parseInt(m[1], 10) : 0;
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(0.6);
  const n = useCountUp(target, inView && target > 0, 1100);
  return (
    <MItem>
      <span ref={ref} className="font-data flex items-baseline gap-2 text-[10px] tracking-[0.14em] text-white/30 uppercase">
        <span className="text-[15px] font-bold text-white tabular-nums">
          {target > 0 ? `${Math.round(n)}${m![2]}` : value}
        </span>
        {label}
      </span>
    </MItem>
  );
}

function CardShell({
  icon,
  accent,
  title,
  children,
  className,
  id,
}: {
  icon: IconName;
  accent: string;
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article
      id={id}
      onPointerMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]",
        className
      )}
      style={{ transitionTimingFunction: "var(--ease-el)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(212,165,116,0.06), transparent 70%)" }}
      />
      <span
        className="flex size-9 items-center justify-center rounded-lg border"
        style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`, background: `color-mix(in srgb, ${accent} 8%, transparent)` }}
      >
        <Icon name={icon} size={16} />
      </span>
      <h3 className="font-display mt-4 text-[17px] font-bold text-white">{title}</h3>
      <div className="relative mt-2.5 text-[13px] leading-[1.7] text-white/50">{children}</div>
    </article>
  );
}

function SegmentedBar() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="mt-5 flex gap-1.5" aria-label="Hardware offload utilization: 60%">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <span
            className={cn("block h-full w-full rounded-full bg-[#D4A574]", i >= 3 && "bg-[#E0BB8F]")}
            style={{
              transform: inView && i < 3 ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transition: `transform .6s var(--ease-el) ${i * 120}ms`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

function ScoreDonut() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4);
  const val = useCountUp(96, inView, 1200);
  const v = inView ? 96 : 0;
  return (
    <div ref={ref} className="mt-5 flex items-center gap-4">
      <div className="relative size-[58px] shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke="#D4A574" strokeWidth="10" strokeLinecap="round"
            pathLength={100} strokeDasharray={`${v} ${100 - v}`}
            style={{ transition: "stroke-dasharray 1.1s var(--ease-el)" }}
          />
        </svg>
        <span className="font-data absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white tabular-nums">
          {Math.round(val)}%
        </span>
      </div>
      <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <span
          className="block h-full rounded-full bg-[#D4A574]"
          style={{
            width: "100%",
            transform: inView ? "scaleX(0.96)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 1.1s var(--ease-el)",
          }}
        />
      </div>
    </div>
  );
}

export default function Architecture() {
  return (
    <section id="architecture" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <MReveal>
          <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.3rem)] font-bold text-white">
            <KineticText per="line" text="Architectural Superiority" />
          </h2>
        </MReveal>
        <MReveal delay={0.08}>
          <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-white/40">
            Modular components designed for high-frequency transactional environments.
            Every layer is isolated, observable, and replaceable.
          </p>
        </MReveal>

        <Stagger className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" stagger={0.09}>
          {[
            ["12", "edge regions"],
            ["38ms", "p50 latency"],
            ["0", "logs retained"],
            ["4B", "outcomes trained"],
          ].map(([v, l]) => (
            <CountStat key={l} value={v} label={l} />
          ))}
        </Stagger>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <MReveal delay={0.1} className="lg:col-span-2">
            <CardShell icon="globe" accent="#D4A574" title="Hardware Acceleration" className="h-full">
              Bypassing standard software stacks, Modul X interfaces directly with specialized
              hardware to execute MX lookups and SMTP handshakes concurrently.
              <SegmentedBar />
            </CardShell>
          </MReveal>

          <MReveal delay={0.18}>
            <CardShell id="compliance" icon="shield" accent="#D4A574" title="Zero-Trust Processing" className="h-full">
              Data is processed in memory and immediately purged. No logs, no traces.
              <span className="font-data mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#D4A574]/20 bg-[#D4A574]/[0.06] px-2.5 py-1 text-[8.5px] font-bold tracking-[0.16em] text-white/80 uppercase">
                <span className="pulse-green size-1.5 rounded-full bg-[#5BC07E]" />
                purged in &lt;1ms
              </span>
            </CardShell>
          </MReveal>

          <MReveal delay={0.26}>
            <CardShell icon="network" accent="#D4A574" title="Global Edge Network" className="h-full">
              Distributed validation nodes ensure low latency regardless of origin.
              <span className="mt-4 flex items-center gap-2">
                {["fra", "iad", "sin", "gru"].map((r, i) => (
                  <span key={r} className="float-y font-data flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[8.5px] font-bold tracking-[0.12em] text-[#D4A574]/70 uppercase" style={{ animationDelay: `${i * -1.4}s` }}>
                    <span className="pulse-blue size-1 rounded-full bg-[#D4A574]" style={{ animationDelay: `${i * 0.4}s` }} />
                    {r}
                  </span>
                ))}
              </span>
            </CardShell>
          </MReveal>

          <MReveal delay={0.34} className="lg:col-span-2">
            <CardShell icon="gauge" accent="#D4A574" title="Predictive Scoring Engine" className="h-full">
              Machine learning models analyze historical bounce patterns and domain reputation
              to assign a confidence score before SMTP connection is attempted.
              <ScoreDonut />
            </CardShell>
          </MReveal>
        </div>
      </div>
    </section>
  );
}
