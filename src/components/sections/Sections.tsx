import Image from "next/image";
import Link from "next/link";
import { DAYS, EVENT, FAQ, HEADLINE_PRIZES, LEGENDS, ORGANISERS, VALUE, paidPlaces, registerHref } from "@/data/festival";
import { inr, prizeLabel } from "@/lib/format";
import { Finder } from "../Finder";
import { Icon, WhatsAppGlyph, Wordmark } from "../icons";
import { CountdownBoxes } from "../live";
import { PrizeExplorer } from "../PrizeExplorer";
import { Cta, Gold, Section, SectionHead, Tbc, WhatsAppLink, live } from "../ui";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
/** highlight on light backgrounds: gold block behind ink text */
const Mark = ({ children }: { children: React.ReactNode }) => <span className="bg-[linear-gradient(transparent_58%,#ffb81c_58%,#ffb81c_92%,transparent_92%)] box-decoration-clone px-[0.06em]">{children}</span>;

/* 01 ─ Choose your sport */
export function Arena() {
  return (
    <Section id="arena">
      <SectionHead title={<>Choose your sport. <Gold>See your prize.</Gold></>} lead="Pick your sport and weight class — we’ll show you exactly how much you can win." />
      <Finder />
    </Section>
  );
}

/* 02 ─ Prize pool (light: reads like an official prize sheet) */
export function Prizes() {
  return (
    <Section id="prizes" theme="paper">
      <SectionHead title={<><Mark>₹1,50,00,000</Mark> prize money</>} lead={<>{paidPlaces}+ athletes will take home cash. Up to 5 winners in every category.</>} />
      <ul className="mb-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HEADLINE_PRIZES.map((h, n) => (
          <li key={h.label + h.sub} className="card relative overflow-hidden p-5 md:p-6" data-reveal style={i(n)}>
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gold" />
            <Icon name={typeof h.prize === "number" ? "trophy" : "flame"} className="size-7 text-amber-600" />
            <p className={`display mt-4 leading-none ${typeof h.prize === "number" ? "text-[clamp(1.9rem,4.5vw,3rem)]" : "text-[clamp(1.4rem,3vw,2.1rem)]"}`}>{prizeLabel(h.prize)}</p>
            <p className="mt-2 text-sm font-semibold">{h.label}</p>
            <p className="text-xs text-muted">{h.sub}</p>
          </li>
        ))}
      </ul>
      <PrizeExplorer />
      <div className="mt-10 grid gap-4 text-sm md:grid-cols-3">
        <p className="flex gap-3"><Icon name="shield" className="size-5 shrink-0 text-amber-600" />Paid by bank transfer after simple KYC (PAN + bank details).<Tbc /></p>
        <p className="flex gap-3"><Icon name="doc" className="size-5 shrink-0 text-amber-600" />TDS deducted as per Indian tax rules.<Tbc /></p>
        <Link href="/prizes" className="flex gap-3 font-semibold underline decoration-line underline-offset-4 hover:decoration-current">
          <Icon name="arrow" className="size-5 shrink-0" />Read the full prize policy
        </Link>
      </div>
      <Cta className="mt-10" label={`Register now — ${inr(EVENT.fee)}`} />
    </Section>
  );
}

