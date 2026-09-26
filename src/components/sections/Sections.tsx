import Link from "next/link";
import { DAYS, EVENT, FAQ, HEADLINE_PRIZES, LEGENDS, ORGANISERS, VALUE, paidPlaces, registerHref } from "@/data/festival";
import { inr, prizeLabel } from "@/lib/format";
import { Finder } from "../Finder";
import { Icon, Wordmark } from "../icons";
import { Countdown } from "../live";
import { PrizeExplorer } from "../PrizeExplorer";
import { Cta, MediaSlot, Section, SectionHead, Tbc, WhatsAppLink, live } from "../ui";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
const Muted = ({ children }: { children: React.ReactNode }) => <span className="text-muted">{children}</span>;

/* 01 ─ Choose your arena */
export function Arena() {
  return (
    <Section id="arena">
      <SectionHead index="01" label="Choose your arena" title={<>Find your category. <Muted>See exactly what you can win.</Muted></>} />
      <Finder />
    </Section>
  );
}

/* 02 ─ The prize pool (paper: an official prize sheet) */
export function Prizes() {
  return (
    <Section id="prizes" theme="paper">
      <SectionHead
        index="02"
        label="The prize pool"
        title={<>Every rupee, <Muted>accounted for.</Muted></>}
        lead={<>{paidPlaces}+ cash prizes. Up to five paid places in every category. Open a championship to see its full table.</>}
      />
      <dl className="mb-16 grid grid-cols-2 border-t border-line md:mb-24 lg:grid-cols-4">
        {HEADLINE_PRIZES.map((h, n) => (
          <div key={h.label + h.sub} className={`border-b border-line py-6 pr-4 lg:border-b-0 ${n % 2 ? "border-l pl-4" : ""} lg:pl-6 ${n ? "lg:border-l" : "lg:pl-0"}`} data-reveal style={i(n)}>
            <dt className="label !text-[10px] text-muted">{h.sub}</dt>
            <dd className={`mt-4 font-extrabold tracking-[-0.04em] ${typeof h.prize === "number" ? "text-[clamp(1.9rem,4.2vw,3.4rem)]" : "text-[clamp(1.4rem,2.6vw,2.2rem)] leading-[1.05]"}`}>{prizeLabel(h.prize)}</dd>
            <dd className="mt-1 text-sm text-muted">{h.label}</dd>
          </div>
        ))}
      </dl>
      <PrizeExplorer />
      <div className="mt-12 grid gap-6 text-sm md:grid-cols-3">
        <p className="text-muted">Paid by bank transfer after KYC (PAN + bank details).<Tbc /></p>
        <p className="text-muted">TDS deducted as required by Indian law.<Tbc /></p>
        <Link href="/prizes" className="inline-flex items-center gap-2 font-semibold underline decoration-line underline-offset-4 hover:decoration-current">
          Full prize &amp; payout policy <Icon name="arrow" className="size-4" />
        </Link>
      </div>
      <Cta className="mt-14" />
    </Section>
  );
}

