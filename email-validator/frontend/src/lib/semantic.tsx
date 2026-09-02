/* ============================================================
   Semantic-UI-derived elements, rebuilt natively for the dark
   BRIDGE design system (semantic-ui-react targets React ≤18;
   these ports run on React 19 and inherit all design tokens).
   Elements: Button(animated) · Label/Ribbon · Statistic ·
   Progress · Rating · Message · Divider
   ============================================================ */

import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon, Spinner, type IconName } from "./ui";
import { cn } from "../utils/cn";

/* ---------------- Button (incl. Semantic's animated reveal) ---------------- */

const BTN_VARIANTS: Record<string, string> = {
  primary:
    "glow-2 bg-[var(--blue)] text-[var(--color-text-on-accent)] hover:brightness-110 hover:glow-3 border border-transparent",
  dark: "glass-1 text-[var(--text-1)] hover:border-[var(--line-blue)] hover:glow-1",
  danger:
    "border border-[rgba(248,113,113,.45)] bg-[rgba(248,113,113,.08)] text-[var(--red)] hover:bg-[rgba(248,113,113,.16)]",
  ghost:
    "border border-[var(--line)] bg-transparent text-[var(--text-2)] hover:border-[var(--line-blue)] hover:text-[var(--cyan)]",
};

export function SuiButton({
  children,
  hidden,
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  href,
  type = "button",
  className,
  icon,
}: {
  children: ReactNode;
  hidden?: ReactNode;
  variant?: keyof typeof BTN_VARIANTS;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  icon?: IconName;
}) {
  const cls = cn(
    "sui-btn relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-2.5 text-[13px] font-bold transition-[filter,box-shadow,background-color] duration-200 active:scale-[.97]",
    BTN_VARIANTS[variant],
    (disabled || loading) && "pointer-events-none opacity-60",
    className
  );
  const inner = (
    <>
      <span className="sui-layer sui-visible">
        {loading ? <Spinner size={14} /> : icon ? <Icon name={icon} size={14} /> : null}
        {loading ? "Working…" : children}
      </span>
      {hidden && !loading && (
        <span className="sui-layer sui-hidden" aria-hidden>
          {hidden}
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls} onClick={disabled ? undefined : onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls}>
      {inner}
    </button>
  );
}

/* ---------------- Label + corner ribbon ---------------- */

export function SuiLabel({
  children,
  color = "var(--cyan)",
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-data inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase",
        className
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export function RibbonCorner({ children, color = "var(--cyan)" }: { children: ReactNode; color?: string }) {
  return (
    <span className="sui-corner" style={{ "--rc": color } as CSSProperties}>
      <span>{children}</span>
    </span>
  );
}

/* ---------------- Statistic ---------------- */

export function SuiStatistic({
  value,
  label,
  accent = "var(--cyan)",
}: {
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="min-w-[86px]">
      <span
        className="font-data block text-[20px] leading-none font-bold tabular-nums"
        style={{ color: accent, textShadow: `0 0 18px color-mix(in srgb, ${accent} 45%, transparent)` }}
      >
        {value}
      </span>
      <span className="font-data mt-1.5 block text-[8.5px] font-semibold tracking-[0.18em] text-[var(--text-3)] uppercase">
        {label}
      </span>
    </div>
  );
}

/* ---------------- Progress (indicating) ---------------- */

export function SuiProgress({
  value,
  max = 100,
  label,
  right,
  accent = "var(--cyan)",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  right?: ReactNode;
  accent?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {(label || right) && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          {label && (
            <span className="font-data text-[9px] font-semibold tracking-[0.18em] text-[var(--text-3)] uppercase">
              {label}
            </span>
          )}
          {right && <span className="font-data text-[10px] font-semibold text-[var(--cyan)] tabular-nums">{right}</span>}
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-[rgba(160,160,184,.1)]"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className="h-full w-full origin-left rounded-full will-change-transform"
          style={{
            transform: `scaleX(${pct / 100})`,
            transition: "transform .6s var(--ease-el)",
            background: `linear-gradient(90deg, ${accent}, var(--blue))`,
            boxShadow: `0 0 12px color-mix(in srgb, ${accent} 55%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- Rating ---------------- */

export function SuiRating({
  value,
  onRate,
  max = 5,
  label = "Rating",
}: {
  value: number;
  onRate: (v: number) => void;
  max?: number;
  label?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div
      className="flex items-center gap-0.5"
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < shown;
        return (
          <button
            key={i}
            role="radio"
            aria-checked={value === i + 1}
            aria-label={`${i + 1} star${i ? "s" : ""}`}
            onMouseEnter={() => setHover(i + 1)}
            onFocus={() => setHover(i + 1)}
            onBlur={() => setHover(0)}
            onClick={() => onRate(i + 1)}
            className="rounded-md p-1 transition-transform duration-150 hover:scale-125 active:scale-90"
            style={{ transitionTimingFunction: "var(--ease-el)" }}
          >
            <Icon
              name="star"
              size={17}
              className={cn(
                "transition-[color,filter] duration-150",
                filled ? "text-[#fbbf24] [filter:drop-shadow(0_0_7px_rgba(251,191,36,.65))]" : "text-[rgba(160,160,184,.28)]"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Message ---------------- */

const MSG_TONES: Record<string, { icon: IconName; c: string }> = {
  info: { icon: "sparkles", c: "var(--cyan)" },
  success: { icon: "check", c: "var(--green)" },
  warning: { icon: "alert", c: "#fbbf24" },
  danger: { icon: "alert", c: "var(--red)" },
};

export function SuiMessage({
  tone = "info",
  title,
  children,
  onClose,
  className,
}: {
  tone?: keyof typeof MSG_TONES;
  title: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const t = MSG_TONES[tone];
  return (
    <div
      role="alert"
      className={cn("slide-up flex items-start gap-3 rounded-xl border bg-[var(--bg-2)] p-4", className)}
      style={{
        borderColor: `color-mix(in srgb, ${t.c} 35%, transparent)`,
        borderLeft: `3px solid ${t.c}`,
        background: `color-mix(in srgb, ${t.c} 6%, var(--bg-2))`,
      }}
    >
      <span
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
        style={{ color: t.c, background: `color-mix(in srgb, ${t.c} 14%, transparent)` }}
      >
        <Icon name={t.icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold" style={{ color: t.c }}>
          {title}
        </p>
        {children && <div className="mt-1 text-[12px] leading-relaxed text-[var(--text-2)]">{children}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss message"
          className="shrink-0 rounded-md p-1 text-[var(--text-3)] transition-colors duration-150 hover:text-[var(--text-1)]"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
}

/* ---------------- Divider ---------------- */

export function SuiDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(160,160,184,.22)]" />
      <span className="font-data text-[9px] font-semibold tracking-[0.24em] text-[var(--text-3)] uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(160,160,184,.22)]" />
    </div>
  );
}
