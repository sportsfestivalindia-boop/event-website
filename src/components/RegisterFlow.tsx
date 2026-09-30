"use client";

import Link from "next/link";
import { useState } from "react";
import { CHAMPIONSHIPS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph, Wordmark } from "./icons";

type Form = { sport: string; division: string; cls: string; name: string; phone: string; email: string; city: string; gym: string };
type Done = { regId: string; label: string; paid: number; demo?: boolean };
type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

const open = CHAMPIONSHIPS.filter((c) => c.divisions.length > 0);
const firstClass = (sport: string, division: string) => open.find((c) => c.id === sport)?.divisions.find((d) => d.id === division)?.classes[0] ?? "";

function loadCheckout() {
  return new Promise<void>((ok, fail) => {
    if (window.Razorpay) return ok();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => ok();
    s.onerror = () => fail(new Error("Could not load payment window. Check your internet and try again."));
    document.body.appendChild(s);
  });
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

export function RegisterFlow({ initial }: { initial: { sport?: string; division?: string; cls?: string } }) {
  const champ0 = open.find((c) => c.id === initial.sport) ?? open[0];
  const div0 = champ0.divisions.find((d) => d.id === initial.division) ?? champ0.divisions[0];
  const [f, setF] = useState<Form>({
    sport: champ0.id,
    division: div0.id,
    cls: div0.classes.includes(initial.cls ?? "") ? initial.cls! : div0.classes[0],
    name: "",
    phone: "",
    email: "",
    city: "",
    gym: "",
  });
  const [step, setStep] = useState(1);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demoPay, setDemoPay] = useState<{ amount: number; label: string } | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const champ = open.find((c) => c.id === f.sport)!;
  const div = champ.divisions.find((d) => d.id === f.division)!;
  const fee = div.fee ?? EVENT.fee;
  const label = `${champ.sport} · ${div.name}${div.classes.length > 1 ? ` · ${f.cls}` : ""}`;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const detailsOk = f.name.trim().length > 1 && /^[6-9]\d{9}$/.test(f.phone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && f.city.trim().length > 1;

  async function pay() {
    setError("");
    setBusy(true);
    try {
      const o = await post<{ free?: boolean; demo?: boolean; regId?: string; orderId?: string; amount: number; key?: string; label: string }>("/api/order", f);
      if (o.free) return setDone({ regId: o.regId!, label: o.label, paid: 0 });
      if (o.demo) return setDemoPay({ amount: o.amount, label: o.label });
      await loadCheckout();
      new window.Razorpay!({
        key: o.key,
        amount: o.amount,
        currency: "INR",
        order_id: o.orderId,
        name: "Sports Festival 2026",
        description: o.label,
        prefill: { name: f.name, email: f.email, contact: "+91" + f.phone },
        theme: { color: "#FFB81C" },
        handler: async (r: RzpResponse) => {
          try {
            const v = await post<{ regId: string }>("/api/verify", { orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature });
            setDone({ regId: v.regId, label: o.label, paid: o.amount / 100 });
          } catch (e) {
            setError((e as Error).message);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDemo() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1400)); // feels like a real bank round-trip
    try {
      const v = await post<{ regId: string }>("/api/verify", { demo: true });
      setDone({ regId: v.regId, label: demoPay!.label, paid: demoPay!.amount, demo: true });
      setDemoPay(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Pass done={done} name={f.name} city={f.city} />;

  const input = "h-13 w-full rounded-lg border border-line bg-raise px-4 text-base outline-none transition-colors focus:border-gold";

  return (
    <div className="mx-auto w-full max-w-xl px-5 pt-6 pb-40 md:pt-10">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Back to home">
          <Wordmark />
        </Link>
        <Link href="/" className="text-sm text-muted hover:text-white">
          ✕ Close
        </Link>
      </div>

      <h1 className="display mt-10 text-5xl">
        Register <span className="text-gold">now</span>
      </h1>
      <p className="mt-2 text-muted">India’s Biggest Sports Festival · 4–6 Dec 2026 · Bhubaneswar</p>

      {/* step bar */}
      <ol className="mt-8 grid grid-cols-3 gap-2 text-xs font-semibold">
        {["Category", "Your details", "Pay"].map((s, i) => (
          <li key={s}>
            <span className={`block h-1.5 rounded-full ${step > i ? "bg-gold" : "bg-line"}`} />
            <span className={`mt-2 block ${step === i + 1 ? "text-gold" : "text-muted"}`}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      {step === 1 && (
        <section className="mt-8 space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold">Sport</p>
            <div className="grid grid-cols-2 gap-2">
              {open.map((c) => (
                <button
                  key={c.id}
                  aria-pressed={c.id === f.sport}
                  onClick={() => setF({ ...f, sport: c.id, division: c.divisions[0].id, cls: c.divisions[0].classes[0] })}
                  className={`rounded-lg border p-3 text-left text-sm font-semibold transition-colors ${c.id === f.sport ? "border-gold bg-gold/10 text-gold" : "border-line bg-raise"}`}
                >
                  {c.sport}
                </button>
              ))}
            </div>
          </div>
          {champ.divisions.length > 1 && (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Division</span>
              <select className={input} value={f.division} onChange={(e) => setF({ ...f, division: e.target.value, cls: firstClass(f.sport, e.target.value) })}>
                {champ.divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {div.classes.length > 1 && (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Weight / height class</span>
              <select className={input} value={f.cls} onChange={set("cls")}>
                {div.classes.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
          )}
          <div className="flex items-center justify-between rounded-lg bg-raise p-4">
            <span className="text-sm text-muted">Entry fee</span>
            <span className="display text-3xl text-gold">{fee ? inr(fee) : "FREE"}</span>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Full name (as on ID)</span>
            <input className={input} value={f.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Rakesh Kumar Sahoo" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Mobile number (WhatsApp)</span>
            <div className="flex">
              <span className="grid place-items-center rounded-l-lg border border-r-0 border-line bg-raise px-3 text-sm text-muted">+91</span>
              <input
                className={`${input} rounded-l-none`}
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input className={input} value={f.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">City</span>
            <input className={input} value={f.city} onChange={set("city")} autoComplete="address-level2" placeholder="e.g. Cuttack" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Gym / club <span className="font-normal text-muted">(optional)</span>
            </span>
            <input className={input} value={f.gym} onChange={set("gym")} placeholder="Where do you train?" />
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 space-y-4">
          <div className="card divide-y divide-line">
            {[
              ["Category", label],
              ["Name", f.name],
              ["Mobile", "+91 " + f.phone],
              ["Email", f.email],
              ["City", f.city + (f.gym ? ` · ${f.gym}` : "")],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 p-4 text-sm">
                <span className="text-muted">{k}</span>
                <span className="text-right font-semibold">{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-4">
              <span className="font-semibold">Total</span>
              <span className="display text-3xl text-gold">{fee ? inr(fee) : "FREE"}</span>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <Icon name="check" className="size-5 shrink-0 text-gold" /> Confirmation on WhatsApp + email instantly
            </li>
            <li className="flex gap-2">
              <Icon name="check" className="size-5 shrink-0 text-gold" /> Full refund if the event is cancelled
            </li>
            <li className="flex gap-2">
              <Icon name="lock" className="size-5 shrink-0 text-gold" /> Secure payment · UPI, cards, netbanking
            </li>
          </ul>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 accent-[#ffb81c]" />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="underline">
                terms
              </Link>
              ,{" "}
              <Link href="/refund" className="underline">
                refund policy
              </Link>{" "}
              and athlete waiver, and consent to AOGA using my details for this event.
            </span>
          </label>
        </section>
      )}

      {error && <p className="mt-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {/* sticky action bar */}
      <div className="t-ink fixed inset-x-0 bottom-0 z-40 border-t border-line px-5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn btn-line !px-5">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 2 && !detailsOk} className="btn btn-gold flex-1 disabled:opacity-40">
              Continue <Icon name="arrow" className="arr size-5" />
            </button>
          ) : (
            <button onClick={pay} disabled={!agree || busy} className="btn btn-gold flex-1 disabled:opacity-40">
              {busy ? "Please wait…" : fee ? `Pay ${inr(fee)}` : "Confirm free registration"}
            </button>
          )}
        </div>
        {step === 2 && !detailsOk && <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted">Fill name, a 10-digit mobile, email and city to continue</p>}
      </div>

      {demoPay && <DemoPay amount={demoPay.amount} busy={busy} onPay={confirmDemo} onClose={() => setDemoPay(null)} />}
    </div>
  );
}

/** Demo payment sheet — shown only while no gateway keys are configured. Clearly labelled; no money moves. */
function DemoPay({ amount, busy, onPay, onClose }: { amount: number; busy: boolean; onPay: () => void; onClose: () => void }) {
  const [method, setMethod] = useState("UPI");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center" role="dialog" aria-modal>
      <div className="t-paper w-full max-w-md rounded-t-2xl p-6 md:rounded-2xl">
        <p className="rounded-md bg-amber-100 px-3 py-2 text-center text-xs font-semibold text-amber-900">DEMO PAYMENT · no money will be charged</p>
        <div className="mt-5 flex items-baseline justify-between">
          <p className="font-semibold">Sports Festival 2026</p>
          <p className="display text-3xl">{inr(amount)}</p>
        </div>
        <p className="mt-5 mb-2 text-sm font-semibold">Pay using</p>
        <div className="grid grid-cols-2 gap-2">
          {["UPI", "Card", "Netbanking", "Wallet"].map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`rounded-lg border p-3 text-sm font-semibold ${method === m ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
              {m}
            </button>
          ))}
        </div>
        {method === "UPI" && <p className="mt-3 text-xs text-muted">GPay · PhonePe · Paytm · BHIM · any UPI app</p>}
        <button onClick={onPay} disabled={busy} className="btn btn-ink mt-6 w-full disabled:opacity-60">
          {busy ? "Processing payment…" : `Pay ${inr(amount)}`}
        </button>
        <button onClick={onClose} disabled={busy} className="mt-3 w-full text-center text-sm text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Success: the athlete pass. */
function Pass({ done, name, city }: { done: Done; name: string; city: string }) {
  const share = encodeURIComponent(`I just registered for India’s Biggest Sports Festival 2026 — ₹1.5 Crore prize pool! 4–6 Dec, Bhubaneswar. Register: ${typeof location !== "undefined" ? location.origin : ""}`);
  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold text-ink">
          <Icon name="check" className="size-9" />
        </span>
        <h1 className="display mt-5 text-5xl">You’re registered!</h1>
        <p className="mt-2 text-muted">{done.paid ? `Payment of ${inr(done.paid)} received${done.demo ? " (demo)" : ""}.` : "Free registration confirmed."} Your pass is below.</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-ink ring-1 ring-gold/60 shadow-[0_30px_80px_-30px_#ffb81c77]">
        <div className="flex items-center justify-between bg-gold px-5 py-3 text-ink">
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Athlete pass</span>
          <span className="text-xs font-bold">4–6 DEC 2026</span>
        </div>
        <div className="p-6">
          <Wordmark />
          <p className="mt-6 text-xs text-muted uppercase">Athlete</p>
          <p className="display text-4xl leading-tight">{name}</p>
          <p className="text-sm text-muted">{city}</p>
          <p className="mt-4 text-xs text-muted uppercase">Category</p>
          <p className="font-semibold">{done.label}</p>
          <div className="mt-6 flex items-end justify-between border-t border-dashed border-line pt-4">
            <div>
              <p className="text-xs text-muted uppercase">Registration ID</p>
              <p className="display text-3xl tracking-wider whitespace-nowrap text-gold">{done.regId}</p>
            </div>
            <p className="text-right text-xs text-muted">
              {EVENT.venue}
              <br />
              Bhubaneswar
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted">Screenshot this pass and show it at check-in.</p>

      <div className="mt-8 flex flex-col gap-3">
        <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noopener" className="btn w-full bg-wa text-white">
          <WhatsAppGlyph className="size-6" /> Share with friends
        </a>
        <Link href="/" className="btn btn-line w-full">
          Back to home
        </Link>
      </div>
    </div>
  );
}
