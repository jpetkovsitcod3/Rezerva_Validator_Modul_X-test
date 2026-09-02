/* ============================================================
   BRIDGE MODUL X — 7-layer validation engine (shared core)
   Deterministic per-address results so the demo behaves like
   a real backend: same address → same verdict, every time.
   ============================================================ */

export type LayerKey =
  | "syntax"
  | "dns"
  | "mx"
  | "disposable"
  | "catchall"
  | "smtp"
  | "scoring";

export type LayerStatus = "pass" | "fail" | "warn" | "skip" | "off";

export interface LayerResult {
  key: LayerKey;
  name: string;
  status: LayerStatus;
  ms: number;
  note: string;
}

export type VerdictStatus = "valid" | "invalid" | "risky";

export interface Verdict {
  email: string;
  domain: string;
  score: number;
  status: VerdictStatus;
  action: string;
  layers: LayerResult[];
  totalMs: number;
}

export const LAYERS: { key: LayerKey; name: string; short: string }[] = [
  { key: "syntax", name: "Syntax", short: "RFC 5322 parse" },
  { key: "dns", name: "DNS Lookup", short: "domain + NS" },
  { key: "mx", name: "MX Record", short: "mail exchangers" },
  { key: "disposable", name: "Disposable", short: "blocklist match" },
  { key: "catchall", name: "Catch-All", short: "accept-all probe" },
  { key: "smtp", name: "SMTP Probe", short: "RCPT TO handshake" },
  { key: "scoring", name: "ML Scoring", short: "41 signals → 0–100" },
];

export const DISPOSABLE_SEED = [
  "mailinator.com",
  "tempmail.io",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "temp-mail.org",
  "maildrop.cc",
  "dispostable.com",
  "fakeinbox.com",
];

const TYPO_MAP: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotnail.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "protonmal.com": "protonmail.com",
  "iclod.com": "icloud.com",
};

const CATCHALL_SET = new Set([
  "megacorp.com",
  "bigcorp.com",
  "globex.com",
  "initech.com",
  "umbrella.co",
  "starkind.com",
  "vandelay.com",
]);

const ROLE_LOCALS = new Set(["info", "sales", "admin", "support", "hello", "contact", "office", "team"]);
const FREE_PROVIDERS = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "protonmail.com", "icloud.com", "aol.com"]);

export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/* ---------- deterministic prng ---------- */

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.codePointAt(i) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- engine ---------- */

