import { EVENT, topPrize } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, Wheel } from "../icons";
import { Countdown, Odometer } from "../live";
import { Cta, Tbc } from "../ui";

export function Hero() {
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-5 pt-24 pb-10 md:pt-28">
      {/* ── light: wheel backlit through haze (placeholder for the Walk-Out film) ── */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-[-6%] right-[-58%] size-[150vw] md:top-[-10%] md:right-[-14%] md:size-[min(92vw,1000px)]">
          <div className="absolute inset-[-25%] rounded-full bg-[radial-gradient(closest-side,#d4a53755,#d4a53718_45%,transparent_72%)]" />
          <div className="rays absolute inset-[-40%] animate-spin-slow" />
          <Wheel className="relative size-full animate-spin-slow text-gold/45" strokeWidth={0.9} />
        </div>
        <div className="haze absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/85 to-transparent md:h-1/2" />
        <div className="absolute inset-y-0 left-0 hidden w-2/3 bg-gradient-to-r from-ink via-ink/70 to-transparent md:block" />
      </div>

      <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-end md:justify-center">
        <p className="eyebrow rise mb-5">
          {EVENT.name} · {EVENT.year}
        </p>

        <h1 className="display rise" style={{ "--i": 1 } as React.CSSProperties}>
          <span className="foil block text-[clamp(8.5rem,44vw,17rem)] leading-[.8] lg:inline lg:text-[clamp(8rem,11vw,12rem)] lg:leading-[.84]">₹1.5</span>
          <span className="block text-[clamp(5.2rem,27vw,10.5rem)] leading-[.84] lg:ml-6 lg:inline lg:text-[clamp(8rem,11vw,12rem)]">Crore</span>
          <span className="sr-only">prize pool</span>
        </h1>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 rise" style={{ "--i": 2 } as React.CSSProperties}>
          <span className="eyebrow !text-ivory/70">Prize pool</span>
          <Odometer value={inr(EVENT.prizePool)} className="display text-[clamp(1.9rem,8vw,3rem)] text-molten" />
        </div>

        <div className="mt-7 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3 border-y border-line py-4 rise" style={{ "--i": 3 } as React.CSSProperties}>
          <div>
            <p className="text-[11px] font-semibold tracking-[.16em] text-mute uppercase">Your entry</p>
            <p className="display tnum text-4xl">{inr(EVENT.fee)}</p>
          </div>
          <Icon name="arrow" className="size-6 text-gold" />
          <div>
            <p className="text-[11px] font-semibold tracking-[.16em] text-mute uppercase">Win up to</p>
            <p className="display tnum text-4xl text-gold">{inr(topPrize)}</p>
          </div>
        </div>

        <div className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start rise" style={{ "--i": 4 } as React.CSSProperties}>
          <Cta id="hero-cta" />
          <a href="#arena" className="btn btn-ghost w-full sm:w-auto">
            Find my category <Icon name="down" className="size-5" />
          </a>
        </div>

        <div className="mt-7 flex flex-col gap-2 text-sm text-ivory/85 sm:flex-row sm:flex-wrap sm:gap-x-6 rise" style={{ "--i": 5 } as React.CSSProperties}>
          <Countdown />
          <span className="inline-flex items-center gap-2">
            <Icon name="calendar" className="size-4" /> {EVENT.dateLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="pin" className="size-4" /> {EVENT.venue}, Bhubaneswar
            <Tbc note={EVENT.tbc.venue} />
          </span>
        </div>
      </div>
    </section>
  );
}
