import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../lib/ui";
import { cn } from "../utils/cn";

const NAV_ITEMS = [
  { label: "Product", href: "#pipeline" },
  { label: "Architecture", href: "#architecture" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#/app/keys" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-[#0A0A0A]/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* brand */}
        <a href="#top" className="flex items-center gap-2.5" aria-label="Bridge Modul X — home">
          <span className="relative flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
              <rect x="3.5" y="6.5" width="25" height="19" rx="3.5" fill="none" stroke="#D4A574" strokeWidth="2" />
              <path d="m3.5 11 12.5 8 12.5-8" fill="none" stroke="#D4A574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-[#D4A574] pulse-green" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            Bridge <span className="text-[#D4A574]">Modul X</span>
          </span>
        </a>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-white/60 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#/login"
            className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
          >
            Sign In
          </a>
          <a
            href="#/signup"
            className="rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-[#0A0A0A] transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
          >
            Start Free
          </a>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/70 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <Icon name={mobileOpen ? "close" : "menu"} size={17} />
        </button>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
                <a
                  href="#/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-center text-[14px] font-medium text-white/70 transition-colors hover:text-white"
                >
                  Sign In
                </a>
                <a
                  href="#/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-white px-4 py-2.5 text-center text-[14px] font-bold text-[#0A0A0A]"
                >
                  Start Free
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Alternate landing route — reuses the same components as the main landing */
export default function LandingPageAlt() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <LandingNav />
      <div className="pt-16 text-center py-40">
        <h1 className="font-display text-4xl font-bold text-white">Bridge Modul X</h1>
        <p className="mt-4 text-white/40">Visit the main landing page for the full experience.</p>
        <a href="#/" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-[13px] font-bold text-[#0A0A0A]">
          Go to Home
        </a>
      </div>
    </div>
  );
}
