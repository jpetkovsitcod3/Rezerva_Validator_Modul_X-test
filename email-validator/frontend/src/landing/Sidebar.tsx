import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "../lib/ui";
import { SlidingNumber, PulseDot } from "../lib/motion";
import { cn } from "../utils/cn";

const ITEMS: { id: string; label: string; icon: IconName; href: string }[] = [
  { id: "top", label: "Dashboard", icon: "gauge", href: "#top" },
  { id: "pipeline", label: "Validation", icon: "mail", href: "#pipeline" },
  { id: "pipeline2", label: "Pipeline", icon: "layers", href: "#pipeline" },
  { id: "architecture", label: "Analytics", icon: "chart", href: "#architecture" },
  { id: "compliance", label: "Compliance", icon: "shield", href: "#compliance" },
  { id: "pricing", label: "Pricing", icon: "gem", href: "#pricing" },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="REACTOR Modul X — home">
      <span className="relative flex size-8 items-center justify-center rounded-lg border border-[rgba(212,175,55,.3)] bg-[#0c0c0c]">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M6 24V8h10a6 6 0 0 1 3.5 10.9A6 6 0 0 1 16.5 30H6" stroke="var(--palette-teal-400)" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M11 13h5M11 19h6" stroke="var(--palette-teal-400)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-[var(--palette-teal-400)] pulse-green" />
      </span>
      {!compact && (
        <span className="font-display text-[15px] font-bold tracking-tight text-white">
          REACTOR <span className="text-[var(--palette-teal-400)]">Nodul X</span>
        </span>
      )}
    </a>
  );
}

export default function Sidebar() {
  const [active, setActive] = useState("top");
  const [open, setOpen] = useState(false);
  const [series, setSeries] = useState<number[]>(() =>
    Array.from({ length: 18 }, (_, i) => 1180 + Math.round(Math.sin(i / 2.4) * 90 + (i % 3) * 22))
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setSeries((s) => {
        const last = s[s.length - 1];
        const next = Math.max(900, Math.min(1600, last + Math.round((Math.random() - 0.48) * 140)));
        return [...s.slice(1), next];
      });
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const rate = series[series.length - 1];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const sparkPts = series
    .map((v, i) => `${(i / (series.length - 1)) * 64},${16 - ((v - min) / (max - min || 1)) * 13}`)
    .join(" ");

  useEffect(() => {
    const ids = ["top", "pipeline", "architecture", "compliance", "pricing"];
    const els = ids.map((i) => document.getElementById(i)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (item: (typeof ITEMS)[number]) =>
    item.id === active || (item.id === "pipeline2" && active === "pipeline");

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {ITEMS.map((item) => (
        <a
          key={item.id}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(item) ? "page" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
            isActive(item)
              ? "text-white"
              : "border border-transparent text-[var(--text-3)] hover:translate-x-0.5 hover:bg-[rgba(212,175,55,.04)] hover:text-[var(--text-1)]"
          )}
        >
          {isActive(item) && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg border border-[rgba(212,175,55,.2)] bg-[rgba(212,175,55,.06)]"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              aria-hidden
            />
          )}
          {isActive(item) && (
            <motion.span
              layoutId="sidebar-indicator"
              aria-hidden
              className="absolute top-1/2 left-0 h-5 w-[2.5px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[var(--palette-teal-400)] to-[var(--palette-amber-400)] shadow-[0_0_8px_rgba(212,175,55,.8)]"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <Icon name={item.icon} size={15} className={cn("relative z-10", isActive(item) ? "text-[var(--palette-teal-400)]" : "text-[var(--text-3)] group-hover:text-[var(--text-2)]")} />
          <span className="relative z-10">{item.label}</span>
          {isActive(item) && <PulseDot color="var(--palette-teal-400)" size={5} />}
        </a>
      ))}
    </nav>
  );

  const foot = (
    <div className="mt-auto space-y-3 border-t border-[rgba(212,175,55,.06)] pt-4">
      <a href="#/login" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-[var(--text-3)] transition-colors duration-200 hover:text-[var(--text-1)]">
        <Icon name="arrowRight" size={14} className="text-[var(--text-3)]" />
        Sign In
      </a>
      <a
        href="#/signup"
        className="shine flex items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-bold text-black transition-[filter,box-shadow] duration-200 hover:brightness-110"
        style={{ background: "linear-gradient(90deg, var(--palette-teal-400), var(--palette-amber-400) 60%)", boxShadow: "0 0 24px rgba(212,175,55,.3)" }}
      >
        Get Started
      </a>
    </div>
  );

  return (
    <>
      {/* desktop rail */}
      <aside className="hidden h-full flex-col border-r border-[rgba(212,175,55,.06)] bg-[#0c0c0c] p-4 lg:flex">
        <div className="px-1 pb-5">
          <BrandMark />
        </div>
        <label className="mb-5 flex items-center gap-2.5 rounded-lg border border-[rgba(212,175,55,.08)] bg-[#141414] px-3 py-2 transition-colors duration-200 focus-within:border-[rgba(212,175,55,.4)]">
          <Icon name="search" size={13} className="text-[var(--text-3)]" />
          <input
            aria-label="Search the console"
            placeholder="Search..."
            className="w-full bg-transparent text-[12.5px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]"
          />
        </label>
        {nav}

        {/* live throughput */}
        <div className="mt-5 rounded-lg border border-[rgba(212,175,55,.08)] bg-[#141414] p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-data text-[8px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">Throughput</span>
            <span className="font-data flex items-baseline text-[12px] font-bold text-[var(--text-1)]">
              <SlidingNumber value={rate} />
              <span className="ml-1 text-[8px] font-semibold text-[var(--text-3)]">req/s</span>
            </span>
          </div>
          <svg viewBox="0 0 64 18" className="mt-2 h-[18px] w-full" aria-hidden>
            <polyline points={sparkPts} fill="none" stroke="var(--palette-teal-400)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          </svg>
        </div>

        {foot}
      </aside>

      {/* mobile top bar + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[rgba(212,175,55,.06)] bg-[rgba(26,26,26,.92)] px-4 py-3 backdrop-blur-md lg:hidden">
        <BrandMark />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex size-9 items-center justify-center rounded-lg border border-[rgba(212,175,55,.1)] text-[var(--text-1)]"
        >
          <Icon name="menu" size={17} />
        </button>
      </div>
      <div className={cn("fixed inset-0 z-[70] lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <button
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-[rgba(0,0,0,.8)] backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <div
          className={cn(
            "absolute top-0 right-0 flex h-full w-[270px] flex-col bg-[#0c0c0c] p-4 transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full"
          )}
          style={{ transitionTimingFunction: "var(--ease-el)" }}
          role="dialog"
          aria-label="Mobile menu"
        >
          <div className="mb-5 flex items-center justify-between">
            <BrandMark compact />
            <button onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-label="Close menu" className="flex size-8 items-center justify-center rounded-lg border border-[rgba(212,175,55,.1)] text-[var(--text-3)]">
              <Icon name="close" size={14} />
            </button>
          </div>
          {nav}
          {foot}
        </div>
      </div>
    </>
  );
}
