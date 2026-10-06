import Image from "next/image";
import { CHAMPIONSHIPS, EVENT, categoryCount, paidPlaces } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon } from "../icons";
import { Countdown, Odometer } from "../live";
import { Cta, PAY_LINE } from "../ui";

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero() {
  return (
    <section id="top" className="t-ink relative isolate overflow-hidden lg:flex lg:min-h-[100svh] lg:items-center">
      {/* athletes + bolt (client artwork). Mobile: square crop on top. Desktop: right side, fading into black. */}
      <div aria-hidden className="strike relative mt-14 md:mt-0 -z-10 aspect-[4/3] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[64%]">
        <Image src="/img/hero-athletes.webp" alt="" fill priority sizes="100vw" className="object-cover lg:hidden" />
        <Image src="/img/hero-desktop.webp" alt="" fill priority sizes="64vw" className="hidden object-cover object-[80%_center] [mask-image:linear-gradient(to_right,transparent,#000_30%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent lg:hidden" />
        <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-ink to-transparent lg:block" />
      </div>
      <span className="sr-only">Anil Gochhikar, Ranu Mohanty and Dutee Chand</span>

      <div className="mx-auto -mt-10 w-full px-5 pb-12 md:px-10 lg:mt-0 lg:pt-24 lg:pb-10">
        <div className="max-w-[640px] lg:max-w-[52%]">
          <h1 className="rise" style={d(0)}>
            <span className="display block text-[clamp(2.2rem,9vw,3.6rem)] lg:text-[min(3.4vw,6.2vh)]">India’s Biggest</span>
            <span className="display block text-[clamp(3.4rem,14.5vw,6rem)] lg:text-[min(5.6vw,10.5vh)]">
              <span className="text-gold">Sports</span> Festival
            </span>
          </h1>
          <span className="rise mt-5 block h-[3px] w-40 bg-gold md:w-56" style={d(1)} />

          <p className="rise mt-6 md:mt-8" style={d(2)}>
            <span className="display block text-[clamp(5rem,24vw,10rem)] leading-[0.9] lg:text-[min(8.6vw,17vh)]">
              <span className="text-gold">₹1.5</span> Crore
            </span>
            <span className="tracked mt-3 block pl-[0.3em] text-[clamp(1.35rem,6.4vw,2.4rem)] lg:text-[min(2.3vw,4.4vh)]">Prize money</span>
          </p>

          <div className="rise mt-8 flex items-stretch gap-4 whitespace-nowrap sm:gap-5 md:mt-10" style={d(3)}>
            <div className="flex items-center gap-3">
              <Icon name="ticket" className="size-7 shrink-0 text-gold sm:size-9" />
              <div>
                <p className="label !text-[11px] text-muted">Your entry</p>
                <p className="display text-[clamp(1.5rem,7.5vw,2.25rem)]">{inr(EVENT.fee)}</p>
              </div>
            </div>
          </div>

          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={d(4)}>
            <Cta id="hero-cta" micro={false} />
            <a href="#arena" className="btn btn-line w-full sm:w-auto">
              Find my category <Icon name="down" className="size-5" />
            </a>
          </div>
          <p className="rise mt-3 text-xs text-muted" style={d(4)}>
            {PAY_LINE}
          </p>

          <ul className="rise mt-8 flex flex-col gap-3 border-t border-line pt-6 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6" style={d(5)}>
            <li className="flex items-center gap-2.5">
              <Icon name="calendar" className="size-5 text-gold" /> <b className="font-semibold">4–6 DEC 2026</b>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="pin" className="size-5 text-gold" /> {EVENT.venue}, Bhubaneswar
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="users" className="size-5 text-gold" /> Registrations close in <Countdown className="font-semibold text-gold" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Gold marquee of the seven championships, separated by the bolt. */
export function Ticker() {
  const names = CHAMPIONSHIPS.map((c) => c.sport.replace(" & Physique", "").replace(" (Wrestling)", ""));
  const run = [...names, ...names];
  return (
    <div className="t-gold overflow-hidden py-3.5 md:py-4" aria-label={names.join(", ")}>
      <div className="marquee flex w-max items-center" aria-hidden>
        {run.map((n, i) => (
          <span key={i} className="display flex items-center text-[clamp(1.4rem,3vw,2.2rem)]">
            <span className="px-5 md:px-8">{n}</span>
            <Icon name="bolt" className="size-6 fill-ink stroke-none md:size-7" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Festival at a glance — four big numbers anyone can read in one second. */
export function Glance() {
  const stats = [
    { icon: "rupee", v: <Odometer value={inr(EVENT.prizePool)} />, l: "Total prize money" },
    { icon: "trophy", v: String(CHAMPIONSHIPS.length), l: "Championships" },
    { icon: "medal", v: `${paidPlaces}+`, l: "Podium places with cash awards" },
    { icon: "users", v: `${categoryCount}+`, l: "Categories" },
    { icon: "calendar", v: "3 Days", l: "4–6 December 2026" },
  ];
  return (
    <div className="t-ink border-b border-line px-5 py-12 md:px-10 md:py-16">
      <ul className="mx-auto grid w-full grid-cols-2 gap-3 md:gap-4 lg:grid-cols-6">
        {stats.map((s, i) => (
          <li key={s.l} className={`card p-5 md:p-6 ${i === 0 ? "col-span-2" : ""}`} data-reveal style={d(i)}>
            <Icon name={s.icon} className="size-7 text-gold" />
            <p className="display mt-4 text-[clamp(2rem,4vw,3rem)] leading-none whitespace-nowrap">{s.v}</p>
            <p className="mt-2 text-sm text-muted">{s.l}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
