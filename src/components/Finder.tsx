"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { CHAMPIONSHIPS, EVENT, championshipTotal, registerHref, type Championship } from "@/data/festival";
import { inr, inrShort, ordinal, prizeLabel } from "@/lib/format";
import { Icon } from "./icons";
import { Tbc, WhatsAppLink } from "./ui";

const defaultClass = (classes: string[]) => classes[Math.min(4, classes.length - 1)] ?? "";
type Sel = { sport: string; div: string; cls: string };
const selFor = (c: Championship): Sel => ({ sport: c.id, div: c.divisions[0]?.id ?? "", cls: defaultClass(c.divisions[0]?.classes ?? []) });
const noSub = () => () => {};

export function Finder() {
  // deep links from poster QR codes: /?sport=powerlifting (null on the server)
  const urlSport = useSyncExternalStore(noSub, () => new URLSearchParams(location.search).get("sport"), () => null);
  const [picked, setPicked] = useState<Sel | null>(null);
  const sel = picked ?? selFor(CHAMPIONSHIPS.find((x) => x.id === urlSport) ?? CHAMPIONSHIPS[0]);
  const { sport, div, cls } = sel;
  const choose = (c: Championship) => setPicked(selFor(c));

  const champ = CHAMPIONSHIPS.find((c) => c.id === sport)!;
  const division = champ.divisions.find((d) => d.id === div);
  const fee = division?.fee ?? EVENT.fee;
  const cash = division?.prizes.filter((p): p is number => typeof p === "number") ?? [];
  const hasClasses = (division?.classes.length ?? 0) > 1;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
      {/* sport index */}
      <ol className="border-b border-line lg:col-span-5">
        {CHAMPIONSHIPS.map((c, i) => {
          const on = c.id === sport;
          const total = championshipTotal(c);
          return (
            <li key={c.id} className="border-t border-line">
              <button onClick={() => choose(c)} aria-pressed={on} className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-2 py-4 text-left md:py-5">
                <span className={`mono text-xs ${on ? "text-signal" : "text-muted"}`}>0{i + 1}</span>
                <span className={`text-[1.35rem] leading-tight font-bold tracking-[-0.02em] transition-colors md:text-[1.7rem] ${on ? "text-fg" : "text-muted group-hover:text-fg"}`}>
                  {c.sport}
                </span>
                <span className={`mono text-xs ${on ? "text-fg" : "text-muted"}`}>{total ? inrShort(total) : "TBA"}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="min-w-0 lg:col-span-7">
        <p className="label text-muted">
          {champ.level}
          {champ.tbc && <Tbc note={champ.tbc} />}
        </p>
        <h3 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">{champ.name}</h3>

        {champ.divisions.length > 1 && (
          <div className="rail -mx-5 mt-6 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Division">
            {champ.divisions.map((d) => (
              <button
                key={d.id}
                className="chip"
                aria-pressed={d.id === div}
                onClick={() => setPicked({ ...sel, div: d.id, cls: defaultClass(d.classes) })}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
        {division && hasClasses && (
          <div className="rail -mx-5 mt-3 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Class">
            {division.classes.map((k) => (
              <button key={k} className="chip mono !font-medium" aria-pressed={k === cls} onClick={() => setPicked({ ...sel, cls: k })}>
                {k}
              </button>
            ))}
          </div>
        )}

        {/* the bib */}
        <div className="t-paper relative mt-8 overflow-hidden rounded-[3px] px-6 pt-8 pb-0 md:px-9 md:pt-10" aria-live="polite">
          {["top-3.5 left-3.5", "top-3.5 right-3.5", "bottom-16 left-3.5", "bottom-16 right-3.5"].map((p) => (
            <span key={p} aria-hidden className={`absolute ${p} size-2.5 rounded-full bg-ink`} />
          ))}
          <div className="label flex justify-between gap-4 !text-[9px] text-muted">
            <span>IBSF 2026 · {champ.name}</span>
            <span>Entry</span>
          </div>

          {division ? (
            <>
              <p className="display-c mt-4 text-[clamp(4.5rem,17vw,9rem)] uppercase">{hasClasses ? cls : division.name}</p>
              <p className="mt-3 text-lg font-bold tracking-tight">
                {hasClasses ? division.name : champ.sport}
                {division.tbc && <Tbc note={division.tbc} />}
              </p>
              {division.note && <p className="text-sm text-muted">{division.note}</p>}

              <ol className="mt-6 border-t border-dashed border-line">
                {division.prizes.map((p, i) => (
                  <li key={i} className="flex items-baseline justify-between border-b border-dashed border-line py-2.5">
                    <span className="mono text-xs text-muted">{ordinal(i)}</span>
                    <span className={`mono ${i === 0 ? "text-2xl font-semibold md:text-3xl" : "text-base md:text-lg"}`}>{prizeLabel(p)}</span>
                  </li>
                ))}
              </ol>
              {division.extras && (
                <div className="py-4">
                  <p className="label !text-[9px] text-muted">Winners also contest</p>
                  {division.extras.map((e) => (
                    <p key={e.label} className="mt-1.5 flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{e.label}</span>
                      <span className="mono">{prizeLabel(e.prize)}</span>
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="display-c mt-4 text-[clamp(4.5rem,17vw,9rem)] uppercase">TBA</p>
              <p className="mt-3 max-w-md pb-8 text-muted">Categories and the prize table for {champ.name} are being finalised. Get them on WhatsApp the moment they’re published.</p>
            </>
          )}

          <div className="t-signal -mx-6 mt-4 flex h-12 items-center justify-between px-6 md:-mx-9 md:px-9">
            <span className="label !text-[9px]">{fee > 0 && cash.length && Math.min(...cash) >= fee ? `Every paid place returns your ${inr(fee)}` : "India’s Biggest Sports Festival"}</span>
            <span className="mono hidden text-xs sm:inline">04—06.12.26</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {division ? (
            <Link href={registerHref(champ.id, division.id, cls)} className="btn btn-signal w-full sm:w-auto sm:min-w-[320px]" data-cta="finder">
              {fee === 0 ? "Register free" : `Enter ${hasClasses ? cls : division.name} — ${inr(fee)}`}
              <Icon name="arrow" className="arr size-5" />
            </Link>
          ) : (
            <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn btn-signal w-full sm:w-auto">
              Notify me on WhatsApp
              <Icon name="arrow" className="arr size-5" />
            </a>
          )}
          <WhatsAppLink label="Not sure which category? Ask us" />
        </div>
      </div>
    </div>
  );
}