export interface EngineOptions {
  blocklist: string[];
  enabled: Record<LayerKey, boolean>;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function judge(rawEmail: string, opts: EngineOptions): Verdict {
  const email = rawEmail.trim().toLowerCase();
  const rand = prng(hashStr(email));
  const layers: LayerResult[] = [];
  const domain = email.includes("@") ? email.split("@")[1] ?? "" : "";
  const local = email.includes("@") ? email.split("@")[0] ?? "" : "";

  const push = (key: LayerKey, status: LayerStatus, ms: number, note: string) => {
    const meta = LAYERS.find((l) => l.key === key)!;
    layers.push({ key, name: meta.name, status, ms: r1(ms), note });
  };
  const off = (key: LayerKey) => push(key, "off", 0, "disabled by admin");
  const fillRest = (from: number) => {
    for (let i = from; i < 6; i++) push(LAYERS[i].key, "skip", 0, "early exit");
  };

  /* 1 · syntax */
  if (!opts.enabled.syntax) {
    off("syntax");
  } else if (!EMAIL_RE.test(email) || email.length > 320) {
    push("syntax", "fail", 0.2 + rand() * 0.3, "malformed address — RFC 5322 reject");
    fillRest(1);
    push("scoring", "pass", 0.9, "early-exit scoring");
    return finish(email, domain, layers, 0);
  } else {
    push("syntax", "pass", 0.2 + rand() * 0.3, "RFC 5322 valid");
  }

  /* 2 · dns */
  if (!opts.enabled.dns) {
    off("dns");
  } else if (TYPO_MAP[domain]) {
    push("dns", "fail", 6 + rand() * 8, `NXDOMAIN — did you mean ${TYPO_MAP[domain]}?`);
    fillRest(2);
    push("scoring", "pass", 1, "early-exit scoring");
    return finish(email, domain, layers, 0);
  } else if (domain.startsWith("nomx.") || domain.startsWith("dead.")) {
    push("dns", "fail", 6 + rand() * 8, "NXDOMAIN — domain does not resolve");
    fillRest(2);
    push("scoring", "pass", 1, "early-exit scoring");
    return finish(email, domain, layers, 0);
  } else {
    push("dns", "pass", 5 + rand() * 9, `${2 + Math.floor(rand() * 3)} NS records found`);
  }

  /* 3 · mx */
  if (!opts.enabled.mx) {
    off("mx");
  } else if (domain.startsWith("nullmx.")) {
    push("mx", "fail", 10 + rand() * 8, "null MX (RFC 7505) — domain receives no mail");
    fillRest(3);
    push("scoring", "pass", 1.1, "early-exit scoring");
    return finish(email, domain, layers, 0);
  } else {
    push("mx", "pass", 9 + rand() * 10, `${1 + Math.floor(rand() * 3)} mail exchanger(s)`);
  }

  /* 4 · disposable */
  if (!opts.enabled.disposable) {
    off("disposable");
  } else if (opts.blocklist.includes(domain)) {
    push("disposable", "fail", 0.5 + rand() * 0.6, `disposable domain — blocklist hit (${opts.blocklist.length} domains)`);
    fillRest(4);
    push("scoring", "pass", 1.1, "early-exit scoring");
    return finish(email, domain, layers, 4);
  } else {
    push("disposable", "pass", 0.5 + rand() * 0.6, `clean — ${opts.blocklist.length}-domain blocklist`);
  }

  /* 5 · catch-all */
  const isCatchall = CATCHALL_SET.has(domain);
  if (!opts.enabled.catchall) {
    off("catchall");
  } else if (isCatchall) {
    push("catchall", "warn", 16 + rand() * 12, "accepts all addresses — unverifiable");
  } else {
    push("catchall", "pass", 14 + rand() * 12, "selective domain");
  }

  /* 6 · smtp */
  if (!opts.enabled.smtp) {
    off("smtp");
  } else {
    const h = hashStr(domain);
    if (h % 17 === 0) {
      push("smtp", "fail", 180 + rand() * 220, "550 5.1.1 — user unknown");
      push("scoring", "pass", 1.4 + rand(), "41 signals weighed");
      return finish(email, domain, layers, 0);
    } else if (h % 23 === 0) {
      push("smtp", "warn", 200 + rand() * 200, "451 greylist — retry recommended");
    } else {
      push("smtp", "pass", 160 + rand() * 240, "RCPT TO accepted · 250 2.1.5");
    }
  }

  /* 7 · scoring */
  let score = 97 - Math.floor(rand() * 6);
  const notes: string[] = [];
  if (isCatchall && opts.enabled.catchall) {
    score -= 38;
    notes.push("catch-all penalty −38");
  }
  if (layers.some((l) => l.note.startsWith("451"))) {
    score -= 14;
    notes.push("greylist −14");
  }
  if (ROLE_LOCALS.has(local)) {
    score -= 6;
    notes.push("role address −6");
  }
  if (FREE_PROVIDERS.has(domain)) {
    score -= 2;
    notes.push("free provider −2");
  }
  score = Math.max(2, Math.min(99, score));
  push("scoring", "pass", 1.4 + rand(), notes.length ? notes.join(" · ") : "41 signals weighed");
  return finish(email, domain, layers, score);
}

function finish(email: string, domain: string, layers: LayerResult[], score: number): Verdict {
  const totalMs = Math.round(layers.reduce((s, l) => s + l.ms, 0) * 10) / 10;
  let status: VerdictStatus = "valid";
  let action = "Safe to send";
  if (score < 40) {
    status = "invalid";
    action = "Do not send — hard bounce likely";
  } else if (score < 75) {
    status = "risky";
    action = "Manual review — route to human";
  }
  return { email, domain, score, status, action, layers, totalMs };
}

/* ---------- shared meta ---------- */

export const STATUS_META: Record<VerdictStatus, { label: string; color: string }> = {
  valid: { label: "Valid", color: "var(--green)" },
  risky: { label: "Risky", color: "var(--purple)" },
  invalid: { label: "Invalid", color: "var(--red)" },
};

export const LAYER_STATUS_META: Record<LayerStatus, { label: string; color: string }> = {
  pass: { label: "Pass", color: "var(--green)" },
  fail: { label: "Fail", color: "var(--red)" },
  warn: { label: "Warn", color: "var(--purple)" },
  skip: { label: "Skipped", color: "var(--text-3)" },
  off: { label: "Off", color: "var(--text-3)" },
};

/* ---------- csv helpers ---------- */

export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

/* ---------- quick check (syntax + DNS only — parity with /validate/quick) ---------- */

export function judgeQuick(rawEmail: string, _opts: EngineOptions): Verdict {
  const email = rawEmail.trim().toLowerCase();
  const rand = prng(hashStr(email + ":quick"));
  const domain = email.includes("@") ? email.split("@")[1] ?? "" : "";
  const layers: LayerResult[] = [];
  const push = (key: LayerKey, status: LayerStatus, ms: number, note: string) => {
    const meta = LAYERS.find((l) => l.key === key)!;
    layers.push({ key, name: meta.name, status, ms: r1(ms), note });
  };

  let failed = false;
  if (!EMAIL_RE.test(email) || email.length > 320) {
    push("syntax", "fail", 0.2 + rand() * 0.3, "malformed address — RFC 5322 reject");
    failed = true;
  } else {
    push("syntax", "pass", 0.2 + rand() * 0.3, "RFC 5322 valid");
  }
  if (failed) {
    push("dns", "skip", 0, "early exit");
  } else if (TYPO_MAP[domain]) {
    push("dns", "fail", 6 + rand() * 8, `NXDOMAIN — did you mean ${TYPO_MAP[domain]}?`);
    failed = true;
  } else if (domain.startsWith("dead.") || domain.startsWith("nomx.")) {
    push("dns", "fail", 6 + rand() * 8, "NXDOMAIN — domain does not resolve");
    failed = true;
  } else {
    push("dns", "pass", 5 + rand() * 9, "resolves — NS records found");
  }
  (["mx", "disposable", "catchall", "smtp", "scoring"] as LayerKey[]).forEach((k) =>
    push(k, "skip", 0, "quick mode — not probed")
  );

  const score = failed ? 6 : 62;
  return {
    email,
    domain,
    score,
    status: failed ? "invalid" : "valid",
    action: failed
      ? "Do not send — address or domain is broken"
      : "Syntax + DNS clean — run a deep check before sending",
    layers,
    totalMs: Math.round(layers.reduce((s, l) => s + l.ms, 0) * 10) / 10,
  };
}

/* ---------- domain intelligence (parity with /api/v1/domain/{domain}) ---------- */

export interface DomainReport {
  domain: string;
  exists: boolean;
  suggestion: string | null;
  mx: { host: string; priority: number }[];
  spf: { record: string; mechanisms: string[]; strict: boolean } | null;
  dmarc: { policy: "none" | "quarantine" | "reject"; rua: string } | null;
  dkim: { selector: string; bits: number; valid: boolean }[];
  score: number;
  verdict: string;
}

const CURATED_DOMAINS: Record<string, Partial<DomainReport>> = {
  "gmail.com": {
    mx: [{ host: "gmail-smtp-in.l.google.com", priority: 5 }, { host: "alt1.gmail-smtp-in.l.google.com", priority: 10 }],
    spf: { record: "v=spf1 include:_spf.google.com ~all", mechanisms: ["include:_spf.google.com", "~all"], strict: false },
    dmarc: { policy: "none", rua: "mailto:mailauth-reports@google.com" },
    dkim: [{ selector: "google", bits: 2048, valid: true }],
  },
  "outlook.com": {
    mx: [{ host: "outlook-com.olc.protection.outlook.com", priority: 5 }],
    spf: { record: "v=spf1 include:spf.protection.outlook.com -all", mechanisms: ["include:spf.protection.outlook.com", "-all"], strict: true },
    dmarc: { policy: "reject", rua: "mailto:dmarc@outlook.com" },
    dkim: [{ selector: "selector1", bits: 2048, valid: true }, { selector: "selector2", bits: 2048, valid: true }],
  },
  "stripe.com": {
    mx: [{ host: "mx0.stripe.com", priority: 10 }, { host: "mx1.stripe.com", priority: 20 }],
    spf: { record: "v=spf1 include:_spf.stripe.com -all", mechanisms: ["include:_spf.stripe.com", "-all"], strict: true },
    dmarc: { policy: "reject", rua: "mailto:dmarc-reports@stripe.com" },
    dkim: [{ selector: "stripe1", bits: 2048, valid: true }],
  },
};

export function domainReport(raw: string): DomainReport {
  const domain = raw.trim().toLowerCase().replace(/^@/, "").replace(/\/.*$/, "");
  const empty: DomainReport = {
    domain, exists: false, suggestion: TYPO_MAP[domain] ?? null,
    mx: [], spf: null, dmarc: null, dkim: [], score: 0,
    verdict: TYPO_MAP[domain]
      ? `Domain not found — did you mean ${TYPO_MAP[domain]}?`
      : "NXDOMAIN — this domain does not resolve",
  };
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain))
    return { ...empty, verdict: "Not a valid domain name" };
  if (TYPO_MAP[domain] || domain.startsWith("dead.") || domain.startsWith("nomx.")) return empty;

  const rand = prng(hashStr("dom:" + domain));
  const curated = CURATED_DOMAINS[domain];
  const mxCount = 1 + Math.floor(rand() * 3);
  const mx = curated?.mx ?? Array.from({ length: mxCount }, (_, i) => ({
    host: `mx${i + 1}.${domain}`,
    priority: (i + 1) * 10,
  }));
  const hasSpf = curated?.spf ? true : rand() > 0.18;
  const spf = curated?.spf ?? (hasSpf
    ? {
        record: `v=spf1 include:mail.${domain} ${rand() > 0.5 ? "-all" : "~all"}`,
        mechanisms: [`include:mail.${domain}`, rand() > 0.5 ? "-all" : "~all"],
        strict: rand() > 0.5,
      }
    : null);
  const pol = rand();
  const dmarc = curated?.dmarc ?? (rand() > 0.25
    ? { policy: pol < 0.34 ? "reject" : pol < 0.67 ? "quarantine" : "none", rua: `mailto:dmarc@${domain}` }
    : null);
  const dkim = curated?.dkim ?? (rand() > 0.3
    ? [{ selector: ["google", "default", "s1", "mail"][Math.floor(rand() * 4)], bits: rand() > 0.4 ? 2048 : 1024, valid: rand() > 0.12 }]
    : []);

  let score = 30 + Math.min(20, mx.length * 8);
  if (spf) score += spf.strict ? 18 : 10;
  if (dmarc) score += dmarc.policy === "reject" ? 22 : dmarc.policy === "quarantine" ? 14 : 6;
  if (dkim.length) score += dkim.every((d) => d.valid) ? 10 : 4;
  score = Math.min(99, score);

  const verdict =
    score >= 80 ? "Strong authentication posture — safe to receive and send"
    : score >= 55 ? "Decent posture — some authentication gaps"
    : "Weak posture — missing SPF/DMARC, higher spoofing risk";

  return { domain, exists: true, suggestion: null, mx, spf, dmarc, dkim, score, verdict };
}

export function parseEmailList(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  text
    .split(/[\n,;]+/)
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
    .forEach((s) => {
      // take first column if a CSV row is pasted
      const candidate = s.split(",")[0].trim().toLowerCase();
      if (candidate && !seen.has(candidate)) {
        seen.add(candidate);
        out.push(candidate);
      }
    });
  return out;
}
