import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Icon } from "../lib/ui";
import { navigate, useAuth } from "../lib/auth";
import { ApiError } from "../lib/db";
import { SuiButton, SuiDivider, SuiStatistic } from "../lib/semantic";
import { Field, inputCls } from "./ui";
import { springSoft } from "../lib/motion";

function AuthFrame({ children, side }: { children: React.ReactNode; side: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[var(--bg-1)] lg:grid-cols-[1fr_1.1fr]">
      {/* brand side */}
      <div className="relative hidden overflow-hidden border-r border-[var(--line-secondary)] bg-[var(--bg-0)] lg:block">
        <div className="hero-fallback absolute inset-0" aria-hidden />
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10">
          <a href="#/" className="flex w-fit items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-[rgba(79,138,255,.25)] bg-[var(--bg-3)]">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
                <rect x="4" y="7" width="24" height="18" rx="3.5" stroke="var(--palette-teal-400)" strokeWidth="2.4" />
                <path d="m4 11 12 8 12-8" stroke="var(--palette-teal-400)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[16px] font-extrabold tracking-tight text-[var(--text-1)]">REACTOR</span>
          </a>
          <div>{side}</div>
          <a href="#/" className="font-data w-fit text-[10px] tracking-[0.2em] text-[var(--text-3)] uppercase transition-colors duration-200 hover:text-[var(--cyan)]">
            &larr; back to reactor console
          </a>
        </div>
      </div>
      {/* form side */}
      <div className="flex items-center justify-center p-6 md:p-10">{children}</div>
    </div>
  );
}

function DemoPanel({ onFill }: { onFill: (email: string) => void }) {
  return (
    <div className="glass-1 rounded-xl p-4">
      <p className="font-data text-[9px] font-semibold tracking-[0.2em] text-[var(--cyan)] uppercase">
        Demo access &middot; password: demo1234
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onFill("user@bridge.demo")}
          className="rounded-xl border border-[var(--line-secondary)] bg-[var(--bg-2)] px-3 py-2.5 text-left transition-all duration-200 hover:border-[var(--line-blue)] hover:glow-1"
        >
          <span className="flex items-center gap-1.5 text-[12px] font-extrabold text-[var(--text-1)]">
            <Icon name="users" size={13} className="text-[var(--cyan)]" /> Demo user
          </span>
          <span className="font-data mt-1 block truncate text-[9.5px] text-[var(--text-3)]">user@bridge.demo</span>
        </button>
        <button
          type="button"
          onClick={() => onFill("admin@bridge.demo")}
          className="rounded-xl border border-[var(--line-secondary)] bg-[var(--bg-2)] px-3 py-2.5 text-left transition-all duration-200 hover:border-[rgba(167,139,250,.4)] hover:shadow-[0_0_12px_rgba(167,139,250,.15)]"
        >
          <span className="flex items-center gap-1.5 text-[12px] font-extrabold text-[var(--text-1)]">
            <Icon name="lock" size={13} className="text-[var(--purple)]" /> Demo admin
          </span>
          <span className="font-data mt-1 block truncate text-[9.5px] text-[var(--text-3)]">admin@bridge.demo</span>
        </button>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/app");
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      const u = await login(email, pw);
      navigate(u.role === "admin" ? "/admin" : "/app");
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      side={
        <div>
          <h1 className="font-display text-[clamp(1.9rem,3vw,2.7rem)] leading-[1.12] text-[var(--text-1)]">
            The engine that reads <em className="grad-text not-italic">every address</em> seven ways.
          </h1>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
            <SuiStatistic value="2.4M" label="checks / day" accent="var(--cyan)" />
            <SuiStatistic value="38ms" label="median latency" accent="var(--blue)" />
            <SuiStatistic value="4,217" label="blocked domains" accent="var(--purple)" />
          </div>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
        className="w-full max-w-[400px]"
      >
        <a href="#/" className="mb-8 flex w-fit items-center gap-2 lg:hidden">
          <Icon name="arrowRight" size={14} className="rotate-180 text-[var(--cyan)]" />
          <span className="font-data text-[10px] tracking-[0.2em] text-[var(--text-3)] uppercase">back</span>
        </a>
        <h2 className="text-[24px] font-extrabold tracking-tight text-[var(--text-1)]">Sign in</h2>
        <p className="mt-1.5 text-[13px] text-[var(--text-3)]">
          New here?{" "}
          <a href="#/signup" className="font-bold text-[var(--cyan)] hover:underline">
            Create an account
          </a>
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              className={inputCls}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              className={inputCls}
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </Field>
          {err && (
            <p role="alert" className="slide-up flex items-start gap-2 rounded-xl border border-[rgba(248,113,113,.3)] bg-[rgba(248,113,113,.06)] px-3.5 py-2.5 text-[12.5px] font-semibold text-[var(--red)]">
              <Icon name="alert" size={14} className="mt-0.5 shrink-0" /> {err}
            </p>
          )}
          <SuiButton
            type="submit"
            loading={busy}
            className="w-full py-3 text-[14px]"
            hidden={<>7 layers await</>}
            icon="send"
          >
            {busy ? "Authenticating..." : "Sign in to dashboard"}
          </SuiButton>
        </form>

        <div className="mt-6 space-y-4">
          <SuiDivider label="one-click demo" />
          <DemoPanel
            onFill={(em) => {
              setEmail(em);
              setPw("demo1234");
              setErr("");
              (document.querySelector('input[type="password"]') as HTMLInputElement | null)?.focus();
            }}
          />
        </div>
      </motion.div>
    </AuthFrame>
  );
}

