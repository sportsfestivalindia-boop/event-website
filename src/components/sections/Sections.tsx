import Image from "next/image";
import Link from "next/link";
import { COMMITTEE, DANGAL_FEE, DAYS, DOCUMENTS, EVENT, FAQ, HEADLINE_PRIZES, LEGENDS, ORGANISERS, REFUND, VALUE, minFee, paidPlaces, registerHref } from "@/data/festival";
import { STALLS } from "@/data/partners";
import { inr, prizeLabel } from "@/lib/format";
import { Finder } from "../Finder";
import { Icon, WhatsAppGlyph, Wordmark } from "../icons";
import { CountdownBoxes } from "../live";
import { Cta, Gold, POLICY_LINKS, Section, SectionHead, WhatsAppLink } from "../ui";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
/** highlight on light backgrounds: gold block behind ink text */
const Mark = ({ children }: { children: React.ReactNode }) => <span className="bg-[linear-gradient(transparent_58%,#ffb81c_58%,#ffb81c_92%,transparent_92%)] box-decoration-clone px-[0.06em]">{children}</span>;

/* 01 ─ Choose your sport */
export function Arena() {
  return (
    <Section id="arena">
      <SectionHead title={<>Choose your sport. <Gold>Find your class.</Gold></>} lead="Pick your sport and weight class — see your competition day, entry fee and the prize money awarded to the winners." />
      <Finder />
    </Section>
  );
}

/* 02 ─ Prize pool (light: reads like an official prize sheet) */
export function Prizes() {
  return (
    <Section id="prizes" theme="paper">
      <SectionHead title={<><Mark>₹1,50,00,000</Mark> prize money</>} lead={<>{paidPlaces}+ podium places with cash awards — up to 5 per category, decided on merit by qualified judges and official results.</>} />
      <ul className="mb-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HEADLINE_PRIZES.map((h, n) => (
          <li key={h.label + h.sub} className="card relative overflow-hidden p-5 md:p-6" data-reveal style={i(n)}>
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gold" />
            <Icon name={typeof h.prize === "number" ? "trophy" : "flame"} className="size-7 text-amber-600" />
            <p className={`display mt-4 leading-none ${typeof h.prize === "number" ? "text-[clamp(1.4rem,6.4vw,3rem)] whitespace-nowrap lg:text-[clamp(1.9rem,2.6vw,3rem)]" : "text-[clamp(1.3rem,5.5vw,2.1rem)]"}`}>{prizeLabel(h.prize)}</p>
            <p className="mt-2 text-sm font-semibold">{h.label}</p>
            <p className="text-xs text-muted">{h.sub}</p>
          </li>
        ))}
      </ul>
      <Cta className="-mt-4" label={`Register now — from ${inr(minFee)}`} />
    </Section>
  );
}

