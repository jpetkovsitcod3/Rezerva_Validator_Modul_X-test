/* ============================================================
   BRIDGE MODUL X — client-side data layer
   Simulates the production backend: seeded demo dataset,
   localStorage persistence, latency, sessions, credits.
   Demo-only: passwords use a salted digest, NOT real hashing.
   ============================================================ */

import {
  DISPOSABLE_SEED,
  domainReport,
  judge,
  judgeQuick,
  prng,
  hashStr,
  type DomainReport,
  type EngineOptions,
  type LayerKey,
  type LayerResult,
  type Verdict,
  type VerdictStatus,
} from "./engine";

export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passDigest: string;
  role: Role;
  status: "active" | "suspended";
  credits: number;
  createdAt: number;
}

export interface ValidationRecord {
  id: string;
  userId: string;
  email: string;
  status: VerdictStatus;
  score: number;
  totalMs: number;
  layers: LayerResult[];
  ts: number;
  mode: "quick" | "deep";
}

/** Parity with the reference `bulk_jobs` table — jobs survive reloads. */
export interface BulkJob {
  id: string;
  userId: string;
  total: number;
  processed: number;
  valid: number;
  risky: number;
  invalid: number;
  status: "running" | "completed" | "cancelled";
  startedAt: number;
  finishedAt: number | null;
  rows: { email: string; status: VerdictStatus; score: number }[];
}

export interface ApiKey {
  id: string;
  userId: string;
  label: string;
  key: string;
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
}

export interface Settings {
  creditsOnSignup: number;
  enabled: Record<LayerKey, boolean>;
}

interface DB {
  users: User[];
  records: ValidationRecord[];
  keys: ApiKey[];
  jobs: BulkJob[];
  blocklist: string[];
  settings: Settings;
  seededAt: number;
}

const K = {
  db: "bx1_db",
  session: "bx1_session",
  version: "bx1_version",
};
const SCHEMA = 5;
const SALT = "bridge-modul-x-demo";

const digest = (pw: string) => {
  const s = pw + SALT;
  let h1 = hashStr(s);
  let h2 = hashStr(s.split("").reverse().join(""));
  return `${h1.toString(36)}.${h2.toString(36)}`;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const delay = (ms?: number) =>
  new Promise<void>((r) => setTimeout(r, ms ?? 280 + Math.random() * 320));

/* ---------------- persistence ---------------- */

let cache: DB | null = null;

function load(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(K.db);
    const ver = localStorage.getItem(K.version);
    if (raw && ver === String(SCHEMA)) {
      cache = JSON.parse(raw) as DB;
      return cache;
    }
  } catch {
    /* corrupted storage → reseed */
  }
  cache = seed();
  save();
  return cache;
}

function save() {
  if (!cache) return;
  try {
    localStorage.setItem(K.db, JSON.stringify(cache));
    localStorage.setItem(K.version, String(SCHEMA));
  } catch {
    /* storage full/blocked — demo continues in memory */
  }
}

export function resetDemoData() {
  localStorage.removeItem(K.db);
  localStorage.removeItem(K.version);
  cache = null;
  load();
}

/* ---------------- seed ---------------- */

const SEED_ADDRESSES = [
  "maya.chen@stripe.com", "jules@nordica.io", "dev@loopwell.app", "sofia@cartful.com",
  "billing@helixbio.com", "james@gmial.com", "promo@mailinator.com", "info@megacorp.com",
  "leads@yopmail.com", "anna@fjordline.no", "cto@nordpay.se", "ops@beacon.dev",
  "marcus@initech.com", "hello@vandelay.com", "priya@umbrella.co", "tom@starkind.com",
  "no.reply@dead-domain.io", "support@outlok.com", "growth@hooli.xyz", "qa@nullmx.test",
  "lena@brightline.co", "finance@globex.com", "sam@proton.me", "errors@sharklasers.com",
];

