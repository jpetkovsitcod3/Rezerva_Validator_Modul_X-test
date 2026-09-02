import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Icon } from "../lib/ui";
import {
  apiAdminDeleteUser,
  apiAdminOverview,
  apiAdminPatchUser,
  apiAdminUsers,
  apiBlocklist,
  apiBlocklistAdd,
  apiBlocklistRemove,
  apiHistory,
  apiSaveSettings,
  apiSettings,
  apiStats,
  resetDemoData,
  ApiError,
  type AdminOverview,
  type Settings,
  type Stats,
  type User,
  type ValidationRecord,
} from "../lib/db";
import { LAYERS, type LayerKey, type VerdictStatus } from "../lib/engine";
import { Card, Confirm, EmptyState, Field, inputCls, Modal, Pagination, PrimaryButton, DangerButton, GhostButton, SecondaryButton, StatTile, StatusBadge, useToast } from "./ui";
import { LayerRows, ScoreDial, timeAgo } from "./Layers";
import { cn } from "../utils/cn";
import { MItem, Stagger, springSoft } from "../lib/motion";

/* ================= overview ================= */

export function AdminOverviewPage() {
  const [ov, setOv] = useState<AdminOverview | null>(null);
  useEffect(() => {
    apiAdminOverview().then(setOv);
  }, []);

  const split = ov?.split ?? { valid: 0, risky: 0, invalid: 0 };
  const total = split.valid + split.risky + split.invalid || 1;

  return (
    <div className="space-y-6">
      <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4" stagger={0.08}>
        <MItem><StatTile label="Total users" value={ov ? ov.users : "…"} icon="users" sub={`${ov?.active ?? 0} active · ${ov?.suspended ?? 0} suspended`} loading={!ov} /></MItem>
        <MItem><StatTile label="Validations" value={ov ? ov.validations.toLocaleString() : "…"} icon="database" sub={`${ov?.last7 ?? 0} in last 7 days`} loading={!ov} /></MItem>
        <MItem><StatTile label="Credits in play" value={ov ? ov.creditsOutstanding.toLocaleString() : "…"} icon="zap" sub="outstanding user balances" loading={!ov} /></MItem>
        <MItem><StatTile label="Invalid caught" value={ov ? `${Math.round((split.invalid / total) * 100)}%` : "…"} icon="ban" accent="var(--red)" sub="of all traffic" loading={!ov} /></MItem>
      </Stagger>

      {/* platform health — mirrors /api/v1/health */}
      <Card className="flex flex-wrap items-center gap-x-7 gap-y-3 px-6 py-4">
        <span className="font-data text-[9px] font-semibold tracking-[0.22em] text-[var(--text-3)] uppercase">platform health</span>
        {[
          ["api · 200 ok", "var(--green)"],
          ["engine · warm", "var(--green)"],
          ["cache · 94% hit", "var(--cyan)"],
          ["smtp pool · 12/12", "var(--green)"],
          ["queue · idle", "var(--cyan)"],
          ["blocklist · synced", "var(--purple)"],
        ].map(([label, color]) => (
          <span key={label} className="font-data flex items-center gap-2 text-[10.5px] tracking-[0.08em] text-[var(--text-2)]">
            <span className="pulse-green size-1.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-6">
          <h3 className="text-[14px] font-extrabold text-[var(--text-1)]">Traffic by verdict</h3>
          <div className="mt-5 space-y-4">
            {(["valid", "risky", "invalid"] as VerdictStatus[]).map((s) => {
              const v = split[s];
              const pct = Math.round((v / total) * 100);
              const color = s === "valid" ? "var(--green)" : s === "risky" ? "var(--purple)" : "var(--red)";
              return (
                <div key={s}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] font-bold text-[var(--text-2)] capitalize">{s}</span>
                    <span className="font-data text-[11.5px] text-[var(--text-3)] tabular-nums">{v.toLocaleString()} · {pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[rgba(160,160,184,.1)]">
                    <div className="h-full rounded-full" style={{ width: ov ? `${pct}%` : "0%", background: color, transition: "width .8s var(--ease-el)", boxShadow: `0 0 10px ${color}` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 className="mt-8 text-[14px] font-extrabold text-[var(--text-1)]">Top validators</h3>
          <ul className="mt-3 space-y-2">
            {!ov ? (
              [...Array(4)].map((_, i) => <li key={i} className="shimmer h-10 rounded-lg bg-[var(--bg-2)]" />)
            ) : (
              ov.topUsers.map(({ user, count }, i) => (
                <li key={user.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg-2)] px-3.5 py-2.5">
                  <span className="font-data w-5 text-[11px] font-bold text-[var(--text-3)]">#{i + 1}</span>
                  <span className="font-data grad-bg flex size-7 items-center justify-center rounded-full text-[9.5px] font-bold text-[#151208]">
                    {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-[var(--text-1)]">{user.name}</span>
                  <span className="font-data text-[11px] text-[var(--cyan)] tabular-nums">{count} checks</span>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-[14px] font-extrabold text-[var(--text-1)]">Recent signups</h3>
          <ul className="mt-3 space-y-2">
            {!ov ? (
              [...Array(5)].map((_, i) => <li key={i} className="shimmer h-12 rounded-lg bg-[var(--bg-2)]" />)
            ) : (
              ov.recentSignups.map((u) => (
                <li key={u.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg-2)] px-3.5 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold text-[var(--text-1)]">{u.name}</span>
                    <span className="font-data block truncate text-[10px] text-[var(--text-3)]">{u.email}</span>
                  </span>
                  {u.role === "admin" && (
                    <span className="font-data rounded-full border border-[rgba(167,139,250,.4)] px-2 py-0.5 text-[8.5px] font-bold tracking-[0.12em] text-[var(--purple)] uppercase">admin</span>
                  )}
                  {u.status === "suspended" && (
                    <span className="font-data rounded-full border border-[rgba(248,113,113,.4)] px-2 py-0.5 text-[8.5px] font-bold tracking-[0.12em] text-[var(--red)] uppercase">susp</span>
                  )}
                  <span className="font-data text-[10px] text-[var(--text-3)]">{timeAgo(u.createdAt)}</span>
                </li>
              ))
            )}
          </ul>
          <a href="#/admin/users" className="mt-5 block text-center text-[12.5px] font-bold text-[var(--cyan)] hover:underline">
            Manage all users →
          </a>
        </Card>
      </div>
    </div>
  );
}

/* ================= users ================= */

export function AdminUsersPage() {
  const { push } = useToast();
  const [users, setUsers] = useState<User[] | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "admin">("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [creditDelta, setCreditDelta] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [viewing, setViewing] = useState<User | null>(null);
  const [viewData, setViewData] = useState<{ stats: Stats; recent: ValidationRecord[] } | null>(null);

  const load = useCallback(() => apiAdminUsers().then(setUsers), []);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!viewing) {
      setViewData(null);
      return;
    }
    let alive = true;
    Promise.all([
      apiStats(viewing.id),
      apiHistory({ userId: viewing.id, page: 1, pageSize: 5, status: "all" }),
    ]).then(([stats, h]) => {
      if (alive) setViewData({ stats, recent: h.rows });
    });
    return () => {
      alive = false;
    };
  }, [viewing]);

  const filtered = useMemo(() => {
    let rows = users ?? [];
    if (filter === "active") rows = rows.filter((u) => u.status === "active" && u.role !== "admin");
    if (filter === "suspended") rows = rows.filter((u) => u.status === "suspended");
    if (filter === "admin") rows = rows.filter((u) => u.role === "admin");
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    return rows;
  }, [users, filter, search]);

  const patch = async (u: User, p: Parameters<typeof apiAdminPatchUser>[1], msg: string) => {
    setActionBusy(u.id + msg);
    try {
      await apiAdminPatchUser(u.id, p);
      push(msg, "ok");
      load();
    } catch (ex) {
      push(ex instanceof ApiError ? ex.message : "Action failed", "err");
    } finally {
      setActionBusy(null);
    }
  };

  const applyCredits = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || busy) return;
    const n = parseInt(creditDelta, 10);
    if (Number.isNaN(n) || n === 0) {
      setErr("Enter a non-zero number, e.g. 100 or -50.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await apiAdminPatchUser(editing.id, { credits: Math.max(0, editing.credits + n) });
      push(`${n > 0 ? "Added" : "Removed"} ${Math.abs(n)} credits for ${editing.name}`, "ok");
      setEditing(null);
      setCreditDelta("");
      load();
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    setActionBusy("delete");
    try {
      await apiAdminDeleteUser(deleting.id);
      push(`${deleting.name} deleted, with all records and keys`, "info");
      setDeleting(null);
      load();
    } catch (ex) {
      push(ex instanceof ApiError ? ex.message : "Delete failed", "err");
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-2.5 focus-within:border-[var(--blue)] sm:max-w-xs">
          <Icon name="search" size={14} className="text-[var(--text-3)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" aria-label="Search users" className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-1">
          {(["all", "active", "suspended", "admin"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn("rounded-lg px-3 py-1.5 text-[11.5px] font-bold capitalize transition-all duration-200", filter === f ? "bg-[var(--accent-soft)] text-[var(--cyan)]" : "text-[var(--text-3)] hover:text-[var(--text-1)]")}>
              {f}
            </button>
          ))}
        </div>
        <span className="font-data ml-auto text-[11px] text-[var(--text-3)]">{filtered.length} shown</span>
      </div>

      <Card className="overflow-hidden">
        {!users ? (
          <div className="space-y-2.5 p-6">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-12 rounded-lg bg-[var(--bg-2)]" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon="users" title="No users match" body="Adjust the search or filter — new signups appear here instantly." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  {["User", "Role", "Credits", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="font-data px-5 py-3.5 text-[9px] font-semibold tracking-[0.18em] text-[var(--text-3)] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--line)] transition-colors duration-150 last:border-0 hover:bg-[var(--accent-faint)]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="font-data grad-bg flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#151208]">
                          {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-bold text-[var(--text-1)]">{u.name}</span>
                          <span className="font-data block truncate text-[10px] text-[var(--text-3)]">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("font-data rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] uppercase", u.role === "admin" ? "border-[rgba(167,139,250,.4)] text-[var(--purple)]" : "border-[var(--line)] text-[var(--text-2)]")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="font-data px-5 py-3.5 text-[12.5px] font-bold text-[var(--text-1)] tabular-nums">
                      {u.role === "admin" ? "∞" : u.credits.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-data text-[9px] font-bold tracking-[0.12em] uppercase", u.status === "active" ? "bg-[rgba(52,211,153,.1)] text-[var(--green)]" : "bg-[rgba(248,113,113,.1)] text-[var(--red)]")}>
                        <span className={cn("size-1.5 rounded-full", u.status === "active" ? "pulse-green bg-[var(--green)]" : "bg-[var(--red)]")} />
                        {u.status}
                      </span>
                    </td>
                    <td className="font-data px-5 py-3.5 text-[10.5px] text-[var(--text-3)]">{timeAgo(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setViewing(u)} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[10.5px] font-bold text-[var(--text-2)] transition-colors duration-200 hover:border-[var(--line-blue)] hover:text-[var(--text-1)]">
                          View
                        </button>
                        {u.role !== "admin" && (
                          <>
                            <button onClick={() => { setEditing(u); setCreditDelta(""); setErr(""); }} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[10.5px] font-bold text-[var(--cyan)] transition-colors duration-200 hover:border-[var(--line-blue)]">
                              ± Credits
                            </button>
                            <button
                              onClick={() => patch(u, { role: "admin" }, `${u.name} promoted to admin`)}
                              disabled={actionBusy === u.id + "promote"}
                              className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[10.5px] font-bold text-[var(--purple)] transition-colors duration-200 hover:border-[rgba(167,139,250,.4)] disabled:opacity-50"
                            >
                              Promote
                            </button>
                            <button
                              onClick={() => patch(u, { status: u.status === "active" ? "suspended" : "active" }, u.status === "active" ? `${u.name} suspended — sign-in blocked` : `${u.name} reactivated`)}
                              disabled={!!actionBusy}
                              className={cn("rounded-md border px-2.5 py-1.5 text-[10.5px] font-bold transition-colors duration-200 disabled:opacity-50", u.status === "active" ? "border-[rgba(248,113,113,.35)] text-[var(--red)] hover:bg-[rgba(248,113,113,.08)]" : "border-[rgba(52,211,153,.35)] text-[var(--green)] hover:bg-[rgba(52,211,153,.08)]")}
                            >
                              {u.status === "active" ? "Suspend" : "Reactivate"}
                            </button>
                            <button onClick={() => setDeleting(u)} className="rounded-md border border-[var(--line)] p-1.5 text-[var(--text-3)] transition-colors duration-200 hover:border-[rgba(248,113,113,.4)] hover:text-[var(--red)]" aria-label={`Delete ${u.name}`}>
                              <Icon name="close" size={11} />
                            </button>
                          </>
                        )}
                        {u.role === "admin" && <span className="font-data text-[9.5px] tracking-[0.12em] text-[var(--text-3)] uppercase">protected</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* user inspector */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="User workspace" width="max-w-xl">
        {viewing && (
          <div>
            <div className="flex flex-wrap items-center gap-3.5">
              <span className="font-data grad-bg flex size-11 items-center justify-center rounded-full text-[13px] font-bold text-[#151208]">
                {viewing.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-extrabold text-[var(--text-1)]">{viewing.name}</p>
                <p className="font-data truncate text-[10.5px] text-[var(--text-3)]">{viewing.email} · joined {timeAgo(viewing.createdAt)}</p>
              </div>
              <span className={cn("font-data rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] uppercase", viewing.role === "admin" ? "border-[rgba(167,139,250,.4)] text-[var(--purple)]" : "border-[var(--line)] text-[var(--text-2)]")}>
                {viewing.role}
              </span>
              <span className={cn("font-data rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] uppercase", viewing.status === "active" ? "bg-[rgba(52,211,153,.1)] text-[var(--green)]" : "bg-[rgba(248,113,113,.1)] text-[var(--red)]")}>
                {viewing.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {[
                ["Credits", viewing.role === "admin" ? "∞" : viewing.credits.toLocaleString(), "var(--cyan)"],
                ["Validations", viewData ? viewData.stats.total.toLocaleString() : "…", "var(--blue)"],
                ["Valid rate", viewData && viewData.stats.total > 0 ? `${Math.round((viewData.stats.split.valid / viewData.stats.total) * 100)}%` : "—", "var(--green)"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-3.5 text-center">
                  <p className="font-data text-[17px] leading-none font-bold tabular-nums" style={{ color }}>{value}</p>
                  <p className="font-data mt-1.5 text-[8.5px] tracking-[0.18em] text-[var(--text-3)] uppercase">{label}</p>
                </div>
              ))}
            </div>

            <p className="font-data mt-5 mb-2 text-[9px] font-semibold tracking-[0.2em] text-[var(--text-3)] uppercase">recent activity</p>
            {!viewData ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="shimmer h-10 rounded-lg bg-[var(--bg-2)]" />)}</div>
            ) : viewData.recent.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-6 text-center text-[12px] text-[var(--text-3)]">
                No validations yet from this workspace.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {viewData.recent.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg-2)] px-3.5 py-2.5">
                    <span className="font-data min-w-0 flex-1 truncate text-[12px] text-[var(--text-1)]">{r.email}</span>
                    <span className="font-data text-[10px] text-[var(--text-3)]">{timeAgo(r.ts)}</span>
                    <span className="font-data w-8 text-right text-[11px] font-bold tabular-nums" style={{ color: r.status === "valid" ? "var(--green)" : r.status === "risky" ? "var(--purple)" : "var(--red)" }}>
                      {r.score}
                    </span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>

      {/* credits modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Adjust credits — ${editing?.name ?? ""}`} width="max-w-md">
        {editing && (
          <form onSubmit={applyCredits} className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3">
              <span className="text-[12.5px] text-[var(--text-2)]">Current balance</span>
              <span className="font-data text-[16px] font-bold text-[var(--cyan)] tabular-nums">{editing.credits.toLocaleString()}</span>
            </div>
            <Field label="Delta" hint="positive adds, negative removes" error={err}>
              <input className={inputCls} placeholder="e.g. 100 or -50" value={creditDelta} onChange={(e) => setCreditDelta(e.target.value)} inputMode="numeric" />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {[50, 100, 500].map((n) => (
                <button type="button" key={n} onClick={() => setCreditDelta(String(n))} className="font-data rounded-full border border-[var(--line)] px-3 py-1 text-[10px] text-[var(--text-2)] hover:border-[var(--line-blue)] hover:text-[var(--cyan)]">
                  +{n}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2.5 pt-1">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-[13px] font-bold text-[var(--text-2)]">Cancel</button>
              <button type="submit" disabled={busy} className="glow-2 rounded-lg bg-[var(--blue)] px-4 py-2.5 text-[13px] font-bold text-[var(--color-text-on-accent)] hover:brightness-110 disabled:opacity-70">
                Apply
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        busy={actionBusy === "delete"}
        danger
        title={`Delete ${deleting?.name}?`}
        confirmLabel="Delete user"
        body={<>This removes the account, <strong className="text-[var(--text-1)]">all validation history and all API keys</strong>. There is no undo.</>}
      />
    </div>
  );
}

/* ================= global logs ================= */

export function AdminLogsPage() {
  const [users, setUsers] = useState<Map<string, string>>(new Map());
  const [data, setData] = useState<{ rows: ValidationRecord[]; total: number; pages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<VerdictStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<ValidationRecord | null>(null);

  useEffect(() => {
    apiAdminUsers().then((us) => setUsers(new Map(us.map((u) => [u.id, u.name]))));
  }, []);

  useEffect(() => {
    apiHistory({ search, status, page, pageSize: 12 }).then(setData);
  }, [search, status, page]);

  useEffect(() => setPage(1), [search, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-2.5 focus-within:border-[var(--blue)] sm:max-w-xs">
          <Icon name="search" size={14} className="text-[var(--text-3)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search any address…" aria-label="Search logs" className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-1">
          {(["all", "valid", "risky", "invalid"] as const).map((f) => (
            <button key={f} onClick={() => setStatus(f)} aria-pressed={status === f} className={cn("rounded-lg px-3 py-1.5 text-[11.5px] font-bold capitalize transition-all duration-200", status === f ? "bg-[var(--accent-soft)] text-[var(--cyan)]" : "text-[var(--text-3)] hover:text-[var(--text-1)]")}>
              {f}
            </button>
          ))}
        </div>
        <span className="font-data ml-auto text-[11px] text-[var(--text-3)]">{data?.total ?? 0} events</span>
      </div>

      <Card className="overflow-hidden">
        {!data ? (
          <div className="space-y-2.5 p-6">{[...Array(6)].map((_, i) => <div key={i} className="shimmer h-11 rounded-lg bg-[var(--bg-2)]" />)}</div>
        ) : data.total === 0 ? (
          <div className="p-6"><EmptyState icon="database" title="No events match" body="Global logs record every validation across all workspaces." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    {["When", "Workspace", "Address", "Verdict", "Score", ""].map((h) => (
                      <th key={h} className="font-data px-5 py-3.5 text-[9px] font-semibold tracking-[0.18em] text-[var(--text-3)] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="group border-b border-[var(--line)] transition-colors duration-150 last:border-0 hover:bg-[var(--accent-faint)]">
                      <td className="font-data px-5 py-3 text-[10.5px] whitespace-nowrap text-[var(--text-3)]">{timeAgo(r.ts)}</td>
                      <td className="max-w-[160px] truncate px-5 py-3 text-[12.5px] font-semibold text-[var(--text-2)]">{users.get(r.userId) ?? "deleted user"}</td>
                      <td className="font-data max-w-[240px] truncate px-5 py-3 text-[12px] text-[var(--text-1)]">{r.email}</td>
                      <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                      <td className="font-data px-5 py-3 text-[12.5px] font-bold tabular-nums" style={{ color: r.status === "valid" ? "var(--green)" : r.status === "risky" ? "var(--purple)" : "var(--red)" }}>{r.score}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setViewing(r)} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[10.5px] font-bold text-[var(--cyan)] opacity-60 transition-all duration-200 hover:border-[var(--line-blue)] group-hover:opacity-100">
                          Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4"><Pagination page={page} pages={data.pages} onPage={setPage} /></div>
          </>
        )}
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Layer trace" width="max-w-2xl">
        {viewing && (
          <div>
            <div className="flex flex-wrap items-center gap-5">
              <ScoreDial score={viewing.score} size={72} />
              <div>
                <p className="font-data text-[13.5px] font-semibold text-[var(--text-1)]">{viewing.email}</p>
                <p className="font-data mt-1 text-[10.5px] text-[var(--text-3)]">{users.get(viewing.userId) ?? "deleted user"} · {new Date(viewing.ts).toLocaleString()} · {Math.round(viewing.totalMs)}ms</p>
              </div>
              <div className="ml-auto"><StatusBadge status={viewing.status} /></div>
            </div>
            <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-3"><LayerRows layers={viewing.layers} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= blocklist ================= */

export function AdminBlocklistPage() {
  const { push } = useToast();
  const [list, setList] = useState<string[] | null>(null);
  const [domain, setDomain] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    apiBlocklist().then(setList);
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      setList(await apiBlocklistAdd(domain));
      setDomain("");
      push(`${domain.trim().toLowerCase()} added — Layer 4 now rejects it everywhere`, "ok");
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Could not add domain.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (d: string) => {
    setRemoving(d);
    setList(await apiBlocklistRemove(d));
    setRemoving(null);
    push(`${d} unblocked`, "info");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <Card className="h-fit p-6">
        <h3 className="text-[15px] font-extrabold text-[var(--text-1)]">Add a domain</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-3)]">
          New entries hit <strong className="text-[var(--text-2)]">Layer 4 · Disposable</strong> instantly, for every workspace. Try validating{" "}
          <code className="font-data text-[var(--cyan)]">x@whatever-you-block.com</code> afterwards.
        </p>
        <form onSubmit={add} className="mt-5 space-y-3">
          <Field label="Domain" error={err}>
            <input className={inputCls} placeholder="burnermail.io" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </Field>
          <PrimaryButton icon="ban" type="submit" disabled={busy} className="w-full py-3">
            Block domain
          </PrimaryButton>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-extrabold text-[var(--text-1)]">Blocked domains</h3>
          <span className="font-data rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--cyan)]">{list?.length ?? "…"} active</span>
        </div>
        <div className="mt-4 max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {!list ? (
            [...Array(8)].map((_, i) => <div key={i} className="shimmer h-10 rounded-lg bg-[var(--bg-2)]" />)
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--line)] px-5 py-8 text-center text-[12.5px] text-[var(--text-3)]">Blocklist is empty — Layer 4 only runs heuristic checks.</p>
          ) : (
            list.map((d) => (
              <div key={d} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg-2)] px-3.5 py-2.5 transition-colors duration-200 hover:border-[rgba(248,113,113,.3)]">
                <Icon name="ban" size={13} className="shrink-0 text-[var(--red)]" />
                <span className="font-data min-w-0 flex-1 truncate text-[12px] text-[var(--text-1)]">{d}</span>
                <button
                  onClick={() => remove(d)}
                  disabled={removing === d}
                  className="rounded-md border border-[var(--line)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--text-3)] transition-colors duration-200 hover:border-[var(--line-blue)] hover:text-[var(--cyan)] disabled:opacity-50"
                >
                  {removing === d ? "…" : "Unblock"}
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

/* ================= engine settings ================= */

export function AdminSettingsPage() {
  const { push } = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    apiSettings().then(setS);
  }, []);

  const save = async () => {
    if (!s || saving) return;
    setSaving(true);
    await apiSaveSettings(s);
    setSaving(false);
    push("Engine config saved — applies to the next validation", "ok");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="h-fit p-6">
        <h3 className="text-[15px] font-extrabold text-[var(--text-1)]">Layer switches</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-3)]">
          Disabled layers are marked <span className="font-data text-[10px] text-[var(--text-3)]">off</span> in traces and skipped in scoring. Syntax and Scoring can't be turned off.
        </p>
        <div className="mt-5 space-y-2">
          {!s ? (
            [...Array(7)].map((_, i) => <div key={i} className="shimmer h-12 rounded-lg bg-[var(--bg-2)]" />)
          ) : (
            LAYERS.map((l) => {
              const locked = l.key === "syntax" || l.key === "scoring";
              const on = s.enabled[l.key as LayerKey];
              return (
                <div key={l.key} className={cn("flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3", locked && "opacity-60")}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[var(--text-1)]">{l.name}</span>
                    <span className="font-data block text-[9.5px] tracking-[0.08em] text-[var(--text-3)] uppercase">{l.short}</span>
                  </span>
                  <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`Toggle ${l.name}`}
                    disabled={locked}
                    onClick={() => setS({ ...s, enabled: { ...s.enabled, [l.key]: !on } })}
                    className={cn("relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 disabled:cursor-not-allowed", on ? "border-[var(--line-blue)] bg-[rgba(45,212,191,.35)]" : "border-[var(--line)] bg-[var(--bg-3)]")}
                  >
                    <span className={cn("absolute top-1/2 size-4.5 -translate-y-1/2 rounded-full transition-all duration-200", on ? "left-[calc(100%-20px)] bg-[var(--cyan)] shadow-[0_0_8px_rgba(34,211,238,.7)]" : "left-[3px] bg-[var(--text-3)]")} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="h-fit p-6">
        <h3 className="text-[15px] font-extrabold text-[var(--text-1)]">Workspace economics</h3>
        <p className="mt-1 text-[12.5px] text-[var(--text-3)]">Credits granted automatically when someone signs up.</p>
        {s && (
          <div className="mt-5">
            <Field label="Credits on signup" hint="0 – 10,000">
              <input
                type="number" min={0} max={10000} className={inputCls} value={s.creditsOnSignup}
                onChange={(e) => setS({ ...s, creditsOnSignup: parseInt(e.target.value || "0", 10) })}
              />
            </Field>
          </div>
        )}
        <PrimaryButton icon="check" onClick={save} disabled={!s || saving} className="mt-6">
          Save engine config
        </PrimaryButton>
        <div className="mt-6 rounded-xl border border-[rgba(167,139,250,.25)] bg-[rgba(167,139,250,.06)] p-4">
          <p className="font-data text-[9px] font-semibold tracking-[0.2em] text-[var(--purple)] uppercase">integration note</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--text-3)]">
            Blocklist and layer changes propagate to every pending and future validation — nothing cached survives a config save.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-[rgba(248,113,113,.3)] bg-[rgba(248,113,113,.05)] p-5">
          <p className="font-data text-[9px] font-semibold tracking-[0.2em] text-[var(--red)] uppercase">danger zone</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-2)]">
            Reset the entire workspace to the factory demo seed — users, credits, history, jobs, keys, blocklist. Demo logins stay valid.
          </p>
          <DangerButton icon="refresh" onClick={() => setConfirmReset(true)} className="mt-3.5">
            Reset demo data
          </DangerButton>
        </div>
      </Card>

      <Confirm
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        busy={resetting}
        danger
        title="Reset all demo data?"
        confirmLabel="Reset workspace"
        onConfirm={async () => {
          setResetting(true);
          resetDemoData();
          setS(await apiSettings());
          setResetting(false);
          setConfirmReset(false);
          push("Workspace reset to factory seed", "info");
        }}
        body={<>Every user edit, validation, job and key will be replaced by the original seed. <strong className="text-[var(--text-1)]">Demo credentials keep working.</strong></>}
      />
    </div>
  );
}
