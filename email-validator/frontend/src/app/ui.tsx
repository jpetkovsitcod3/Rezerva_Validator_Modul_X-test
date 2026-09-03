import {
  createContext,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Icon, Spinner, type IconName } from "../lib/ui";
import { MOverlay, MPanel } from "../lib/motion";
import { STATUS_META, type VerdictStatus } from "../lib/engine";
import { cn } from "../utils/cn";

/* ================= toasts ================= */

type Tone = "ok" | "err" | "info";
interface Toast {
  id: number;
  msg: string;
  tone: Tone;
}
const ToastCtx = createContext<{ push: (msg: string, tone?: Tone) => void }>({
  push: () => {},
});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const push = (msg: string, tone: Tone = "ok") => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };
  const toneStyle: Record<Tone, string> = {
    ok: "border-[#BFD8C0] text-[var(--green)]",
    err: "border-[#EAB9BB] text-[var(--red)]",
    info: "border-[#EAEAEA] text-[var(--text-1)]",
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[120] flex w-[320px] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn("slide-up pointer-events-auto flex items-start gap-2.5 rounded-xl border border-[#EAEAEA] bg-white px-4 py-3", toneStyle[t.tone])}
          >
            <Icon name={t.tone === "ok" ? "check" : t.tone === "err" ? "alert" : "sparkles"} size={15} className="mt-0.5 shrink-0" />
            <p className="text-[12.5px] leading-snug font-semibold text-[var(--text-1)]">{t.msg}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= modal ================= */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    boxRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && boxRef.current) {
        const nodes = Array.from(
          boxRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((n) => !n.hasAttribute("disabled"));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <MOverlay
            ariaLabel="Close dialog"
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(17,17,17,0.4)]"
          />
          <MPanel
            innerRef={boxRef}
            tabIndex={-1}
            className={cn("relative w-full rounded-xl border border-[#EAEAEA] bg-white p-6 outline-none", width)}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-display text-[18px] font-bold tracking-tight text-[var(--text-1)]">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[#EAEAEA] text-[var(--text-3)] transition-colors duration-200 hover:border-[#111111] hover:text-[var(--text-1)]">
                <Icon name="close" size={14} />
              </button>
            </div>
            {children}
          </MPanel>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Confirm({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="text-[13.5px] leading-relaxed text-[var(--text-2)]">{body}</div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button onClick={onClose} className="rounded-md border border-[#EAEAEA] px-4 py-2.5 text-[13px] font-bold text-[var(--text-2)] transition-colors duration-200 hover:border-[#111111] hover:text-[var(--text-1)]">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-bold text-white transition-colors duration-200 active:scale-[.98] disabled:opacity-70",
            danger ? "bg-[#9F2F2D] hover:bg-[#86302E]" : "bg-[#111111] hover:bg-[#333333]"
          )}
        >
          {busy && <Spinner size={13} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/* ================= bits ================= */

export function StatusBadge({ status }: { status: VerdictStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="font-data inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-bold tracking-[0.05em] uppercase"
      style={{ color: m.color, borderColor: `color-mix(in srgb, ${m.color} 35%, transparent)`, background: `color-mix(in srgb, ${m.color} 10%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-[#EAEAEA] bg-white", className)}>{children}</div>;
}

export const StatTile = memo(function StatTile({
  label,
  value,
  sub,
  icon,
  accent = "var(--cyan)",
  loading,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: IconName;
  accent?: string;
  loading?: boolean;
}) {
  return (
    <Card className="hover-lift p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-data text-[9.5px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">{label}</p>
          {loading ? (
            <div className="shimmer mt-2.5 h-7 w-24 rounded-lg bg-[var(--bg-2)]" />
          ) : (
            <p className="font-data mt-1.5 text-[26px] leading-none font-bold text-[var(--text-1)] tabular-nums">{value}</p>
          )}
          {sub && <div className="mt-2 text-[11.5px] text-[var(--text-3)]">{sub}</div>}
        </div>
        <span className="flex size-9 items-center justify-center rounded-xl border" style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`, background: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
          <Icon name={icon} size={16} />
        </span>
      </div>
    </Card>
  );
});

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#EAEAEA] bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg border border-[#EAEAEA] bg-[#F7F6F3] text-[var(--text-3)]">
        <Icon name={icon} size={20} />
      </span>
      <p className="font-display mt-4 text-[17px] font-bold text-[var(--text-1)]">{title}</p>
      <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[var(--text-3)]">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1.5 rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-[12px] font-bold text-[var(--text-2)] transition-colors duration-200 hover:border-[#111111] hover:text-[var(--text-1)] disabled:pointer-events-none disabled:opacity-40"
      >
        <Icon name="arrowRight" size={12} className="rotate-180" /> Prev
      </button>
      <span className="font-data text-[11px] text-[var(--text-3)]">
        page {page} / {pages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        className="flex items-center gap-1.5 rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-[12px] font-bold text-[var(--text-2)] transition-colors duration-200 hover:border-[#111111] hover:text-[var(--text-1)] disabled:pointer-events-none disabled:opacity-40"
      >
        Next <Icon name="arrowRight" size={12} />
      </button>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-data mb-1.5 flex items-baseline justify-between text-[10px] font-semibold tracking-[0.16em] text-[var(--text-2)] uppercase">
        {label}
        {hint && <span className="normal-case tracking-normal text-[var(--text-3)]">{hint}</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="font-data mt-1.5 block text-[10.5px] text-[var(--red)]">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-[#EAEAEA] bg-white px-3.5 py-2.5 text-[13.5px] text-[var(--text-1)] outline-none transition-colors duration-200 placeholder:text-[var(--text-3)] focus:border-[#111111]";

export function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const { push } = useToast();
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setDone(true);
        push("Copied to clipboard", "info");
        setTimeout(() => setDone(false), 1600);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#EAEAEA] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-2)] transition-colors duration-200 hover:border-[#111111] hover:text-[var(--text-1)]"
    >
      <Icon name={done ? "check" : "code"} size={11} />
      {done ? "Copied" : label}
    </button>
  );
}

/* ================= unified button system ================= */

const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-md font-bold transition-colors duration-200 active:scale-[.98] disabled:opacity-60 disabled:pointer-events-none";

export function PrimaryButton({ children, icon, loading, disabled, className, onClick, type = "button", href }: {
  children: ReactNode;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  href?: string;
}) {
  const cls = cn(BTN_BASE, "bg-[#111111] text-white hover:bg-[#333333] px-5 py-2.5 text-[13px]", className);
  const inner = <>{loading ? <Spinner size={13} /> : icon ? <Icon name={icon} size={14} /> : null}{children}</>;
  if (href) return <a href={href} className={cls} onClick={disabled ? undefined : onClick}>{inner}</a>;
  return <button type={type} onClick={onClick} disabled={disabled || loading} className={cls}>{inner}</button>;
}

export function SecondaryButton({ children, icon, loading, disabled, className, onClick, type = "button" }: {
  children: ReactNode;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cn(BTN_BASE, "border border-[#EAEAEA] bg-white text-[var(--text-1)] hover:border-[#111111] px-5 py-2.5 text-[13px]", className)}>
      {loading ? <Spinner size={13} /> : icon ? <Icon name={icon} size={14} /> : null}{children}
    </button>
  );
}

export function DangerButton({ children, icon, loading, disabled, className, onClick, type = "button" }: {
  children: ReactNode;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cn(BTN_BASE, "border border-[#EAB9BB] bg-[#FDEBEC] text-[#9F2F2D] hover:bg-[#F6DADB] px-4 py-2.5 text-[13px]", className)}>
      {loading ? <Spinner size={13} /> : icon ? <Icon name={icon} size={14} /> : null}{children}
    </button>
  );
}

export function GhostButton({ children, icon, disabled, className, onClick, type = "button" }: {
  children: ReactNode;
  icon?: IconName;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(BTN_BASE, "border border-transparent text-[var(--text-2)] hover:border-[#EAEAEA] hover:bg-[#F7F6F3] hover:text-[var(--text-1)] px-4 py-2.5 text-[13px]", className)}>
      {icon ? <Icon name={icon} size={14} /> : null}{children}
    </button>
  );
}
