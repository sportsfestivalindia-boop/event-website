import Link from "next/link";
import { DAYS, EVENT, FAQ, HEADLINE_PRIZES, LEGENDS, ORGANISERS, VALUE, paidPlaces, registerHref } from "@/data/festival";
import { inr, prizeLabel } from "@/lib/format";
import { Finder } from "../Finder";
import { Crest, Icon, Wheel } from "../icons";
import { Countdown } from "../live";
import { PrizeExplorer } from "../PrizeExplorer";
import { Cta, MediaSlot, Section, SectionHead, Tbc, WhatsAppLink, live } from "../ui";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

/* 03 ─ Choose your arena */
export function Arena() {
  return (
    <Section id="arena">
      <SectionHead eyebrow="Choose your arena" title={<>Find your category.<br /><span className="text-gold">See your prize.</span></>} lead="Seven championships. Pick your sport, division and class to see exactly what you can win." />
      <Finder />
    </Section>
  );
}

/* 04 ─ The ₹1.5 Crore */
export function Prizes() {
  return (
    <Section id="prizes" className="bg-[radial-gradient(60%_40%_at_50%_0%,#d4a5371a,transparent)]">
      <SectionHead
        eyebrow="The prize pool"
        title={<><span className="foil">{inr(EVENT.prizePool)}</span><br />on the line.</>}
        lead={<>{paidPlaces}+ cash prizes across seven championships. Tap a championship to see every category.</>}
      />
      <ul className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HEADLINE_PRIZES.map((h, n) => (
          <li key={h.label + h.sub} className="card p-4 md:p-5" data-reveal style={i(n)}>
            <p className="text-xs font-semibold tracking-[.14em] text-mute uppercase">{h.sub}</p>
            <p className={`display mt-3 text-gold ${typeof h.prize === "number" ? "text-[clamp(1.7rem,6.5vw,2.6rem)]" : "text-[clamp(1.3rem,5vw,2rem)]"}`}>{prizeLabel(h.prize)}</p>
            <p className="mt-1 text-sm text-ivory/80">{h.label}</p>
          </li>
        ))}
      </ul>
      <PrizeExplorer />
      <div className="mt-10 grid gap-4 text-sm text-ivory/80 md:grid-cols-3">
        <p className="flex gap-3"><Icon name="shield" className="size-5 shrink-0 text-gold" />Paid by bank transfer after KYC (PAN + bank details).<Tbc /></p>
        <p className="flex gap-3"><Icon name="doc" className="size-5 shrink-0 text-gold" />TDS deducted as required by Indian law.<Tbc /></p>
        <Link href="/prizes" className="flex gap-3 font-semibold text-molten hover:underline"><Icon name="arrow" className="size-5 shrink-0" />Read the full prize &amp; payout policy</Link>
      </div>
      <Cta className="mt-10" />
    </Section>
  );
}

