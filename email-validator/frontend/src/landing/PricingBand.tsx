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
    <section id="pricing" className="border-t border-[var(--color-border-secondary)] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-bold text-[var(--text-1)]">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 max-w-md mx-auto text-[13.5px] leading-relaxed text-[var(--text-3)]">
            Start free. Scale when you need to. No surprises.
          </p>
        </div>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3" stagger={0.1}>
          {TIERS.map((t) => (
            <MItem key={t.name}>
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-xl border border-[#EAEAEA] bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:border-[#D8D4C8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                  t.featured && "border-[#111111]"
                )}
                style={{ transitionTimingFunction: "var(--ease-el)" }}
              >
                {t.featured && (
                  <span className="font-data absolute -top-2.5 left-6 rounded-full bg-[#111111] px-2.5 py-1 text-[8px] font-bold tracking-[0.05em] text-white uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="font-data text-[10px] font-bold tracking-[0.22em] text-[var(--text-3)] uppercase">{t.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-[32px] leading-none font-bold text-[var(--text-1)]">{t.price}</span>
                  <span className="font-data text-[9.5px] tracking-[0.1em] text-[var(--text-3)] uppercase">{t.per}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[12.5px] text-[var(--text-2)]">
                      <span className="flex size-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-[var(--color-status-success)]">
                        <Icon name="check" size={9} weight="bold" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href={t.href}
                  className={cn(
                    "mt-6 rounded-md px-4 py-2.5 text-center text-[12.5px] font-bold transition-colors duration-200 active:scale-[.98]",
                    t.featured
                      ? "bg-[#111111] text-white hover:bg-[#333333]"
                      : "border border-[#EAEAEA] text-[var(--text-1)] hover:border-[#111111]"
                  )}
                >
                  {t.cta}
                </a>
              </article>
            </MItem>
          ))}
        </Stagger>
        <p className="font-data mt-8 text-center text-[9.5px] tracking-[0.18em] text-[var(--text-3)] uppercase">
          No credit card required · Cancel anytime · SOC2 Type II
        </p>
      </div>
    </section>
  );
}