function seed(): DB {
  const now = Date.now();
  const day = 86400000;
  const rand = prng(20260214);

  const mkUser = (name: string, email: string, role: Role, credits: number, ageDays: number, status: "active" | "suspended" = "active"): User => ({
    id: uid(),
    name,
    email,
    passDigest: digest("demo1234"),
    role,
    status,
    credits,
    createdAt: now - ageDays * day - Math.floor(rand() * day),
  });

  const users: User[] = [
    mkUser("Ava Stone", "admin@bridge.demo", "admin", 99999, 210),
    mkUser("Noah Reyes", "user@bridge.demo", "user", 74, 34),
    mkUser("Lena Fischer", "lena@nordica.io", "user", 212, 96),
    mkUser("Marcus Ade", "marcus@loopmail.io", "user", 18, 61),
    mkUser("Sofia Reyes", "sofia@cartful.com", "user", 455, 148),
    mkUser("Jonas Weck", "jonas@nordpay.se", "user", 0, 22, "suspended"),
    mkUser("Priya Nair", "priya@helixbio.com", "user", 96, 12),
    mkUser("Tomás Rivera", "tomas@beacon.dev", "user", 31, 5),
  ];
  // stable ids → demo-data resets never orphan the active session
  const FIXED_IDS = ["u_admin", "u_demo", "u_lena", "u_marcus", "u_sofia", "u_jonas", "u_priya", "u_tomas"];
  users.forEach((u, i) => {
    u.id = FIXED_IDS[i] ?? `u_${i}`;
  });

  const enabled: Record<LayerKey, boolean> = {
    syntax: true, dns: true, mx: true, disposable: true, catchall: true, smtp: true, scoring: true,
  };
  const opts: EngineOptions = { blocklist: DISPOSABLE_SEED, enabled };

  const records: ValidationRecord[] = [];
  users.forEach((u, ui) => {
    const volume = u.role === "admin" ? 26 : [0, 38, 22, 14, 44, 6, 11, 8][ui] ?? 10;
    for (let i = 0; i < volume; i++) {
      const email = SEED_ADDRESSES[Math.floor(rand() * SEED_ADDRESSES.length)];
      const v = judge(email, opts);
      // ≥5 min old: seeded records can never collide with the 60s rate-limit window
      const ts = now - 300000 - Math.floor(rand() * 14 * day) - Math.floor(rand() * day * 0.9);
      records.push({
        id: uid(),
        userId: u.id,
        email: v.email,
        status: v.status,
        score: v.score,
        totalMs: v.totalMs,
        layers: v.layers,
        ts,
        mode: "deep",
      });
    }
  });
  records.sort((a, b) => b.ts - a.ts);

  const demoUser = users[1];
  const keys: ApiKey[] = [
    {
      id: uid(),
      userId: demoUser.id,
      label: "Production — signup form",
      key: `bx_live_${uid()}${uid()}${uid()}`,
      createdAt: now - 21 * day,
      lastUsedAt: now - 2 * 3600000,
      revokedAt: null,
    },
    {
      id: uid(),
      userId: demoUser.id,
      label: "Staging — nightly list clean",
      key: `bx_live_${uid()}${uid()}${uid()}`,
      createdAt: now - 9 * day,
      lastUsedAt: null,
      revokedAt: null,
    },
  ];

  // one completed bulk job for the demo user, so the Jobs panel tells a story
  const jobRows = SEED_ADDRESSES.slice(0, 12).map((a) => {
    const v = judge(a, opts);
    return { email: v.email, status: v.status, score: v.score };
  });
  const jobs: BulkJob[] = [
    {
      id: "job_seed",
      userId: demoUser.id,
      total: jobRows.length,
      processed: jobRows.length,
      valid: jobRows.filter((r) => r.status === "valid").length,
      risky: jobRows.filter((r) => r.status === "risky").length,
      invalid: jobRows.filter((r) => r.status === "invalid").length,
      status: "completed",
      startedAt: now - 3 * day - 3600000,
      finishedAt: now - 3 * day - 3540000,
      rows: jobRows,
    },
  ];

  return {
    users,
    records: records.slice(0, 400),
    keys,
    jobs,
    blocklist: [...DISPOSABLE_SEED],
    settings: { creditsOnSignup: 25, enabled },
    seededAt: now,
  };
}