/* 05 ─ What ₹5,000 gets you */
export function Value() {
  return (
    <Section id="value">
      <SectionHead eyebrow="Your entry" title={<>What {inr(EVENT.fee)}<br /><span className="text-gold">gets you.</span></>} />
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {live(VALUE).map((v, n) => (
          <li key={v.title} className="card flex gap-4 p-5 md:p-6" data-reveal style={i(n)}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold"><Icon name={v.icon} className="size-6" /></span>
            <div>
              <p className="display text-2xl">{v.title}{v.tbc && <Tbc note="Inclusion to confirm (N1)" />}</p>
              <p className="mt-1.5 text-ivory/70">{v.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <p className="display text-3xl md:text-4xl">All this — plus a shot at <span className="text-gold">₹1.5 Crore.</span></p>
        <Cta label={`Claim my spot — ${inr(EVENT.fee)}`} />
      </div>
    </Section>
  );
}

/* 06 ─ The stage + the legends */
export function Stage() {
  const legends = live(LEGENDS);
  return (
    <Section id="stage" className="overflow-hidden">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <MediaSlot label="Stage render / past AOGA event" className="aspect-[16/10] lg:aspect-[4/5]" />
        <div>
          <SectionHead eyebrow="The stage" title={<>Under the<br /><span className="text-gold">lights.</span></>} lead={<>Three days in one arena, with a production built for champions: LED stage, live broadcast, professional photography and a crowd that came to see strength.<Tbc note="Production details to confirm" /></>} />
          <ul className="space-y-3 text-ivory/80">
            {["Fitness & sports expo", "Athlete meet & greet", "Food & lifestyle zones", "Live music & cultural showcase"].map((t) => (
              <li key={t} className="flex gap-3"><Icon name="check" className="size-5 text-gold" />{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {legends.length > 0 && (
        <div className="mt-20">
          <p className="eyebrow mb-6">The legends behind it</p>
          <ul className="rail -mx-5 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0">
            {legends.map((l, n) => (
              <li key={l.name} className="w-[68vw] md:w-auto" data-reveal style={i(n)}>
                <MediaSlot label={`${l.name} portrait + video`} className="aspect-[4/5]" />
                <p className="display mt-4 text-3xl">{l.name}<Tbc note="Written consent needed (N3)" /></p>
                <p className="text-sm text-gold">{l.title}</p>
                <p className="text-sm text-mute">{l.line}</p>
              </li>
            ))}
          </ul>
          <Link href="#arena" className="mt-8 inline-flex items-center gap-2 font-semibold text-molten hover:underline">Compete with them <Icon name="arrow" className="size-5" /></Link>
        </div>
      )}

      <div className="mt-20 grid gap-4 md:grid-cols-2">
        <div className="card relative isolate overflow-hidden p-6 md:p-8" data-reveal>
          <Wheel hollow className="absolute -right-16 -bottom-16 -z-10 size-56 text-gold/10" />
          <p className="eyebrow">Utkal Kesari 2026</p>
          <p className="display mt-3 text-5xl">After 25 years,<br /><span className="text-gold">the Dangal returns.</span></p>
          <p className="mt-3 text-ivory/70">The winner rides home on a Royal Enfield Bullet. Runner-up: {inr(100000)}.</p>
        </div>
        <div className="card relative overflow-hidden p-6 md:p-8" data-reveal style={i(1)}>
          <p className="eyebrow">Star Category</p>
          <p className="display mt-3 text-5xl">Different bodies.<br /><span className="text-gold">Same spirit.</span></p>
          <p className="mt-3 text-ivory/70">For physically disabled athletes. <b className="text-ivory">Free registration</b>, and a {inr(210000)} prize table.</p>
          <Link href={registerHref("bodybuilding", "star", "Open")} className="mt-5 inline-flex items-center gap-2 font-semibold text-molten hover:underline">Register free <Icon name="arrow" className="size-5" /></Link>
        </div>
      </div>
    </Section>
  );
}

/* 07 ─ Three days */
export function Days() {
  return (
    <Section id="schedule">
      <SectionHead eyebrow="Schedule" title={<>Three days.<br /><span className="text-gold">You need one.</span></>} lead={<>Every category competes in a fixed session, so you can plan travel for your day.<Tbc note="Session-level schedule per category" /></>} />
      <ol className="grid gap-3 md:grid-cols-3">
        {DAYS.map((d, n) => (
          <li key={d.day} className="card p-6" data-reveal style={i(n)}>
            <div className="flex items-baseline justify-between">
              <span className="display text-7xl text-gold/90">0{n + 1}</span>
              <span className="text-sm font-semibold text-ivory/70">{d.date}</span>
            </div>
            <p className="display mt-4 text-3xl">{d.title}</p>
            <ul className="mt-4 space-y-2 text-ivory/75">
              {d.items.map((t) => (
                <li key={t} className="flex gap-2"><span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-gold" />{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 08 ─ Built on trust */
export function Trust() {
  const items = [
    { icon: "users", t: "Independent judges", b: "A certified panel drawn from multiple states. Scores and results are published.", tbc: "Judges list (N4)" },
    { icon: "doc", t: "Published rulebooks", b: "Rules, weigh-in procedure, eligibility and anti-doping policy for every championship.", tbc: "Rulebooks (B8)" },
    { icon: "shield", t: "Medical cover", b: "On-site medical team and ambulance throughout the festival.", tbc: "Medical partner (N4)" },
    { icon: "lock", t: "Secure payments", b: "UPI, cards and netbanking via Razorpay. Instant receipt and GST invoice." },
    { icon: "badge", t: "Registered association", b: `All Odisha Gym Association · ${EVENT.regdNo}`, tbc: EVENT.tbc.identity },
    { icon: "phone", t: "One official helpline", b: `${EVENT.phone} · WhatsApp and calls, 9 am – 9 pm`, tbc: "Support hours" },
  ];
  return (
    <Section id="trust">
      <SectionHead eyebrow="Built on trust" title={<>Real organisers.<br /><span className="text-gold">Real prizes.</span></>} />
      <div className="card relative isolate mb-4 overflow-hidden border-gold/50 bg-[linear-gradient(135deg,#d4a5371f,#16120e_60%)] p-6 md:p-10" data-reveal>
        <Wheel hollow className="absolute -top-20 -right-20 -z-10 size-72 text-gold/10" />
        <p className="eyebrow">Prize commitment</p>
        <p className="display mt-3 max-w-3xl text-[clamp(2.2rem,7vw,3.8rem)]">The ₹1.5 Crore is committed. It does not depend on how many athletes register.<Tbc note="Written commitment needed (B2)" /></p>
        <Link href="/prizes" className="mt-5 inline-flex items-center gap-2 font-semibold text-molten hover:underline">Prize &amp; payout policy <Icon name="arrow" className="size-5" /></Link>
      </div>

      <div className="card mb-4 p-6 md:p-8">
        <p className="eyebrow mb-6">Organised by the All Odisha Gym Association</p>
        <ul className="grid gap-6 sm:grid-cols-3">
          {ORGANISERS.map((o) => (
            <li key={o.name} className="flex items-center gap-4">
              <span className="display grid size-16 shrink-0 place-items-center rounded-full border border-gold/50 bg-stone-2 text-2xl text-gold">{o.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <span><span className="display block text-2xl">{o.name}</span><span className="text-sm text-mute">{o.role}</span></span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, n) => (
          <li key={t.t} className="card flex gap-4 p-5" data-reveal style={i(n)}>
            <Icon name={t.icon} className="size-6 shrink-0 text-gold" />
            <div>
              <p className="font-semibold">{t.t}{t.tbc && <Tbc note={t.tbc} />}</p>
              <p className="mt-1 text-sm text-ivory/70">{t.b}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* 09 ─ Register in 3 steps */
export function Register() {
  const steps = [
    { t: "Choose your category", b: "Sport, division, class. Already picked? It’s pre-filled." },
    { t: "Your details", b: "Name, mobile, email, city and gym. Seven fields." },
    { t: `Pay ${inr(EVENT.fee)}`, b: "UPI, card or netbanking. Confirmation lands on WhatsApp." },
  ];
  return (
    <Section id="register" className="bg-[radial-gradient(70%_60%_at_50%_100%,#d4a53722,transparent)]">
      <SectionHead eyebrow="Register" title={<>Three steps.<br /><span className="text-gold">Two minutes.</span></>} />
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((s, n) => (
          <li key={s.t} className="card p-6" data-reveal style={i(n)}>
            <span className="display grid size-12 place-items-center rounded-full bg-gold text-2xl text-ink">{n + 1}</span>
            <p className="display mt-5 text-3xl">{s.t}</p>
            <p className="mt-2 text-ivory/70">{s.b}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="space-y-3 text-ivory/85">
          <Countdown className="text-lg" />
          <p className="flex gap-3"><Icon name="shield" className="size-5 shrink-0 text-gold" />Full refund if the event is cancelled. Free category change or transfer until registrations close.<Tbc note="Refund policy (B6)" /></p>
          <p className="flex gap-3"><Icon name="lock" className="size-5 shrink-0 text-gold" />UPI · Cards · Netbanking, secured by Razorpay</p>
        </div>
        <div className="flex flex-col gap-4">
          <Cta wide label={`Register now — ${inr(EVENT.fee)}`} />
          <WhatsAppLink className="justify-center" label="Coach registering a team? WhatsApp us" />
        </div>
      </div>
    </Section>
  );
}

/* 10 ─ Venue + travel */
export function Venue() {
  return (
    <Section id="venue">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <a href={EVENT.mapsUrl} target="_blank" rel="noopener" className="card group relative block aspect-[4/3] overflow-hidden" aria-label="Open venue in Google Maps">
          <div className="absolute inset-0 bg-[linear-gradient(#3a2e2255_1px,transparent_1px),linear-gradient(90deg,#3a2e2255_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_46%,#3a2e22_46%,#3a2e22_49%,transparent_49%),linear-gradient(20deg,transparent_60%,#3a2e22_60%,#3a2e22_62%,transparent_62%)]" />
          <span className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-full place-items-center">
            <span className="absolute size-16 animate-ping rounded-full bg-gold/25" />
            <Icon name="pin" className="relative size-12 text-gold" />
          </span>
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-sm bg-ink/85 px-3 py-2 text-sm font-semibold group-hover:text-molten">Open in Google Maps <Icon name="arrow" className="size-4" /></span>
        </a>
        <div>
          <SectionHead eyebrow="Venue" title={<>{EVENT.venue}<Tbc note={EVENT.tbc.venue} /></>} lead={EVENT.city} />
          <ul className="space-y-4 text-ivory/85">
            <li className="flex gap-3"><Icon name="plane" className="size-6 shrink-0 text-gold" />Biju Patnaik International Airport (BBI)<Tbc note="Distance" /></li>
            <li className="flex gap-3"><Icon name="train" className="size-6 shrink-0 text-gold" />Bhubaneswar Railway Station (BBS)<Tbc note="Distance" /></li>
            <li className="flex gap-3"><Icon name="hotel" className="size-6 shrink-0 text-gold" />Partner hotels with athlete rates — shared after you register<Tbc note="Hotel partners (N4)" /></li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* 11 ─ FAQ */
export function Faq() {
  return (
    <Section id="faq">
      <SectionHead eyebrow="FAQ" title={<>Before you<br /><span className="text-gold">register.</span></>} />
      <div className="max-w-3xl divide-y divide-line border-y border-line">
        {live(FAQ).map((f, n) => (
          <details key={f.q} className="group" data-faq={n}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              <span>{f.q}{f.tbc && <Tbc />}</span>
              <Icon name="plus" className="size-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="pb-6 text-ivory/75">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Cta micro={false} />
        <WhatsAppLink label="Still unsure? Ask us on WhatsApp" />
      </div>
    </Section>
  );
}

/* 12 ─ Final call */
export function FinalCall() {
  return (
    <section id="final" className="relative isolate overflow-hidden px-5 py-28 text-center md:py-40">
      <div aria-hidden className="absolute top-1/2 left-1/2 -z-10 size-[140vw] -translate-x-1/2 -translate-y-1/2 md:size-[900px]">
        <div className="rays absolute inset-[-30%] animate-spin-slow" />
        <Wheel hollow className="size-full animate-spin-slow text-gold/15" />
      </div>
      <p className="eyebrow mb-6">{EVENT.dateLabel} · Bhubaneswar</p>
      <h2 className="display text-[clamp(3rem,12vw,9rem)]" data-reveal>
        <span className="foil">₹1.5 Crore.</span>
        <br />One stage.
        <br />Your name on it.
      </h2>
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
        <Cta wide label={`Take the stage — ${inr(EVENT.fee)}`} micro={false} />
        <Countdown className="text-sm text-ivory/80" />
      </div>
    </section>
  );
}

/* 13 ─ Footer */
export function Footer() {
  const links = [
    ["Prize policy", "/prizes"], ["Rules", "/rules"], ["Refunds", "/refund"], ["Terms", "/terms"], ["Privacy", "/privacy"],
    ["Partner with us", "/partner"], ["International athletes", "/international"],
  ];
  return (
    <footer className="border-t border-line pb-28 md:pb-0">
      <div aria-hidden className="h-3 bg-[repeating-linear-gradient(45deg,#d4a53733_0_6px,transparent_6px_12px),repeating-linear-gradient(-45deg,#c8241c26_0_6px,transparent_6px_12px)]" />
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Crest className="size-12" />
            <p className="display text-2xl">{EVENT.organiser}</p>
          </div>
          <p className="mt-4 text-sm text-mute">{EVENT.address}<br />{EVENT.regdNo} · GSTIN {EVENT.gstin}<Tbc note={EVENT.tbc.identity} /></p>
          <p className="mt-4 text-lg text-gold" lang="or">ଜୟ ଓଡ଼ିଶା</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Contact</p>
          <a href={EVENT.phoneHref} className="flex items-center gap-2 hover:text-molten"><Icon name="phone" className="size-4 text-gold" />{EVENT.phone}</a>
          <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-molten"><Icon name="whatsapp" className="size-4 text-[#3ecf6e]" />WhatsApp</a>
          <p className="text-mute">{EVENT.email}</p>
          {EVENT.socials.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noopener" className="block hover:text-molten">{s.label}</a>)}
        </div>
        <ul className="space-y-2 text-sm">
          <li className="eyebrow mb-3">Information</li>
          {links.map(([l, h]) => <li key={h}><Link href={h} className="text-ivory/80 hover:text-molten">{l}</Link></li>)}
        </ul>
      </div>
      <p className="border-t border-line px-5 py-6 text-center text-xs text-mute">© {EVENT.year} {EVENT.organiser}. {EVENT.name} {EVENT.year}.</p>
    </footer>
  );
}
