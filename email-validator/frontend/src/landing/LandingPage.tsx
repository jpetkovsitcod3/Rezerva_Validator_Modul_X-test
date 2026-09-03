import { RouteTransition } from "../lib/route-transition";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    badge: "Real-time",
    title: "Catch invalid emails the moment they're typed",
    description:
      "Drop our JavaScript snippet into any signup form. VerifAI blocks typos, role-based spam traps, and disposable addresses before they hit your CRM — no batch job, no waiting.",
  },
  {
    badge: "99.7% accuracy",
    title: "Syntax, MX, SMTP, and disposable-domain checks in one call",
    description:
      "Most verifiers stop at syntax. We go further: live MX lookups, SMTP handshakes, and a daily-refreshed database of 18M disposable domains — all in a single API call under 800 ms.",
  },
  {
    badge: "Bulk cleaning",
    title: "Clean 10M-row lists overnight without breaking your stack",
    description:
      "Upload a CSV or stream from S3. VerifAI chunks, verifies, and returns a tagged file with catch-all, role-based, and risky rows isolated — ready to drop straight back into your ESP.",
  },
];

const plans = [
  {
    name: "Free",
    price: 0,
    description: "For solo senders and side projects.",
    features: [
      "1,000 verifications / month",
      "Real-time API access",
      "Disposable-domain detection",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: 29,
    description: "For growing newsletters and small teams.",
    features: [
      "25,000 verifications / month",
      "Bulk CSV upload (up to 100k rows)",
      "Email & chat support",
      "Webhooks + Zapier",
    ],
    cta: "Start 14-day trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 99,
    description: "For SaaS and outbound teams that verify at scale.",
    features: [
      "150,000 verifications / month",
      "Bulk CSV up to 10M rows",
      "Catch-all + role-based tagging",
      "SOC 2 Type II + GDPR DPA",
      "Priority support (4-hr SLA)",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "For high-volume senders and regulated industries.",
    features: [
      "Unlimited verifications",
      "Dedicated IP for SMTP checks",
      "On-prem / VPC deployment",
      "Custom SLA + 24/7 phone support",
      "Single sign-on (SAML, OIDC)",
    ],
    cta: "Book a demo",
    highlighted: false,
  },
];

const testimonials = [
  {
    quote:
      "We cut bounces from 8.4% to 0.6% in the first week. VerifAI paid for the Pro plan inside two campaigns.",
    name: "Maya Chen",
    role: "Head of Growth, Loopline",
  },
  {
    quote:
      "The real-time API catches every disposable address our signup form used to let through. Onboarding completion is up 22%.",
    name: "Rafael Souza",
    role: "Engineering Lead, Hatch.io",
  },
  {
    quote:
      "We process 4M emails a week for outbound. VerifAI's catch-all tagging saved our sender reputation.",
    name: "Priya Raman",
    role: "VP Marketing, Northwind",
  },
];

const logos = ["Loopline", "Hatch.io", "Northwind", "Beacon", "Quill", "Atlas"];

const faqs = [
  {
    q: "How accurate is VerifAI?",
    a: "VerifAI catches 99.7% of invalid email addresses across syntax, MX, SMTP, and disposable-domain checks. Every credit comes with an accuracy guarantee.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free plan includes 1,000 verifications every month, forever. Upgrade only when you need more.",
  },
  {
    q: "Can I verify emails in real time?",
    a: "Yes. Use the REST API or our JavaScript snippet to verify a single email in under 800 ms as the user types.",
  },
  {
    q: "Is my data secure?",
    a: "Emails are processed in memory and never stored on the Free and Starter plans. Pro and Enterprise include SOC 2 Type II, GDPR DPA, and at-rest encryption.",
  },
  {
    q: "Do you offer bulk list cleaning?",
    a: "Yes — upload a CSV up to 10M rows on Pro, or use the API for continuous cleaning.",
  },
];

/* ------------------------------------------------------------------ */
/*  Reusable bits                                                      */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-0.5 h-5 w-5 flex-none text-violet-400"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.408l-7.997 8a1 1 0 01-1.408 0l-3.999-4a1 1 0 011.408-1.408L8 12.59l7.296-7.294a1 1 0 011.408 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 text-gray-400 transition group-open:rotate-180"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 px-4 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative z-10 max-w-4xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Now verifying 10M+ emails a day
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
          Stop bounces.<br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Send what lands.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-400">
          Real-time email verification with 99.7% accuracy. Drop our snippet
          into any form and catch invalid addresses before they hit your CRM —
          and before they destroy your sender reputation.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-md bg-violet-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-violet-500"
          >
            Start free — 1,000 credits/month
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-md border border-gray-700 bg-transparent px-8 py-3 text-base font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            See how it works →
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          No credit card required · Free forever plan · Cancel anytime
        </p>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="border-y border-gray-800 bg-gray-950 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-gray-500">
          Trusted by 4,000+ teams sending serious email
        </p>
        <div className="grid grid-cols-3 items-center gap-x-8 gap-y-6 text-center sm:grid-cols-6">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-lg font-semibold text-gray-400 transition hover:text-gray-200"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureDeepDive() {
  return (
    <section id="features" className="bg-gray-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-400">
            How VerifAI works
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Three layers of checks, one API call
          </h2>
          <p className="text-lg text-gray-400">
            Most verifiers stop at syntax. VerifAI verifies the address actually
            accepts mail — so your campaigns reach real inboxes.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex flex-col items-center gap-12 lg:flex-row ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <span className="mb-3 inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-violet-300">
                  {feature.badge}
                </span>
                <h3 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-400">{feature.description}</p>
              </div>

              <div className="flex-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
                  {/* Decorative SVG panel — no external assets required */}
                  <FeatureIllustration index={i} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Inline SVG illustrations so we ship with zero external assets. */
function FeatureIllustration({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
        <rect width="400" height="300" fill="#0b0f1a" />
        <rect x="40" y="40" width="320" height="220" rx="14" fill="#111827" stroke="#1f2937" strokeWidth="2" />
        <rect x="60" y="68" width="180" height="14" rx="4" fill="#374151" />
        <rect x="60" y="98" width="280" height="40" rx="8" fill="#0b0f1a" stroke="#374151" />
        <text x="76" y="123" fontSize="14" fontFamily="ui-monospace" fill="#a78bfa">maya@loopline</text>
        <rect x="60" y="156" width="120" height="32" rx="16" fill="#064e3b" />
        <circle cx="76" cy="172" r="5" fill="#34d399" />
        <text x="90" y="177" fontSize="12" fill="#34d399" fontWeight="600">Real-time check</text>
        <rect x="190" y="156" width="150" height="32" rx="16" fill="#7f1d1d" />
        <circle cx="206" cy="172" r="5" fill="#f87171" />
        <text x="220" y="177" fontSize="12" fill="#f87171" fontWeight="600">Disposable blocked</text>
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
        <rect width="400" height="300" fill="#0b0f1a" />
        <circle cx="200" cy="150" r="110" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.4" />
        <circle cx="200" cy="150" r="80" fill="none" stroke="#f472b6" strokeWidth="2" opacity="0.5" />
        <circle cx="200" cy="150" r="50" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.7" />
        <text x="200" y="155" textAnchor="middle" fontSize="32" fontWeight="800" fill="#ffffff" fontFamily="ui-sans-serif">99.7%</text>
        <text x="200" y="180" textAnchor="middle" fontSize="11" fill="#9ca3af" letterSpacing="2">ACCURACY</text>
        <g>
          <circle cx="120" cy="80" r="6" fill="#34d399" />
          <text x="135" y="85" fontSize="11" fill="#d1d5db">MX</text>
        </g>
        <g>
          <circle cx="280" cy="80" r="6" fill="#34d399" />
          <text x="295" y="85" fontSize="11" fill="#d1d5db">SMTP</text>
        </g>
        <g>
          <circle cx="120" cy="230" r="6" fill="#fbbf24" />
          <text x="135" y="235" fontSize="11" fill="#d1d5db">Catch-all</text>
        </g>
        <g>
          <circle cx="280" cy="230" r="6" fill="#34d399" />
          <text x="295" y="235" fontSize="11" fill="#d1d5db">Disposable</text>
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
      <rect width="400" height="300" fill="#0b0f1a" />
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 16 }).map((_, col) => {
          const valid = (row + col) % 3 !== 0;
          return (
            <rect
              key={`${row}-${col}`}
              x={30 + col * 22}
              y={30 + row * 24}
              width="14"
              height="14"
              rx="3"
              fill={valid ? "#064e3b" : "#7f1d1d"}
              opacity={valid ? 0.8 : 0.9}
            />
          );
        }),
      )}
      <rect x="30" y="30" width="352" height="240" fill="none" stroke="#1f2937" strokeWidth="2" rx="6" />
    </svg>
  );
}