/* ---------------- error helper ---------------- */

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/* ---------------- session ---------------- */

export function currentUserId(): string | null {
  return localStorage.getItem(K.session);
}

export async function fetchSessionUser(): Promise<User | null> {
  await delay(120);
  const id = currentUserId();
  if (!id) return null;
  const u = load().users.find((x) => x.id === id);
  if (!u || u.status === "suspended") {
    localStorage.removeItem(K.session);
    return null;
  }
  return { ...u };
}

/* ---------------- auth ---------------- */

export async function apiLogin(email: string, password: string): Promise<User> {
  await delay();
  const db = load();
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.passDigest !== digest(password))
    throw new ApiError("auth", "Invalid email or password.");
  if (u.status === "suspended")
    throw new ApiError("suspended", "This account is suspended. Contact support@bridgemodulx.io.");
  localStorage.setItem(K.session, u.id);
  return { ...u };
}

export async function apiSignup(name: string, email: string, password: string): Promise<User> {
  await delay();
  const db = load();
  const em = email.trim().toLowerCase();
  if (name.trim().length < 2) throw new ApiError("validation", "Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))
    throw new ApiError("validation", "That email address doesn't look valid.");
  if (password.length < 8)
    throw new ApiError("validation", "Password must be at least 8 characters.");
  if (db.users.some((u) => u.email.toLowerCase() === em))
    throw new ApiError("exists", "An account with this email already exists.");
  const u: User = {
    id: uid(),
    name: name.trim(),
    email: em,
    passDigest: digest(password),
    role: "user",
    status: "active",
    credits: db.settings.creditsOnSignup,
    createdAt: Date.now(),
  };
  db.users.unshift(u);
  localStorage.setItem(K.session, u.id);
  save();
  return { ...u };
}

export function apiLogout() {
  localStorage.removeItem(K.session);
}

export async function apiUpdateProfile(userId: string, patch: { name?: string; email?: string }): Promise<User> {
  await delay();
  const db = load();
  const u = db.users.find((x) => x.id === userId);
  if (!u) throw new ApiError("auth", "Session expired.");
  if (patch.email !== undefined) {
    const em = patch.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))
      throw new ApiError("validation", "That email address doesn't look valid.");
    if (db.users.some((x) => x.id !== userId && x.email.toLowerCase() === em))
      throw new ApiError("exists", "That email is already in use.");
    u.email = em;
  }
  if (patch.name !== undefined) {
    if (patch.name.trim().length < 2) throw new ApiError("validation", "Name is too short.");
    u.name = patch.name.trim();
  }
  save();
  return { ...u };
}

export async function apiChangePassword(userId: string, current: string, next: string): Promise<void> {
  await delay();
  const db = load();
  const u = db.users.find((x) => x.id === userId);
  if (!u) throw new ApiError("auth", "Session expired.");
  if (u.passDigest !== digest(current)) throw new ApiError("auth", "Current password is incorrect.");
  if (next.length < 8) throw new ApiError("validation", "New password must be at least 8 characters.");
  u.passDigest = digest(next);
  save();
}

/* ---------------- validation ---------------- */

function engineOpts(db: DB): EngineOptions {
  return { blocklist: db.blocklist, enabled: db.settings.enabled };
}

export const RATE_LIMIT_PER_MIN = 15;

