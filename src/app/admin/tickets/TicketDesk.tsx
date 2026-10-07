"use client";

import { useEffect, useMemo, useState } from "react";
import { CHAMPIONSHIPS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { WhatsAppGlyph } from "@/components/icons";

// Every category label exactly as athletes see it at registration, with its fee and competition day.
const CATEGORIES = CHAMPIONSHIPS.flatMap((c) =>
  c.divisions.flatMap((d) =>
    d.classes.map((k) => ({ label: `${c.sport} · ${d.name}${d.classes.length > 1 ? ` · ${k}` : ""}`, fee: d.fee ?? EVENT.fee, when: c.when })),
  ),
).filter((x) => x.fee > 0);

const input = "h-12 w-full rounded-lg border border-line bg-raise px-4 text-base outline-none focus:border-gold";
const KEY = "sf26_staff_key";

export function TicketDesk() {
  const [key, setKey] = useState("");
  const [f, setF] = useState({ name: "", phone: "", regId: "", utr: "", category: CATEGORIES[0].label, amount: String(CATEGORIES[0].fee) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState<{ ticketNo: string; url: string; name: string; phone: string; category: string } | null>(null);

  useEffect(() => {
    try {
      const k = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of the remembered staff password
      if (k) setKey(k);
    } catch {}
  }, []);

  const cat = useMemo(() => CATEGORIES.find((c) => c.label === f.category), [f.category]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const ok = key.length >= 12 && f.name.trim().length > 1 && /^[6-9]\d{9}$/.test(f.phone) && /^\d{12}$/.test(f.utr) && !!cat;

  async function issue() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, name: f.name, phone: f.phone, regId: f.regId, utr: f.utr, category: f.category, when: cat?.when ?? "", amount: Number(f.amount) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not issue the ticket.");
      try {
        localStorage.setItem(KEY, key);
      } catch {}
      setIssued({ ticketNo: d.ticketNo, url: d.url, name: f.name, phone: f.phone, category: f.category });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (issued) {
    const msg = `✅ Payment verified — ${EVENT.name} ${EVENT.year}\n\nHi ${issued.name}, your ticket is ready.\nTicket No: ${issued.ticketNo}\n${issued.category}\n\nOpen your ticket: ${issued.url}\n\nShow this ticket and your Government ID at check-in. ${EVENT.dateLabel} · ${EVENT.venue}, Bhubaneswar.\n— All Odisha Gym Association`;
    return (
      <div className="card p-6">
        <p className="label text-gold">Ticket issued</p>
        <p className="display mt-2 text-5xl text-gold">{issued.ticketNo}</p>
        <p className="mt-2 font-semibold">{issued.name}</p>
        <p className="text-sm text-muted">{issued.category}</p>
        <div className="mt-6 flex flex-col gap-3">
          <a href={`https://wa.me/91${issued.phone}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener" className="btn w-full bg-wa text-white">
            <WhatsAppGlyph className="size-6" /> Send ticket on WhatsApp
          </a>
          <a href={issued.url} target="_blank" rel="noopener" className="btn btn-line w-full">
            Open ticket
          </a>
          <button onClick={() => navigator.clipboard?.writeText(issued.url)} className="text-sm text-muted underline">
            Copy ticket link
          </button>
          <button
            onClick={() => {
              setIssued(null);
              setF({ ...f, name: "", phone: "", regId: "", utr: "" });
            }}
            className="btn btn-gold w-full"
          >
            Next ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Staff password</span>
        <input className={input} type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="current-password" />
      </label>
      <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm">
        Before issuing: open the <b>Yes Bank merchant app</b> and confirm this UTR received exactly the right amount. One UTR = one ticket.
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">UTR / UPI reference (from the screenshot)</span>
        <input className={`${input} tnum tracking-widest`} value={f.utr} onChange={(e) => setF({ ...f, utr: e.target.value.replace(/\D/g, "").slice(0, 12) })} inputMode="numeric" placeholder="12 digits" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Athlete name</span>
          <input className={input} value={f.name} onChange={set("name")} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Athlete WhatsApp number</span>
          <input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(-10) })} inputMode="numeric" placeholder="10 digits" />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Category</span>
        <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, amount: String(CATEGORIES.find((c) => c.label === e.target.value)?.fee ?? "") })}>
          {CATEGORIES.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label} — {inr(c.fee)}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Amount received (₹)</span>
          <input className={input} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, "") })} inputMode="numeric" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Registration ID <span className="font-normal text-muted">(from their message)</span>
          </span>
          <input className={`${input} uppercase`} value={f.regId} onChange={set("regId")} placeholder="SF26-XXXXXX" />
        </label>
      </div>
      {cat && Number(f.amount) !== cat.fee && <p className="text-sm text-red-300">Amount differs from the {inr(cat.fee)} fee — double-check before issuing.</p>}
      {error && <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <button onClick={issue} disabled={!ok || busy} className="btn btn-gold w-full disabled:opacity-40">
        {busy ? "Issuing…" : "Issue ticket"}
      </button>
    </div>
  );
}
