import { MItem, MReveal, Stagger } from "../lib/motion";

const COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Platform",
    links: [
      ["Product", "#top"],
      ["Features", "#architecture"],
      ["Pricing", "#pricing"],
    ],
  },
  {
    title: "Developers",
    links: [
      ["API Docs", "#/app/keys"],
      ["Status", "#top"],
      ["GitHub", "#top"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "#compliance"],
      ["Terms", "#compliance"],
    ],
  },
];

function BrandMark() {
  return (
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
  );
}

export default function FooterLanding() {
  return (
    <footer className="relative bg-[#0A0A0A] px-5 py-14 md:px-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <MReveal>
          <div>
            <BrandMark />
            <p className="mt-4 max-w-xs text-[12.5px] leading-[1.7] text-white/35">
              Hardware-accelerated validation infrastructure for modern enterprises.
            </p>
            <p className="font-data mt-4 flex items-center gap-2 text-[9px] font-semibold tracking-[0.16em] text-white/30 uppercase">
              <span className="pulse-green size-1.5 rounded-full bg-[#5BC07E]" />
              All 7 layers operational
            </p>
            <p className="font-data mt-5 text-[9.5px] tracking-[0.14em] text-white/20 uppercase">
              &copy; 2026 Bridge Modul X
            </p>
          </div>
        </MReveal>
        <Stagger className="contents" stagger={0.08}>
          {COLS.map((col) => (
            <MItem key={col.title}>
              <nav aria-label={col.title}>
                <p className="font-data text-[9px] font-bold tracking-[0.24em] text-white/30 uppercase">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="inline-block text-[12.5px] text-white/40 transition-[color,transform] duration-200 hover:translate-x-1 hover:text-white/80"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </MItem>
          ))}
        </Stagger>
      </div>
    </footer>
  );
}