export async function apiValidate(
  user: User,
  email: string,
  opts?: { quick?: boolean }
): Promise<{ verdict: Verdict; record: ValidationRecord }> {
  const db = load();
  const quick = !!opts?.quick;
  const verdict = quick ? judgeQuick(email, engineOpts(db)) : judge(email, engineOpts(db));
  // simulate the network + probe time, compressed for UI
  await delay(quick ? 200 : Math.min(900, 260 + verdict.totalMs));

  const u = db.users.find((x) => x.id === user.id);
  if (!u) throw new ApiError("auth", "Session expired.");

  // rate limiting (parity with the reference API middleware)
  const windowStart = Date.now() - 60000;
  const recent = db.records.filter((r) => r.userId === u.id && r.ts >= windowStart).length;
  if (recent >= RATE_LIMIT_PER_MIN)
    throw new ApiError(
      "rate",
      `Rate limit reached — ${RATE_LIMIT_PER_MIN} checks/minute. Give it a few seconds and retry.`
    );

  if (u.role !== "admin" && !quick) {
    if (u.credits <= 0)
      throw new ApiError("credits", "You're out of validation credits. Ask an admin for more, or upgrade.");
    u.credits -= 1;
  }
  const record: ValidationRecord = {
    id: uid(),
    userId: u.id,
    email: verdict.email,
    status: verdict.status,
    score: verdict.score,
    totalMs: verdict.totalMs,
    layers: verdict.layers,
    ts: Date.now(),
    mode: quick ? "quick" : "deep",
  };
  db.records.unshift(record);
  if (db.records.length > 600) db.records.length = 600;
  save();
  return { verdict, record };
}

/** Bulk path — same accounting, compressed latency for queue runs. */
export async function apiValidateFast(user: User, email: string): Promise<{ verdict: Verdict; record: ValidationRecord }> {
  const db = load();
  const verdict = judge(email, engineOpts(db));
  await delay(36 + Math.random() * 60);
  const u = db.users.find((x) => x.id === user.id);
  if (!u) throw new ApiError("auth", "Session expired.");
  if (u.role !== "admin") {
    if (u.credits <= 0)
      throw new ApiError("credits", "Out of validation credits.");
    u.credits -= 1;
  }
  const record: ValidationRecord = {
    id: uid(),
    userId: u.id,
    email: verdict.email,
    status: verdict.status,
    score: verdict.score,
    totalMs: verdict.totalMs,
    layers: verdict.layers,
    ts: Date.now(),
    mode: "deep",
  };
  db.records.unshift(record);
  if (db.records.length > 600) db.records.length = 600;
  save();
  return { verdict, record };
}

export function touchKey(keyId: string) {
  const db = load();
  const k = db.keys.find((x) => x.id === keyId);
  if (k && !k.revokedAt) {
    k.lastUsedAt = Date.now();
    save();
  }
}

/* ---------------- history / stats ---------------- */

export interface HistoryQuery {
  userId?: string;
  search?: string;
  status?: VerdictStatus | "all";
  page: number;
  pageSize: number;
}

export interface HistoryPage {
  rows: ValidationRecord[];
  total: number;
  pages: number;
}

export async function apiHistory(q: HistoryQuery): Promise<HistoryPage> {
  await delay(220);
  const db = load();
  let rows = db.records;
  if (q.userId) rows = rows.filter((r) => r.userId === q.userId);
  if (q.status && q.status !== "all") rows = rows.filter((r) => r.status === q.status);
  if (q.search) {
    const s = q.search.trim().toLowerCase();
    rows = rows.filter((r) => r.email.includes(s));
  }
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / q.pageSize));
  const page = Math.min(q.page, pages);
  return { rows: rows.slice((page - 1) * q.pageSize, page * q.pageSize), total, pages };
}

export async function apiDeleteRecord(recordId: string): Promise<void> {
  await delay(200);
  const db = load();
  db.records = db.records.filter((r) => r.id !== recordId);
  save();
}

export function exportHistoryRows(rows: ValidationRecord[], users: Map<string, string>) {
  return rows.map((r) => [
    new Date(r.ts).toISOString(),
    users.get(r.userId) ?? "—",
    r.email,
    r.status,
    r.score,
    r.totalMs,
  ]);
}

