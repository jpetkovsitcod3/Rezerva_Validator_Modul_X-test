import { BrandMark } from "./Sidebar";
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

export default function FooterLanding() {
  return (
    <footer className="relative bg-[var(--color-bg-canvas)] px-5 py-14 md:px-10">
      <div className="grad-pan absolute inset-x-0 top-0 h-px" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <MReveal>
          <div>
            <BrandMark />
            <p className="mt-4 max-w-xs text-[12.5px] leading-[1.7] text-[var(--text-3)]">
              Hardware-accelerated validation infrastructure for modern enterprises.
            </p>
            <p className="font-data mt-4 flex items-center gap-2 text-[9px] font-semibold tracking-[0.16em] text-[var(--text-3)] uppercase">
              <span className="pulse-green size-1.5 rounded-full bg-[var(--color-status-success)]" />
              All 7 layers operational
            </p>
            <p className="font-data mt-5 text-[9.5px] tracking-[0.14em] text-[var(--text-3)] uppercase">
              &copy; 2026 Bridge Modul X
            </p>
          </div>
        </MReveal>
        <Stagger className="contents" stagger={0.08}>
          {COLS.map((col) => (
            <MItem key={col.title}>
              <nav aria-label={col.title}>
                <p className="font-data text-[9px] font-bold tracking-[0.24em] text-[var(--text-3)] uppercase">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="inline-block text-[12.5px] text-[var(--text-2)] transition-all duration-200 hover:translate-x-1 hover:text-[var(--text-1)]"
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
