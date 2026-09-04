import { MItem, MReveal, Stagger } from "../lib/motion";

export default function CTABand() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] px-5 py-20 md:px-10 md:py-28">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[1px] w-[50%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D4A574]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,165,116,0.06),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <MReveal>
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white">
            Stop guessing. Start validating.
          </h2>
        </MReveal>
        <MReveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-lg text-[13.5px] leading-relaxed text-white/45">
            Join thousands of teams that rely on Modul X to protect their sender reputation,
            reduce bounces, and keep their lists pristine.
          </p>
        </MReveal>
        <Stagger className="mt-8 flex flex-wrap items-center justify-center gap-3" stagger={0.1}>
          <MItem>
            <a
              href="#/signup"
              className="group inline-flex items-center gap-2 rounded-lg bg-white py-3 pr-3 pl-6 text-[13px] font-bold text-[#0A0A0A] transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
            >
              Get Started Free
              <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-black/10 text-[11px] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
          </MItem>
          <MItem>
            <a
              href="#/app/validator"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-[13px] font-bold text-white/80 transition-all duration-200 hover:border-white/30 hover:text-white active:scale-[0.98]"
            >
              Open Validator
            </a>
          </MItem>
        </Stagger>
        <MReveal delay={0.18}>
          <p className="mt-5 font-data text-[10px] tracking-[0.14em] text-white/20 uppercase">
            No credit card required · Cancel anytime · SOC2 Type II
          </p>
        </MReveal>
      </div>
    </section>
  );
}
