import { Icon } from "../lib/ui";
import { LAYER_STATUS_META, type LayerResult } from "../lib/engine";
import { cn } from "../utils/cn";

export function ScoreDial({
  score,
  size = 92,
}: {
  score: number;
  size?: number;
}) {
  const color = score >= 75 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#EFEDE8" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          pathLength={100} strokeDasharray={`${score} ${100 - score}`}
          style={{ transition: "stroke-dasharray .9s var(--ease-el)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-data leading-none font-bold text-[var(--text-1)] tabular-nums" style={{ fontSize: size * 0.24 }}>
          {score}
        </span>
        <span className="font-data mt-0.5 text-[7px] tracking-[0.2em] text-[var(--text-3)]">/100</span>
      </div>
    </div>
  );
}

function Led({ status }: { status: LayerResult["status"] }) {
  const m = LAYER_STATUS_META[status];
  if (status === "skip" || status === "off")
    return <span className="font-data text-[10px] text-[var(--text-3)]">{status === "off" ? "off" : "—"}</span>;
  const icon = status === "pass" ? "check" : status === "fail" ? "close" : "alert";
  return (
    <span
      className="pop-in flex size-[17px] items-center justify-center rounded-full"
      style={{ color: m.color, background: `color-mix(in srgb, ${m.color} 15%, transparent)` }}
    >
      <Icon name={icon} size={10} weight="bold" />
    </span>
  );
}

export function LayerRows({ layers }: { layers: LayerResult[] }) {
  return (
    <ul className="space-y-1" aria-label="Layer results">
      {layers.map((l, i) => {
        const m = LAYER_STATUS_META[l.status];
        return (
          <li key={l.key} className="flex items-center gap-3 rounded-lg px-2.5 py-[7px] transition-colors duration-200 hover:bg-[var(--accent-faint)]">
            <span className="font-data w-5 shrink-0 text-[9.5px] text-[var(--text-3)]">{String(i + 1).padStart(2, "0")}</span>
            <span className="w-[108px] shrink-0 text-[12.5px] font-semibold text-[var(--text-2)]">{l.name}</span>
            <span className="font-data min-w-0 flex-1 truncate text-[10.5px] text-[var(--text-3)]">{l.note}</span>
            <span className="font-data shrink-0 text-[10px] text-[var(--text-3)] tabular-nums">
              {l.status === "skip" || l.status === "off" ? "" : l.ms >= 1 ? `${Math.round(l.ms)}ms` : `${l.ms.toFixed(1)}ms`}
            </span>
            <span className="flex w-5 shrink-0 justify-end">
              <Led status={l.status} />
            </span>
            <span className="font-data hidden w-14 text-right text-[8.5px] font-bold tracking-[0.1em] uppercase sm:block" style={{ color: m.color }}>
              {m.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const statusDotCls: Record<string, string> = {
  valid: "bg-[var(--green)]",
  risky: "bg-[var(--amber)]",
  invalid: "bg-[var(--red)]",
};

export function rowTone(status: string) {
  return cn(status === "valid" && "text-[var(--green)]", status === "risky" && "text-[var(--amber)]", status === "invalid" && "text-[var(--red)]");
}
