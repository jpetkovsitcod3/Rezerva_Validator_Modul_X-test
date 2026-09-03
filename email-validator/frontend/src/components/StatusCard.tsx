import type { ReactNode } from "react";
import { Icon, type IconName } from "../lib/ui";
import { cn } from "../utils/cn";

export type StatusTone = "ok" | "warn" | "err" | "info";

const TONE_META: Record<StatusTone, { icon: IconName; ring: string; dot: string }> = {
  ok: {
    icon: "check",
    ring: "border-[#BFD8C0] bg-[#EDF3EC] text-[var(--green)]",
    dot: "bg-[var(--green)]",
  },
  warn: {
    icon: "alert",
    ring: "border-[#EAD9A8] bg-[#FBF3DB] text-[var(--amber)]",
    dot: "bg-[var(--amber)]",
  },
  err: {
    icon: "alert",
    ring: "border-[#EAB9BB] bg-[#FDEBEC] text-[var(--red)]",
    dot: "bg-[var(--red)]",
  },
  info: {
    icon: "sparkles",
    ring: "border-[#EAEAEA] bg-[#F7F6F3] text-[var(--text-1)]",
    dot: "bg-[#111111]",
  },
};

interface StatusCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: IconName;
  tone?: StatusTone;
  trend?: number;
  className?: string;
}

/**
 * StatusCard — a paper stat tile with a pastel status tone,
 * icon chip, and optional trend indicator.
 */
export default function StatusCard({
  label,
  value,
  sub,
  icon,
  tone = "info",
  trend,
  className,
}: StatusCardProps) {
  const meta = TONE_META[tone];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[#EAEAEA] bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:border-[#D8D4C8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-data text-[9.5px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">
            {label}
          </p>
          <p className="font-data mt-2 text-[26px] leading-none font-bold text-[var(--text-1)] tabular-nums">
            {value}
          </p>
          {sub && <div className="mt-2 text-[11.5px] text-[var(--text-3)]">{sub}</div>}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border",
            meta.ring
          )}
        >
          <Icon name={icon} size={16} />
        </span>
      </div>
      {typeof trend === "number" && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              "font-data text-[10.5px] font-bold",
              trend >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"
            )}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
          <span className="text-[10px] text-[var(--text-3)]">vs last period</span>
        </div>
      )}
      <span
        className={cn("absolute top-3 right-3 size-1.5 rounded-full", meta.dot)}
        aria-hidden
      />
    </div>
  );
}
