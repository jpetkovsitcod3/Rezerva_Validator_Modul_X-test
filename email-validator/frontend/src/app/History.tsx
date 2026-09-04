import { useCallback, useEffect, useRef, startTransition, useState, ViewTransition } from "react";
import { Icon } from "../lib/ui";
import { useAuth } from "../lib/auth";
import { RouteTransition } from "../lib/route-transition";
import { apiDeleteRecord, apiHistory, type HistoryPage, type ValidationRecord } from "../lib/db";
import { downloadCSV, toCSV, type VerdictStatus } from "../lib/engine";
import { Card, Confirm, EmptyState, GhostButton, Modal, Pagination, StatusBadge, useToast } from "./ui";
import { LayerRows, ScoreDial, timeAgo } from "./Layers";
import { cn } from "../utils/cn";

const PAGE_SIZE = 9;
const FILTERS: { key: VerdictStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "valid", label: "Valid" },
  { key: "risky", label: "Risky" },
  { key: "invalid", label: "Invalid" },
];

export default function History() {
  const { user } = useAuth();
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VerdictStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HistoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<ValidationRecord | null>(null);
  const [deleting, setDeleting] = useState<ValidationRecord | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const h = await apiHistory({ userId: user.id, search, status, page, pageSize: PAGE_SIZE });
    if (firstLoad.current) {
      firstLoad.current = false;
      // Reveal the first table inside a Transition so the skeleton→table
      // swap animates; refetches (filters/pagination) stay silent.
      startTransition(() => {
        setData(h);
        setLoading(false);
      });
    } else {
      setData(h);
      setLoading(false);
    }
  }, [user, search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [search, status]);

  const openTrace = (r: ValidationRecord) => {
    setViewing(r);
  };
  const closeTrace = () => {
    setViewing(null);
  };

  const doDelete = async () => {
    if (!deleting) return;
    setBusyDelete(true);
    await apiDeleteRecord(deleting.id);
    setBusyDelete(false);
    setDeleting(null);
    push("Validation deleted from history", "info");
    load();
  };

  const exportAll = async () => {
    if (!user || exporting) return;
    setExporting(true);
    const h = await apiHistory({ userId: user.id, search, status, page: 1, pageSize: 10000 });
    downloadCSV(
      `bridge-history-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(
        ["checked_at", "email", "status", "score", "total_ms"],
        h.rows.map((r) => [new Date(r.ts).toISOString(), r.email, r.status, r.score, r.totalMs])
      )
    );
    setExporting(false);
    push(`Exported ${h.rows.length} rows to CSV`, "ok");
  };

  return (
    <RouteTransition>
      <div className="space-y-5">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 transition-colors duration-200 focus-within:border-[#D4A574]/40 sm:max-w-xs">
            <Icon name="search" size={14} className="shrink-0 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search addresses..."
              aria-label="Search history"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-[var(--line-secondary)] bg-[var(--bg-2)] p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                aria-pressed={status === f.key}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition-all duration-200",
                  status === f.key ? "bg-[var(--accent-soft)] text-[var(--cyan)]" : "text-white/30 hover:text-white"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <GhostButton
            icon="arrowDown"
            onClick={exportAll}
            disabled={exporting || !data || data.total === 0}
            className="ml-auto text-[12.5px]"
          >
            {exporting ? "Exporting..." : `Export CSV${data && data.total ? ` (${data.total})` : ""}`}
          </GhostButton>
        </div>

        {/* table */}
        <Card className="overflow-hidden">
          {loading ? (
            <ViewTransition exit="slide-down">
              <div className="space-y-2.5 p-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="shimmer h-12 rounded-lg bg-[var(--bg-2)]" />
                ))}
              </div>
            </ViewTransition>
          ) : !data || data.total === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={search || status !== "all" ? "search" : "clock"}
                title={search || status !== "all" ? "No matches" : "History is empty"}
                body={
                  search || status !== "all"
                    ? "Nothing matches this filter. Loosen it up and try again."
                    : "Every validation you run is stored here with its full layer trace."
                }
                action={
                  !search && status === "all" ? (
                    <a href="#/app/validator" className="rounded-md bg-[#111111] px-5 py-2.5 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#333333]">
                      Run your first check
                    </a>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <ViewTransition enter="slide-up" default="none">
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-b border-[var(--line)]">
                        {["Address", "Verdict", "Score", "Latency", "Checked", ""].map((h) => (
                          <th key={h} className="font-data px-5 py-3.5 text-[9px] font-semibold tracking-[0.18em] text-white/30 uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((r) => (
                        <tr key={r.id} className="group border-b border-[var(--line)] transition-colors duration-150 last:border-0 hover:bg-[var(--accent-faint)]">
                          <td className="font-data max-w-[260px] truncate px-5 py-3.5 text-[12.5px] font-semibold text-white">{r.email}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                          <td className="px-5 py-3.5">
                            <span className="font-data text-[13px] font-bold tabular-nums" style={{ color: r.status === "valid" ? "var(--green)" : r.status === "risky" ? "var(--amber)" : "var(--red)" }}>
                              {r.score}
                            </span>
                          </td>
                          <td className="font-data px-5 py-3.5 text-[11.5px] text-white/50 tabular-nums">{Math.round(r.totalMs)}ms</td>
                          <td className="font-data px-5 py-3.5 text-[11px] text-white/30">
                            {timeAgo(r.ts)}
                            <span className="ml-2 rounded border border-[var(--line)] px-1 py-px text-[8px] tracking-[0.1em] uppercase">{r.mode}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                              <button
                                onClick={() => openTrace(r)}
                                className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[10.5px] font-bold text-white transition-colors duration-200 hover:border-[#D4A574]/40"
                              >
                                Trace
                              </button>
                              <button
                                onClick={() => setDeleting(r)}
                                aria-label={`Delete ${r.email}`}
                                className="rounded-md border border-[var(--line)] p-1.5 text-white/30 transition-colors duration-200 hover:border-white/[0.15] hover:text-[#E68080]"
                              >
                                <Icon name="trash" size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 pb-4">
                  <Pagination page={page} pages={data.pages} onPage={setPage} />
                </div>
              </>
            </ViewTransition>
          )}
        </Card>

        {/* trace modal */}
        <Modal open={!!viewing} onClose={closeTrace} title="Full layer trace" width="max-w-2xl">
          {viewing && (
            <div>
              <div className="flex flex-wrap items-center gap-5">
                <ScoreDial score={viewing.score} size={76} />
                <div className="min-w-0 flex-1">
                  <p className="font-data truncate text-[14px] font-semibold text-white">{viewing.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={viewing.status} />
                    <span className="font-data text-[10.5px] text-white/30">
                      {Math.round(viewing.totalMs)}ms · {new Date(viewing.ts).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-3">
                <LayerRows layers={viewing.layers} />
              </div>
            </div>
          )}
        </Modal>

        <Confirm
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={doDelete}
          busy={busyDelete}
          danger
          title="Delete this validation?"
          confirmLabel="Delete"
          body={
            <>
              <span className="font-data text-[var(--cyan)]">{deleting?.email}</span> and its layer trace will be
              removed from your history. Credits are not refunded.
            </>
          }
        />
      </div>
    </RouteTransition>
  );
}
