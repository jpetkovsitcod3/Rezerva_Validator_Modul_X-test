import { MItem, MReveal, Stagger } from "../lib/motion";

const TRUST = [
  "Stripe",
  "Notion",
  "Linear",
  "Vercel",
  "Supabase",
  "Figma",
  "Resend",
  "Railway",
];

export default function TrustBar() {
  return (
    <section className="border-b border-[var(--color-border-secondary)] bg-[var(--color-bg-canvas)] px-5 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <MReveal>
          <p className="font-data text-center text-[9px] font-bold tracking-[0.28em] text-[var(--text-3)] uppercase">
            Trusted by teams at forward-thinking companies
          </p>
        </MReveal>
        <Stagger className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14" stagger={0.06}>
          {TRUST.map((name) => (
            <MItem key={name}>
              <span translate="no" className="font-display text-[15px] font-bold tracking-tight text-[var(--text-3)] transition-colors duration-200 hover:text-[var(--text-1)]">
                {name}
              </span>
            </MItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