export function SignupPage() {
  const { user, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/app");
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      await signup(name, email, pw);
      navigate("/app");
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      side={
        <div>
          <h1 className="font-display text-[clamp(1.9rem,3vw,2.7rem)] leading-[1.12] text-[var(--text-1)]">
            Your first <em className="grad-text not-italic">25 validations</em> are on us.
          </h1>
          <ul className="mt-6 space-y-2.5">
            {["All 7 layers from day one", "No credit card, no time limit", "API keys the moment you sign in"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-[var(--text-2)]">
                <span className="flex size-5 items-center justify-center rounded-full bg-[rgba(107,159,120,.14)] text-[var(--green)]">
                  <Icon name="check" size={10} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="w-full max-w-[400px]">
        <a href="#/" className="mb-8 flex w-fit items-center gap-2 lg:hidden">
          <Icon name="arrowRight" size={14} className="rotate-180 text-[var(--cyan)]" />
          <span className="font-data text-[10px] tracking-[0.2em] text-[var(--text-3)] uppercase">back</span>
        </a>
        <h2 className="text-[24px] font-extrabold tracking-tight text-[var(--text-1)]">Create account</h2>
        <p className="mt-1.5 text-[13px] text-[var(--text-3)]">
          Already validating?{" "}
          <a href="#/login" className="font-bold text-[var(--cyan)] hover:underline">
            Sign in
          </a>
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          <Field label="Full name">
            <input autoComplete="name" className={inputCls} placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Work email">
            <input type="email" autoComplete="email" className={inputCls} placeholder="ada@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" hint="min 8 characters">
            <input type="password" autoComplete="new-password" className={inputCls} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </Field>
          {err && (
            <p role="alert" className="slide-up flex items-start gap-2 rounded-xl border border-[rgba(248,113,113,.3)] bg-[rgba(248,113,113,.06)] px-3.5 py-2.5 text-[12.5px] font-semibold text-[var(--red)]">
              <Icon name="alert" size={14} className="mt-0.5 shrink-0" /> {err}
            </p>
          )}
          <SuiButton
            type="submit"
            loading={busy}
            className="w-full py-3 text-[14px]"
            hidden={<>25 credits included</>}
            icon="rocket"
          >
            {busy ? "Creating workspace..." : "Start validating free"}
          </SuiButton>
          <p className="text-center text-[11px] leading-relaxed text-[var(--text-3)]">
            25 credits included · no card required
          </p>
        </form>
      </div>
    </AuthFrame>
  );
}