/* 03 ─ Champions + special categories */
export function Champions() {
  const legends = LEGENDS;
  return (
    <Section id="champions">
      <SectionHead title={<>India’s champions are <Gold>behind this festival.</Gold></>} />
      {legends.length > 0 && (
        <ul className="rail -mx-5 !gap-3 md:mx-0 md:grid md:grid-cols-3 md:!gap-4 md:px-0">
          {legends.map((l, n) => (
            <li key={l.name} className="group card w-[78vw] overflow-hidden md:w-auto" data-reveal style={i(n)}>
              <div className="relative aspect-[4/5] overflow-hidden 2xl:aspect-square">
                <Image src={l.face} alt={l.name} fill sizes="(min-width: 768px) 33vw, 78vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <p className="display text-3xl md:text-4xl">
                    {l.name}
                  </p>
                  <p className="mt-1 text-sm text-white/80">{l.title}</p>
                </div>
              </div>
              <p className="flex items-center gap-2 border-t border-line bg-gold px-5 py-3 text-sm font-semibold text-ink md:px-6">
                <Icon name="trophy" className="size-4" /> {l.line}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card relative overflow-hidden p-6 md:p-8" data-reveal>
          <p className="label text-gold">Utkal Kesari 2026 · Dangal</p>
          <p className="display mt-4 text-[clamp(4.5rem,11vw,7.5rem)] leading-none text-gold">25 years</p>
          <p className="display mt-1 text-3xl md:text-4xl">later, the Dangal returns</p>
          <p className="mt-4 text-muted">
            Utkal Kesari (men) winner takes home a <b className="text-white">Royal Enfield Bullet</b> and the Gada. Women’s Utkal Kesari winner wins {inr(100000)} and the Gada. Plus weight-category bouts for men and women — entry just {inr(DANGAL_FEE)}.
          </p>
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
      <SectionHead title={<>What a <Mark>{inr(EVENT.fee)}</Mark> entry gets you</>} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VALUE.map((v, n) => (
          <li key={v.title} className="card flex gap-4 p-5 md:p-6" data-reveal style={i(n % 3)}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-ink">
              <Icon name={v.icon} className="size-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">
                {v.title}
              </p>
              <p className="mt-1 text-sm text-muted">{v.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-6 rounded-2xl bg-ink p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <p className="display text-3xl md:text-4xl">
          All this — and your shot at the <span className="text-gold">podium</span>
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
      <SectionHead title={<>3 days of action. <Gold>Find your day.</Gold></>} lead="Strength sports and the marathon on Day 1. Bodybuilding prelims on Day 2, finals on Day 3. Detailed timings are finalised by the Technical Committee." />
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
    { icon: "users", t: "Qualified judging panel", b: "Chief Judge, judges, jury and statisticians appointed by the Technical Committee. Judges must stay impartial." },
    { icon: "doc", t: "Official rules", b: "Conducted under rules approved by the Organising and Technical Committees. Weigh-in is compulsory." },
    { icon: "shield", t: "Medical support", b: "First aid, medical personnel and ambulance / emergency coordination at the venue." },
    { icon: "lock", t: "Pay by UPI", b: `Scan the UPI QR (paid to ${EVENT.upi.payee}) with GPay, PhonePe, Paytm or any UPI app. Confirmed by the AOGA team on WhatsApp.` },
    { icon: "badge", t: "Official organiser", b: `${EVENT.organiser}${EVENT.regdNo ? ` · Regd. No. ${EVENT.regdNo}` : ""} · ${EVENT.address}` },
    { icon: "phone", t: "Real people, real help", b: `${EVENT.phone} · ${EVENT.email}` },
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
                  </p>
                  <p className="mt-1 text-sm text-muted">{t.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="card p-6 md:p-8 lg:col-span-8" data-reveal>
          <p className="label text-amber-700">Organising committee</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {COMMITTEE.map((n) => (
              <li key={n} className="rounded-full border border-line px-3 py-1.5 text-sm font-medium">
                {n}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 md:p-8 lg:col-span-4" data-reveal style={i(1)}>
          <p className="label text-amber-700">Bring on event day</p>
          <ul className="mt-4 space-y-2 text-sm">
            {DOCUMENTS.map((d) => (
              <li key={d} className="flex gap-2">
                <Icon name="check" className="size-5 shrink-0 text-amber-600" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted">Information as per the AOGA official circular, Ref. {EVENT.circularRef}.</p>
    </Section>
  );
}

/* 07 ─ Register (gold) */
export function Register() {
  const steps = [
    { icon: "trophy", t: "Choose your category", b: "Sport and weight class. Already chosen above? It’s filled in for you." },
    { icon: "users", t: "Fill your details", b: "Name, date of birth, mobile, email, city and association. Takes a minute." },
    { icon: "lock", t: "Pay by UPI QR", b: "Scan with GPay, PhonePe, Paytm or any UPI app, then send your UTR number. AOGA confirms your pass on WhatsApp." },
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
            Full refund if the event is cancelled. {REFUND.partialPct}% refund until {REFUND.partialUntil}. Free category change until registrations close.{" "}
            <Link href="/refund" className="font-semibold underline underline-offset-4">
              Refund policy
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Cta tone="ink" wide micro={false} label={`Register now — from ${inr(minFee)}`} />
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn w-full bg-wa text-white">
            <WhatsAppGlyph className="size-6" /> Team registration on WhatsApp
          </a>
          <p className="text-center text-xs text-muted">Coaches: register your whole team in one message on WhatsApp.</p>
          <Link href="/partner#stalls" className="flex items-center justify-between gap-4 rounded-xl bg-ink px-5 py-4 text-white" data-cta="stall">
            <span>
              <span className="block text-xs font-semibold tracking-[0.16em] text-gold uppercase">Exhibitors &amp; brands</span>
              <span className="font-semibold">Book a stall at the venue — from {inr(STALLS[0].price)}</span>
            </span>
            <Icon name="arrow" className="size-5 shrink-0 text-gold" />
          </Link>
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
          <SectionHead title={EVENT.venue} lead={EVENT.city} className="!mb-8" />
          <ul className="space-y-3">
            {rows.map(([ic, k, v]) => (
              <li key={k} className="card flex items-center gap-4 p-4">
                <Icon name={ic} className="size-6 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs font-semibold text-muted uppercase">{k}</span>
                  {v}
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
          {FAQ.map((f) => (
            <details key={f.q} className="group card open:ring-2 open:ring-gold">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-5 text-base font-semibold md:text-lg [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
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
      <div className="mx-auto w-full text-center">
        <p className="label text-gold">Last call · 4–6 December 2026</p>
        <h2 className="display mx-auto mt-4 max-w-[16ch] text-[clamp(3rem,9vw,7.5rem)]">
          <span className="text-gold">Six championships.</span> One stage. Your name.
        </h2>
        <div className="mx-auto mt-10 max-w-xl">
          <CountdownBoxes glass />
        </div>
        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3">
          <Cta wide micro={false} label={`Register now — from ${inr(minFee)}`} />
          <WhatsAppLink label="Need help? WhatsApp us" />
        </div>
      </div>
    </section>
  );
}

/* Footer */
export function Footer() {
  const links = [...POLICY_LINKS, ["Partner with us", "/partner"]];
  return (
    <footer className="t-ink border-t border-line px-5 pt-14 pb-32 md:px-10 md:pb-14">
      <div className="mx-auto grid w-full gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark />
          <div className="mt-6 flex items-center gap-4">
            <Image src="/img/aoga.webp" alt="AOGA" width={320} height={331} className="size-14" />
            <p className="text-sm text-muted">
              Organised by the {EVENT.organiser} ({EVENT.organiserShort})
              <br />
              {EVENT.address}
              {(EVENT.regdNo || EVENT.gstin) && (
                <>
                  <br />
                  {[EVENT.regdNo && `Regd. No. ${EVENT.regdNo}`, EVENT.gstin && `GSTIN ${EVENT.gstin}`].filter(Boolean).join(" · ")}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm md:col-span-3">
          <p className="label mb-3 text-gold">Contact</p>
          <a href={EVENT.phoneHref} className="block hover:text-gold">{EVENT.phone}</a>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="block hover:text-gold">WhatsApp</a>
          <a href={`mailto:${EVENT.email}`} className="block hover:text-gold">{EVENT.email}</a>
          {EVENT.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener" className="block hover:text-gold">{s.label}</a>
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:col-span-4">
          <li className="label col-span-2 mb-1 text-gold">Information</li>
          {links.map(([l, h]) => (
            <li key={h}>
              <Link href={h} className="hover:text-gold">{l}</Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-12 w-full max-w-4xl text-xs leading-relaxed text-muted">
        {EVENT.name} is a physical sports competition. Results and prizes are decided solely by athletic performance — judges’ scores, weigh-ins, lifts,
        bouts and finish times — under published rules. There is no lottery, draw, betting or game of chance. The registration fee is a participation fee
        for competition entry and athlete services. Payments are made by UPI to the organiser’s collection account ({EVENT.upi.payee}).
      </p>
      <div className="mx-auto mt-6 flex w-full flex-wrap justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
        <span>© {EVENT.year} {EVENT.organiser}</span>
        <span>
          Jai Hind · Jai Odisha
        </span>
      </div>
    </footer>
  );
}