export interface Stats {
  total: number;
  today: number;
  last7: number;
  split: Record<VerdictStatus, number>;
  series: { day: string; count: number }[];
  avgMs: number;
}

export async function apiStats(userId?: string): Promise<Stats> {
  await delay(260);
  const db = load();
  const rows = userId ? db.records.filter((r) => r.userId === userId) : db.records;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const split: Record<VerdictStatus, number> = { valid: 0, risky: 0, invalid: 0 };
  rows.forEach((r) => split[r.status]++);
  const series: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i).getTime();
    const d1 = d0 + 86400000;
    series.push({
      day: new Date(d0).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: rows.filter((r) => r.ts >= d0 && r.ts < d1).length,
    });
  }
  return {
    total: rows.length,
    today: rows.filter((r) => r.ts >= startToday).length,
    last7: series.slice(-7).reduce((s, d) => s + d.count, 0),
    split,
    series,
    avgMs: rows.length ? Math.round(rows.reduce((s, r) => s + r.totalMs, 0) / rows.length) : 0,
  };
}

/* ---------------- api keys ---------------- */

export async function apiListKeys(userId: string): Promise<ApiKey[]> {
  await delay(200);
  return load().keys.filter((k) => k.userId === userId).map((k) => ({ ...k }));
}

export async function apiCreateKey(userId: string, label: string): Promise<ApiKey> {
  await delay();
  const db = load();
  if (label.trim().length < 2) throw new ApiError("validation", "Give the key a short label.");
  const active = db.keys.filter((k) => k.userId === userId && !k.revokedAt);
  if (active.length >= 5) throw new ApiError("limit", "Maximum of 5 active keys. Revoke one first.");
  const k: ApiKey = {
    id: uid(),
    userId,
    label: label.trim(),
    key: `bx_live_${uid()}${uid()}${uid()}`,
    createdAt: Date.now(),
    lastUsedAt: null,
    revokedAt: null,
  };
  db.keys.unshift(k);
  save();
  return { ...k };
}

export async function apiRevokeKey(keyId: string): Promise<void> {
  await delay(220);
  const db = load();
  const k = db.keys.find((x) => x.id === keyId);
  if (!k) throw new ApiError("notfound", "Key not found.");
  k.revokedAt = Date.now();
  save();
}

/* ---------------- admin ---------------- */

export async function apiAdminUsers(): Promise<User[]> {
  await delay(300);
  return load().users.map((u) => ({ ...u }));
}

export async function apiAdminPatchUser(
  userId: string,
  patch: Partial<Pick<User, "credits" | "role" | "status" | "name">>
): Promise<User> {
  await delay(260);
  const db = load();
  const u = db.users.find((x) => x.id === userId);
  if (!u) throw new ApiError("notfound", "User not found.");
  if (patch.credits !== undefined) u.credits = Math.max(0, Math.round(patch.credits));
  if (patch.role) u.role = patch.role;
  if (patch.status) u.status = patch.status;
  if (patch.name !== undefined && patch.name.trim().length >= 2) u.name = patch.name.trim();
  save();
  return { ...u };
}

export async function apiAdminDeleteUser(userId: string): Promise<void> {
  await delay(320);
  const db = load();
  const u = db.users.find((x) => x.id === userId);
  if (!u) throw new ApiError("notfound", "User not found.");
  if (u.role === "admin") throw new ApiError("forbidden", "Admin accounts can't be deleted.");
  db.users = db.users.filter((x) => x.id !== userId);
  db.records = db.records.filter((r) => r.userId !== userId);
  db.keys = db.keys.filter((k) => k.userId !== userId);
  save();
}

export interface AdminOverview {
  users: number;
  active: number;
  suspended: number;
  validations: number;
  last7: number;
  creditsOutstanding: number;
  split: Record<VerdictStatus, number>;
  topUsers: { user: User; count: number }[];
  recentSignups: User[];
}