/* 03 ─ What ₹5,000 gets you */
export function Value() {
  return (
    <Section id="value">
      <SectionHead index="03" label="Your entry" title={<>What {inr(EVENT.fee)} <Muted>gets you.</Muted></>} />
      <ol className="grid gap-x-16 md:grid-cols-2">
        {live(VALUE).map((v, n) => (
          <li key={v.title} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-line py-7" data-reveal style={i(n % 2)}>
            <span className="mono pt-1.5 text-xs text-muted">0{n + 1}</span>
            <div>
              <p className="text-2xl font-bold tracking-[-0.02em]">
                {v.title}
                {v.tbc && <Tbc note="Inclusion to confirm (N1)" />}
              </p>
              <p className="mt-2 max-w-md text-muted">{v.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-16 flex flex-col gap-10 border-t border-line pt-12 lg:flex-row lg:items-end lg:justify-between">
        <p className="display max-w-[16ch] text-[clamp(2.2rem,4.5vw,4rem)]">
          All of it — plus a shot at <span className="text-signal">₹1.5 crore.</span>
        </p>
        <Cta label={`Claim my spot — ${inr(EVENT.fee)}`} />
      </div>
    </Section>
  );
}

/* 04 ─ The stage + the legends */
export function Stage() {
  const legends = live(LEGENDS);
  return (
    <Section id="stage" className="!pt-0">
      <div className="relative -mx-5 md:-mx-10">
        <MediaSlot label="Stage · hero still" ratio="21:9" className="aspect-[4/5] md:aspect-[21/9]" />
        <div className="absolute inset-x-5 bottom-10 md:inset-x-10 md:bottom-14">
          <p className="label mb-4 text-muted">04 · The stage</p>
          <h2 className="display text-[clamp(3.2rem,10vw,9rem)]" data-reveal>
            Under the lights.
          </h2>
        </div>
      </div>

      <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
        <p className="lede !max-w-none text-[clamp(1.25rem,2vw,1.75rem)] !leading-snug !text-fg lg:col-span-6">
          Three days in one arena. A production built for champions: LED stage, live broadcast, professional photography — and a crowd that came to see strength.
          <Tbc note="Production details to confirm" />
        </p>
        <ul className="lg:col-span-5 lg:col-start-8">
          {["Fitness & sports expo", "Athlete meet & greet", "Food & lifestyle zones", "Music & cultural showcase"].map((t, n) => (
            <li key={t} className="flex justify-between border-t border-line py-4 text-lg font-medium last:border-b">
              {t}
              <span className="mono text-xs text-muted">0{n + 1}</span>
            </li>
          ))}
        </ul>
      </div>

      {legends.length > 0 && (
        <div className="mt-24 md:mt-32">
          <div className="mb-10 flex items-center gap-4">
            <span className="label">The names behind it</span>
            <span data-rule className="h-px flex-1 bg-line" />
          </div>
          <ul className="rail -mx-5 !gap-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:px-0">
            {legends.map((l, n) => (
              <li key={l.name} className="w-[72vw] md:w-auto" data-reveal style={i(n)}>
                <MediaSlot label={l.name} ratio="3:4" className="aspect-[3/4]" />
                <p className="mt-5 text-2xl font-bold tracking-[-0.02em]">
                  {l.name}
                  <Tbc note="Written consent needed (N3)" />
                </p>
                <p className="text-sm text-muted">
                  {l.title} · {l.line}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-24 grid border-t border-line md:mt-32 md:grid-cols-2">
        <div className="py-12 md:pr-12" data-reveal>
          <p className="label text-muted">Utkal Kesari 2026 · Dangal</p>
          <p className="display-c mt-6 text-[clamp(7rem,16vw,13rem)] text-signal">25</p>
          <p className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">years later, the Dangal returns.</p>
          <p className="mt-4 max-w-sm text-muted">The winner rides home on a Royal Enfield Bullet. Runner-up takes {inr(100000)}.</p>
        </div>
        <div className="border-t border-line py-12 md:border-t-0 md:border-l md:pl-12" data-reveal style={i(1)}>
          <p className="label text-muted">Star Category · Para-athletes</p>
          <p className="display-c mt-6 text-[clamp(7rem,16vw,13rem)]">Free</p>
          <p className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">Different bodies. Same spirit.</p>
          <p className="mt-4 max-w-sm text-muted">Free registration for athletes with physical disabilities, with a {inr(210000)} prize table.</p>
          <Link href={registerHref("bodybuilding", "star", "Open")} className="mt-6 inline-flex items-center gap-2 font-semibold underline decoration-line underline-offset-4 hover:decoration-current">
            Register free <Icon name="arrow" className="size-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* 05 ─ Three days */
export function Days() {
  return (
    <Section id="schedule" theme="paper">
      <SectionHead index="05" label="Schedule" title={<>Three days. <Muted>You need one.</Muted></>} lead={<>Every category competes in a fixed session, so you plan travel for your day only.<Tbc note="Session-level schedule per category" /></>} />
      <ol className="grid border-t border-fg md:grid-cols-3">
        {DAYS.map((d, n) => (
          <li key={d.day} className={`py-8 md:px-8 md:py-10 ${n ? "border-t border-line md:border-t-0 md:border-l" : "md:pl-0"}`} data-reveal style={i(n)}>
            <p className="mono text-xs text-muted">{d.date}</p>
            <p className="display-c mt-4 text-[5.5rem]">0{n + 1}</p>
            <p className="mt-4 text-2xl font-bold tracking-[-0.02em]">{d.title}</p>
            <ul className="mt-5">
              {d.items.map((t) => (
                <li key={t} className="border-t border-line py-2.5 text-muted">
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 06 ─ Built on trust */
export function Trust() {
  const items = [
    { t: "Independent judges", b: "A certified panel drawn from multiple states. Scores and results are published.", tbc: "Judges list (N4)" },
    { t: "Published rulebooks", b: "Rules, weigh-ins, eligibility and anti-doping policy for every championship.", tbc: "Rulebooks (B8)" },
    { t: "Medical cover", b: "On-site medical team and ambulance for all three days.", tbc: "Medical partner (N4)" },
    { t: "Secure payments", b: "UPI, cards and netbanking via Razorpay. Instant receipt and GST invoice." },
    { t: "Registered association", b: `All Odisha Gym Association · ${EVENT.regdNo}`, tbc: EVENT.tbc.identity },
    { t: "One official helpline", b: `${EVENT.phone} · calls and WhatsApp, 9 am – 9 pm`, tbc: "Support hours" },
  ];
  return (
    <Section id="trust">
      <SectionHead index="06" label="Built on trust" title={<>Real organisers. <Muted>Real prizes.</Muted></>} />
      <figure className="border-y border-line py-12 md:py-20" data-reveal>
        <blockquote className="display max-w-[22ch] text-[clamp(2rem,4.6vw,4.4rem)]">
          “The ₹1.5 crore is committed. It does not depend on how many athletes register.”
          <Tbc note="Written commitment needed (B2)" />
        </blockquote>
        <figcaption className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="label text-muted">— All Odisha Gym Association</span>
          <Link href="/prizes" className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-current">
            Prize &amp; payout policy <Icon name="arrow" className="size-4" />
          </Link>
        </figcaption>
      </figure>

      <ul className="grid gap-8 py-12 sm:grid-cols-3 md:py-16">
        {ORGANISERS.map((o) => (
          <li key={o.name} className="flex items-center gap-5">
            <span className="grid size-16 shrink-0 place-items-center bg-raise text-lg font-bold tracking-tight">{o.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
            <span>
              <span className="block text-xl font-bold tracking-[-0.02em]">{o.name}</span>
              <span className="text-sm text-muted">{o.role}, AOGA</span>
            </span>
          </li>
        ))}
      </ul>

      <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, n) => (
          <li key={t.t} className="border-t border-line py-7" data-reveal style={i(n % 3)}>
            <p className="text-lg font-bold">
              {t.t}
              {t.tbc && <Tbc note={t.tbc} />}
            </p>
            <p className="mt-2 text-muted">{t.b}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* 07 ─ Register (signal) */
export function Register() {
  const steps = [
    { t: "Choose your category", b: "Sport, division, class. Already picked one? It’s pre-filled." },
    { t: "Your details", b: "Name, mobile, email, city and gym. Seven fields." },
    { t: `Pay ${inr(EVENT.fee)}`, b: "UPI, card or netbanking. Confirmation lands on WhatsApp." },
  ];
  return (
    <Section id="register" theme="signal">
      <SectionHead index="07" label="Register" title={<>Three steps. <Muted>Two minutes.</Muted></>} />
      <ol className="grid border-t border-fg md:grid-cols-3">
        {steps.map((s, n) => (
          <li key={s.t} className={`py-8 md:px-8 ${n ? "border-t border-line md:border-t-0 md:border-l" : "md:pl-0"}`} data-reveal style={i(n)}>
            <p className="display-c text-[6rem]">{n + 1}</p>
            <p className="mt-4 text-2xl font-bold tracking-[-0.02em]">{s.t}</p>
            <p className="mt-2 text-muted">{s.b}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-10 border-t border-fg pt-12 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="label">Registration closes in</p>
          <p className="mt-3 text-[clamp(2rem,5vw,3.6rem)] font-medium">
            <Countdown />
          </p>
          <p className="mt-6 max-w-md text-sm">
            Full refund if the event is cancelled. Free category change or transfer until registrations close.
            <Tbc note="Refund policy (B6)" />
          </p>
          <p className="mt-2 text-sm text-muted">UPI · Cards · Netbanking — secured by Razorpay</p>
        </div>
        <div className="flex flex-col gap-5">
          <Cta tone="ink" wide micro={false} />
          <WhatsAppLink label="Coach registering a team? WhatsApp us" />
        </div>
      </div>
    </Section>
  );
}

/* 08 ─ Venue */
export function Venue() {
  const rows = [
    ["Fly in", "Biju Patnaik International Airport (BBI)"],
    ["By train", "Bhubaneswar Railway Station (BBS)"],
    ["Stay", "Partner hotels at athlete rates — shared after you register"],
  ];
  return (
    <Section id="venue">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHead index="08" label="Venue" title={<>{EVENT.venue}<Tbc note={EVENT.tbc.venue} /></>} lead={EVENT.city} className="!mb-10" />
          <dl>
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 border-t border-line py-4 last:border-b">
                <dt className="label pt-1 !text-[10px] text-muted">{k}</dt>
                <dd>
                  {v}
                  <Tbc note="Distances / partners" />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <a href={EVENT.mapsUrl} target="_blank" rel="noopener" className="group finder-frame relative block aspect-square overflow-hidden lg:col-span-5 lg:col-start-8" aria-label="Open the venue in Google Maps">
          <svg aria-hidden viewBox="0 0 400 400" className="absolute inset-0 size-full text-line" fill="none" stroke="currentColor">
            <path d="M-20 290 L420 150" strokeWidth="14" />
            <path d="M130 -20 L250 420" strokeWidth="8" />
            <path d="M-20 90 Q 200 130 420 60" strokeWidth="4" />
            <path d="M40 420 L120 -20 M300 -20 L360 420" strokeWidth="2" />
          </svg>
          <span className="absolute top-[47%] left-[49%] -translate-1/2">
            <span className="absolute inset-0 animate-ping rounded-full bg-signal/40" />
            <span className="sun relative block size-5" />
          </span>
          <span className="label absolute bottom-5 left-5 inline-flex items-center gap-2 !text-[10px]">
            Open in Google Maps <Icon name="external" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </a>
      </div>
    </Section>
  );
}

/* 09 ─ FAQ */
export function Faq() {
  return (
    <Section id="faq" theme="paper">
      <SectionHead index="09" label="FAQ" title={<>Before you <Muted>register.</Muted></>} />
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="text-muted">Can’t find your answer? A real person replies on WhatsApp, usually within minutes.</p>
            <WhatsAppLink className="mt-5" label="Ask on WhatsApp" />
            <Cta className="mt-10" micro={false} />
          </div>
        </div>
        <div className="border-b border-line lg:col-span-8">
          {live(FAQ).map((f) => (
            <details key={f.q} className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-lg font-semibold tracking-[-0.01em] md:text-xl [&::-webkit-details-marker]:hidden">
                <span>
                  {f.q}
                  {f.tbc && <Tbc />}
                </span>
                <Icon name="plus" className="mt-1 size-5 shrink-0 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-7 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* 10 ─ Final call: the sun rises on the last screen */
export function FinalCall() {
  return (
    <section id="final" className="t-ink relative isolate overflow-hidden px-5 pt-28 pb-0 text-center md:px-10 md:pt-40">
      <p className="label text-muted">04—06 December 2026 · Bhubaneswar</p>
      <h2 className="display mx-auto mt-8 max-w-[13ch] text-[clamp(3.2rem,10vw,9rem)]" data-reveal>
        <span className="block">₹1.5 crore.</span>
        <span className="block">One stage.</span>
        <span className="block text-muted">Your name on it.</span>
      </h2>
      <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 md:mt-16">
        <Cta wide micro={false} label={`Take the stage — ${inr(EVENT.fee)}`} />
        <p className="text-sm text-muted">
          Closes in <Countdown />
        </p>
      </div>
      {/* the sun rises on the horizon as you arrive */}
      <div aria-hidden className="relative mt-20 h-[46vw] max-h-[420px] md:mt-28">
        <div className="absolute top-0 left-1/2 size-[124vw] max-h-[1040px] max-w-[1040px] -translate-x-1/2">
          <div className="sun sun-scroll size-full" />
        </div>
      </div>
    </section>
  );
}

/* Footer */
export function Footer() {
  const links = [
    ["Prize policy", "/prizes"],
    ["Rules", "/rules"],
    ["Refunds", "/refund"],
    ["Terms", "/terms"],
    ["Privacy", "/privacy"],
    ["Partner with us", "/partner"],
    ["International athletes", "/international"],
  ];
  return (
    <footer className="t-ink relative border-t border-line px-5 pt-16 pb-32 md:px-10 md:pb-12">
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark />
          <p className="mt-8 max-w-sm text-sm text-muted">
            Organised by the {EVENT.organiser}. {EVENT.address}. {EVENT.regdNo} · GSTIN {EVENT.gstin}
            <Tbc note={EVENT.tbc.identity} />
          </p>
        </div>
        <div className="space-y-2 text-sm md:col-span-3">
          <p className="label mb-4 !text-[10px] text-muted">Contact</p>
          <a href={EVENT.phoneHref} className="block hover:text-signal">{EVENT.phone}</a>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="block hover:text-signal">WhatsApp</a>
          <p className="text-muted">{EVENT.email}</p>
          {EVENT.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener" className="block hover:text-signal">{s.label}</a>
          ))}
        </div>
        <ul className="space-y-2 text-sm md:col-span-4">
          <li className="label mb-4 !text-[10px] text-muted">Information</li>
          {links.map(([l, h]) => (
            <li key={h}>
              <Link href={h} className="hover:text-signal">{l}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1360px] justify-between border-t border-line pt-6 text-xs text-muted">
        <span>© {EVENT.year} {EVENT.organiser}</span>
        <span lang="or">ଜୟ ଓଡ଼ିଶା</span>
      </div>
    </footer>
  );
}
