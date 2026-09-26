"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAMPIONSHIPS, EVENT, championshipTotal, registerHref, type Championship } from "@/data/festival";
import { inr, inrShort, ordinal, prizeLabel } from "@/lib/format";
import { Icon, Pictogram } from "./icons";
import { Tbc, WhatsAppLink } from "./ui";

const pick = (c: Championship) => ({ d: c.divisions[0]?.id ?? "", k: c.divisions[0]?.classes[Math.min(4, c.divisions[0].classes.length - 1)] ?? "" });

export function Finder() {
  const [sport, setSport] = useState("bodybuilding");
  const [div, setDiv] = useState("mens-bb");
  const [cls, setCls] = useState("75 kg");

  // deep links from poster QR codes: /?sport=powerlifting#arena
  useEffect(() => {
    const s = new URLSearchParams(location.search).get("sport");
    const c = CHAMPIONSHIPS.find((x) => x.id === s);
    if (c) choose(c);
  }, []);

  function choose(c: Championship) {
    const p = pick(c);
    setSport(c.id);
    setDiv(p.d);
    setCls(p.k);
  }

  const champ = CHAMPIONSHIPS.find((c) => c.id === sport)!;
  const division = champ.divisions.find((d) => d.id === div);
  const fee = division?.fee ?? EVENT.fee;
  const minCash = Math.min(...(division?.prizes.filter((p): p is number => typeof p === "number") ?? [0]));

  return (
    <div>
      {/* 1 · sport */}
      <div className="-mx-5 md:mx-0">
        <ul className="rail pb-2 md:grid md:grid-cols-4 md:gap-3 md:px-0 lg:grid-cols-7" role="list">
          {CHAMPIONSHIPS.map((c) => {
            const on = c.id === sport;
            const total = championshipTotal(c);
            return (
              <li key={c.id} className="w-[42vw] max-w-[190px] md:w-auto md:max-w-none">
                <button
                  onClick={() => choose(c)}
                  aria-pressed={on}
                  className={`group flex h-full w-full flex-col items-start gap-3 rounded-[10px] border p-4 text-left transition-[border-color,background-color,transform] duration-150 hover:-translate-y-1 ${on ? "border-gold bg-gold/10" : "border-line bg-stone hover:border-gold/60"}`}
                >
                  <Pictogram id={c.pictogram} className={`size-9 ${on ? "text-molten" : "text-gold"}`} />
                  <span className="display text-[1.35rem] leading-[.95]">{c.sport}</span>
                  <span className="mt-auto text-xs text-mute">{total ? `Up to ${inrShort(total)} in prizes` : "Categories soon"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
        {/* 2 · division + class */}
        <div className="min-w-0 space-y-6">
          <div>
            <p className="eyebrow mb-1">{champ.level}</p>
            <h3 className="display text-4xl">
              {champ.name}
              {champ.tbc && <Tbc note={champ.tbc} />}
            </h3>
            <p className="mt-2 text-ivory/70">{champ.tagline}</p>
          </div>
          {champ.divisions.length > 1 && (
            <fieldset className="min-w-0">
              <legend className="mb-3 text-sm font-semibold text-ivory/80">Division</legend>
              <div className="rail -mx-5 !gap-2 md:mx-0 md:flex-wrap md:!px-0">
                {champ.divisions.map((d) => (
                  <button
                    key={d.id}
                    className="chip"
                    aria-pressed={d.id === div}
                    onClick={() => {
                      setDiv(d.id);
                      setCls(d.classes[Math.min(4, d.classes.length - 1)]);
                    }}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {division && division.classes.length > 1 && (
            <fieldset className="min-w-0">
              <legend className="mb-3 text-sm font-semibold text-ivory/80">Class</legend>
              <div className="rail -mx-5 !gap-2 md:mx-0 md:flex-wrap md:!px-0">
                {division.classes.map((k) => (
                  <button key={k} className="chip tnum" aria-pressed={k === cls} onClick={() => setCls(k)}>
                    {k}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        {/* 3 · result */}
        <div className="card relative min-w-0 overflow-hidden p-5 md:p-7" aria-live="polite">
          <div aria-hidden className="absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,#d4a53740,transparent)]" />
          {division ? (
            <>
              <p className="eyebrow">Your category</p>
              <p className="display mt-2 text-[2.6rem]">
                {division.name}
                {division.classes.length > 1 && <span className="block text-gold">{cls}</span>}
                {division.tbc && <Tbc note={division.tbc} />}
              </p>
              {division.note && <p className="mt-1 text-sm text-molten">{division.note}</p>}

              <ol className="mt-5 divide-y divide-line border-y border-line">
                {division.prizes.map((p, i) => (
                  <li key={i} className="flex items-baseline justify-between py-2.5">
                    <span className={`text-sm font-semibold ${i === 0 ? "text-molten" : "text-ivory/70"}`}>{ordinal(i)} place</span>
                    <span className={`display tnum ${i === 0 ? "text-4xl text-gold" : "text-2xl"}`}>{prizeLabel(p)}</span>
                  </li>
                ))}
              </ol>

              {division.extras && (
                <div className="mt-4 rounded-md border border-gold/30 bg-gold/5 p-3 text-sm">
                  <p className="font-semibold text-molten">Also competing for</p>
                  {division.extras.map((e) => (
                    <p key={e.label} className="mt-1 flex justify-between gap-3">
                      <span className="text-ivory/80">{e.label}</span>
                      <b className="tnum">{prizeLabel(e.prize)}</b>
                    </p>
                  ))}
                </div>
              )}

              <ul className="mt-4 space-y-1.5 text-sm text-ivory/80">
                {fee > 0 && minCash >= fee && (
                  <li className="flex gap-2">
                    <Icon name="check" className="size-5 shrink-0 text-gold" /> Every paid place wins back at least your {inr(fee)} entry.
                  </li>
                )}
                <li className="flex gap-2">
                  <Icon name="calendar" className="size-5 shrink-0 text-gold" /> Session day confirmed on your athlete pass
                  <Tbc note="Per-category session schedule" />
                </li>
              </ul>

              <Link href={registerHref(champ.id, division.id, cls)} className="btn btn-gold mt-6 w-full" data-cta="finder">
                {fee === 0 ? "Register free" : `Enter ${division.classes.length > 1 ? cls : division.name} — ${inr(fee)}`}
                <Icon name="arrow" className="size-5" />
              </Link>
            </>
          ) : (
            <>
              <p className="eyebrow">Coming soon</p>
              <p className="display mt-2 text-[2.6rem]">{champ.sport}</p>
              <p className="mt-3 text-ivory/75">Categories and the prize table for {champ.name} are being finalised. Get them on WhatsApp the moment they’re published.</p>
              <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn btn-ghost mt-6 w-full">
                <Icon name="whatsapp" className="size-5 text-[#3ecf6e]" /> Notify me on WhatsApp
              </a>
            </>
          )}
          <WhatsAppLink className="mt-4 w-full justify-center" label="Not sure which category? Ask us" />
        </div>
      </div>
    </div>
  );
}