function Testimonials() {
  return (
    <section className="bg-gray-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-400">
            What teams say
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            4,000+ teams stopped bouncing on day one
          </h2>
          <p className="text-lg text-gray-400">
            VerifAI customers cut invalid-email signups by 95% on average.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-8"
            >
              <blockquote className="mb-6 text-lg leading-relaxed text-gray-200">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-semibold text-white">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="text-sm text-gray-400">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-gray-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-400">
            Pricing
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Free forever. Scale when you&rsquo;re ready.
          </h2>
          <p className="text-lg text-gray-400">
            Pay only for the verifications you use. No seats, no minimums.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? "rounded-2xl border-2 border-violet-500 bg-violet-950/50 p-8 ring-4 ring-violet-500/20"
                  : "rounded-2xl border border-gray-800 bg-gray-900 p-8"
              }
            >
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-violet-500 px-2.5 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mb-6 text-sm text-gray-400">{plan.description}</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {plan.price === null ? "Custom" : `$${plan.price}`}
                </span>
                {plan.price !== null && (
                  <span className="text-sm text-gray-400">/ month</span>
                )}
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={
                  plan.highlighted
                    ? "block w-full rounded-md bg-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-violet-500"
                    : "block w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-center text-sm font-medium text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
                }
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="bg-gray-950 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-400">
            FAQ
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Questions, answered
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 open:bg-gray-900/80"
              open={i === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-lg font-medium text-white">
                {faq.q}
                <ChevronIcon />
              </summary>
              <p className="mt-4 text-gray-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="bg-gray-950 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950 to-gray-900 p-12 text-center md:p-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="relative">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Verify your first 1,000 emails &mdash; free.
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
              No credit card. Setup in 3 minutes. Keep using the free plan
              forever, or upgrade when you outgrow it.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-md bg-violet-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-violet-500"
              >
                Start free
              </a>
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-transparent px-8 py-3 text-base font-medium text-gray-200 transition hover:border-gray-400 hover:text-white"
              >
                Book a demo
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              30-day money-back guarantee · Cancel anytime · SOC 2 Type II
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-3 text-xl font-bold text-white">VerifAI</div>
            <p className="max-w-xs text-sm text-gray-400">
              Email verification for teams that take deliverability seriously.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#cta" className="hover:text-white">API docs</a></li>
              <li><a href="#cta" className="hover:text-white">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#cta" className="hover:text-white">About</a></li>
              <li><a href="#cta" className="hover:text-white">Customers</a></li>
              <li><a href="#cta" className="hover:text-white">Careers</a></li>
              <li><a href="#cta" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#cta" className="hover:text-white">Privacy</a></li>
              <li><a href="#cta" className="hover:text-white">Terms</a></li>
              <li><a href="#cta" className="hover:text-white">DPA</a></li>
              <li><a href="#cta" className="hover:text-white">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm text-gray-500 sm:flex-row">
          <p>&copy; 2026 VerifAI, Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#cta" aria-label="Twitter" className="hover:text-white">Twitter</a>
            <a href="#cta" aria-label="GitHub" className="hover:text-white">GitHub</a>
            <a href="#cta" aria-label="LinkedIn" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <RouteTransition>
      <main className="bg-gray-950 text-white">
        <Hero />
        <LogoStrip />
        <FeatureDeepDive />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </RouteTransition>
  );
}