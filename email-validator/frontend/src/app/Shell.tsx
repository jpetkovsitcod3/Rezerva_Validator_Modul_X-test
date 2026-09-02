import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "../lib/ui";
import { useAuth } from "../lib/auth";
import { PageFade, springSnappy } from "../lib/motion";
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
  "/app": "Reactor Core Console",
  "/app/validator": "Validation Engine",
  "/app/history": "Analytics Mesh",
  "/app/keys": "Pipeline Control",
  "/app/settings": "System Config",
  "/admin": "Admin Overview",
  "/admin/users": "Admin Users",
  "/admin/logs": "Admin Global Logs",
  "/admin/blocklist": "Admin Compliance",
  "/admin/settings": "Admin Engine Config",
};

/* ─── Reactor-style side link ─── */
function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <a
      href={`#${item.path}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "metallic-panel group relative flex items-center gap-3 p-3 text-sm transition-colors duration-200",
        active
          ? "border-[var(--palette-teal-400)]/50 inner-glow text-[var(--palette-teal-400)] text-glow"
          : "hover:border-[var(--palette-teal-400)]/30 text-[var(--text-2)]"
      )}
    >
      <span className="screw-bottom" />
      <Icon
        name={item.icon}
        size={16}
        className={cn(
          active ? "text-[var(--palette-teal-400)]" : "text-[var(--text-3)] group-hover:text-[var(--text-2)]"
        )}
      />
      <span>{item.label}</span>
      {active && (
        <span className="ml-auto size-1.5 rounded-full bg-[var(--palette-teal-400)] shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
      )}
    </a>
  );
}

/* ─── Reactor-style control slider ─── */
function ControlSlider({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <svg className="size-3 text-[var(--palette-teal-400)]" fill="currentColor" viewBox="0 0 20 20">
          <path clipRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" fillRule="evenodd" />
        </svg>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full border border-[#333] bg-[#111]">
        <div className="relative h-full bg-[var(--palette-teal-400)] shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ width: value }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-sm bg-white shadow-md" style={{ width: 8, height: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Reactor-style throughput chart ─── */
function ThroughputChart() {
  const bars = [30, 50, 40, 70, 100, 60, 80, 45, 90, 55, 75, 65];
  return (
    <div className="metallic-panel p-4">
      <span className="screw-bottom" />
      <div className="mb-2 flex items-end justify-between">
        <span className="text-xs uppercase tracking-wider">Throughput</span>
        <span className="text-glow text-sm font-bold text-[var(--palette-teal-400)]">
          1,962 <span className="text-[10px] font-normal text-[var(--text-3)]">req/s</span>
        </span>
      </div>
      <div className="flex h-8 items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-full rounded-t-sm transition-colors hover:bg-[var(--palette-teal-400)]",
              i === 4
                ? "bg-[var(--palette-teal-400)] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                : "bg-[var(--palette-teal-400)]/40"
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
  const route = window.location.hash.slice(1) || "/app";
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
    <div className="flex h-screen overflow-hidden p-4 text-sm">
      {/* mobile drawer backdrop */}
      <button
        aria-label="Close menu"
        onClick={() => setDrawer(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden",
          drawer ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* ─── SIDEBAR ─── */}
      <aside
        className={cn(
          "z-50 flex w-64 flex-shrink-0 flex-col gap-4 overflow-y-auto transition-transform duration-300 lg:translate-x-0",
          drawer ? "fixed top-0 bottom-0 left-0" : "fixed top-0 bottom-0 left-0 -translate-x-full lg:static lg:translate-x-0"
        )}
        style={{ transitionTimingFunction: "var(--ease-el)" }}
      >
        {/* brand */}
        <div className="metallic-panel flex items-center gap-3 p-4">
          <span className="screw-bottom" />
          <span className="flex size-8 items-center justify-center rounded bg-[var(--palette-teal-400)] font-bold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            B
          </span>
          <div>
            <h1 className="text-glow font-bold tracking-wider text-white">REACTOR</h1>
            <p className="text-xs text-[var(--text-3)]/70">
              {area === "admin" ? "ADMIN CONSOLE" : "Nodul X"}
            </p>
          </div>
        </div>

        {/* search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <input
            className="w-full rounded border border-[var(--color-border-primary)] bg-[#141414] py-2 pl-9 text-[var(--text-2)] placeholder-[var(--text-3)]/50 focus:border-[var(--palette-teal-400)] focus:ring-1 focus:ring-[var(--palette-teal-400)]"
            placeholder="Search..."
            type="text"
          />
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-2" aria-label={area === "admin" ? "Admin" : "Dashboard"}>
          {nav.map((n) => (
            <SideLink key={n.path} item={n} active={route === n.path} />
          ))}
        </nav>

        {/* controls */}
        <div className="metallic-panel mt-auto flex flex-col gap-4 p-4">
          <span className="screw-bottom" />
          <ControlSlider label="Sensitivity" value="66%" />
          <ControlSlider label="Output" value="50%" />
        </div>

        {/* throughput */}
        <ThroughputChart />

        {/* workspace links */}
        <div className="metallic-panel flex flex-col gap-2 p-4">
          <span className="screw-bottom" />
          {isAdmin && area === "user" && (
            <a href="#/admin" className="flex items-center gap-2 px-2 py-1 text-sm text-white transition-colors hover:text-[var(--palette-teal-400)]">
              <Icon name="lock" size={16} /> Admin console
            </a>
          )}
          {isAdmin && area === "admin" && (
            <a href="#/app" className="flex items-center gap-2 px-2 py-1 text-sm text-white transition-colors hover:text-[var(--palette-teal-400)]">
              <Icon name="users" size={16} /> User view
            </a>
          )}
          <a href="#/" className="flex items-center gap-2 px-2 py-1 text-sm text-white transition-colors hover:text-[var(--palette-teal-400)]">
            <Icon name="globe" size={16} /> Back to site
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-2 py-1 text-sm text-white transition-colors hover:text-[var(--palette-teal-400)]"
          >
            <Icon name="close" size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden pl-0 lg:pl-4">
        {/* header */}
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-glow text-2xl font-bold tracking-wide text-white md:text-3xl">
              {TITLES[route] ?? "Dashboard"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">Real-time validation mesh status</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="metallic-panel flex items-center gap-2 border-[var(--palette-teal-400)]/50 px-4 py-2 inner-glow">
              <span className="screw-bottom" />
              <span className="size-2 animate-pulse rounded-full bg-[var(--palette-teal-400)] shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
              <span className="text-glow text-sm font-bold uppercase tracking-wider text-[var(--palette-teal-400)]">Core Stable</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className="metallic-panel flex items-center gap-2.5 py-1 pr-3 pl-1 transition-colors duration-200 hover:border-[var(--palette-teal-400)]/30"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-[var(--palette-teal-400)] text-[10px] font-bold text-black">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[120px] truncate text-xs leading-tight font-bold text-white">
                    {user?.name}
                  </span>
                  <span className="block text-[8px] uppercase tracking-[0.14em] text-[var(--text-3)]">
                    {user?.role}
                  </span>
                </span>
                <Icon name="chevronDown" size={13} className={cn("text-[var(--text-3)] transition-transform duration-200", menu && "rotate-180")} />
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
                      className="metallic-panel absolute right-0 z-20 mt-2 w-52 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.55)]"
                    >
                      <a role="menuitem" href="#/app/settings" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-white">
                        <Icon name="shield" size={14} /> Profile & security
                      </a>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenu(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[var(--red)] hover:bg-red-500/10"
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
        <main className="flex-1 overflow-y-auto">
          <PageFade id={route}>{children}</PageFade>
        </main>
      </div>
    </div>
  );
}
