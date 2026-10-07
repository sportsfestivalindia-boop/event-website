import type { Metadata } from "next";
import Link from "next/link";
import { CHAMPIONSHIPS, EVENT } from "@/data/festival";
import { PARTNER_WHY, SECTORS, SPONSOR_MIN, STALLS, TIERS } from "@/data/partners";
import { inr, inrShort } from "@/lib/format";
import { Icon, WhatsAppGlyph, Wordmark } from "@/components/icons";
import { Reveal } from "@/components/live";
import { SponsorForm, StallBooking } from "@/components/Partner";
import { Footer } from "@/components/sections/Sections";
import { Gold, Section, SectionHead } from "@/components/ui";

export const metadata: Metadata = {
  title: "Brand Partners · Sponsor or Book a Stall · Sports Festival 2026",
  description: `Sponsor India’s Biggest Sports Festival 2026 (from ${inrShort(SPONSOR_MIN)}) or book an exhibition stall at Baramunda Ground, Bhubaneswar — 4–6 December 2026.`,
};

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

export default function PartnerPage() {
  return (
    <>
      <header className="t-ink sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center gap-6 px-5 md:h-20 md:px-10">
          <Link href="/" aria-label="Sports Festival — home">
            <Wordmark />
          </Link>
          <nav className="ml-auto hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
            <a href="#sponsor" className="hover:text-gold">Sponsorship</a>
            <a href="#stalls" className="hover:text-gold">Stalls</a>
            <Link href="/" className="hover:text-gold">Athletes</Link>
          </nav>
          <a href="#stalls" className="btn btn-gold ml-auto !min-h-10 shrink-0 !px-4 !text-xs whitespace-nowrap md:ml-0 md:!min-h-11 md:!px-5 md:!text-sm">
            Book a stall
          </a>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="t-ink relative isolate overflow-hidden px-5 pt-16 pb-16 md:px-10 md:pt-24 md:pb-24">
          <div aria-hidden className="slash absolute inset-0 -z-10 opacity-25" />
          <p className="label text-gold">Brand partners · 4–6 Dec 2026 · Baramunda Ground, Bhubaneswar</p>
          <h1 className="display mt-5 max-w-[16ch] text-[clamp(3rem,8vw,7rem)]">
            Put your brand in front of <Gold>India’s strength community.</Gold>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg text-muted">
            Sponsor the festival or book an exhibition stall at Odisha’s biggest sports, fitness and strength event — organised by the All Odisha Gym Association.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#stalls" className="btn btn-gold">
              Book a stall from {inr(STALLS[0].price)} <Icon name="arrow" className="arr size-5" />
            </a>
            <a href="#sponsor" className="btn btn-line">
              Become a sponsor
            </a>
          </div>
          <ul className="mt-12 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["3 Days", "4–6 December 2026"],
              [String(CHAMPIONSHIPS.length), "Championships"],
              ["₹1.5 Crore", "Prize pool"],
              ["1000s", "Visitors & athletes"],
            ].map(([v, l], n) => (
              <li key={l} className="card p-4" data-reveal style={i(n)}>
                <p className="display text-3xl text-gold">{v}</p>
                <p className="mt-1 text-sm text-muted">{l}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* why */}
        <Section>
          <SectionHead title={<>Why partner <Gold>with us</Gold></>} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PARTNER_WHY.map((w, n) => (
              <li key={w.t} className="card p-6" data-reveal style={i(n)}>
                <span className="grid size-12 place-items-center rounded-full bg-gold text-ink">
                  <Icon name={w.icon} className="size-6" />
                </span>
                <p className="mt-4 text-lg font-semibold">{w.t}</p>
                <p className="mt-1 text-sm text-muted">{w.b}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* sponsorship */}
        <Section id="sponsor" theme="paper">
          <SectionHead
            title={<>Sponsorship from {inrShort(SPONSOR_MIN)}</>}
            lead="₹2 Lakh+ investment. Unlimited brand visibility. Partner with the strength — be part of the glory."
          />
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <ol className="space-y-3">
                {TIERS.map((t, n) => (
                  <li key={t.id} className={`card flex gap-4 p-5 ${t.top ? "ring-2 ring-gold" : ""}`} data-reveal style={i(n)}>
                    <span className="display grid size-10 shrink-0 place-items-center rounded-full bg-ink text-lg text-gold">{n + 1}</span>
                    <div>
                      <p className="display text-2xl">{t.name}</p>
                      <p className="mt-1 text-sm text-muted">{t.line}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm font-semibold">Ideal for</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <li key={s} className="rounded-full border border-line bg-raise px-3 py-1.5 text-sm font-medium">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6">
              <SponsorForm />
            </div>
          </div>
        </Section>

        {/* stalls */}
        <Section id="stalls">
          <SectionHead
            title={<>Book a stall at <Gold>Baramunda Ground</Gold></>}
            lead="Choose your size, fill your details and send the booking to AOGA on WhatsApp. Stall location is allotted by AOGA — book early for the best spots."
          />
          <StallBooking />
        </Section>

        {/* contact */}
        <section className="t-gold px-5 py-14 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="display text-4xl">Talk to the partnerships team</p>
              <p className="mt-2">
                {EVENT.phone} · {EVENT.email}
              </p>
            </div>
            <a
              href={`https://wa.me/${EVENT.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I’d like to know about sponsorship / stalls at India’s Biggest Sports Festival 2026.")}`}
              target="_blank"
              rel="noopener"
              className="btn btn-ink"
            >
              <WhatsAppGlyph className="size-6" /> WhatsApp us
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
