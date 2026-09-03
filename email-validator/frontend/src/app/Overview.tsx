import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "../lib/ui";
import { useAuth } from "../lib/auth";
import { RouteTransition } from "../lib/route-transition";
import { apiHistory, apiStats, type Stats } from "../lib/db";
import type { ValidationRecord } from "../lib/db";
import { Card, EmptyState, StatusBadge } from "./ui";
import { ScoreDial, timeAgo } from "./Layers";
import { cn } from "../utils/cn";
import { fmt, useCountUp } from "../lib/ui";

const LAYER_PIPELINE = [
  { key: "syntax", label: "Syntax" },
  { key: "dns", label: "DNS" },
  { key: "mx", label: "MX" },
  { key: "disposable", label: "Disposable" },
  { key: "catchall", label: "Catch-All" },
  { key: "smtp", label: "SMTP" },
  { key: "ml", label: "ML Score" },
] as const;

const REGION_NODES: { code: string; label: string; x: number; y: number }[] = [
  { code: "us-w", label: "US-West", x: 170, y: 175 },
  { code: "us-e", label: "US-East", x: 250, y: 180 },
  { code: "eu-c", label: "EU-Central", x: 470, y: 160 },
  { code: "eu-w", label: "EU-West", x: 430, y: 175 },
  { code: "eu-e", label: "EU-East", x: 525, y: 150 },
  { code: "ap-s", label: "AP-South", x: 625, y: 200 },
  { code: "ap-e", label: "AP-East", x: 720, y: 185 },
  { code: "ap-se", label: "AP-SEA", x: 700, y: 240 },
  { code: "oc-e", label: "OC-East", x: 760, y: 295 },
  { code: "sa-e", label: "SA-East", x: 290, y: 305 },
  { code: "af-s", label: "AF-South", x: 500, y: 290 },
];

const ROUTE_LINKS: [number, number][] = [
  [0, 1], [1, 3], [2, 3], [3, 4], [3, 5], [5, 6], [5, 7], [5, 8], [6, 7], [9, 1], [10, 2],
];

function MetricCard({ value, suffix, label, sub, accent }: { value: number; suffix?: string; label: string; sub: string; accent: string }) {
  const v = useCountUp(value, true, 900);
  return (
    <div className="metallic-panel relative flex flex-1 flex-col gap-1.5 p-4">
      <span className="screw-bottom" />
      <div className="flex items-center justify-between">
        <span className="font-data text-[9.5px] font-semibold tracking-[0.18em] text-[var(--text-3)] uppercase">{label}</span>
        <span className="size-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-glow font-data text-[1.7rem] font-bold leading-none tabular-nums text-white">
          {v.toLocaleString()}
        </span>
        {suffix && <span className="text-xs font-bold tracking-wide" style={{ color: accent }}>{suffix}</span>}
      </div>
      <span className="text-[10.5px] text-[var(--text-3)]">{sub}</span>
    </div>
  );
}

