import { MItem, MReveal, Stagger } from "../lib/motion";

export default function CTABand() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--color-border-secondary)] px-5 py-20 md:px-10 md:py-28">
      <div aria-hidden className="absolute inset-0 bg-[#F7F6F3]" />
      <div aria-hidden className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(149,100,0,0.05),transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <MReveal>
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[var(--text-1)]">
            Stop guessing. Start validating.
          </h2>
        </MReveal>
        <MReveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-lg text-[13.5px] leading-relaxed text-[var(--text-3)]">
            Join thousands of teams that rely on Modul X to protect their sender reputation,
            reduce bounces, and keep their lists pristine.
          </p>
        </MReveal>
        <Stagger className="mt-8 flex flex-wrap items-center justify-center gap-3" stagger={0.1}>
          <MItem>
            <a
              href="#/signup"
              className="group inline-flex items-center gap-2 rounded-md bg-[#111111] py-3 pr-3 pl-6 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#333333] active:scale-[0.98]"
            >
              Get Started Free
              <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-white/15 text-[11px] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
          </MItem>
          <MItem>
            <a
              href="#/app/validator"
              className="inline-flex items-center gap-2 rounded-md border border-[#EAEAEA] bg-white px-6 py-3 text-[13px] font-bold text-[var(--text-1)] transition-colors duration-200 hover:border-[#111111] active:scale-[0.98]"
            >
              Open Validator
            </a>
          </MItem>
        </Stagger>
        <MReveal delay={0.18}>
          <p className="mt-5 font-data text-[10px] tracking-[0.14em] text-[var(--text-3)] uppercase">
            No credit card required · Cancel anytime · SOC2 Type II
          </p>
        </MReveal>
      </div>
    </section>
  );
}
