"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { COMMITTEE, DANGAL_FEE, DAYS, DOCUMENTS, EVENT, FAQ, HEADLINE_PRIZES, LEGENDS, ORGANISERS, REFUND, VALUE, minFee, paidPlaces, registerHref } from "@/data/festival";
import { STALLS } from "@/data/partners";
import { inr, prizeLabel } from "@/lib/format";
import { useReplayOnScroll } from "@/hooks/useReplayOnScroll";
import { Finder } from "../Finder";
import { Icon, WhatsAppGlyph, Wordmark } from "../icons";
import { CountdownBoxes } from "../live";
import { Cta, Gold, POLICY_LINKS, Section, SectionHead, WhatsAppLink } from "../ui";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
/** highlight on light backgrounds: yellow block behind text */
const Mark = ({ children }: { children: React.ReactNode }) => <span className="bg-[linear-gradient(transparent_58%,#ffde00_58%,#ffde00_92%,transparent_92%)] box-decoration-clone px-[0.06em] text-black font-semibold">{children}</span>;

/* 01 ─ Choose your sport */
export function Arena() {
  const ref = useRef<HTMLElement>(null);
  const play = useReplayOnScroll(ref);
  return (
    <Section ref={ref} data-play={play} id="arena">
      <SectionHead title={<>Choose your sport. <Gold>Find your class.</Gold></>} lead="Pick your sport and weight class — see your competition day, entry fee and the prize money awarded to the winners." />
      <Finder />
    </Section>
  );
}

import { PrizeSection } from "../PrizeSection";

/* 02 ─ Prize pool (Bento Prize Wall) */
export function Prizes() {
  return <PrizeSection />;
}

import { ChampionsSection } from "../ChampionsSection";

/* 03 ─ Champions (Expanding Panels & Stacking Cards) */
export function Champions() {
  return <ChampionsSection />;
}

import { ValueSection } from "../ValueSection";

/* 04 ─ What ₹5,000 gets you (Pinned Horizontal Journey / Zig-Zag Rail) */
export function Value() {
  return <ValueSection />;
}

import { ScheduleSection } from "../ScheduleSection";

/* 05 ─ Schedule (Boarding-Pass Tickets) */
export function Days() {
  return <ScheduleSection />;
}

import { OrganisedBySection } from "../OrganisedBySection";

/* 06 ─ Trust */
export function Trust() {
  return <OrganisedBySection />;
}

import { RegisterSection } from "../RegisterSection";

/* 07 ─ Register (Podium Staircase + Departure Board) */
export function Register() {
  return <RegisterSection />;
}

import { VenueSection } from "../VenueSection";

/* 08 ─ Venue */
export function Venue() {
  return <VenueSection />;
}


import { FaqSection } from "../FaqSection";

/* 09 ─ FAQ */
export function Faq() {
  return <FaqSection />;
}

/* 10 ─ Final call */
export function FinalCall() {
  const ref = useRef<HTMLElement>(null);
  const play = useReplayOnScroll(ref);
  return (
    <section ref={ref} data-play={play} id="final" className="t-ink relative isolate overflow-hidden w-full page-gutter py-12 md:py-24 lg:py-32">
      <div aria-hidden className="slash absolute inset-0 -z-10 opacity-35 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" />
      <div className="content-contain mx-auto w-full text-center">
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
    <footer className="t-ink border-t border-line w-full page-gutter pt-14 pb-32 md:pb-14">
      <div className="content-contain mx-auto grid w-full gap-10 md:grid-cols-12">
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
      <p className="content-contain mx-auto mt-12 w-full text-xs leading-relaxed text-muted">
        {EVENT.name} is a physical sports competition. Results and prizes are decided solely by athletic performance — judges’ scores, weigh-ins, lifts,
        bouts and finish times — under published rules. There is no lottery, draw, betting or game of chance. The registration fee is a participation fee
        for competition entry and athlete services. Payments are made by UPI to the organiser’s collection account ({EVENT.upi.payee}).
      </p>
      <div className="content-contain mx-auto mt-6 flex w-full flex-wrap justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
        <span>© {EVENT.year} {EVENT.organiser}</span>
        <span>
          Jai Hind · Jai Odisha
        </span>
      </div>
    </footer>
  );
}