function GlobalMeshMap({ validatedToday }: { validatedToday: number }) {
  return (
    <div className="metallic-panel col-span-1 flex flex-col overflow-hidden lg:col-span-2">
      <span className="screw-bottom" />
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="globe" size={15} className="text-[var(--palette-teal-300)]" weight="duotone" />
          <h3 className="font-data text-[10px] font-bold tracking-[0.22em] text-white uppercase">Global mesh</h3>
          <span className="ml-2 text-[10px] tracking-wider text-[var(--text-3)] uppercase">{REGION_NODES.length} regions · 12 routes</span>
        </div>
        <div className="text-right">
          <span className="block font-data text-[9px] tracking-[0.2em] text-[var(--text-3)] uppercase">Validated today</span>
          <span className="text-glow font-data text-[1.4rem] leading-none font-bold text-[var(--palette-teal-300)] tabular-nums">
            {validatedToday.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden rounded border border-[var(--line)] bg-[#0B0F14]">
        <svg viewBox="0 0 900 420" className="size-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(79,138,255,0.18)" />
              <stop offset="100%" stopColor="rgba(79,138,255,0)" />
            </radialGradient>
          </defs>
          <rect width="900" height="420" fill="url(#mapGlow)" />
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2="900" y2={i * 20} stroke="rgba(120,145,200,0.06)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 45 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="420" stroke="rgba(120,145,200,0.06)" strokeWidth="0.5" />
          ))}
          {ROUTE_LINKS.map(([a, b], i) => (
            <line
              key={`l${i}`}
              x1={REGION_NODES[a].x}
              y1={REGION_NODES[a].y}
              x2={REGION_NODES[b].x}
              y2={REGION_NODES[b].y}
              stroke="rgba(120,170,255,0.32)"
              strokeWidth="0.8"
            />
          ))}
          {REGION_NODES.map((p, i) => (
            <g key={p.code}>
              <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="var(--palette-teal-300)" strokeWidth="0.5" opacity="0.4">
                <animate attributeName="r" values="5;14;5" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r="3" fill="var(--palette-teal-300)">
                <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
              </circle>
              <text x={p.x + 8} y={p.y - 6} fill="rgba(190,210,255,0.7)" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="0.06em">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-center gap-2 rounded border border-[var(--palette-teal-300)]/35 bg-[#0B0F14]/85 px-3 py-2 text-[10.5px] text-[var(--text-2)] backdrop-blur-sm sm:flex-nowrap">
          <Icon name="alert" size={13} weight="duotone" className="text-[var(--palette-amber-300)]" />
          <span className="font-data text-[9.5px] tracking-[0.2em] text-[var(--text-3)] uppercase">Anomaly</span>
          <span>Route <span className="font-data text-[var(--palette-teal-300)]">AP-South › EU-West</span> · spike 245ms</span>
        </div>
      </div>
    </div>
  );
}

function PipelineLayer({ index, label, status, totalLayers }: { index: number; label: string; status: "active" | "warning"; totalLayers: number }) {
  const isActive = status === "active";
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl border text-[12.5px] font-bold tabular-nums transition-all",
            isActive
              ? "border-[var(--palette-teal-300)]/55 bg-[var(--accent-faint)] text-[var(--palette-teal-300)] shadow-[0_0_18px_-4px_rgba(79,138,255,0.55)]"
              : "border-[var(--palette-amber-400)]/55 bg-[rgba(245,198,107,0.08)] text-[var(--palette-amber-400)] shadow-[0_0_18px_-4px_rgba(245,198,107,0.55)]"
          )}
        >
          {index + 1}
        </div>
        <span className="font-data text-[9px] font-semibold tracking-[0.14em] text-[var(--text-3)] uppercase">{label}</span>
      </div>
      {index < totalLayers - 1 && (
        <div className="mb-5 flex flex-1 items-center">
          <div className="h-px flex-1 bg-[var(--line)]" />
          <Icon name="arrowRight" size={10} weight="bold" className="mx-1 text-[var(--text-3)]/70" />
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>
      )}
    </div>
  );
}

function PipelinePanel({ stats }: { stats: Stats | null }) {
  const total = stats?.total ?? 0;
  const riskyRatio = total ? Math.min(0.3, (stats?.split.risky ?? 0) / Math.max(1, total)) : 0.12;
  return (
    <div className="metallic-panel flex flex-col p-4" style={{ minHeight: 280 }}>
      <span className="screw-bottom" />
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="layers" size={15} weight="duotone" className="text-[var(--palette-teal-300)]" />
          <h3 className="text-[14px] font-bold tracking-tight text-white">7-layer validation pipeline</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] tracking-wider uppercase">
          <span className="flex items-center gap-1.5 text-[var(--text-3)]"><span className="size-1.5 rounded-sm bg-[var(--palette-teal-300)]" />Trusted</span>
          <span className="flex items-center gap-1.5 text-[var(--text-3)]"><span className="size-1.5 rounded-sm bg-[var(--palette-amber-300)]" />Soft block</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {LAYER_PIPELINE.map((l, i) => (
          <PipelineLayer
            key={l.key}
            index={i}
            label={l.label}
            status={i === 4 ? "warning" : "active"}
            totalLayers={LAYER_PIPELINE.length}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-2)]">
          <Icon name="flask" size={14} weight="duotone" className="text-[var(--palette-teal-300)]" />
          A sequential, rigorous filter that rejects <span className="font-data text-[var(--palette-amber-300)]">{(riskyRatio * 100).toFixed(1)}%</span> with extreme prejudice.
        </div>
        <a href="#/app/validator" className="font-data shrink-0 rounded-lg border border-[var(--palette-teal-300)]/55 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[var(--palette-teal-300)] uppercase transition-colors duration-200 hover:bg-[var(--accent-faint)]">
          Run a check
        </a>
      </div>
    </div>
  );
}

