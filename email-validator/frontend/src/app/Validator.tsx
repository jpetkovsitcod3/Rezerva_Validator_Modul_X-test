import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, Spinner } from "../lib/ui";
import { springSnappy } from "../lib/motion";
import { useAuth } from "../lib/auth";
import {
  apiBlocklist,
  apiDomain,
  apiFinishJob,
  apiHistory,
  apiListJobs,
  apiSettings,
  apiStartJob,
  apiValidate,
  apiValidateFast,
  ApiError,
  RATE_LIMIT_PER_MIN,
  type BulkJob,
  type Settings,
  type ValidationRecord,
} from "../lib/db";
import {
  judge,
  judgeQuick,
  parseEmailList,
  downloadCSV,
  toCSV,
  type DomainReport,
  type EngineOptions,
  type Verdict,
} from "../lib/engine";
import { Card, EmptyState, PrimaryButton, GhostButton, StatusBadge, useToast } from "./ui";
import { RibbonCorner, SuiMessage, SuiProgress } from "../lib/semantic";
import { LayerRows, ScoreDial, timeAgo } from "./Layers";
import { RouteTransition } from "../lib/route-transition";
import { cn } from "../utils/cn";

/* ================= single check (quick / deep) ================= */

function SingleCheck({ opts, onSpent }: { opts: EngineOptions | null; onSpent: () => void }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"quick" | "deep">("deep");
  const [formErr, setFormErr] = useState("");
  const [rateErr, setRateErr] = useState("");
  const [creditErr, setCreditErr] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [reveal, setReveal] = useState(0);
  const [result, setResult] = useState<Verdict | null>(null);
  const [resultMode, setResultMode] = useState<"quick" | "deep">("deep");
  const [recent, setRecent] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!user) return;
    apiHistory({ userId: user.id, page: 1, pageSize: 5, status: "all" }).then((h) =>
      setRecent([...new Set(h.rows.map((r) => r.email))])
    );
  }, [user]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const outOfCredits = !!user && user.role !== "admin" && user.credits <= 0;

  const run = (target?: string, forceMode?: "quick" | "deep") => {
    const em = (target ?? email).trim();
    const m = forceMode ?? mode;
    setFormErr("");
    setCreditErr("");
    setRateErr("");
    if (!em) {
      setFormErr("Enter an email address first.");
      return;
    }
    if (m === "deep" && outOfCredits) {
      setCreditErr("Deep checks cost 1 credit and you're at zero. Quick checks are free — or ask an admin for a top-up.");
      return;
    }
    if (!opts || !user) return;
    clearTimers();
    const verdict = m === "quick" ? judgeQuick(em, opts) : judge(em, opts);
    setEmail(em);
    setPhase("running");
    setResult(null);
    setResultMode(m);
    setReveal(0);
    // quick mode resolves almost instantly; deep walks all 7 layers
    const stepMs = m === "quick" ? 140 : 250;
    verdict.layers.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setReveal(i + 1), stepMs * (i + 1)));
    });
    const doneAt = stepMs * verdict.layers.length + 300;
    timers.current.push(
      window.setTimeout(async () => {
        try {
          await apiValidate(user, em, { quick: m === "quick" });
          setResult(verdict);
          setPhase("done");
          onSpent();
          push(
            m === "quick"
              ? `Quick check: ${em} — ${verdict.status === "valid" ? "syntax + DNS clean" : "failed early"}`
              : verdict.status === "valid"
                ? `${em} scored ${verdict.score}/100 — safe to send`
                : verdict.status === "risky"
                  ? `${em} scored ${verdict.score}/100 — needs review`
                  : `${em} failed — do not send`,
            verdict.status === "invalid" ? "err" : "ok"
          );
        } catch (ex) {
          setPhase("idle");
          setReveal(0);
          if (ex instanceof ApiError && ex.code === "rate") setRateErr(ex.message);
          else if (ex instanceof ApiError && ex.code === "credits") setCreditErr(ex.message);
          else setRateErr("Validation failed. Try again.");
        }
      }, doneAt)
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run();
  };

  const runningLayers =
    phase === "running" && opts
      ? (resultMode === "quick"
          ? judgeQuick(email || "pending@example.com", opts)
          : judge(email || "pending@example.com", opts)
        ).layers
      : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-4 sm:p-6">
        <h3 className="font-display text-[19px] font-bold text-white">Single check</h3>
        <p className="mt-1 text-[12.5px] text-white/30">
          Quick = syntax + DNS, free. Deep = all 7 layers, 1 credit.
        </p>

        {/* mode toggle */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.06] bg-[var(--bg-2)] p-1" role="group" aria-label="Validation depth">
          {(
            [
              ["quick", "Quick", "free · 2 layers"],
              ["deep", "Deep", "1 credit · 7 layers"],
            ] as const
          ).map(([key, label, sub]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={cn(
                "rounded-lg px-3 py-2 text-left transition-all duration-200",
                mode === key ? "bg-[#111111]" : "hover:bg-[#F1EFEA]"
              )}
            >
              <span className={cn("block text-[13px] font-extrabold", mode === key ? "text-white" : "text-white/50")}>
                {label}
              </span>
              <span className="font-data block text-[8.5px] tracking-[0.14em] text-white/30 uppercase">{sub}</span>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-4">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors duration-200 focus-within:border-[#D4A574]/40",
              formErr ? "border-[#E68080]/40" : "border-white/[0.06]"
            )}
          >
            <Icon name="mail" size={16} className="shrink-0 text-[var(--cyan)]" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              aria-label="Email address to validate"
              aria-describedby={formErr ? "email-error" : undefined}
              aria-invalid={!!formErr}
              className="font-data min-w-0 flex-1 bg-transparent text-[13.5px] text-white outline-none placeholder:text-white/30"
            />
            <button
              type="submit"
              disabled={phase === "running"}
              aria-busy={phase === "running"}
              className="flex shrink-0 items-center gap-2 rounded-md bg-[#111111] px-4 py-2 text-[12.5px] font-bold text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[.98] disabled:opacity-70"
            >
              {phase === "running" ? <Spinner size={13} /> : <Icon name="zap" size={13} />}
              {phase === "running" ? "Running…" : mode === "quick" ? "Quick check" : "Deep check"}
            </button>
          </div>
          {formErr && <p id="email-error" role="alert" className="font-data mt-2 text-[10.5px] text-[var(--red)]">{formErr}</p>}
        </form>

        {recent.length > 0 && (
          <div className="mt-4">
            <p className="font-data text-[9px] font-semibold tracking-[0.18em] text-white/30 uppercase">recent</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => run(r)}
                  disabled={phase === "running"}
                  className="font-data rounded-full border border-white/[0.06] px-2.5 py-1 text-[10px] text-white/30 transition-colors duration-200 hover:border-[#D4A574]/40 hover:text-white disabled:opacity-50"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {(creditErr || rateErr) && (
          <div className="mt-5">
            <SuiMessage tone="danger" title={rateErr ? "Rate limit" : "Out of credits"}>
              {rateErr || creditErr}
              {rateErr && (
                <span className="font-data mt-1.5 block text-[9.5px] tracking-[0.12em] text-white/30 uppercase">
                  limit: {RATE_LIMIT_PER_MIN} checks / minute
                </span>
              )}
            </SuiMessage>
          </div>
        )}

        {phase === "idle" && !creditErr && !rateErr && (
          <div className="mt-6 rounded-xl border border-dashed border-white/[0.06] p-5 text-center">
            <p className="font-data text-[10px] tracking-[0.18em] text-white/30 uppercase">try a tricky one</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {["james@gmial.com", "promo@mailinator.com", "info@megacorp.com"].map((s) => (
                <button
                  key={s}
                  onClick={() => run(s)}
                  className="font-data rounded-full border border-white/[0.06] px-2.5 py-1 text-[10px] text-white/50 transition-colors duration-200 hover:border-[#D4A574]/40 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* result trace */}
      <Card className="p-4 sm:p-6">
        {phase === "idle" && !result && (
          <EmptyState icon="activity" title="The trace appears here" body="Quick resolves in ~200ms. Deep walks seven layers, exactly like the production engine." />
        )}
        {phase === "running" && runningLayers && (
          <div>
            <div className="flex items-center gap-3">
              <Spinner size={16} />
              <p className="font-data truncate text-[12.5px] text-white/50">{email}</p>
              <span className="font-data ml-auto rounded-full border border-white/[0.06] px-2 py-0.5 text-[8.5px] tracking-[0.14em] text-[var(--cyan)] uppercase">
                {resultMode} mode
              </span>
            </div>
            <div className="mt-4">
              <LayerRows
                layers={runningLayers.map((l, i) =>
                  i < reveal ? l : { ...l, status: i === reveal ? l.status : "skip", note: i === reveal ? "probing…" : "", ms: 0 }
                )}
              />
            </div>
          </div>
        )}
        {phase === "done" && result && (
          <div className="slide-up">
            <div className="flex flex-wrap items-center gap-5">
              <ScoreDial score={result.score} />
              <div className="min-w-0 flex-1">
                <p className="font-data truncate text-[13px] font-semibold text-white">{result.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={result.status} />
                  <span className="font-data rounded-full border border-white/[0.06] px-2 py-0.5 text-[8.5px] tracking-[0.14em] text-white/30 uppercase">
                    {resultMode}
                  </span>
                  <span className="font-data text-[10.5px] text-white/30">{result.totalMs}ms</span>
                </div>
                <p className="mt-2 text-[12.5px] font-semibold" style={{ color: result.status === "valid" ? "var(--green)" : result.status === "risky" ? "var(--amber)" : "var(--red)" }}>
                  {result.action}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <LayerRows layers={result.layers} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {resultMode === "quick" && result.status === "valid" && (
                <PrimaryButton icon="layers" onClick={() => run(result.email, "deep")} className="text-[12px] px-3.5 py-2">
                  Upgrade to deep check
                </PrimaryButton>
              )}
              <GhostButton
                icon="code"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(result, null, 2)).catch(() => {});
                  push("Verdict JSON copied", "info");
                }}
                className="text-[12px] px-3.5 py-2"
              >
                Copy JSON
              </GhostButton>
              <GhostButton
                icon="refresh"
                onClick={() => { setPhase("idle"); setResult(null); setEmail(""); }}
                className="text-[12px] px-3.5 py-2"
              >
                Reset
              </GhostButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================= domain intelligence ================= */

function DomainIntel() {
  const { push } = useToast();
  const [domain, setDomain] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DomainReport | null>(null);

  const lookup = async (target?: string) => {
    const d = (target ?? domain).trim();
    setErr("");
    if (!d) {
      setErr("Enter a domain — e.g. stripe.com");
      return;
    }
    setDomain(d);
    setLoading(true);
    setReport(null);
    const r = await apiDomain(d);
    setReport(r);
    setLoading(false);
    if (r.exists) push(`DNS profile for ${r.domain} ready`, "info");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    lookup();
  };

  const policyColor = (p: string) =>
    p === "reject" ? "var(--green)" : p === "quarantine" ? "var(--amber)" : "var(--red)";

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden p-4 sm:p-6">
        <RibbonCorner color="var(--green)">free</RibbonCorner>
        <h3 className="text-[15px] font-extrabold text-white">Domain intelligence</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-white/30">
          MX, SPF, DMARC and DKIM for any domain — the same report the engine consults during layers 2–3. Free, unlimited.
        </p>
        <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className={cn("flex min-w-[220px] flex-1 items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors duration-200 focus-within:border-[#D4A574]/40", err ? "border-[#E68080]/40" : "border-white/[0.06]")}>
            <Icon name="globe" size={16} className="shrink-0 text-[var(--cyan)]" />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="company.com"
              aria-label="Domain name to inspect"
              aria-describedby={err ? "domain-error" : undefined}
              aria-invalid={!!err}
              className="font-data min-w-0 flex-1 bg-transparent text-[13.5px] text-white outline-none placeholder:text-white/30"
            />
          </div>
          <PrimaryButton icon="search" type="submit" loading={loading} disabled={loading} className="py-3">
            {loading ? "Querying DNS…" : "Run lookup"}
          </PrimaryButton>
          <div className="flex w-full gap-1.5 pt-1 sm:w-auto sm:pt-0" role="group" aria-label="Quick domain examples">
            {["gmail.com", "stripe.com", "megacorp.com", "dead-domain.io"].map((d) => (
              <button type="button" key={d} onClick={() => lookup(d)} disabled={loading} className="font-data rounded-full border border-white/[0.06] px-2.5 py-1 text-[10px] text-white/30 transition-colors duration-200 hover:border-[#D4A574]/40 hover:text-white disabled:opacity-50">
                {d}
              </button>
            ))}
          </div>
        </form>
        {err && <p id="domain-error" role="alert" className="font-data mt-2.5 text-[10.5px] text-[var(--red)]">{err}</p>}
      </Card>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-[150px] rounded-xl border border-white/[0.06] bg-[var(--bg-2)]" />
          ))}
        </div>
      )}

      {report && !loading && (
        <div className="slide-up space-y-4">
          {/* summary */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-5">
              <ScoreDial score={report.score} />
              <div className="min-w-0 flex-1">
                <p className="font-data text-[16px] font-bold text-white">{report.domain}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2.5">
                  <span className={cn("font-data flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-bold tracking-[0.12em] uppercase", report.exists ? "border-[#5BC07E]/30 text-[#5BC07E]" : "border-[#E68080]/30 text-[#E68080]")}>
                    <span className={cn("size-1.5 rounded-full", report.exists ? "pulse-green bg-[var(--green)]" : "bg-[var(--red)]")} />
                    {report.exists ? "Resolving" : "NXDOMAIN"}
                  </span>
                  <span className="font-data text-[10.5px] text-white/30">{report.mx.length} MX · {report.dkim.length} DKIM</span>
                </div>
                <p className="mt-2 text-[12.5px] font-semibold" style={{ color: report.score >= 80 ? "var(--green)" : report.score >= 55 ? "var(--amber)" : "var(--red)" }}>
                  {report.verdict}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* MX */}
            <Card className="p-5">
              <div className="flex items-center gap-2.5">
                <Icon name="server" size={15} className="text-[var(--cyan)]" />
                <h4 className="text-[13.5px] font-extrabold text-white">MX records</h4>
                <span className="font-data ml-auto text-[9px] tracking-[0.16em] text-white/30 uppercase">mail exchangers</span>
              </div>
              {report.mx.length === 0 ? (
                <p className="font-data mt-4 rounded-lg border border-[#E68080]/30 bg-[#E68080]/10 px-3.5 py-3 text-[11px] text-[#E68080]">
                  No MX records — this domain cannot receive mail.
                </p>
              ) : (
                <ul className="mt-3.5 space-y-2">
                  {report.mx.map((m) => (
                    <li key={m.host} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[var(--bg-2)] px-3.5 py-2.5">
                      <span className="font-data rounded-md border border-[#D4A574]/40 bg-white/[0.03] px-2 py-1 text-[10px] font-bold text-white">
                        pri {m.priority}
                      </span>
                      <span className="font-data min-w-0 flex-1 truncate text-[12px] text-white">{m.host}</span>
                      <span className="pulse-green size-1.5 shrink-0 rounded-full bg-[var(--green)]" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* SPF */}
            <Card className="p-5">
              <div className="flex items-center gap-2.5">
                <Icon name="shield" size={15} className="text-[var(--cyan)]" />
                <h4 className="text-[13.5px] font-extrabold text-white">SPF</h4>
                <span className="font-data ml-auto text-[9px] tracking-[0.16em] text-white/30 uppercase">sender policy</span>
              </div>
              {!report.spf ? (
                <p className="font-data mt-4 rounded-lg border border-[#E68080]/30 bg-[#E68080]/10 px-3.5 py-3 text-[11px] text-[#E68080]">
                  No SPF record — anyone can spoof this domain.
                </p>
              ) : (
                <>
                  <code className="font-data mt-3.5 block overflow-x-auto rounded-lg border border-white/[0.06] bg-[var(--bg-1)] px-3.5 py-3 text-[11px] text-[var(--cyan)]">
                    {report.spf.record}
                  </code>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {report.spf.mechanisms.map((m) => (
                      <span key={m} className="font-data rounded-md border border-white/[0.06] bg-[var(--bg-2)] px-2 py-1 text-[10px] text-white/50">{m}</span>
                    ))}
                    <span className={cn("font-data ml-auto rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] uppercase", report.spf.strict ? "bg-[#5BC07E]/15 text-[#5BC07E]" : "bg-[#FBF3DB] text-[var(--amber)]")}>
                      {report.spf.strict ? "hard fail" : "soft fail"}
                    </span>
                  </div>
                </>
              )}
            </Card>

            {/* DMARC */}
            <Card className="p-5">
              <div className="flex items-center gap-2.5">
                <Icon name="lock" size={15} className="text-[var(--cyan)]" />
                <h4 className="text-[13.5px] font-extrabold text-white">DMARC</h4>
                <span className="font-data ml-auto text-[9px] tracking-[0.16em] text-white/30 uppercase">policy</span>
              </div>
              {!report.dmarc ? (
                <p className="font-data mt-4 rounded-lg border border-[#E68080]/30 bg-[#E68080]/10 px-3.5 py-3 text-[11px] text-[#E68080]">
                  No DMARC — spoofed mail flows unchecked.
                </p>
              ) : (
                <div className="mt-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-data rounded-lg border px-3.5 py-2 text-[12px] font-bold uppercase" style={{ color: policyColor(report.dmarc.policy), borderColor: policyColor(report.dmarc.policy), background: `color-mix(in srgb, ${policyColor(report.dmarc.policy)} 10%, transparent)` }}>
                      p={report.dmarc.policy}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EFEDE8]">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: report.dmarc.policy === "reject" ? "100%" : report.dmarc.policy === "quarantine" ? "62%" : "24%", background: policyColor(report.dmarc.policy), transitionTimingFunction: "var(--ease-el)" }} />
                    </div>
                  </div>
                  <p className="font-data mt-3 truncate text-[10.5px] text-white/30">reports → {report.dmarc.rua}</p>
                </div>
              )}
            </Card>

            {/* DKIM */}
            <Card className="p-5">
              <div className="flex items-center gap-2.5">
                <Icon name="code" size={15} className="text-[var(--cyan)]" />
                <h4 className="text-[13.5px] font-extrabold text-white">DKIM</h4>
                <span className="font-data ml-auto text-[9px] tracking-[0.16em] text-white/30 uppercase">signing keys</span>
              </div>
              {report.dkim.length === 0 ? (
                <p className="font-data mt-4 rounded-lg border border-[#E68080]/30 bg-[#E68080]/10 px-3.5 py-3 text-[11px] text-[#E68080]">
                  No DKIM keys published — messages can't be authenticated.
                </p>
              ) : (
                <ul className="mt-3.5 space-y-2">
                  {report.dkim.map((k) => (
                    <li key={k.selector} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[var(--bg-2)] px-3.5 py-2.5">
                      <span className="font-data rounded-md border border-white/[0.06] px-2 py-1 text-[10px] text-white/50">
                        {k.selector}._domainkey
                      </span>
                      <span className="font-data ml-auto text-[10.5px] text-white/30">{k.bits}-bit</span>
                      <span className={cn("flex size-5 items-center justify-center rounded-full", k.valid ? "bg-[#5BC07E]/15 text-[#5BC07E]" : "bg-[#E68080]/15 text-[#E68080]")}>
                        <Icon name={k.valid ? "check" : "close"} size={10} weight="bold" />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= bulk clean + jobs ================= */

function BulkClean({ onSpent }: { onSpent: () => void }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ValidationRecord[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [err, setErr] = useState("");
  const [jobs, setJobs] = useState<BulkJob[] | null>(null);
  const cancelRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadJobs = () => {
    if (user) apiListJobs(user.id).then(setJobs);
  };
  useEffect(loadJobs, [user]);

  const list = parseEmailList(text);
  const needCredits = user?.role === "admin" ? 0 : list.length;
  const short = user ? needCredits - user.credits : 0;

  const onFile = async (f: File | null) => {
    if (!f) return;
    if (!/\.(csv|txt)$/i.test(f.name)) {
      setErr("Only .csv or .txt files are supported.");
      return;
    }
    setErr("");
    setText(await f.text());
    push(`Loaded ${f.name}`, "info");
  };

  const start = async () => {
    if (!user || running) return;
    setErr("");
    if (list.length === 0) {
      setErr("Paste at least one address, or drop a .csv file.");
      return;
    }
    if (short > 0) {
      setErr(`This run needs ${list.length} credits — you have ${user.credits}. Trim the list by ${short} or get topped up.`);
      return;
    }
    setRunning(true);
    setResults([]);
    cancelRef.current = false;
    setProgress({ done: 0, total: list.length });
    const job = await apiStartJob(user.id, list.length);
    let processed = 0;
    const compact: BulkJob["rows"] = [];
    const counts = { valid: 0, risky: 0, invalid: 0 };
    let failed = false;

    for (const em of list) {
      if (cancelRef.current) break;
      try {
        const { record } = await apiValidateFast(user, em);
        processed++;
        compact.push({ email: record.email, status: record.status, score: record.score });
        counts[record.status]++;
        setResults((r) => [...r, record]);
        setProgress({ done: processed, total: list.length });
      } catch (ex) {
        failed = true;
        setErr(
          ex instanceof ApiError && ex.code === "credits"
            ? `Ran out of credits after ${processed} of ${list.length}. Export the partial results below.`
            : "Something failed mid-run. Partial results kept."
        );
        break;
      }
    }

    await apiFinishJob(job.id, {
      processed,
      valid: counts.valid,
      risky: counts.risky,
      invalid: counts.invalid,
      status: cancelRef.current ? "cancelled" : failed ? "cancelled" : "completed",
      rows: compact,
    });
    setRunning(false);
    onSpent();
    loadJobs();
    if (!cancelRef.current && !failed) push(`Bulk clean finished — ${processed} address${processed === 1 ? "" : "es"} checked`, "ok");
    if (cancelRef.current) push(`Cancelled — ${processed} processed, remaining credits untouched`, "info");
  };

  const counts = results.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc as Record<string, number>)[r.status]! + 1 }),
    { valid: 0, risky: 0, invalid: 0 } as Record<string, number>
  );

  const exportRows = (rows: { email: string; status: string; score: number }[], name: string) => {
    downloadCSV(name, toCSV(["email", "status", "score"], rows.map((r) => [r.email, r.status, r.score])));
    push("CSV exported", "ok");
  };

  const pct = progress.total ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-extrabold text-white">Bulk list clean</h3>
            <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-white/30">
              Paste addresses (one per line, commas fine) or load a CSV. Jobs are tracked and survive reloads — find past runs below.
            </p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={running}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors duration-200 hover:border-[#D4A574]/40 disabled:opacity-60"
          >
            <Icon name="database" size={14} /> Load .csv / .txt
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} aria-label="Upload CSV or text file" />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={running}
          rows={6}
          placeholder={"maya@stripe.com\njames@gmial.com\npromo@mailinator.com, info@megacorp.com"}
          aria-label="Email addresses to validate (one per line)"
          aria-describedby={err ? "bulk-error" : undefined}
          aria-invalid={!!err}
          className="font-data mt-4 w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-[12.5px] leading-relaxed text-white outline-none transition-colors duration-200 placeholder:text-white/30 focus:border-[#D4A574]/40 disabled:opacity-60"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="font-data rounded-full border border-white/[0.06] px-3 py-1.5 text-[10.5px] text-white/50">
            {list.length} unique address{list.length === 1 ? "" : "es"}
          </span>
          {user && user.role !== "admin" && (
            <span className={cn("font-data rounded-full border px-3 py-1.5 text-[10.5px]", short > 0 ? "border-[#E68080]/30 text-[#E68080]" : "border-white/[0.06] text-white/50")}>
              cost: {needCredits} credits · balance: {user.credits}
            </span>
          )}
          <div className="ml-auto flex gap-2.5">
            {running && (
              <button
                onClick={() => (cancelRef.current = true)}
                className="flex items-center gap-2 rounded-lg border border-[#EAB9BB] bg-[#FDEBEC] px-4 py-2.5 text-[12.5px] font-bold text-[#9F2F2D] transition-colors duration-200 hover:bg-[#F6DADB]"
              >
                <Icon name="close" size={12} /> Cancel run
              </button>
            )}
            <PrimaryButton
              icon="zap"
              onClick={start}
              loading={running}
              disabled={running || list.length === 0}
            >
              {running ? `Checking ${progress.done}/${progress.total}…` : "Run bulk clean"}
            </PrimaryButton>
          </div>
        </div>

        {err && (
          <p id="bulk-error" role="alert" className="slide-up mt-3 flex items-start gap-2 rounded-lg border border-[#EAB9BB] bg-[#FDEBEC] px-3.5 py-2.5 text-[12px] font-semibold text-[#9F2F2D]">
            <Icon name="alert" size={14} className="mt-0.5 shrink-0" /> {err}
          </p>
        )}

        {(running || results.length > 0) && (
          <SuiProgress
            className="mt-5"
            value={pct}
            label={running ? "processing queue" : "run complete"}
            right={`${Math.round(pct)}%`}
          />
        )}
      </Card>

      {results.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h4 className="text-[14px] font-extrabold text-white">Results</h4>
            <span className="font-data rounded-full bg-[#EDF3EC] px-2.5 py-1 text-[10px] font-bold text-[var(--green)]">{counts.valid} valid</span>
            <span className="font-data rounded-full bg-[#FBF3DB] px-2.5 py-1 text-[10px] font-bold text-[var(--amber)]">{counts.risky} risky</span>
            <span className="font-data rounded-full bg-[#FDEBEC] px-2.5 py-1 text-[10px] font-bold text-[var(--red)]">{counts.invalid} invalid</span>
            <button
              onClick={() => exportRows(results.map((r) => ({ email: r.email, status: r.status, score: r.score })), `bridge-bulk-${new Date().toISOString().slice(0, 10)}.csv`)}
              className="ml-auto flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[12px] font-bold text-white transition-colors duration-200 hover:border-[#D4A574]/40"
            >
              <Icon name="download" size={12} /> Export CSV ({results.length})
            </button>
          </div>
          <ul className="mt-4 max-h-[300px] space-y-1 overflow-y-auto pr-1">
            {results.map((r) => (
              <li key={r.id} className="feed-in flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[var(--bg-2)]">
                <span className="font-data min-w-0 flex-1 truncate text-[12px] text-white">{r.email}</span>
                <span className="font-data text-[10px] text-white/30 tabular-nums">{Math.round(r.totalMs)}ms</span>
                <span className="font-data w-9 text-right text-[11px] font-bold tabular-nums" style={{ color: r.status === "valid" ? "var(--green)" : r.status === "risky" ? "var(--amber)" : "var(--red)" }}>
                  {r.score}
                </span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* persisted jobs */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[14px] font-extrabold text-white">Bulk jobs</h4>
            <p className="font-data mt-0.5 text-[9.5px] tracking-[0.16em] text-white/30 uppercase">persisted — survive reloads</p>
          </div>
          {jobs && <span className="font-data rounded-full border border-white/[0.06] px-2.5 py-1 text-[10px] text-[var(--cyan)]">{jobs.length} total</span>}
        </div>
        <div className="mt-4">
          {!jobs ? (
            <div className="space-y-2.5">{[...Array(2)].map((_, i) => <div key={i} className="shimmer h-14 rounded-xl bg-[var(--bg-2)]" />)}</div>
          ) : jobs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[0.06] px-5 py-7 text-center text-[12.5px] text-white/30">
              No jobs yet — your first bulk run lands here.
            </p>
          ) : (
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li key={j.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors duration-200 hover:border-white/[0.15]">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", j.status === "completed" ? "border-[#BFD8C0] bg-[#5BC07E]/15 text-[#5BC07E]" : "border-[#EAB9BB] bg-[#E68080]/15 text-[#E68080]")}>
                    <Icon name={j.status === "completed" ? "check" : "close"} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-white">
                      {j.processed}/{j.total} checked
                      <span className="font-data ml-2 text-[9.5px] font-semibold tracking-[0.12em] text-white/30 uppercase">{j.status}</span>
                    </p>
                    <p className="font-data mt-0.5 text-[10px] text-white/30">
                      {timeAgo(j.startedAt)} ·{" "}
                      <span className="text-[var(--green)]">{j.valid} valid</span> ·{" "}
                      <span className="text-[var(--amber)]">{j.risky} risky</span> ·{" "}
                      <span className="text-[var(--red)]">{j.invalid} invalid</span>
                    </p>
                  </div>
                  <button
                    onClick={() => exportRows(j.rows, `bridge-${j.id}.csv`)}
                    disabled={j.rows.length === 0}
                    className="flex items-center gap-1.5 rounded-md border border-white/[0.06] px-3 py-1.5 text-[10.5px] font-bold text-white/50 transition-colors duration-200 hover:border-[#D4A574]/40 hover:text-white disabled:opacity-40"
                  >
                    <Icon name="download" size={10} /> CSV
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ================= page ================= */

export default function Validator() {
  const { refresh } = useAuth();
  const [tab, setTab] = useState<"single" | "bulk" | "domain">("single");
  const [opts, setOpts] = useState<EngineOptions | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([apiBlocklist(), apiSettings()]).then(([blocklist, settings]: [string[], Settings]) => {
      if (alive) setOpts({ blocklist, enabled: settings.enabled });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <RouteTransition>
      <div className="space-y-5">
        <div className="flex w-fit items-center gap-1 rounded-xl border border-[var(--line-secondary)] bg-[var(--bg-2)] p-1">
          {(
            [
              ["single", "Single check", "mail"],
              ["bulk", "Bulk clean", "database"],
              ["domain", "Domain intel", "globe"],
            ] as const
          ).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-bold transition-colors duration-200",
                tab === key ? "text-white" : "text-white/30 hover:text-white"
              )}
            >
              {tab === key && (
                <motion.span
                  layoutId="validator-tab"
                  className="absolute inset-0 rounded-lg bg-[#F1EFEA]"
                  transition={springSnappy}
                  aria-hidden
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon name={icon} size={13} /> {label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springSnappy}
          >
            {tab === "single" && <SingleCheck opts={opts} onSpent={refresh} />}
            {tab === "bulk" && <BulkClean onSpent={refresh} />}
            {tab === "domain" && <DomainIntel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </RouteTransition>
  );
}
