import { MItem, MReveal, Stagger } from "../lib/motion";

const TRUST = [
  { name: "Stripe", tag: "Payments" },
  { name: "Notion", tag: "Productivity" },
  { name: "Linear", tag: "Engineering" },
  { name: "Vercel", tag: "Infrastructure" },
  { name: "Supabase", tag: "Database" },
  { name: "Figma", tag: "Design" },
  { name: "Resend", tag: "Email" },
  { name: "Railway", tag: "Deploy" },
];

export default function TrustBar() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#0D0D0D] px-5 py-12 md:px-10 md:py-16">
      {/* subtle gradient accent */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[1px] w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D4A574]/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <MReveal>
          <p className="font-data text-center text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase">
            Trusted by teams at forward-thinking companies
          </p>
        </MReveal>

        <Stagger className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-10" stagger={0.05}>
          {TRUST.map((t) => (
            <MItem key={t.name}>
              <div className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 transition-all duration-300 hover:border-[#D4A574]/20 hover:bg-white/[0.04]">
                <span className="font-display text-[15px] font-bold tracking-tight text-white/40 transition-colors duration-300 group-hover:text-white/80">
                  {t.name}
                </span>
                <span className="hidden font-data text-[8px] font-semibold tracking-[0.16em] text-white/15 uppercase transition-colors duration-300 group-hover:text-[#D4A574]/40 sm:inline">
                  {t.tag}
                </span>
              </div>
            </MItem>
          ))}
        </Stagger>

        <MReveal delay={0.2}>
          <p className="font-data mt-8 text-center text-[9px] tracking-[0.14em] text-white/20 uppercase">
            & more across fintech, devtools, and enterprise SaaS
          </p>
        </MReveal>
      </div>
    </section>
  );
}
