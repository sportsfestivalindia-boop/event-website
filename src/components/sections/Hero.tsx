import { CHAMPIONSHIPS, EVENT, topPrize } from "@/data/festival";
import { inr, inrShort } from "@/lib/format";
import { Icon } from "../icons";
import { Countdown, Odometer } from "../live";
import { Cta, Tbc } from "../ui";

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero() {
  return (
    <section id="top" className="t-ink relative isolate flex min-h-[100svh] flex-col overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-24 md:pb-12">
      {/* the sun — one flat disc. The Walk-Out film will later sit inside it. */}
      <div aria-hidden className="absolute top-[13svh] right-[-52vw] -z-10 size-[118vw] md:top-[132px] md:right-[-10vw] md:size-[min(54vw,820px)]">
        <div className="sun sunrise size-full" />
      </div>

      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col">
        <div className="label rise flex justify-between gap-4 border-b border-line pb-4 text-muted" style={d(0)}>
          <span>
            {EVENT.venue}, Bhubaneswar
            <Tbc note={EVENT.tbc.venue} />
          </span>
          <span className="shrink-0">04—06 Dec 2026</span>
        </div>

        <div className="flex-1" />

        <p className="label rise mb-4 md:mb-6" style={d(1)}>
          {EVENT.name} {EVENT.year} · Prize pool
        </p>
        <h1 className="display-c rise" style={d(2)}>
          <span className="block text-[clamp(8rem,46vw,20rem)] md:inline md:text-[clamp(8rem,13.5vw,15rem)]">₹1.5</span>
          <span className="block text-[clamp(5.5rem,31vw,20rem)] md:ml-[0.14em] md:inline md:text-[clamp(8rem,13.5vw,15rem)]">Crore</span>
        </h1>
        <p className="rise mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:mt-7" style={d(3)}>
          <Odometer value={inr(EVENT.prizePool)} className="mono text-[clamp(1.35rem,3vw,2rem)] font-medium" />
          <span className="text-sm text-muted">in cash prizes across {CHAMPIONSHIPS.length} championships</span>
        </p>

        <dl className="rise mt-8 grid grid-cols-3 border-y border-line md:mt-12 md:max-w-[740px] md:grid-cols-4" style={d(4)}>
          {[
            ["Entry", inr(EVENT.fee)],
            ["Top prize", inrShort(topPrize)],
            ["Championships", String(CHAMPIONSHIPS.length)],
          ].map(([k, v], i) => (
            <div key={k} className={`py-4 pr-3 ${i ? "border-l border-line pl-3 md:pl-5" : ""} ${i === 2 ? "hidden md:block" : ""}`}>
              <dt className="label !text-[9px] text-muted md:!text-[10px]">{k}</dt>
              <dd className="mt-1.5 text-xl font-bold tracking-tight md:text-3xl">{v}</dd>
            </div>
          ))}
          <div className="border-l border-line py-4 pl-3 md:pl-5">
            <dt className="label !text-[9px] text-muted md:!text-[10px]">Registration closes</dt>
            <dd className="mt-2 text-[13px] md:text-lg">
              <Countdown />
            </dd>
          </div>
        </dl>

        <div className="rise mt-6 flex flex-col gap-5 md:mt-10 md:flex-row md:items-start md:gap-10" style={d(5)}>
          <Cta id="hero-cta" />
          <a href="#arena" className="group inline-flex items-center gap-3 self-start text-sm font-semibold md:mt-5">
            Find your category
            <Icon name="down" className="size-4 transition-transform duration-300 group-hover:translate-y-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Signal-orange marquee of the seven championships. */
export function Ticker() {
  const names = CHAMPIONSHIPS.map((c) => c.sport.replace(" & Physique", "").replace(" (Wrestling)", ""));
  const run = [...names, ...names];
  return (
    <div className="t-signal overflow-hidden border-y border-ink py-4 md:py-5" aria-label={names.join(", ")}>
      <div className="marquee flex w-max items-center" aria-hidden>
        {run.map((n, i) => (
          <span key={i} className="flex items-center text-[clamp(1.4rem,3.2vw,2.6rem)] font-extrabold tracking-[-0.02em] uppercase [font-variation-settings:'wdth'_125]">
            <span className="px-6 md:px-10">{n}</span>
            <span className="size-3 rounded-full bg-ink md:size-4" />
          </span>
        ))}
      </div>
    </div>
  );
}
