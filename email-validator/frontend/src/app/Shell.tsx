import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "../lib/ui";
import { useAuth, useRoute } from "../lib/auth";
import { springSnappy } from "../lib/motion";
import { cn } from "../utils/cn";

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

const USER_NAV: NavItem[] = [
  { path: "/app", label: "Dashboard", icon: "activity" },
  { path: "/app/validator", label: "Validation", icon: "mail" },
  { path: "/app/history", label: "Analytics", icon: "clock" },
  { path: "/app/keys", label: "Pipeline", icon: "code" },
  { path: "/app/settings", label: "Settings", icon: "shield" },
];

const ADMIN_NAV: NavItem[] = [
  { path: "/admin", label: "Dashboard", icon: "activity" },
  { path: "/admin/users", label: "Users", icon: "users" },
  { path: "/admin/logs", label: "Global Logs", icon: "database" },
  { path: "/admin/blocklist", label: "Compliance", icon: "ban" },
  { path: "/admin/settings", label: "Engine", icon: "layers" },
];

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/validator": "Validation Engine",
  "/app/history": "Analytics",
  "/app/keys": "Pipeline Control",
  "/app/settings": "System Config",
  "/admin": "Admin Overview",
  "/admin/users": "Admin Users",
  "/admin/logs": "Admin Global Logs",
  "/admin/blocklist": "Admin Compliance",
  "/admin/settings": "Admin Engine Config",
};

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <a
      href={`#${item.path}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-white/[0.06] text-white"
          : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
      )}
    >
      <Icon
        name={item.icon}
        size={16}
        className={cn(active ? "text-[#D4A574]" : "text-white/30 group-hover:text-white/50")}
      />
      <span>{item.label}</span>
      {active && (
        <span className="ml-auto size-1.5 rounded-full bg-[#D4A574]" />
      )}
    </a>
  );
}

function ControlSlider({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="font-data text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">{label}</span>
        <Icon name="bolt" size={12} weight="fill" className="text-[#D4A574]/60" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="relative h-full bg-[#D4A574]" style={{ width: value }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-sm border border-[#D4A574] bg-[#0A0A0A]" style={{ width: 8, height: 12 }} />
        </div>
      </div>
    </div>
  );
}

function ThroughputChart() {
  const bars = [30, 50, 40, 70, 100, 60, 80, 45, 90, 55, 75, 65];
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-end justify-between">
        <span className="font-data text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">Throughput</span>
        <span className="font-data text-sm font-bold text-white">
          1,962 <span className="text-[10px] font-normal text-white/30">req/s</span>
        </span>
      </div>
      <div className="flex h-8 items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-full rounded-t-sm transition-colors",
              i === 4 ? "bg-[#D4A574]" : "bg-white/[0.08] hover:bg-white/[0.12]"
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Shell({
  area,
  children,
}: {
  area: "user" | "admin";
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const route = useRoute() || "/app";
  const nav = area === "admin" ? ADMIN_NAV : USER_NAV;
  const isAdmin = user?.role === "admin";

  useEffect(() => setDrawer(false), [route]);

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-[100dvh] overflow-hidden p-4 text-sm">
      {/* mobile drawer backdrop */}
      <button
        aria-label="Close menu"
        onClick={() => setDrawer(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden",
          drawer ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* ─── SIDEBAR ─── */}
      <aside
        style={{ viewTransitionName: "app-sidebar", transitionTimingFunction: "var(--ease-el)" }}
        className={cn(
          "z-50 flex w-64 flex-shrink-0 flex-col gap-4 overflow-y-auto transition-transform duration-300 lg:translate-x-0",
          drawer ? "fixed top-0 bottom-0 left-0" : "fixed top-0 bottom-0 left-0 -translate-x-full lg:static lg:translate-x-0"
        )}
      >
        {/* brand */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
              <rect x="3.5" y="6.5" width="25" height="19" rx="3.5" fill="none" stroke="#D4A574" strokeWidth="2" />
              <path d="m3.5 11 12.5 8 12.5-8" fill="none" stroke="#D4A574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h1 className="font-display text-[15px] font-bold tracking-tight text-white">
              Bridge <span className="text-[#D4A574]">Modul X</span>
            </h1>
            <p className="font-data text-[9px] uppercase tracking-[0.16em] text-white/30">
              {area === "admin" ? "Admin Console" : "Validation Engine"}
            </p>
          </div>
        </div>

        {/* search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
            <Icon name="search" size={16} />
          </span>
          <input
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13px] text-white placeholder-white/25 focus:border-[#D4A574]/40 focus:outline-none focus:ring-1 focus:ring-[#D4A574]/20"
            placeholder="Search..."
            type="text"
          />
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-1" aria-label={area === "admin" ? "Admin" : "Dashboard"}>
          {nav.map((n) => (
            <SideLink key={n.path} item={n} active={route === n.path} />
          ))}
        </nav>

        {/* controls */}
        <div className="mt-auto flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <ControlSlider label="Sensitivity" value="66%" />
          <ControlSlider label="Output" value="50%" />
        </div>

        {/* throughput */}
        <ThroughputChart />

        {/* workspace links */}
        <div className="flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {isAdmin && area === "user" && (
            <a href="#/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70">
              <Icon name="lock" size={15} /> Admin console
            </a>
          )}
          {isAdmin && area === "admin" && (
            <a href="#/app" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70">
              <Icon name="users" size={15} /> User view
            </a>
          )}
          <a href="#/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70">
            <Icon name="globe" size={15} /> Back to site
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
          >
            <Icon name="close" size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden pl-0 lg:pl-4">
        {/* header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawer(true)}
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white lg:hidden"
            >
              <Icon name="menu" size={17} />
            </button>
            <div className="min-w-0">
              <h2 className="font-display text-[1.6rem] leading-[1.1] font-bold tracking-tight text-white md:text-3xl">
                {TITLES[route] ?? "Dashboard"}
              </h2>
              <p className="mt-1 text-[12.5px] text-white/35 sm:text-sm">
                {area === "admin" ? "Platform-wide validation mesh status" : "Real-time validation mesh status"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2">
              <span className="size-2 rounded-full bg-[#5BC07E]" />
              <span className="font-data text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Core Stable</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1 pr-3 pl-1 transition-colors duration-200 hover:border-white/[0.15]"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-[#D4A574] text-[10px] font-bold text-[#0A0A0A]">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[120px] truncate text-xs leading-tight font-bold text-white/80">
                    {user?.name}
                  </span>
                  <span className="block font-data text-[8px] uppercase tracking-[0.14em] text-white/30">
                    {user?.role}
                  </span>
                </span>
                <Icon name="chevronDown" size={13} className={cn("text-white/30 transition-transform duration-200", menu && "rotate-180")} />
              </button>
              <AnimatePresence>
                {menu && (
                  <>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-0 z-10 cursor-default"
                      aria-label="Close menu"
                      onClick={() => setMenu(false)}
                    />
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={springSnappy}
                      className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414] p-1.5 shadow-2xl"
                    >
                      <a role="menuitem" href="#/app/settings" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-white/50 hover:bg-white/[0.05] hover:text-white/80">
                        <Icon name="shield" size={14} /> Profile & security
                      </a>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenu(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[#E68080] hover:bg-[#E68080]/10"
                      >
                        <Icon name="close" size={14} /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
