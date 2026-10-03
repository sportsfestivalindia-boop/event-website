"use client";

import { useState } from "react";
import { EVENT } from "@/data/festival";
import { SECTORS, STALLS, STALL_TBC, TIERS } from "@/data/partners";
import { razorpayPay, type RzpOrder } from "@/lib/checkout";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph } from "./icons";
import { Tbc } from "./ui";

const input = "h-12 w-full rounded-lg border border-line bg-raise px-4 text-base outline-none transition-colors focus:border-gold";
const waTo = (text: string) => `https://wa.me/${EVENT.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

/* ───────── Stall booking: pick a size → details → pay (Razorpay) → booking confirmed ───────── */
export function StallBooking() {
  const [stall, setStall] = useState(STALLS[0].id);
  const [f, setF] = useState({ company: "", contact: "", phone: "", email: "", gstin: "", sector: SECTORS[0] });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; label: string; amount: number; paid: boolean } | null>(null);

  const st = STALLS.find((s) => s.id === stall)!;
  const ok = f.company.trim().length > 1 && f.contact.trim().length > 1 && /^[6-9]\d{9}$/.test(f.phone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const summary = (id: string) =>
    `Stall booking ${id}\nStall: ${st.size} (${inr(st.price)})\nCompany: ${f.company}\nContact: ${f.contact}, +91 ${f.phone}, ${f.email}\nSector: ${f.sector}${f.gstin ? `\nGSTIN: ${f.gstin}` : ""}`;

  async function book() {
    setError("");
    setBusy(true);
    try {
      const o = await post<{ bookingId: string; amount: number; label: string; razorpay: RzpOrder | null }>("/api/stall", { stall, ...f, gstin: f.gstin.toUpperCase() });
      if (!o.razorpay) return setDone({ id: o.bookingId, label: o.label, amount: o.amount, paid: false });
      const paid = await razorpayPay(o.razorpay, { description: `${o.label} · Baramunda Ground`, prefill: { name: f.contact, email: f.email, contact: "+91" + f.phone }, notes: { booking_id: o.bookingId } });
      await post("/api/verify", { ref: o.bookingId, ...paid });
      setDone({ id: o.bookingId, label: o.label, amount: o.amount, paid: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="card mx-auto max-w-xl p-6 text-center md:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold text-ink">
          <Icon name="check" className="size-8" />
        </span>
        <p className="display mt-5 text-4xl">{done.paid ? "Stall booked!" : "Almost done"}</p>
        <p className="mt-2 text-muted">
          {done.paid
            ? `Payment of ${inr(done.amount)} received. AOGA will share your stall allotment and invoice on WhatsApp and email.`
            : "Send this booking to the AOGA team on WhatsApp. They’ll confirm availability and share payment details."}
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-gold/60 p-4 text-left text-sm">
          <p className="text-xs text-muted uppercase">Booking ID</p>
          <p className="display text-3xl text-gold">{done.id}</p>
          <p className="mt-2 font-semibold">
            {done.label} · {inr(done.amount)}
          </p>
          <p className="text-muted">
            {f.company} · {f.contact}
          </p>
        </div>
        {!done.paid && (
          <a href={waTo(summary(done.id))} target="_blank" rel="noopener" className="btn mt-6 w-full bg-wa text-white">
            <WhatsAppGlyph className="size-6" /> Send booking on WhatsApp
          </a>
        )}
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <ul className="grid grid-cols-2 gap-3 lg:col-span-7" role="radiogroup" aria-label="Stall size">
        {STALLS.map((s) => {
          const on = s.id === stall;
          return (
            <li key={s.id}>
              <button
                role="radio"
                aria-checked={on}
                onClick={() => setStall(s.id)}
                className={`flex h-full w-full flex-col items-start rounded-xl border p-4 text-left transition-[border-color,background-color] md:p-5 ${on ? "border-gold bg-gold/10" : "border-line bg-raise hover:border-gold/60"}`}
              >
                <span className="text-xs font-semibold text-muted uppercase">{s.sqft.toLocaleString("en-IN")} sq ft</span>
                <span className="display mt-1 text-2xl md:text-3xl">{s.size}</span>
                <span className={`display mt-3 text-2xl md:text-3xl ${on ? "text-gold" : ""}`}>{inr(s.price)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="card p-5 md:p-7 lg:col-span-5">
        <p className="label text-gold">Your stall</p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="display text-3xl">{st.size}</p>
          <p className="display text-3xl text-gold">
            {inr(st.price)}
            <Tbc note={STALL_TBC} />
          </p>
        </div>
        <p className="mt-1 text-xs text-muted">Baramunda Ground Field, Bhubaneswar · 4–6 Dec 2026</p>

        <div className="mt-6 space-y-4">
          <Field label="Company / brand name">
            <input className={input} value={f.company} onChange={set("company")} autoComplete="organization" />
          </Field>
          <Field label="Contact person">
            <input className={input} value={f.contact} onChange={set("contact")} autoComplete="name" />
          </Field>
          <Field label="Mobile (WhatsApp)">
            <input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" />
          </Field>
          <Field label="Email">
            <input className={input} value={f.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business sector">
              <select className={input} value={f.sector} onChange={set("sector")}>
                {[...SECTORS, "Other"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="GSTIN" optional>
              <input className={`${input} uppercase`} value={f.gstin} onChange={set("gstin")} maxLength={15} placeholder="For GST invoice" />
            </Field>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#ffb81c]" />
            <span className="text-muted">I agree that stall location is allotted by AOGA, and to the exhibitor rules shared with the booking.</span>
          </label>
        </div>

        {error && <p className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button onClick={book} disabled={!ok || !agree || busy} className="btn btn-gold mt-5 w-full disabled:opacity-40">
          {busy ? "Please wait…" : `Book & pay ${inr(st.price)}`}
          <Icon name="arrow" className="arr size-5" />
        </button>
        <p className="mt-3 text-center text-xs text-muted">Secure payment by Razorpay · Netbanking, cards & UPI. Large amounts: use netbanking.</p>
      </div>
    </div>
  );
}

/* ───────── Sponsorship enquiry → AOGA on WhatsApp (or email) ───────── */
export function SponsorForm() {
  const [f, setF] = useState({ company: "", contact: "", phone: "", email: "", tier: TIERS[0].name, budget: "₹2 – 5 Lakh", note: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const ok = f.company.trim().length > 1 && f.contact.trim().length > 1 && /^[6-9]\d{9}$/.test(f.phone);
  const text = `Sponsorship enquiry — India’s Biggest Sports Festival 2026\nCompany: ${f.company}\nContact: ${f.contact}, +91 ${f.phone}${f.email ? `, ${f.email}` : ""}\nInterested in: ${f.tier}\nBudget: ${f.budget}${f.note ? `\nNote: ${f.note}` : ""}`;

  return (
    <div className="card p-5 md:p-7">
      <p className="label text-amber-700">Sponsorship enquiry</p>
      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company / brand">
            <input className={input} value={f.company} onChange={set("company")} autoComplete="organization" />
          </Field>
          <Field label="Contact person">
            <input className={input} value={f.contact} onChange={set("contact")} autoComplete="name" />
          </Field>
          <Field label="Mobile">
            <input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" />
          </Field>
          <Field label="Email" optional>
            <input className={input} value={f.email} onChange={set("email")} type="email" autoComplete="email" />
          </Field>
          <Field label="Interested in">
            <select className={input} value={f.tier} onChange={set("tier")}>
              {TIERS.map((t) => (
                <option key={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget">
            <select className={input} value={f.budget} onChange={set("budget")}>
              {["₹2 – 5 Lakh", "₹5 – 10 Lakh", "₹10 – 25 Lakh", "₹25 Lakh +"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Anything else?" optional>
          <textarea className={`${input} h-24 py-3`} value={f.note} onChange={set("note")} placeholder="Products, activation ideas, sampling…" />
        </Field>
      </div>
      <a href={ok ? waTo(text) : undefined} target="_blank" rel="noopener" aria-disabled={!ok} className={`btn mt-5 w-full bg-wa text-white ${ok ? "" : "pointer-events-none opacity-40"}`}>
        <WhatsAppGlyph className="size-6" /> Send enquiry on WhatsApp
      </a>
      <a
        href={`mailto:${EVENT.email}?subject=${encodeURIComponent(`Sponsorship enquiry — ${f.company || "Sports Festival 2026"}`)}&body=${encodeURIComponent(text)}`}
        className="mt-3 block text-center text-sm font-semibold underline decoration-line underline-offset-4"
      >
        or email {EVENT.email}
      </a>
    </div>
  );
}
