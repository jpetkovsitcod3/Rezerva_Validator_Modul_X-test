import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "../lib/ui";
import { MItem, MReveal, Stagger, springSoft } from "../lib/motion";
import { useAuth } from "../lib/auth";
import { apiHistory, apiStats, type Stats } from "../lib/db";
import type { ValidationRecord } from "../lib/db";
import { Card, EmptyState, StatTile, StatusBadge } from "./ui";
import { ScoreDial, timeAgo } from "./Layers";
import { cn } from "../utils/cn";

/* ─── Validation Rate Gauge (reactor style) ─── */
function ValidationRateGauge({ rate }: { rate: number }) {
  return (
    <div className="metallic-panel flex flex-1 flex-col p-4">
      <span className="screw-bottom" />
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider">Validation Rate</h3>
        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        {/* arc gauge */}
        <svg viewBox="0 0 120 80" className="w-32">
          <path d="M10 70 A50 50 0 0 1 110 70" fill="none" stroke="#333" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M10 70 A50 50 0 0 1 110 70"
            fill="none"
            stroke="var(--palette-teal-400)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(rate / 100) * 157} 157`}
            style={{ filter: "drop-shadow(0 0 6px rgba(79,138,255,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-glow text-2xl font-bold text-[var(--palette-teal-400)]">{rate}%</span>
          <span className="text-[10px] uppercase">Core Stability</span>
          <span className="mt-1 text-[10px] text-green-400">^ 0.05% from last</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Threats Blocked Gauge (reactor style) ─── */
function ThreatsBlockedGauge({ count }: { count: number }) {
  return (
    <div className="metallic-panel flex flex-1 flex-col p-4">
      <span className="screw-bottom" />
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider">Threats Blocked</h3>
        <svg className="size-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </div>
      <div className="text-center text-[10px] uppercase opacity-70">Core Temperature & Threat Level</div>
      <div className="relative flex flex-1 items-center justify-center">
        {/* bar gauge */}
        <div className="flex w-full items-end gap-1.5 px-2">
          {[20, 35, 25, 50, 40, 30, 55, 45, 60, 35, 25].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full rounded-t-sm transition-colors hover:bg-red-400",
                  i === 8 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-red-500/40"
                )}
                style={{ height: `${h * 1.2}px` }}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-glow-strong text-3xl font-bold text-red-400">{count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Global Mesh Map (reactor style) ─── */
function GlobalMeshMap({ validatedToday }: { validatedToday: number }) {
  return (
    <div className="metallic-panel col-span-2 flex flex-col overflow-hidden p-4">
      <span className="screw-bottom" />
      <div className="relative z-10 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="size-4 text-[var(--palette-teal-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <h3 className="font-bold uppercase tracking-wider text-white">Global Mesh</h3>
          <span className="ml-2 text-xs opacity-50">11 NODES</span>
        </div>
        <div className="text-xs">
          Validated Today:{" "}
          <span className="text-glow text-lg font-bold text-[var(--palette-teal-400)]">
            {validatedToday.toLocaleString()}
          </span>
        </div>
      </div>
      {/* map area */}
      <div className="relative flex-1 overflow-hidden rounded border border-[#333] bg-black/50">
        {/* world map grid (CSS-drawn) */}
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 800 400" className="size-full" preserveAspectRatio="xMidYMid slice">
            {/* grid lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="800" y2={i * 20} stroke="#333" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 40 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="400" stroke="#333" strokeWidth="0.5" />
            ))}
            {/* node dots */}
            {[
              { cx: 180, cy: 150 }, { cx: 400, cy: 120 }, { cx: 550, cy: 180 },
              { cx: 300, cy: 200 }, { cx: 650, cy: 140 }, { cx: 120, cy: 250 },
              { cx: 480, cy: 280 }, { cx: 700, cy: 220 }, { cx: 250, cy: 300 },
              { cx: 580, cy: 300 }, { cx: 350, cy: 350 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy} r="3" fill="var(--palette-teal-400)" opacity="0.8">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
                <circle cx={p.cx} cy={p.cy} r="8" fill="none" stroke="var(--palette-teal-400)" strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="r" values="5;12;5" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
            {/* connection lines */}
            {[
              [180, 150, 400, 120], [400, 120, 550, 180], [300, 200, 480, 280],
              [120, 250, 300, 200], [550, 180, 650, 140], [480, 280, 580, 300],
              [250, 300, 350, 350], [650, 140, 700, 220],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--palette-teal-400)" strokeWidth="0.5" opacity="0.2" />
            ))}
          </svg>
        </div>
        {/* anomaly overlay */}
        <div className="absolute bottom-4 left-4 max-w-xs rounded border border-[var(--palette-teal-400)]/50 bg-[#141414]/90 p-3 shadow-[0_0_10px_rgba(79,138,255,0.3)] backdrop-blur-sm">
          <div className="mb-1 flex items-start gap-2">
            <svg className="mt-0.5 size-4 text-[var(--palette-teal-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            <h4 className="font-bold text-white">Anomaly Detected</h4>
          </div>
          <p className="ml-6 text-xs">Route: <span className="text-[var(--palette-teal-400)]">AP-South &gt; EU-West</span></p>
          <p className="ml-6 text-xs">Latency spikes: 245ms</p>
        </div>
      </div>
    </div>
  );
}

/* ─── 7-Layer Pipeline Panel (reactor style) ─── */
function PipelinePanel() {
  const layers = [
    { name: "Syntax", status: "active", color: "var(--palette-teal-400)" },
    { name: "DNS", status: "active", color: "var(--palette-teal-400)" },
    { name: "MX", status: "active", color: "var(--palette-teal-400)" },
    { name: "Disposable", status: "active", color: "var(--palette-teal-400)" },
    { name: "Catch-All", status: "warning", color: "var(--palette-amber-400)" },
    { name: "SMTP", status: "active", color: "var(--palette-teal-400)" },
    { name: "ML Score", status: "active", color: "var(--palette-teal-400)" },
  ];

  return (
    <div className="metallic-panel flex flex-1 flex-col overflow-hidden p-4" style={{ minHeight: 300 }}>
      <span className="screw-bottom" />
      <div className="relative z-10 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="size-4 text-[var(--palette-teal-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">7-Layer Fission Control Pipeline</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-sm bg-[var(--palette-teal-400)] shadow-[0_0_5px_rgba(79,138,255,0.7)]" /> Trusted
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-sm bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)]" /> Rejected
          </div>
        </div>
      </div>
      {/* pipeline visualization */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded border border-[#333] bg-black/60">
        <div className="flex items-center gap-3 px-8">
          {layers.map((layer, i) => (
            <div key={layer.name} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border text-xs font-bold transition-all",
                    layer.status === "active"
                      ? "border-[var(--palette-teal-400)]/50 bg-[var(--palette-teal-400)]/10 text-[var(--palette-teal-400)] shadow-[0_0_10px_rgba(79,138,255,0.2)]"
                      : "border-[var(--palette-amber-400)]/50 bg-[var(--palette-amber-400)]/10 text-[var(--palette-amber-400)] shadow-[0_0_10px_rgba(255,200,0,0.2)]"
                  )}
                >
                  {i + 1}
                </div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-3)]">{layer.name}</span>
              </div>
              {i < layers.length - 1 && (
                <div className="mb-5 flex items-center">
                  <div className="h-px w-6 bg-[var(--palette-teal-400)]/30" />
                  <svg className="size-3 text-[var(--palette-teal-400)]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div className="h-px w-6 bg-[var(--palette-teal-400)]/30" />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* overlay text */}
        <div className="absolute bottom-4 left-1/2 max-w-xl -translate-x-1/2 rounded-full border border-[var(--color-border-primary)] bg-[#0c0c0c]/80 px-6 py-2 text-center text-xs backdrop-blur">
          A sequential, rigorous process designed to filter invalid data with{" "}
          <span className="text-lg font-bold text-[var(--palette-teal-400)] text-glow">extreme prejudice</span>.
        </div>
      </div>
    </div>
  );
}

/* ─── Main Overview ─── */
export default function Overview() {
  const { user, refresh } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<ValidationRecord[] | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [s, h] = await Promise.all([
      apiStats(user.id),
      apiHistory({ userId: user.id, page: 1, pageSize: 6, status: "all" }),
    ]);
    setStats(s);
    setRecent(h.rows);
  }, [user]);

  useEffect(() => {
    load();
    refresh();
  }, [load, refresh]);

  const validRate =
    stats && stats.total > 0 ? Math.round((stats.split.valid / stats.total) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      {/* ─── Top Grid Row: Global Mesh + Gauges ─── */}
      <div className="grid min-h-[250px] grid-cols-3 gap-4" style={{ height: "40%" }}>
        <GlobalMeshMap validatedToday={stats?.total ?? 0} />
        <div className="col-span-1 flex flex-col gap-4">
          <ValidationRateGauge rate={validRate} />
          <ThreatsBlockedGauge count={stats?.split.invalid ?? 0} />
        </div>
      </div>

      {/* ─── Bottom: 7-Layer Pipeline ─── */}
      <PipelinePanel />

      {/* ─── Recent Validations (compact list) ─── */}
      {recent && recent.length > 0 && (
        <div className="metallic-panel p-4">
          <span className="screw-bottom" />
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recent Validations</h3>
            <a href="#/app/history" className="text-xs font-bold text-[var(--palette-teal-400)] hover:underline">
              View all →
            </a>
          </div>
          <ul className="space-y-1.5">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-200 hover:border-[var(--palette-teal-400)]/20 hover:bg-[var(--bg-2)]">
                <ScoreDial score={r.score} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{r.email}</p>
                  <p className="text-[9.5px] text-[var(--text-3)]">{timeAgo(r.ts)} · {Math.round(r.totalMs)}ms · 7 layers</p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
