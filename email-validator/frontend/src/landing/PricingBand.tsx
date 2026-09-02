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
    <section id="pricing" className="border-t border-[rgba(46,205,179,.06)] px-5 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Stagger className="grid gap-4 md:grid-cols-3" stagger={0.1}>
          {TIERS.map((t) => (
            <MItem key={t.name}>
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1",
                  t.featured
                    ? "border-[rgba(46,205,179,.35)] bg-[#0e1a17]"
                    : "border-[rgba(46,205,179,.08)] bg-[#0d1413] hover:border-[rgba(46,205,179,.2)]"
                )}
                style={{ boxShadow: t.featured ? "0 0 40px rgba(46,205,179,.1)" : undefined, transitionTimingFunction: "var(--ease-el)" }}
              >
                {t.featured && (
                  <span className="font-data absolute -top-2.5 left-6 rounded-full px-2.5 py-1 text-[8px] font-bold tracking-[0.2em] text-[#151208] uppercase" style={{ background: "linear-gradient(90deg,#EB7D00,#C4A35A)" }}>
                    Most Popular
                  </span>
                )}
                <h3 className="font-data text-[10px] font-bold tracking-[0.22em] text-[#7d948f] uppercase">{t.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-[32px] leading-none font-bold text-[#eaf5f2]">{t.price}</span>
                  <span className="font-data text-[9.5px] tracking-[0.1em] text-[#5c736e] uppercase">{t.per}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[12.5px] text-[#8fa39f]">
                      <span className="flex size-[16px] shrink-0 items-center justify-center rounded-full bg-[rgba(107,159,120,.12)] text-[#6B9F78]">
                        <Icon name="check" size={9} strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href={t.href}
                  className={cn(
                    "mt-6 rounded-xl px-4 py-2.5 text-center text-[12.5px] font-bold transition-all duration-200 active:scale-[.98]",
                    t.featured
                      ? "shine text-[#151208] hover:brightness-110"
                      : "border border-[rgba(46,205,179,.15)] text-[#EBE3A7] hover:border-[rgba(235,125,0,.4)] hover:text-[#EBE3A7]"
                  )}
                  style={t.featured ? { background: "linear-gradient(90deg,#3898ff,#EB7D00 60%,#C4A35A)", boxShadow: "0 0 22px rgba(235,125,0,.3)" } : undefined}
                >
                  {t.cta}
                </a>
              </article>
            </MItem>
          ))}
        </Stagger>
        <p className="font-data mt-8 text-center text-[9.5px] tracking-[0.18em] text-[#4c5f5b] uppercase">
          No credit card required · Cancel anytime · SOC2 Type II
        </p>
      </div>
    </section>
  );
}
