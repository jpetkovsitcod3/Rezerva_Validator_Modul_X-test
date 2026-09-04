import { Icon } from "../lib/ui";
import { MItem, Stagger } from "../lib/motion";
import { cn } from "../utils/cn";

const TIERS = [
  {
    name: "Starter",
    price: "$0",
    per: "forever",
    points: ["100 validations / day", "Layers 1-4", "Community support"],
    cta: "Start Free",
    href: "#/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    per: "/ seat / mo",
    points: ["All 7 layers + SMTP probes", "10k validations / mo", "API, webhooks & alerts"],
    cta: "Start 14-day Trial",
    href: "#/signup",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "annual",
    points: ["Unlimited volume", "SSO / SAML + DPA", "Dedicated success manager"],
    cta: "Talk to Sales",
    href: "mailto:sales@bridgemodulx.io",
    featured: false,
  },
];

export default function PricingBand() {
  return (
    <section id="pricing" className="relative border-t border-white/[0.06] px-5 py-20 md:px-10 md:py-28">
      {/* subtle top gradient */}
      <div aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A574]/15 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-bold text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 max-w-md mx-auto text-[13.5px] leading-relaxed text-white/40">
            Start free. Scale when you need to. No surprises.
          </p>
        </div>

        <Stagger className="mt-10 grid gap-4 md:grid-cols-3" stagger={0.1}>
          {TIERS.map((t) => (
            <MItem key={t.name}>
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-xl border p-6 transition-all duration-300",
                  t.featured
                    ? "border-[#D4A574]/30 bg-[#D4A574]/[0.04] shadow-[0_0_40px_rgba(212,165,116,0.06)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                )}
              >
                {t.featured && (
                  <span className="font-data absolute -top-2.5 left-6 rounded-full bg-[#D4A574] px-2.5 py-1 text-[8px] font-bold tracking-[0.05em] text-[#0A0A0A] uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="font-data text-[10px] font-bold tracking-[0.22em] text-white/40 uppercase">
                  {t.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className={cn(
                    "font-display text-[32px] leading-none font-bold",
                    t.featured ? "text-[#D4A574]" : "text-white"
                  )}>
                    {t.price}
                  </span>
                  <span className="font-data text-[9.5px] tracking-[0.1em] text-white/30 uppercase">
                    {t.per}
                  </span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[12.5px] text-white/60">
                      <span className="flex size-[16px] shrink-0 items-center justify-center rounded-full bg-[#2A8C4B]/15 text-[#5BC07E]">
                        <Icon name="check" size={9} weight="bold" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href={t.href}
                  className={cn(
                    "mt-6 rounded-lg px-4 py-2.5 text-center text-[12.5px] font-bold transition-all duration-200 active:scale-[.98]",
                    t.featured
                      ? "bg-[#D4A574] text-[#0A0A0A] hover:bg-[#D4A574]/90"
                      : "border border-white/10 text-white/70 hover:border-white/25 hover:text-white"
                  )}
                >
                  {t.cta}
                </a>
              </article>
            </MItem>
          ))}
        </Stagger>

        <p className="font-data mt-8 text-center text-[9.5px] tracking-[0.18em] text-white/25 uppercase">
          No credit card required · Cancel anytime · SOC2 Type II
        </p>
      </div>
    </section>
  );
}