function VerdictSplit({ stats }: { stats: Stats | null }) {
  const total = stats?.total ?? 0;
  const split = stats?.split ?? { valid: 0, risky: 0, invalid: 0 };
  const segs = [
    { key: "valid", value: split.valid, color: "var(--green)", label: "Valid" },
    { key: "risky", value: split.risky, color: "var(--amber)", label: "Risky" },
    { key: "invalid", value: split.invalid, color: "var(--red)", label: "Invalid" },
  ];
  return (
    <div className="metallic-panel flex flex-col gap-3 p-4">
      <span className="screw-bottom" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="chart" size={14} weight="duotone" className="text-[var(--palette-teal-300)]" />
          <h3 className="font-data text-[10px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">Verdict split</h3>
        </div>
        <span className="font-data text-[10px] tracking-[0.18em] text-[var(--text-3)] uppercase">{fmt(total)} total</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg-2)]">
        {total > 0 ? segs.map((s) => (
          <span
            key={s.key}
            className="h-full"
            style={{ width: `${(s.value / total) * 100}%`, background: s.color, boxShadow: `0 0 8px ${s.color}` }}
            aria-label={`${s.label} ${((s.value / total) * 100).toFixed(1)}%`}
          />
        )) : <span className="block h-full w-full bg-[var(--bg-2)]" />}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {segs.map((s) => (
          <div key={s.key} className="flex flex-col rounded-lg border border-[var(--line)] bg-[var(--bg-1)] px-2.5 py-2">
            <span className="flex items-center gap-1.5 text-[9.5px] tracking-wider text-[var(--text-3)] uppercase">
              <span className="size-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
              {s.label}
            </span>
            <span className="font-data mt-0.5 text-[1.05rem] font-bold tabular-nums" style={{ color: s.color }}>
              {fmt(s.value)}
            </span>
            <span className="font-data text-[10px] text-[var(--text-3)]">
              {total ? ((s.value / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatencyP50({ stats }: { stats: Stats | null }) {
  const ms = stats?.avgMs ?? 0;
  const target = 40;
  const ratio = Math.max(0, Math.min(1, 1 - (ms - target) / 220));
  return (
    <div className="metallic-panel flex flex-col gap-3 p-4">
      <span className="screw-bottom" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="gauge" size={14} weight="duotone" className="text-[var(--palette-teal-300)]" />
          <h3 className="font-data text-[10px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">P50 latency</h3>
        </div>
        <span className="font-data text-[9.5px] text-[var(--text-3)]">target ≤ 40ms</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-data text-glow text-[1.7rem] font-bold tabular-nums text-white">{ms}</span>
        <span className="font-data text-[12px] text-[var(--text-3)]">ms</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-2)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${(ratio * 100).toFixed(0)}%`,
            background: "linear-gradient(90deg, var(--green) 0%, var(--palette-teal-300) 60%, var(--palette-amber-300) 100%)",
            boxShadow: "0 0 10px var(--palette-teal-300)",
          }}
        />
      </div>
    </div>
  );
}

function TrendStrip({ series }: { series: Stats["series"] }) {
  const max = Math.max(1, ...series.map((p) => p.count));
  return (
    <div className="metallic-panel flex flex-col gap-3 p-4">
      <span className="screw-bottom" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="activity" size={14} weight="duotone" className="text-[var(--palette-teal-300)]" />
          <h3 className="font-data text-[10px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">14-day volume</h3>
        </div>
        <span className="font-data text-[10px] text-[var(--text-3)]">peak {fmt(max)}</span>
      </div>
      <div className="flex h-[68px] items-end gap-1">
        {series.map((p, i) => {
          const h = Math.max(2, (p.count / max) * 60);
          return (
            <span
              key={`${p.day}-${i}`}
              className="block w-2 rounded-t-sm bg-[var(--palette-teal-300)]/35 last:bg-[var(--palette-teal-300)]"
              style={{ height: `${h}px`, boxShadow: i === series.length - 1 ? "0 0 6px var(--palette-teal-300)" : "none" }}
              title={`${p.day}: ${p.count}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function RecentRow({ r }: { r: ValidationRecord }) {
  return (
    <li className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-200 hover:border-[var(--line)] hover:bg-[var(--bg-2)]">
      <ScoreDial score={r.score} size={36} />
      <div className="min-w-0">
        <p className="truncate font-data text-[12.5px] font-semibold text-white">{r.email}</p>
        <p className="font-data mt-0.5 text-[9.5px] tracking-[0.06em] text-[var(--text-3)]">
          {timeAgo(r.ts)} · {Math.round(r.totalMs)}ms · 7 layers
        </p>
      </div>
      <span className="font-data text-[10px] tracking-wider text-[var(--text-3)] uppercase">{r.mode}</span>
      <StatusBadge status={r.status} />
    </li>
  );
}

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

  const total = stats?.total ?? 0;
  const todayCount = stats?.today ?? 0;
  const last7 = stats?.last7 ?? 0;
  const validRate = total ? Math.round((stats!.split.valid / total) * 100) : 0;
  const avgMs = stats?.avgMs ?? 0;

  const cards = useMemo(
    () => [
      { key: "today" as const, value: todayCount, suffix: undefined, label: "Validated today", sub: "Live across the mesh", accent: "var(--palette-teal-300)" },
      { key: "last7" as const, value: last7, suffix: undefined, label: "Last 7 days", sub: "Stable trend", accent: "var(--palette-amber-300)" },
      { key: "valid" as const, value: validRate, suffix: "%", label: "Valid rate", sub: "Target ≥ 78%", accent: "var(--green)" },
      { key: "avg" as const, value: avgMs, suffix: "ms", label: "Avg latency", sub: "P50 across regions", accent: "var(--palette-sky-300)" },
    ],
    [todayCount, last7, validRate, avgMs]
  );

  return (
    <RouteTransition>
      <div className="flex flex-1 flex-col gap-4">
        {/* metric row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <MetricCard
              key={c.key}
              value={c.value}
              suffix={c.suffix}
              label={c.label}
              sub={c.sub}
              accent={c.accent}
            />
          ))}
        </div>

        {/* hero mesh + verdict + latency */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <GlobalMeshMap validatedToday={todayCount} />
          <div className="flex flex-col gap-3">
            <VerdictSplit stats={stats} />
            <LatencyP50 stats={stats} />
          </div>
        </div>

        <PipelinePanel stats={stats} />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-data text-[10px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">Recent validations</h3>
              <a href="#/app/history" className="font-data text-[10px] font-semibold tracking-[0.18em] text-[var(--palette-teal-300)] uppercase hover:underline">
                View all →
              </a>
            </div>
            {recent && recent.length > 0 ? (
              <ul className="space-y-1.5">
                {recent.map((r) => (
                  <RecentRow key={r.id} r={r} />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="mail"
                title="No validations yet"
                body="Run your first 7-layer check to populate the dashboard."
                action={
                  <a href="#/app/validator" className="rounded-xl bg-[var(--palette-teal-300)] px-4 py-2 text-[12.5px] font-bold tracking-wide text-[#0A0F1A] transition-[filter] duration-200 hover:brightness-110">
                    Open validator
                  </a>
                }
              />
            )}
          </Card>
          <div className="flex flex-col gap-3">
            <TrendStrip series={stats?.series ?? []} />
            <div className="metallic-panel flex flex-col gap-2 p-4">
              <span className="screw-bottom" />
              <div className="flex items-center gap-2">
                <Icon name="lifebuoy" size={14} weight="duotone" className="text-[var(--palette-teal-300)]" />
                <h3 className="font-data text-[10px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">Integration note</h3>
              </div>
              <p className="text-[12px] leading-relaxed text-[var(--text-2)]">
                Webhooks are signed with HMAC-SHA256. The <code className="font-data text-[var(--palette-teal-300)]">bridge-uid</code> rotates every 24h, so replay attempts after revocation land on a 401 — no extra auth layer needed.
              </p>
              <a href="#/app/settings" className="font-data mt-1 self-start rounded-lg border border-[var(--line)] px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[var(--text-2)] uppercase transition-colors duration-200 hover:border-[var(--line-blue)] hover:text-[var(--text-1)]">
                Configure
              </a>
            </div>
          </div>
        </div>
      </div>
    </RouteTransition>
  );
}
