"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useState } from "react";
import { CHAMPIONSHIPS, DOCUMENTS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph, Wordmark } from "./icons";
import { PolicyLinks } from "./ui";
import { track } from "@/lib/track";
import { UPI_APPS, upiAppLink } from "@/lib/upi";

type Form = { sport: string; division: string; cls: string; name: string; dob: string; phone: string; email: string; city: string; association: string };
type Pending = { regId: string; amount: number; label: string; upi: string | null; qr: string | null };
type Done = { regId: string; label: string; paid: number; utr?: string };
type Claim = { verified?: boolean; pending?: boolean; ticketUrl?: string | null; ticketNo?: string };

const open = CHAMPIONSHIPS.filter((c) => c.divisions.length > 0);
const firstClass = (sport: string, division: string) => open.find((c) => c.id === sport)?.divisions.find((d) => d.id === division)?.classes[0] ?? "";

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
    dob: "",
    phone: "",
    email: "",
    city: "",
    association: "",
  });
  const [step, setStep] = useState(1);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [utr, setUtr] = useState("");
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState<Claim | null>(null);

  // iPhones have no "any UPI app" chooser, so each app button uses that app's own link scheme there
  const ios = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const champ = open.find((c) => c.id === f.sport)!;
  const div = champ.divisions.find((d) => d.id === f.division)!;
  const fee = div.fee ?? EVENT.fee;
  const label = `${champ.sport} · ${div.name}${div.classes.length > 1 ? ` · ${f.cls}` : ""}`;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const detailsOk = f.name.trim().length > 1 && !!f.dob && /^[6-9]\d{9}$/.test(f.phone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && f.city.trim().length > 1;

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const tracking = track("trackingPayload"); // UTM / ad-click attribution, kept for the future server-side Meta feed
      const o = await post<{ free?: boolean; regId: string; amount: number; label: string; upi?: string | null }>("/api/order", { ...f, tracking });
      if (o.free) {
        track("freeRegistered", { label: o.label, regId: o.regId });
        return setDone({ regId: o.regId, label: o.label, paid: 0 });
      }
      track("registrationStarted", { value: o.amount, sport: champ.sport, label: o.label, eventId: tracking?.event_id });
      const qr = o.upi ? await QRCode.toDataURL(o.upi, { margin: 1, width: 520, errorCorrectionLevel: "M" }) : null;
      setPending({ regId: o.regId, amount: o.amount, label: o.label, upi: o.upi ?? null, qr });
      setStep(4);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const waText = (p: Pending, paid?: boolean) =>
    `${paid ? "PAYMENT SCREENSHOT ATTACHED 👇\n\n" : ""}Registration ${p.regId}\n${p.label} · ${inr(p.amount)}${paid ? " · paid by UPI" : ""}\nName: ${f.name}\nDOB: ${f.dob}\nMobile: +91 ${f.phone}\nEmail: ${f.email}\nCity: ${f.city}${f.association ? `\nAssociation: ${f.association}` : ""}`;
  const waHref = (p: Pending, paid?: boolean) => `https://wa.me/${EVENT.paymentsWhatsApp.wa}?text=${encodeURIComponent(waText(p, paid))}`;

  function sendScreenshot() {
    // Fallback: athlete attaches the payment screenshot in WhatsApp; AOGA checks it against Yes Bank and sends the ticket.
    window.open(waHref(pending!, true), "_blank", "noopener");
    setDone({ regId: pending!.regId, label: pending!.label, paid: pending!.amount });
  }

  /** Matches the typed UTR with Yes Bank's own credit alert (logged by Make). Most payments confirm within a minute. */
  async function verify() {
    const p = pending!;
    setError("");
    setChecking(true);
    try {
      for (let i = 0; i < 20; i++) {
        const c = await post<Claim>("/api/claim", { regId: p.regId, utr });
        if (c.verified) {
          // Purchase fires only once the bank has confirmed the money (not on a click)
          track("paid", { orderId: p.regId, value: p.amount, sport: champ.sport, label: p.label });
          return setVerified(c);
        }
        await new Promise((r) => setTimeout(r, 9000));
      }
      setDone({ regId: p.regId, label: p.label, paid: p.amount, utr }); // bank alert still not in: Make finishes it, ticket comes by email
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }

  if (verified) return <Verified claim={verified} regId={pending!.regId} label={pending!.label} email={f.email} />;
  if (done && done.paid) return <Submitted done={done} resend={() => window.open(waHref(pending!, true), "_blank", "noopener")} />;
  if (done) return <Pass done={done} name={f.name} city={f.city} when={champ.when} />;

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

      <ol className="mt-8 grid grid-cols-4 gap-2 text-xs font-semibold">
        {["Category", "Details", "Review", "Pay"].map((s, i) => (
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
                  onClick={() => {
                    setF({ ...f, sport: c.id, division: c.divisions[0].id, cls: c.divisions[0].classes[0] });
                    track("viewSport", c.sport);
                  }}
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
          {div.note && <p className="text-sm text-gold">{div.note}</p>}
          <div className="rounded-lg bg-raise p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Entry fee</span>
              <span className="display text-3xl text-gold">
                {fee ? inr(fee) : "FREE"}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted">
              <Icon name="calendar" className="size-4" /> Competes: {champ.when}
            </p>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Full name (as on Government ID)</span>
            <input className={input} value={f.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Rakesh Kumar Sahoo" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Date of birth</span>
            {/* color-scheme: dark makes the browser's calendar icon light on our dark field; a tap anywhere opens the picker */}
            <input
              className={`${input} cursor-pointer [color-scheme:dark]`}
              value={f.dob}
              onChange={set("dob")}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {}
              }}
              type="date"
              min="1930-01-01"
              max="2012-12-31"
              autoComplete="bday"
            />
            <span className="mt-1.5 block text-xs text-muted">Tap the box to pick your date of birth</span>
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
              Association / federation / gym <span className="font-normal text-muted">(optional)</span>
            </span>
            <input className={input} value={f.association} onChange={set("association")} placeholder="Who are you representing?" />
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 space-y-4">
          <div className="card divide-y divide-line">
            {[
              ["Category", label],
              ["Competes", champ.when],
              ["Name", f.name],
              ["Date of birth", f.dob.split("-").reverse().join("/")],
              ["Mobile", "+91 " + f.phone],
              ["Email", f.email],
              ["City", f.city + (f.association ? ` · ${f.association}` : "")],
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
          {fee > 0 && (
            <p className="flex gap-2 text-sm text-muted">
              <Icon name="rupee" className="size-5 shrink-0 text-gold" /> Next: pay by UPI QR with GPay, PhonePe, Paytm, BHIM or any UPI app.
            </p>
          )}
          <label className="flex items-start gap-3 rounded-lg border border-line p-4 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#ffb81c]" />
            <span>
              <b className="block">Athlete declaration &amp; anti-doping consent</b>
              <span className="mt-1 block text-muted">
                I confirm my information is true and correct. I agree to follow the competition rules, the instructions of officials and the applicable anti-doping requirements, and to cooperate with any authorised testing. I understand that breaking the rules may lead to disqualification or withdrawal of awards. I accept the{" "}
                <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-white">Terms</Link>,{" "}
                <Link href="/refund" target="_blank" className="underline underline-offset-2 hover:text-white">Refund policy</Link> and{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-white">Privacy policy</Link>.
              </span>
            </span>
          </label>
        </section>
      )}

      {step === 4 && pending && pending.qr && (
        <section className="mt-8 space-y-5">
          <div className="t-paper rounded-2xl p-6 text-center">
            <p className="text-xs font-semibold text-muted uppercase">Registration {pending.regId}</p>
            <p className="mt-2 text-sm font-semibold">Pay exactly</p>
            <p className="display text-6xl">{inr(pending.amount)}</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
            <img src={pending.qr} alt={`UPI QR code to pay ${inr(pending.amount)} to ${EVENT.upi.payee}`} width={260} height={260} className="mx-auto mt-4 size-60 rounded-lg border border-line bg-white p-2" />
            <p className="mt-3 text-xs text-muted">
              Your UPI app will show <b className="text-ink">{EVENT.upi.payee}</b> ({EVENT.upi.bank}) — the festival’s collection account
            </p>
            <div className="mt-5 md:hidden">
              <p className="text-sm font-semibold">Paying on this phone? Tap your app:</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {UPI_APPS.map((a) => (
                  <a key={a.name} href={upiAppLink(pending.upi!, a, ios)} className="btn btn-ink !px-3 text-sm">
                    {a.name}
                  </a>
                ))}
                <a href={pending.upi!} className="btn btn-line !px-3 text-sm !text-ink">
                  Other UPI app
                </a>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <span className="text-muted">UPI ID</span>
              <code className="rounded bg-ink/5 px-2 py-1 font-semibold">{EVENT.upi.id}</code>
              <button
                onClick={() => navigator.clipboard?.writeText(EVENT.upi.id).then(() => setCopied(true))}
                className="rounded border border-line px-2 py-1 font-semibold hover:border-ink"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold">How to pay — 3 easy steps</p>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                ["Pay", <>Scan the QR with GPay, PhonePe, Paytm or any UPI app. <b className="text-white">Paying on this phone?</b> Tap your app’s button above — or take a screenshot of the QR and scan it from your gallery inside the app.</>],
                ["Check", <>Make sure the amount is exactly <b className="text-white">{inr(pending.amount)}</b> and the name shown is <b className="text-white">{EVENT.upi.payee}</b>.</>],
                ["Confirm", <>On the “Payment successful” screen, find the <b className="text-white">12-digit UTR / UPI Ref. No. / UPI transaction ID</b>, type it below and tap <b className="text-white">Verify my payment</b>. We match it with the bank and your <b className="text-white">ticket appears here</b> — usually within a minute.</>],
              ].map(([t, b], i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-ink">{i + 1}</span>
                  <span className="text-muted">
                    <b className="text-white">{t}.</b> {b}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <label className="card block p-5">
            <span className="text-sm font-semibold">UTR / UPI reference number</span>
            <input
              className={`${input} tnum mt-3 text-center text-xl tracking-[0.25em]`}
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="12 digits"
              disabled={checking}
            />
            <span className="mt-2 block text-xs text-muted">GPay: “UPI transaction ID” · PhonePe: “UTR” · Paytm: “UPI Ref. No.”</span>
          </label>
          {checking && <p className="text-center text-sm text-gold">Checking with the bank… keep this page open (up to 3 minutes).</p>}
          <button onClick={sendScreenshot} className="flex w-full items-center justify-center gap-2 text-sm text-muted underline underline-offset-2 hover:text-white">
            <WhatsAppGlyph className="size-4" /> Can’t find the UTR? Send your payment screenshot on WhatsApp instead
          </button>
          <p className="text-center text-xs text-muted">Don’t pay twice. If the payment failed or money was deducted without success, WhatsApp {EVENT.paymentsWhatsApp.display} — we’ll sort it out.</p>
        </section>
      )}

      {step === 4 && pending && !pending.qr && (
        <section className="mt-8 space-y-5">
          <div className="card p-6 text-center">
            <p className="text-xs text-muted uppercase">Registration ID</p>
            <p className="display mt-1 text-4xl tracking-wider text-gold">{pending.regId}</p>
            <p className="mt-3 font-semibold">{pending.label}</p>
            <p className="display mt-1 text-3xl">{inr(pending.amount)}</p>
          </div>
          <p className="text-sm text-muted">Your place is reserved. Send these details to the AOGA team on WhatsApp — they’ll share the UPI QR for {inr(pending.amount)} and confirm your athlete pass once it’s paid.</p>
          <a href={waHref(pending)} target="_blank" rel="noopener" className="btn w-full bg-wa text-white">
            <WhatsAppGlyph className="size-6" /> Send registration on WhatsApp
          </a>
        </section>
      )}

      {error && <p className="mt-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      <PolicyLinks className="mt-14" />

      <div className="t-ink fixed inset-x-0 bottom-0 z-40 border-t border-line px-5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl gap-3">
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(step - 1)} className="btn btn-line !px-5">
              Back
            </button>
          )}
          {step < 3 && (
            <button onClick={() => setStep(step + 1)} disabled={step === 2 && !detailsOk} className="btn btn-gold flex-1 disabled:opacity-40">
              Continue <Icon name="arrow" className="arr size-5" />
            </button>
          )}
          {step === 3 && (
            <button onClick={submit} disabled={!agree || busy} className="btn btn-gold flex-1 disabled:opacity-40">
              {busy ? "Please wait…" : fee ? `Pay ${inr(fee)} by UPI` : "Confirm free registration"}
            </button>
          )}
          {step === 4 && pending?.qr && (
            <button onClick={verify} disabled={utr.length !== 12 || checking} className="btn btn-gold flex-1 disabled:opacity-40">
              {checking ? "Checking with the bank…" : "Verify my payment"}
            </button>
          )}
        </div>
        {step === 2 && !detailsOk && <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted">Fill name, date of birth, a 10-digit mobile, email and city</p>}
        {step === 4 && pending?.qr && utr.length !== 12 && <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted">After paying, type the 12-digit UTR from your payment screen</p>}
      </div>
    </div>
  );
}

/** Paid by QR: screenshot sent to AOGA, ticket follows after verification. */
function Submitted({ done, resend }: { done: Done; resend: () => void }) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-10 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold text-ink">
        <Icon name="check" className="size-9" />
      </span>
      <h1 className="display mt-5 text-5xl">Payment submitted</h1>
      {done.utr ? (
        <p className="mt-3 text-muted">
          Thank you! The bank hasn’t confirmed your {inr(done.paid)} payment (UTR {done.utr}) yet — this sometimes takes a little longer. Your <b className="text-white">ticket will be emailed</b> to you automatically as soon as it does.
        </p>
      ) : (
        <p className="mt-3 text-muted">
          Thank you! Our team will check your {inr(done.paid)} payment and send your <b className="text-white">ticket on WhatsApp</b>, usually within 24 hours.
        </p>
      )}
      <div className="card mt-8 p-6">
        <p className="text-xs text-muted uppercase">Your registration ID</p>
        <p className="display mt-1 text-4xl tracking-wider text-gold">{done.regId}</p>
        <p className="mt-2 text-sm font-semibold">{done.label}</p>
      </div>
      <div className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-left text-sm">
        {done.utr ? (
          <>
            <b>No ticket within 2 hours?</b> Send your “Payment successful” screenshot on WhatsApp to <b>{EVENT.paymentsWhatsApp.display}</b>.
          </>
        ) : (
          <>
            <b>Did the screenshot go through?</b> In WhatsApp, attach the “Payment successful” screenshot and send it to <b>{EVENT.paymentsWhatsApp.display}</b>. Didn’t open?
          </>
        )}
        <button onClick={resend} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-wa py-3 font-semibold text-white">
          <WhatsAppGlyph className="size-5" /> {done.utr ? "Send screenshot on WhatsApp" : "Open WhatsApp again"}
        </button>
      </div>
      <p className="mt-6 text-xs text-muted">Keep your registration ID and payment screenshot until you receive your ticket.</p>
      <Link href="/" className="btn btn-line mt-8 w-full">
        Back to home
      </Link>
    </div>
  );
}

/** Bank confirmed the payment: ticket right here (also emailed by the sheet). */
function Verified({ claim, regId, label, email }: { claim: Claim; regId: string; label: string; email: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-10 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-wa text-white">
        <Icon name="check" className="size-9" />
      </span>
      <h1 className="display mt-5 text-5xl">Payment verified</h1>
      <p className="mt-3 text-muted">You’re registered for {label}. We’ve also emailed your ticket to {email}.</p>
      <div className="card mt-8 p-6">
        <p className="text-xs text-muted uppercase">{claim.ticketNo ? "Ticket no." : "Registration ID"}</p>
        <p className="display mt-1 text-4xl tracking-wider text-gold">{claim.ticketNo ?? regId}</p>
      </div>
      {claim.ticketUrl && (
        <a href={claim.ticketUrl} className="btn btn-gold mt-6 w-full">
          Open my ticket <Icon name="arrow" className="arr size-5" />
        </a>
      )}
      <p className="mt-4 text-xs text-muted">Screenshot your ticket and bring it with your Government ID to check-in.</p>
      <Link href="/" className="btn btn-line mt-8 w-full">
        Back to home
      </Link>
    </div>
  );
}

/** Success: the athlete pass (free registrations). */
function Pass({ done, name, city, when }: { done: Done; name: string; city: string; when: string }) {
  const share = encodeURIComponent(`I just registered for India’s Biggest Sports Festival 2026 — 6 championships, 4–6 Dec, Bhubaneswar. Register: ${typeof location !== "undefined" ? location.origin : ""}`);
  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold text-ink">
          <Icon name="check" className="size-9" />
        </span>
        <h1 className="display mt-5 text-5xl">You’re registered!</h1>
        <p className="mt-2 text-muted">
          Free registration confirmed.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-ink ring-1 ring-gold/60 shadow-[0_30px_80px_-30px_#ffb81c77]">
        <div className="flex items-center justify-between bg-gold px-5 py-3 text-ink">
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Athlete pass</span>
          <span className="text-xs font-bold">4–6 DEC 2026</span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <Wordmark />
            <span className="shrink-0 rounded-full bg-wa/15 px-2.5 py-1 text-[10px] font-bold text-wa uppercase">Confirmed</span>
          </div>
          <p className="mt-6 text-xs text-muted uppercase">Athlete</p>
          <p className="display text-4xl leading-tight">{name}</p>
          <p className="text-sm text-muted">{city}</p>
          <p className="mt-4 text-xs text-muted uppercase">Category</p>
          <p className="font-semibold">{done.label}</p>
          <p className="mt-1 text-sm text-gold">{when}</p>
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

      <div className="card mt-6 p-5">
        <p className="text-sm font-semibold">Bring on event day</p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          {DOCUMENTS.map((d) => (
            <li key={d} className="flex gap-2">
              <Icon name="check" className="size-4 shrink-0 text-gold" /> {d}
            </li>
          ))}
        </ul>
      </div>

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
