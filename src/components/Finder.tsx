"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { CHAMPIONSHIPS, EVENT, championshipTotal, registerHref, type Championship } from "@/data/festival";
import { inr, inrShort, ordinal, prizeLabel } from "@/lib/format";
import { Icon } from "./icons";
import { WhatsAppLink } from "./ui";
import { track } from "@/lib/track";

const defaultClass = (classes: string[]) => classes[Math.min(4, classes.length - 1)] ?? "";
type Sel = { sport: string; div: string; cls: string };
const selFor = (c: Championship): Sel => ({ sport: c.id, div: c.divisions[0]?.id ?? "", cls: defaultClass(c.divisions[0]?.classes ?? []) });
const noSub = () => () => {};

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-3 text-sm font-semibold">
      <span className="grid size-7 place-items-center rounded-full bg-gold text-xs font-bold text-ink">{n}</span>
      {children}
    </p>
  );
}

export function Finder() {
  // deep links from poster QR codes: /?sport=powerlifting (null on the server)
  const urlSport = useSyncExternalStore(noSub, () => new URLSearchParams(location.search).get("sport"), () => null);
  const [picked, setPicked] = useState<Sel | null>(null);
  const sel = picked ?? selFor(CHAMPIONSHIPS.find((x) => x.id === urlSport) ?? CHAMPIONSHIPS[0]);
  const { sport, div, cls } = sel;
  const choose = (c: Championship) => {
    setPicked(selFor(c));
    track("viewSport", c.sport);
  };

  const champ = CHAMPIONSHIPS.find((c) => c.id === sport)!;
  const division = champ.divisions.find((d) => d.id === div);
  const fee = division?.fee ?? EVENT.fee;
  const hasClasses = (division?.classes.length ?? 0) > 1;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 space-y-8 lg:col-span-7">
        <div>
          <Step n={1}>Choose your sport</Step>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3">
            {CHAMPIONSHIPS.map((c) => {
              const on = c.id === sport;
              const total = championshipTotal(c);
              return (
                <li key={c.id}>
                  <button
                    onClick={() => choose(c)}
                    aria-pressed={on}
                    className={`flex h-full w-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 ${on ? "border-gold bg-gold/10" : "border-line bg-raise hover:border-gold/60"}`}
                  >
                    <span className="display text-xl leading-tight md:text-2xl">{c.sport}</span>
                    <span className={`mt-auto text-xs font-semibold ${total || c.divisions.length ? "text-gold" : "text-muted"}`}>
                      {total ? `Prizes up to ${inrShort(total)}` : c.divisions.length ? `Registration open · ${inr(Math.min(...c.divisions.map((d) => d.fee ?? EVENT.fee)))}` : "Details coming soon"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {champ.divisions.length > 1 && (
          <div>
            <Step n={2}>Choose your division</Step>
            <div className="rail -mx-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Division">
              {champ.divisions.map((d) => (
                <button key={d.id} className="chip" aria-pressed={d.id === div} onClick={() => setPicked({ ...sel, div: d.id, cls: defaultClass(d.classes) })}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {division && hasClasses && (
          <div>
            <Step n={champ.divisions.length > 1 ? 3 : 2}>Choose your weight / height class</Step>
            <div className="rail -mx-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Class">
              {division.classes.map((k) => (
                <button key={k} className="chip tnum" aria-pressed={k === cls} onClick={() => setPicked({ ...sel, cls: k })}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* the result: an entry card that reads like a race bib */}
      <div className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div className="t-paper relative overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_#ffb81c55]" aria-live="polite">
            <div className="flex items-center justify-between bg-ink px-6 py-3 text-white">
              <span className="text-xs font-semibold tracking-[0.18em] uppercase">Your category</span>
              <span className="text-xs text-gold">{champ.name}</span>
            </div>
            <div className="relative px-6 pt-6 pb-2 md:px-8">
              {["top-3 left-3", "top-3 right-3"].map((p) => (
                <span key={p} aria-hidden className={`absolute ${p} size-2.5 rounded-full bg-ink/80`} />
              ))}
              {division ? (
                <>
                  <p className="display text-[clamp(3.6rem,13vw,5.5rem)] leading-none">{hasClasses ? cls : division.name}</p>
                  <p className="mt-2 text-lg font-semibold">
                    {hasClasses ? division.name : champ.sport}
                  </p>
                  {division.note && <p className="text-sm font-medium text-amber-700">{division.note}</p>}
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <Icon name="calendar" className="size-4 shrink-0" /> {champ.when}
                  </p>
                  {division.prizes.length === 0 && <p className="mt-5 border-y border-line py-4 text-muted">Prizes will be announced by AOGA.</p>}
                  <ol className="mt-5 divide-y divide-line border-y border-line empty:hidden">
                    {division.prizes.map((p, i) => (
                      <li key={i} className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-3 text-sm font-medium">
                          <span className={`medal ${i < 3 ? `medal-${i + 1}` : ""}`}>{i + 1}</span>
                          {ordinal(i)} place
                        </span>
                        <span className={`display tnum ${i === 0 ? "text-3xl" : "text-xl"}`}>{prizeLabel(p)}</span>
                      </li>
                    ))}
                  </ol>
                  {division.extras && (
                    <div className="mt-4 rounded-lg bg-ink/5 p-3">
                      <p className="text-xs font-semibold text-muted uppercase">Winners also compete for</p>
                      {division.extras.map((e) => (
                        <p key={e.label} className="mt-1.5 flex justify-between gap-3 text-sm">
                          <span className="font-semibold">{e.label}</span>
                          <span className="display tnum text-lg">{prizeLabel(e.prize)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="display text-[clamp(3.6rem,13vw,5.5rem)] leading-none">Coming soon</p>
                  <p className="mt-3 pb-6 text-muted">Categories and prizes for {champ.name} will be announced shortly. Get them on WhatsApp first.</p>
                </>
              )}
            </div>
            <div className="t-gold mt-4 flex items-center gap-2 px-6 py-3 text-sm font-semibold md:px-8">
              <Icon name="check" className="size-5 shrink-0" />
              {fee === 0 ? "Free registration for this category" : "Winners decided by qualified judges under official rules"}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {division ? (
              <Link href={registerHref(champ.id, division.id, cls)} className="btn btn-gold w-full" data-cta="finder">
                {fee === 0 ? "Register free" : `Register now — ${inr(fee)}`}
                <Icon name="arrow" className="arr size-5" />
              </Link>
            ) : (
              <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn w-full bg-wa text-white">
                Notify me on WhatsApp
              </a>
            )}
            <WhatsAppLink className="justify-center" label="Not sure which category? Ask us on WhatsApp" />
          </div>
        </div>
      </div>
    </div>
  );
}