/* 03 ─ Champions + special categories */
export function Champions() {
  const legends = live(LEGENDS);
  return (
    <Section id="champions">
      <SectionHead title={<>India’s champions are <Gold>behind this festival.</Gold></>} />
      {legends.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-3">
          {legends.map((l, n) => (
            <li key={l.name} className="card flex items-center gap-5 p-5 md:p-6" data-reveal style={i(n)}>
              <span className="relative size-20 shrink-0 overflow-hidden rounded-full ring-2 ring-gold md:size-24">
                <Image src={l.face} alt={l.name} fill sizes="96px" className="object-cover" />
              </span>
              <span>
                <span className="display block text-2xl md:text-3xl">
                  {l.name}
                  <Tbc note="Written consent needed (N3)" />
                </span>
                <span className="block text-sm text-muted">{l.title}</span>
                <span className="mt-1 block text-xs font-semibold text-gold">{l.line}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card relative overflow-hidden p-6 md:p-8" data-reveal>
          <p className="label text-gold">Utkal Kesari 2026 · Dangal</p>
          <p className="display mt-4 text-[clamp(4.5rem,11vw,7.5rem)] leading-none text-gold">25 years</p>
          <p className="display mt-1 text-3xl md:text-4xl">later, the Dangal returns</p>
          <p className="mt-4 text-muted">Winner takes home a <b className="text-white">Royal Enfield Bullet</b>. Runner-up wins {inr(100000)}.</p>
        </div>
        <div className="card relative overflow-hidden p-6 md:p-8" data-reveal style={i(1)}>
          <p className="label text-gold">Star Category · Para-athletes</p>
          <p className="display mt-4 text-[clamp(4.5rem,11vw,7.5rem)] leading-none text-gold">Free</p>
          <p className="display mt-1 text-3xl md:text-4xl">registration · {inr(210000)} prizes</p>
          <p className="mt-4 text-muted">For athletes with physical disabilities. Different bodies, same spirit.</p>
          <Link href={registerHref("bodybuilding", "star", "Open")} className="mt-5 inline-flex items-center gap-2 font-semibold text-gold hover:underline">
            Register free <Icon name="arrow" className="size-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* 04 ─ What ₹5,000 gets you */
export function Value() {
  return (
    <Section id="value" theme="paper">
      <SectionHead title={<>What you get for <Mark>{inr(EVENT.fee)}</Mark></>} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {live(VALUE).map((v, n) => (
          <li key={v.title} className="card flex gap-4 p-5 md:p-6" data-reveal style={i(n % 3)}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-ink">
              <Icon name={v.icon} className="size-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">
                {v.title}
                {v.tbc && <Tbc note="Inclusion to confirm (N1)" />}
              </p>
              <p className="mt-1 text-sm text-muted">{v.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-6 rounded-2xl bg-ink p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <p className="display text-3xl md:text-4xl">
          All this + a chance to win <span className="text-gold">₹1.5 Crore</span>
        </p>
        <Cta micro={false} label="Book my spot" />
      </div>
    </Section>
  );
}

/* 05 ─ Schedule */
export function Days() {
  return (
    <Section id="schedule">
      <SectionHead title={<>3 days of action. <Gold>You need just one.</Gold></>} lead={<>Each category competes on a fixed day, so you only travel for your day.<Tbc note="Session-level schedule per category" /></>} />
      <ol className="grid gap-3 md:grid-cols-3">
        {DAYS.map((d, n) => (
          <li key={d.day} className="card overflow-hidden" data-reveal style={i(n)}>
            <div className="flex items-baseline justify-between bg-gold px-6 py-4 text-ink">
              <span className="display text-3xl">{d.day}</span>
              <span className="text-sm font-semibold">{d.date}</span>
            </div>
            <div className="p-6">
              <p className="display text-2xl">{d.title}</p>
              <ul className="mt-4 space-y-2.5">
                {d.items.map((t) => (
                  <li key={t} className="flex gap-2.5 text-muted">
                    <Icon name="check" className="mt-0.5 size-5 shrink-0 text-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 06 ─ Trust */
export function Trust() {
  const items = [
    { icon: "users", t: "Independent judges", b: "Certified judges from different states. Results published openly.", tbc: "Judges list (N4)" },
    { icon: "doc", t: "Clear rulebooks", b: "Rules, weigh-in and eligibility for every sport — download before you register.", tbc: "Rulebooks (B8)" },
    { icon: "shield", t: "Doctors on site", b: "Medical team and ambulance ready all 3 days.", tbc: "Medical partner (N4)" },
    { icon: "lock", t: "Safe payment", b: "Pay by UPI, card or netbanking through Razorpay. Instant receipt." },
    { icon: "badge", t: "Registered association", b: `All Odisha Gym Association · ${EVENT.regdNo}`, tbc: EVENT.tbc.identity },
    { icon: "phone", t: "Real people, real help", b: `${EVENT.phone} · Call or WhatsApp, 9 am – 9 pm`, tbc: "Support hours" },
  ];
  return (
    <Section id="trust" theme="paper">
      <SectionHead title={<>Organised by <Mark>AOGA</Mark></>} lead="All Odisha Gym Association — the state body for gyms and fitness in Odisha." />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card flex flex-col items-center gap-6 p-6 text-center md:p-8 lg:col-span-4" data-reveal>
          <Image src="/img/aoga.webp" alt="All Odisha Gym Association crest" width={320} height={331} className="w-40 md:w-48" />
          <ul className="w-full divide-y divide-line text-left">
            {ORGANISERS.map((o) => (
              <li key={o.name} className="flex items-center justify-between gap-3 py-3">
                <span className="font-semibold">{o.name}</span>
                <span className="text-sm text-muted">{o.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="rounded-2xl bg-ink p-6 text-white md:p-8" data-reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink uppercase">
              <Icon name="shield" className="size-4" /> Prize guarantee
            </span>
            <p className="display mt-5 text-[clamp(1.8rem,4vw,3rem)]">
              The <span className="text-gold">₹1.5 Crore</span> prize money is committed. It does not depend on how many athletes register.
              <Tbc note="Written commitment needed (B2)" />
            </p>
            <Link href="/prizes" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
              Prize &amp; payout policy <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((t, n) => (
              <li key={t.t} className="card flex gap-4 p-5" data-reveal style={i(n % 2)}>
                <Icon name={t.icon} className="size-6 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">
                    {t.t}
                    {t.tbc && <Tbc note={t.tbc} />}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* 07 ─ Register (gold) */
export function Register() {
  const steps = [
    { icon: "trophy", t: "Choose your category", b: "Sport and weight class. Already chosen above? It’s filled in for you." },
    { icon: "users", t: "Fill your details", b: "Name, mobile, email, city and gym. Only 7 fields." },
    { icon: "rupee", t: `Pay ${inr(EVENT.fee)} by UPI`, b: "GPay, PhonePe, Paytm or any UPI app. Card and netbanking also work." },
  ];
  return (
    <Section id="register" theme="gold">
      <SectionHead title="Register in 3 easy steps — just 2 minutes" />
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((s, n) => (
          <li key={s.t} className="rounded-2xl bg-white/60 p-6" data-reveal style={i(n)}>
            <div className="flex items-center justify-between">
              <span className="display grid size-12 place-items-center rounded-full bg-ink text-2xl text-gold">{n + 1}</span>
              <Icon name={s.icon} className="size-8" />
            </div>
            <p className="display mt-5 text-2xl">{s.t}</p>
            <p className="mt-2 text-sm text-muted">{s.b}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="label mb-3">Registrations close in</p>
          <CountdownBoxes />
          <p className="mt-4 text-sm">
            Full refund if the event is cancelled. Free category change until registrations close.
            <Tbc note="Refund policy (B6)" />
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Cta tone="ink" wide micro={false} label={`Register now — ${inr(EVENT.fee)}`} />
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn w-full bg-wa text-white">
            <WhatsAppGlyph className="size-6" /> Register on WhatsApp
          </a>
          <p className="text-center text-xs text-muted">Coaches: register your whole team in one message on WhatsApp.</p>
        </div>
      </div>
    </Section>
  );
}

/* 08 ─ Venue */
export function Venue() {
  const rows = [
    ["plane", "By air", "Biju Patnaik International Airport (BBI), Bhubaneswar"],
    ["train", "By train", "Bhubaneswar Railway Station (BBS)"],
    ["hotel", "Stay", "Partner hotels at athlete rates — details after you register"],
  ];
  return (
    <Section id="venue">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHead title={<>{EVENT.venue}<Tbc note={EVENT.tbc.venue} /></>} lead={EVENT.city} className="!mb-8" />
          <ul className="space-y-3">
            {rows.map(([ic, k, v]) => (
              <li key={k} className="card flex items-center gap-4 p-4">
                <Icon name={ic} className="size-6 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs font-semibold text-muted uppercase">{k}</span>
                  {v}
                  <Tbc note="Distances / partners" />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <a href={EVENT.mapsUrl} target="_blank" rel="noopener" className="group card relative block aspect-[4/3] overflow-hidden" aria-label="Open the venue in Google Maps">
          <svg aria-hidden viewBox="0 0 400 300" className="absolute inset-0 size-full text-line" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid slice">
            <path d="M-20 220 L420 110" strokeWidth="14" />
            <path d="M130 -20 L250 320" strokeWidth="8" />
            <path d="M-20 70 Q 200 100 420 40" strokeWidth="4" />
            <path d="M40 320 L120 -20 M300 -20 L360 320" strokeWidth="2" />
          </svg>
          <span className="absolute top-[46%] left-[48%] -translate-1/2">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
            <Icon name="pin" className="relative size-12 fill-gold text-ink" />
          </span>
          <span className="btn btn-gold absolute bottom-5 left-5 !min-h-11 !text-sm">
            Open in Google Maps <Icon name="external" className="size-4" />
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
      <SectionHead title="Your questions, answered" />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {live(FAQ).map((f) => (
            <details key={f.q} className="group card open:ring-2 open:ring-gold">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-5 text-base font-semibold md:text-lg [&::-webkit-details-marker]:hidden">
                <span>
                  {f.q}
                  {f.tbc && <Tbc />}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold text-ink transition-transform duration-300 group-open:rotate-45">
                  <Icon name="plus" className="size-4" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-28">
            <WhatsAppGlyph className="size-10 text-wa" />
            <p className="display mt-4 text-3xl">Still have a question?</p>
            <p className="mt-2 text-sm text-white/70">Message us on WhatsApp. A real person replies, usually within minutes.</p>
            <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn mt-6 w-full bg-wa text-white">
              Chat on WhatsApp
            </a>
            <a href={EVENT.phoneHref} className="mt-3 block text-center text-sm font-semibold text-gold">
              or call {EVENT.phone}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 10 ─ Final call */
export function FinalCall() {
  return (
    <section id="final" className="t-ink relative isolate overflow-hidden px-5 py-24 md:px-10 md:py-32">
      <div aria-hidden className="slash absolute inset-0 -z-10 opacity-35 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" />
      <div className="mx-auto max-w-[1680px] text-center">
        <p className="label text-gold">Last call · 4–6 December 2026</p>
        <h2 className="display mx-auto mt-4 max-w-[16ch] text-[clamp(3rem,9vw,7.5rem)]">
          <span className="text-gold">₹1.5 Crore.</span> One stage. Your name.
        </h2>
        <div className="mx-auto mt-10 max-w-xl">
          <CountdownBoxes glass />
        </div>
        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3">
          <Cta wide micro={false} label={`Register now — ${inr(EVENT.fee)}`} />
          <WhatsAppLink label="Need help? WhatsApp us" />
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
    <footer className="t-ink border-t border-line px-5 pt-14 pb-32 md:px-10 md:pb-14">
      <div className="mx-auto grid max-w-[1680px] gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark />
          <div className="mt-6 flex items-center gap-4">
            <Image src="/img/aoga.webp" alt="AOGA" width={320} height={331} className="size-14" />
            <p className="text-sm text-muted">
              Organised by the {EVENT.organiser}
              <br />
              {EVENT.regdNo} · GSTIN {EVENT.gstin}
              <Tbc note={EVENT.tbc.identity} />
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm md:col-span-3">
          <p className="label mb-3 text-gold">Contact</p>
          <a href={EVENT.phoneHref} className="block hover:text-gold">{EVENT.phone}</a>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="block hover:text-gold">WhatsApp</a>
          <p className="text-muted">{EVENT.email}</p>
          {EVENT.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener" className="block hover:text-gold">{s.label}</a>
          ))}
        </div>
        <ul className="space-y-2 text-sm md:col-span-4">
          <li className="label mb-3 text-gold">Information</li>
          {links.map(([l, h]) => (
            <li key={h}>
              <Link href={h} className="hover:text-gold">{l}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1680px] flex-wrap justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
        <span>© {EVENT.year} {EVENT.organiser} · sportsfestival</span>
        <span>
          Jai Hind · Jai Odisha
        </span>
      </div>
    </footer>
  );
}