export async function apiAdminOverview(): Promise<AdminOverview> {
  await delay(320);
  const db = load();
  const week = Date.now() - 7 * 86400000;
  const split: Record<VerdictStatus, number> = { valid: 0, risky: 0, invalid: 0 };
  const perUser = new Map<string, number>();
  db.records.forEach((r) => {
    split[r.status]++;
    perUser.set(r.userId, (perUser.get(r.userId) ?? 0) + 1);
  });
  const topUsers = [...perUser.entries()]
    .map(([id, count]) => ({ user: db.users.find((u) => u.id === id)!, count }))
    .filter((x) => x.user)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return {
    users: db.users.length,
    active: db.users.filter((u) => u.status === "active").length,
    suspended: db.users.filter((u) => u.status === "suspended").length,
    validations: db.records.length,
    last7: db.records.filter((r) => r.ts >= week).length,
    creditsOutstanding: db.users.reduce((s, u) => s + (u.role === "admin" ? 0 : u.credits), 0),
    split,
    topUsers,
    recentSignups: [...db.users].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
  };
}

/* ---------------- blocklist & settings ---------------- */

export async function apiBlocklist(): Promise<string[]> {
  await delay(180);
  return [...load().blocklist];
}

export async function apiBlocklistAdd(domain: string): Promise<string[]> {
  await delay(220);
  const db = load();
  const d = domain.trim().toLowerCase().replace(/^@/, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d))
    throw new ApiError("validation", "Enter a valid domain, e.g. burnermail.io");
  if (db.blocklist.includes(d)) throw new ApiError("exists", `${d} is already blocked.`);
  db.blocklist.unshift(d);
  save();
  return [...db.blocklist];
}

export async function apiBlocklistRemove(domain: string): Promise<string[]> {
  await delay(180);
  const db = load();
  db.blocklist = db.blocklist.filter((d) => d !== domain);
  save();
  return [...db.blocklist];
}

export async function apiSettings(): Promise<Settings> {
  await delay(150);
  return JSON.parse(JSON.stringify(load().settings)) as Settings;
}

export async function apiSaveSettings(s: Settings): Promise<Settings> {
  await delay(300);
  const db = load();
  db.settings = {
    creditsOnSignup: Math.max(0, Math.min(10000, Math.round(s.creditsOnSignup))),
    enabled: { ...s.enabled },
  };
  save();
  return JSON.parse(JSON.stringify(db.settings)) as Settings;
}

/* ---------------- domain intelligence ---------------- */

export async function apiDomain(domain: string): Promise<DomainReport> {
  await delay(420 + Math.random() * 380);
  return domainReport(domain);
}

/* ---------------- bulk jobs (bulk_jobs parity) ---------------- */

export async function apiListJobs(userId: string): Promise<BulkJob[]> {
  await delay(240);
  return load()
    .jobs.filter((j) => j.userId === userId)
    .map((j) => ({ ...j }));
}

export async function apiStartJob(userId: string, total: number): Promise<BulkJob> {
  const db = load();
  const job: BulkJob = {
    id: `job_${uid()}`,
    userId,
    total,
    processed: 0,
    valid: 0,
    risky: 0,
    invalid: 0,
    status: "running",
    startedAt: Date.now(),
    finishedAt: null,
    rows: [],
  };
  db.jobs.unshift(job);
  if (db.jobs.length > 40) db.jobs.length = 40;
  save();
  return { ...job };
}

export async function apiFinishJob(
  jobId: string,
  patch: Pick<BulkJob, "processed" | "valid" | "risky" | "invalid" | "status" | "rows">
): Promise<void> {
  await delay(160);
  const db = load();
  const j = db.jobs.find((x) => x.id === jobId);
  if (!j) throw new ApiError("notfound", "Job not found.");
  Object.assign(j, patch, { finishedAt: Date.now() });
  save();
}
