"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { TEST_CHAMPIONSHIP, TEST_SPORT_ID, TEST_CATEGORY_LABEL, TEST_FEE } from "@/lib/test-entry";
import { getSortedPayUBanks } from "@/data/payuBanks";
import { CHAMPIONSHIPS, DOCUMENTS, EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { Icon, WhatsAppGlyph, Wordmark } from "./icons";
import { PolicyLinks } from "./ui";
import { TutorialVideo } from "./TutorialVideo";
import { track } from "@/lib/track";
import { type Claim, waitForTicket } from "@/lib/claim";
type Form = { sport: string; division: string; cls: string; name: string; dob: string; phone: string; email: string; city: string; association: string };
export type Pending = { regId: string; amount: number; label: string; upi: string | null; qr: string | null };
/** Reopening a saved registration from its personal link (/pay?id=…): straight to the payment step. */
export type Resume = { pending: Pending; sport?: string; name: string; dob: string; phone: string; email: string; city: string };
type Done = { regId: string; label: string; paid: number; utr?: string };

const baseOpen = CHAMPIONSHIPS.filter((c) => c.divisions.length > 0);
const firstClass = (sport: string, division: string) => baseOpen.find((c) => c.id === sport)?.divisions.find((d) => d.id === division)?.classes[0] ?? "";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

export function RegisterFlow({
  initial,
  resume,
  isModal = false,
  onClose,
  testEntryToken,
}: {
  initial: { sport?: string; division?: string; cls?: string; test?: boolean };
  resume?: Resume;
  isModal?: boolean;
  onClose?: () => void;
  testEntryToken?: string;
}) {
  // staff test mode (?test=1): with the staff password the fee is ₹1; no Meta events, so ads stay clean
  const testing = !!initial.test || !!testEntryToken;
  const [testKey, setTestKey] = useState("");
  const open = useMemo(() => (testEntryToken ? [TEST_CHAMPIONSHIP, ...baseOpen] : baseOpen), [testEntryToken]);
  const champ0 = open.find((c) => c.id === (resume?.sport ?? initial.sport)) ?? open[0];
  const div0 = champ0.divisions.find((d) => d.id === initial.division) ?? champ0.divisions[0];
  const [f, setF] = useState<Form>({
    sport: champ0.id,
    division: div0.id,
    cls: div0.classes.includes(initial.cls ?? "") ? initial.cls! : div0.classes[0],
    name: resume?.name ?? "",
    dob: resume?.dob ?? "",
    phone: resume?.phone ?? "",
    email: resume?.email ?? "",
    city: resume?.city ?? "",
    association: "",
  });
  const [step, setStep] = useState(resume ? 4 : 1);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Pending | null>(resume?.pending ?? null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [utr, setUtr] = useState("");
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState<Claim | null>(null);
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "nb">("upi");
  const [selectedBank, setSelectedBank] = useState<string>("SBIB");
  const [bankQuery, setBankQuery] = useState<string>("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState<boolean>(false);
  const allPayuBanks = useMemo(() => getSortedPayUBanks(), []);
  const filteredBanks = useMemo(() => {
    if (!bankQuery.trim()) return allPayuBanks;
    const q = bankQuery.toLowerCase().trim();
    return allPayuBanks.filter((b) => b.name.toLowerCase().includes(q) || b.bankcode.toLowerCase().includes(q));
  }, [allPayuBanks, bankQuery]);

  const champ = open.find((c) => c.id === f.sport) ?? open[0];
  const div = champ.divisions.find((d) => d.id === f.division) ?? champ.divisions[0];
  const isTestEntry = f.sport === TEST_SPORT_ID || !!testEntryToken;
  const fee = isTestEntry ? TEST_FEE : (div.fee ?? EVENT.fee);
  const label = isTestEntry ? TEST_CATEGORY_LABEL : `${champ.sport} · ${div.name}${div.classes.length > 1 ? ` · ${f.cls}` : ""}`;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const handlePhone = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.length >= 12 && digits.startsWith("91")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
    setF({ ...f, phone: digits.slice(0, 10) });
  };
  const detailsOk = f.name.trim().length > 1 && !!f.dob && /^[6-9]\d{9}$/.test(f.phone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && f.city.trim().length > 1;
  const missingDetailHint = !f.name.trim() || f.name.trim().length <= 1
    ? "Please enter your full name as on ID"
    : !f.dob
    ? "Please select your date of birth"
    : !f.phone
    ? "Please enter your 10-digit WhatsApp mobile number"
    : f.phone.length < 10
    ? `Mobile number needs ${10 - f.phone.length} more digit${10 - f.phone.length > 1 ? "s" : ""}`
    : !/^[6-9]\d{9}$/.test(f.phone)
    ? "Mobile number must start with 6, 7, 8, or 9 (do not include leading 0)"
    : !f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
    ? "Please enter a valid email address"
    : !f.city.trim() || f.city.trim().length <= 1
    ? "Please enter your city / district"
    : null;

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const tracking = track("trackingPayload"); // UTM / ad-click attribution, kept for the future server-side Meta feed
      const o = await post<{ free?: boolean; regId: string; amount: number; label: string; upi?: string | null; testSig?: string }>("/api/order", { ...f, tracking, testToken: testEntryToken, ...(testing && !testEntryToken && { testKey }) });
      if (o.free) {
        if (!testing) track("freeRegistered", { label: o.label, regId: o.regId });
        return setDone({ regId: o.regId, label: o.label, paid: 0 });
      }
      if (!testing) track("registrationStarted", { value: o.amount, sport: champ.sport, label: o.label, eventId: tracking?.event_id });

      // ── PayU: get signed form fields and auto-POST to PayU checkout ──────────
      try {
        const payu = await post<{ fields: Record<string, string>; payuUrl: string }>("/api/payu/initiate", {
          regId: o.regId,
          amount: o.amount,
          label: o.label,
          testToken: testEntryToken,
          testSig: o.testSig,
          method: payMethod === "nb" ? "netbanking" : payMethod,
          bankcode: payMethod === "nb" ? selectedBank : undefined,
          entry: { name: f.name, email: f.email, phone: f.phone, sport: f.sport, division: f.division, cls: f.cls },
        });
        // Build a hidden form and submit it — PayU requires a form POST, not a redirect
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payu.payuUrl;
        Object.entries(payu.fields).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return; // browser navigates to PayU — nothing more to do here
      } catch {
        // PayU not configured yet — fall back to manual UPI QR
      }

      // ── Fallback: manual UPI QR (if PayU keys not set) ───────────────────────
      const qr = o.upi ? await QRCode.toDataURL(o.upi, { margin: 1, width: 520, errorCorrectionLevel: "M" }) : null;
      setPending({ regId: o.regId, amount: o.amount, label: o.label, upi: o.upi ?? null, qr });
      setStep(4);
      if (!isModal) window.scrollTo({ top: 0 });
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
      const c = await waitForTicket({ regId: p.regId, utr });
      if (c) {
        // Purchase fires only once the bank has confirmed the money (not on a click)
        if (!testing) track("paid", { orderId: p.regId, value: p.amount, sport: champ.sport, label: p.label });
        return setVerified(c);
      }
      setDone({ regId: p.regId, label: p.label, paid: p.amount, utr }); // bank alert still not in: Make finishes it, ticket comes by email
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }

  if (verified) return <Verified claim={verified} regId={pending!.regId} label={pending!.label} email={f.email} isModal={isModal} onClose={onClose} />;
  if (done && done.paid) return <Submitted done={done} resend={() => window.open(waHref(pending!, true), "_blank", "noopener")} isModal={isModal} onClose={onClose} />;
  if (done) return <Pass done={done} name={f.name} city={f.city} when={champ.when} isModal={isModal} onClose={onClose} />;

  const input = "h-13 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-base text-white outline-none transition-all focus:border-yellow focus:bg-black focus:ring-2 focus:ring-yellow/20";

  return (
    <div className={isModal ? "relative w-full overflow-hidden bg-black p-3 sm:p-6 md:p-8 flex flex-col justify-center items-center" : "relative min-h-[100svh] w-full overflow-hidden bg-black px-4 py-8 md:py-16 flex flex-col justify-center items-center"}>
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-orange/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full bg-yellow/15 blur-[120px]" />

      {/* Main Boxed Card Container */}
      <div className={`relative w-full ${isModal ? "max-w-2xl rounded-2xl sm:rounded-3xl border border-white/15 bg-black/95 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-2xl z-10" : "max-w-2xl rounded-3xl border border-white/15 bg-black/85 p-6 shadow-[0_25px_80px_-20px_rgba(255,69,0,0.35),0_0_0_1px_rgba(255,222,0,0.15)] backdrop-blur-2xl sm:p-10 z-10 pb-28 md:pb-10"}`}>
        
        {/* Top Header of the Box */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" onClick={(e) => { if (onClose) { e.preventDefault(); onClose(); } }} aria-label="Back to home" className="hover:opacity-90 transition-opacity">
            <Wordmark />
          </Link>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 transition-all hover:border-yellow hover:text-yellow hover:bg-yellow/10 cursor-pointer"
            >
              ✕ Close
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 transition-all hover:border-yellow hover:text-yellow hover:bg-yellow/10"
            >
              ✕ Close
            </Link>
          )}
        </div>

        {/* Headline & Festival Badge */}
        <div className="mt-6 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow/30 bg-gradient-to-r from-orange/15 to-yellow/15 px-3.5 py-1 text-[11px] font-bold tracking-wider text-yellow uppercase">
            India’s Biggest Sports Festival · 4–6 Dec 2026 · Bhubaneswar
          </span>
          <h1 className="display mt-3 text-4xl sm:text-5xl text-white">
            REGISTER <span className="text-yellow">NOW</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">Choose your championship, fill your details &amp; secure your spot</p>
        </div>

        {testEntryToken && (
          <div className="mt-6 rounded-2xl border border-yellow/40 bg-yellow/10 p-4 text-sm text-yellow">
            <b className="block font-bold">🧪 Live Test Entry Mode Active (₹1 Entry)</b>
            <p className="mt-1 text-xs text-white/70">
              You are testing the live ₹1 payment &amp; confirmation pipeline. A real ₹1 test charge will be processed by PayU.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6">
            <TutorialVideo tag="Must watch" title="Watch this before you register" note="1-minute video: how to fill the form, pay by UPI and get your ticket" />
          </div>
        )}

        {/* Step Indicator Segmented Box Tabs */}
        <ol className="mt-8 grid grid-cols-4 gap-2 text-xs font-bold">
          {["Category", "Details", "Review", "Pay"].map((s, i) => {
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <li
                key={s}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 sm:p-3 text-center transition-all ${
                  active
                    ? "bg-gradient-to-r from-orange to-yellow text-black shadow-[0_4px_16px_rgba(255,69,0,0.35)]"
                    : done
                    ? "border border-yellow/40 bg-yellow/10 text-yellow"
                    : "border border-white/10 bg-white/[0.03] text-white/50"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">Step 0{i + 1}</span>
                <span className="mt-0.5 text-xs sm:text-sm font-extrabold truncate w-full">{s}</span>
              </li>
            );
          })}
        </ol>

        {step === 1 && (
          <section className="mt-8 space-y-6">
            {/* Sport Box Selector */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider text-white/80 uppercase flex items-center gap-2">
                <span className="size-2 rounded-full bg-yellow" /> Select Sport
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {open.map((c) => {
                  const active = c.id === f.sport;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      aria-pressed={active}
                      onClick={() => {
                        setF({ ...f, sport: c.id, division: c.divisions[0].id, cls: c.divisions[0].classes[0] });
                        track("viewSport", c.sport);
                      }}
                      className={`group relative flex flex-col justify-between rounded-xl border p-3.5 sm:p-4 text-left transition-all ${
                        active
                          ? "border-2 border-yellow bg-yellow/[0.12] text-yellow shadow-[0_0_20px_rgba(255,222,0,0.2)]"
                          : "border-white/15 bg-white/[0.03] text-white hover:border-yellow/50 hover:bg-white/[0.06] hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className="font-extrabold text-sm sm:text-base leading-tight">{c.sport}</span>
                        {active ? (
                          <span className="grid size-5 place-items-center rounded-full bg-yellow text-black shrink-0 ml-1">
                            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="size-4 rounded-full border border-white/20 shrink-0 ml-1 group-hover:border-yellow/50" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Division Box Selector */}
            {champ.divisions.length > 1 && (
              <div>
                <p className="mb-3 text-xs font-bold tracking-wider text-white/80 uppercase flex items-center gap-2">
                  <span className="size-2 rounded-full bg-yellow" /> Division
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {champ.divisions.map((d) => {
                    const active = d.id === f.division;
                    return (
                      <button
                        type="button"
                        key={d.id}
                        aria-pressed={active}
                        onClick={() => setF({ ...f, division: d.id, cls: firstClass(f.sport, d.id) })}
                        className={`group relative flex items-center justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all ${
                          active
                            ? "border-2 border-yellow bg-yellow/[0.14] text-yellow shadow-[0_0_18px_rgba(255,222,0,0.22)]"
                            : "border-white/15 bg-white/[0.03] text-white hover:border-yellow/50 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="font-bold text-sm leading-tight">{d.name}</span>
                        {active ? (
                          <span className="grid size-4 place-items-center rounded-full bg-yellow text-black shrink-0 ml-2">
                            <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="size-3.5 rounded-full border border-white/25 shrink-0 ml-2 group-hover:border-yellow/50" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weight / Height Class Box Selector */}
            {div.classes.length > 1 && (
              <div>
                <p className="mb-3 text-xs font-bold tracking-wider text-white/80 uppercase flex items-center gap-2">
                  <span className="size-2 rounded-full bg-yellow" /> Weight / Height Class
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {div.classes.map((k) => {
                    const active = k === f.cls;
                    return (
                      <button
                        type="button"
                        key={k}
                        aria-pressed={active}
                        onClick={() => setF({ ...f, cls: k })}
                        className={`rounded-xl border px-3 py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                          active
                            ? "border-2 border-yellow bg-yellow/[0.18] text-yellow shadow-[0_0_15px_rgba(255,222,0,0.25)] scale-[1.02]"
                            : "border-white/15 bg-white/[0.03] text-white/90 hover:border-yellow/40 hover:bg-white/[0.07]"
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {div.note && (
              <p className="rounded-xl border border-yellow/30 bg-yellow/10 p-3 text-sm text-yellow flex items-center gap-2">
                <span className="size-2 rounded-full bg-yellow shrink-0" />
                {div.note}
              </p>
            )}

            {/* Official Entry Fee Ticket Box */}
            <div className="rounded-2xl border border-orange/40 bg-gradient-to-br from-orange/[0.12] via-black to-yellow/[0.08] p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-white/60">Official Entry Fee</span>
                  <p className="mt-1 flex items-center gap-2 text-xs text-white/80">
                    <Icon name="calendar" className="size-4 text-yellow" /> Competes: <span className="font-semibold text-white">{champ.when}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="display text-4xl sm:text-5xl text-yellow">
                    {fee ? inr(fee) : "FREE"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

      {step === 2 && (
        <section className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/80 uppercase">Full name (as on Government ID)</span>
            <input className={input} value={f.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Rakesh Kumar Sahoo" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/80 uppercase">Date of birth</span>
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
            <span className="mt-1.5 block text-xs text-white/60">Tap the box to pick your date of birth</span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/80 uppercase">Mobile number (WhatsApp)</span>
            <div className="flex">
              <span className="grid place-items-center rounded-l-xl border border-r-0 border-white/15 bg-white/5 px-3.5 text-sm font-bold text-yellow">+91</span>
              <input
                className={`${input} rounded-l-none`}
                value={f.phone}
                onChange={(e) => handlePhone(e.target.value)}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
              />
            </div>
            {f.phone.length > 0 && f.phone.length < 10 && (
              <span className="mt-1.5 block text-xs text-amber-400 font-medium">
                10 digits required ({10 - f.phone.length} more digit{10 - f.phone.length > 1 ? "s" : ""})
              </span>
            )}
            {f.phone.length === 10 && !/^[6-9]\d{9}$/.test(f.phone) && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                Mobile number must start with 6, 7, 8, or 9 (do not enter leading 0)
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/80 uppercase">Email</span>
            <input className={input} value={f.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" />
            {f.email.length > 3 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && (
              <span className="mt-1.5 block text-xs text-amber-400 font-medium">
                Enter a valid email address (e.g. you@example.com)
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/80 uppercase">City</span>
            <input className={input} value={f.city} onChange={set("city")} autoComplete="address-level2" placeholder="e.g. Bhubaneswar" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/80 uppercase">
              Association / federation / gym <span className="font-normal text-white/50">(optional)</span>
            </span>
            <input className={input} value={f.association} onChange={set("association")} placeholder="Who are you representing?" />
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 space-y-5">
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] overflow-hidden divide-y divide-white/10 shadow-lg">
            <div className="bg-gradient-to-r from-orange to-yellow px-5 py-3 text-black font-extrabold text-xs uppercase tracking-wider flex justify-between items-center">
              <span>Registration Summary</span>
              <span>4–6 DEC 2026</span>
            </div>
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
                <span className="text-white/60 font-medium">{k}</span>
                <span className="text-right font-bold text-white">{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange/15 to-yellow/15 border-t border-yellow/30">
              <span className="font-extrabold text-white text-base">Total Fee Payable</span>
              <span className="display text-4xl text-yellow">{fee ? inr(fee) : "FREE"}</span>
            </div>
          </div>
          {fee > 0 && (
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold tracking-wider text-white/80 uppercase mb-2.5">
                  Choose Payment Method
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* UPI - Shown first, popular on mobile */}
                  <button
                    type="button"
                    onClick={() => setPayMethod("upi")}
                    aria-pressed={payMethod === "upi"}
                    className={`flex items-center sm:flex-col justify-start sm:justify-center gap-3 p-3.5 rounded-xl border text-left sm:text-center transition-all cursor-pointer min-h-[52px] ${
                      payMethod === "upi"
                        ? "border-2 border-yellow bg-yellow/[0.14] text-yellow shadow-[0_0_15px_rgba(255,222,0,0.2)]"
                        : "border-white/15 bg-white/[0.03] text-white hover:border-white/30"
                    }`}
                  >
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-sm font-extrabold flex items-center gap-1.5 justify-start sm:justify-center">
                        <span>UPI / QR / Apps</span>
                        <span className="text-[10px] bg-yellow text-black font-black px-1.5 py-0.5 rounded uppercase">Fastest</span>
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">GPay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </button>

                  {/* Card Option */}
                  <button
                    type="button"
                    onClick={() => setPayMethod("card")}
                    aria-pressed={payMethod === "card"}
                    className={`flex items-center sm:flex-col justify-start sm:justify-center gap-3 p-3.5 rounded-xl border text-left sm:text-center transition-all cursor-pointer min-h-[52px] ${
                      payMethod === "card"
                        ? "border-2 border-yellow bg-yellow/[0.14] text-yellow shadow-[0_0_15px_rgba(255,222,0,0.2)]"
                        : "border-white/15 bg-white/[0.03] text-white hover:border-white/30"
                    }`}
                  >
                    <span className="text-xl">💳</span>
                    <div>
                      <div className="text-sm font-extrabold">Debit / Credit Card</div>
                      <div className="text-[11px] text-white/60 mt-0.5">Visa, Mastercard, RuPay</div>
                    </div>
                  </button>

                  {/* Net Banking Option */}
                  <button
                    type="button"
                    onClick={() => setPayMethod("nb")}
                    aria-pressed={payMethod === "nb"}
                    className={`flex items-center sm:flex-col justify-start sm:justify-center gap-3 p-3.5 rounded-xl border text-left sm:text-center transition-all cursor-pointer min-h-[52px] ${
                      payMethod === "nb"
                        ? "border-2 border-yellow bg-yellow/[0.14] text-yellow shadow-[0_0_15px_rgba(255,222,0,0.2)]"
                        : "border-white/15 bg-white/[0.03] text-white hover:border-white/30"
                    }`}
                  >
                    <span className="text-xl">🏦</span>
                    <div>
                      <div className="text-sm font-extrabold">Net Banking</div>
                      <div className="text-[11px] text-white/60 mt-0.5">50+ Banks Supported</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Net Banking Dropdown when Net Banking is selected */}
              {payMethod === "nb" && (
                <div className="rounded-2xl border border-white/15 bg-black/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold tracking-wider text-white/80 uppercase">
                      Select Your Bank
                    </label>
                    <span className="text-[11px] text-yellow font-semibold">
                      {allPayuBanks.find((b) => b.bankcode === selectedBank)?.name}
                    </span>
                  </div>

                  {/* Quick-select pills for top popular banks */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { name: "SBI", code: "SBIB" },
                      { name: "HDFC", code: "HDFB" },
                      { name: "ICICI", code: "ICIB" },
                      { name: "Axis", code: "AXIB" },
                      { name: "PNB", code: "PNBB" },
                      { name: "BOB", code: "BBRB" },
                      { name: "Kotak", code: "162B" },
                    ].map((pb) => (
                      <button
                        type="button"
                        key={pb.code}
                        onClick={() => {
                          setSelectedBank(pb.code);
                          setBankDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                          selectedBank === pb.code
                            ? "bg-yellow text-black ring-2 ring-yellow/50 shadow-md"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {pb.name}
                      </button>
                    ))}
                  </div>

                  {/* Searchable input with toggleable dropdown */}
                  <div className="relative pt-1">
                    <input
                      type="text"
                      value={bankDropdownOpen ? bankQuery : (allPayuBanks.find((b) => b.bankcode === selectedBank)?.name ?? "Select Bank")}
                      onChange={(e) => {
                        setBankQuery(e.target.value);
                        setBankDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setBankQuery("");
                        setBankDropdownOpen(true);
                      }}
                      placeholder="Search 50+ banks (e.g. SBI, Canara, Union)..."
                      className="h-12 w-full rounded-xl border border-white/20 bg-white/[0.05] pl-4 pr-16 text-sm text-white outline-none focus:border-yellow focus:ring-1 focus:ring-yellow"
                    />
                    <button
                      type="button"
                      onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                      className="absolute right-2.5 top-[10px] text-xs text-yellow px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold"
                    >
                      {bankDropdownOpen ? "✕ Close" : "▾ Browse"}
                    </button>

                    {bankDropdownOpen && (
                      <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/20 bg-[#161616] shadow-2xl divide-y divide-white/10">
                        {filteredBanks.length === 0 ? (
                          <div className="p-4 text-center text-xs text-white/50">
                            No bank found matching &ldquo;{bankQuery}&rdquo;
                          </div>
                        ) : (
                          filteredBanks.map((b) => {
                            const isSel = selectedBank === b.bankcode;
                            return (
                              <button
                                type="button"
                                key={b.bankcode}
                                onClick={() => {
                                  setSelectedBank(b.bankcode);
                                  setBankDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-3.5 text-left text-xs transition-colors hover:bg-yellow/15 cursor-pointer min-h-[44px] ${
                                  isSel ? "bg-yellow/20 text-yellow font-bold" : "text-white/90"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {b.popular && <span className="text-[10px] text-yellow">★</span>}
                                  <span>{b.name}</span>
                                </span>
                                <span className="text-[10px] opacity-60 font-mono shrink-0 ml-2">{b.bankcode}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informative Security Banner */}
              <div className="flex items-center gap-3 rounded-xl border border-yellow/30 bg-yellow/10 p-3.5 text-xs text-white/90">
                <Icon name="shield" className="size-5 shrink-0 text-yellow" />
                <span>
                  Next: You will be redirected to the secure <b>PayU gateway</b> to complete your transaction with 256-bit encryption. No EMI allowed.
                </span>
              </div>
            </div>
          )}
          {testing && (
            <label className="block rounded-xl border border-yellow/50 bg-yellow/10 p-4 text-sm">
              <b className="block text-yellow font-bold">Staff test mode — pay ₹1 instead of the fee</b>
              <input type="password" value={testKey} onChange={(e) => setTestKey(e.target.value)} placeholder="Staff password" autoComplete="current-password" className="mt-2 h-11 w-full rounded-lg border border-white/20 bg-black px-3 outline-none focus:border-yellow text-white" />
            </label>
          )}
          <label className="flex items-start gap-3.5 rounded-xl border border-white/15 bg-white/[0.03] p-4 text-sm transition-colors hover:border-white/30 cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#ff4500]" />
            <span>
              <b className="block text-white font-bold">Athlete declaration &amp; anti-doping consent</b>
              <span className="mt-1 block text-xs text-white/60 leading-relaxed">
                I confirm my information is true and correct. I agree to follow the competition rules, the instructions of officials and the applicable anti-doping requirements, and to cooperate with any authorised testing. I understand that breaking the rules may lead to disqualification or withdrawal of awards. I accept the{" "}
                <Link href="/terms" target="_blank" className="underline underline-offset-2 text-yellow hover:text-white">Terms</Link>,{" "}
                <Link href="/refund" target="_blank" className="underline underline-offset-2 text-yellow hover:text-white">Refund policy</Link> and{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-2 text-yellow hover:text-white">Privacy policy</Link>.
              </span>
            </span>
          </label>
        </section>
      )}

      {step === 4 && pending && pending.qr && (
        <section className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-white/60 uppercase">Registration {pending.regId}</p>
            <p className="display mt-1 text-5xl text-white">
              Pay <span className="text-yellow">{inr(pending.amount)}</span>
            </p>
            <p className="mt-1 text-sm text-white/60">3 simple steps · takes about 2 minutes · keep this page open</p>
          </div>

          <TutorialVideo title="New to UPI? Watch how to pay" note="Save the QR, pay in your UPI app, copy the UTR, get your ticket · 1 minute" start={33} />

          <PayStep n={1} title="Open any UPI app">
            <p>Google Pay, PhonePe, Paytm, BHIM or your bank’s app — any app with UPI works.</p>
          </PayStep>

          <PayStep n={2} title={`Scan the QR and pay ${inr(pending.amount)}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
            <img src={pending.qr} alt={`UPI QR code to pay ${inr(pending.amount)} to ${EVENT.upi.payee}`} width={260} height={260} className="mx-auto size-60 rounded-xl bg-white p-2 shadow-lg" />
            <p>
              In your UPI app tap <b className="text-white">Scan</b>, scan this QR and pay. Your app will show <b className="text-white">{EVENT.upi.payee}</b> (the festival’s {EVENT.upi.bank} collection account) and <b className="text-white">{inr(pending.amount)}</b> — don’t change the amount.
            </p>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 md:hidden">
              <p className="font-semibold text-white">Only one phone?</p>
              <p className="mt-1">
                Tap the button below to save the QR. Then in your UPI app tap <b className="text-white">Scan</b> → tap the <b className="text-white">photo / gallery icon</b> → choose the QR. (iPhone: press and hold the QR → Save to Photos.)
              </p>
              <a href={pending.qr} download={`sports-festival-${pending.regId}-qr.png`} className="btn btn-gold mt-3 w-full">
                Save QR to gallery
              </a>
            </div>
            <p className="text-xs">
              Can’t scan? Pay to UPI ID <code className="rounded bg-white/10 border border-white/15 px-2 py-0.5 font-semibold text-white">{EVENT.upi.id}</code>{" "}
              <button onClick={() => navigator.clipboard?.writeText(EVENT.upi.id).then(() => setCopied(true))} className="font-semibold text-yellow underline underline-offset-2">
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </p>
          </PayStep>

          <PayStep n={3} title="Enter your UTR number to get your ticket">
            <p>
              After paying, your app shows <b className="text-white">“Payment successful”</b>. On that screen there is a <b className="text-white">12-digit number</b> — this is your UTR. Each app names it differently:
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl bg-white/5 border border-white/10 p-3 text-xs sm:text-sm">
              <span className="text-white/60">Google Pay</span>
              <b className="text-white">UPI transaction ID</b>
              <span className="text-white/60">PhonePe</span>
              <b className="text-white">UTR</b>
              <span className="text-white/60">Paytm</span>
              <b className="text-white">UPI Ref. No.</b>
              <span className="text-white/60">Other apps</span>
              <b className="text-white">UTR / Reference No.</b>
            </div>
            <p>
              It looks like this: <b className="tnum text-white">6281 5012 9971</b>. Press and hold the number → <b className="text-white">Copy</b>, come back here, paste it in the box and tap <b className="text-white">Verify</b>.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="utr"
                aria-label="Your 12-digit UTR number"
                className={`${input} tnum min-w-0 text-center text-xl tracking-[0.15em] placeholder:text-sm placeholder:tracking-normal`}
                value={utr}
                onChange={(e) => setUtr(e.target.value.match(/\d{12}/)?.[0] ?? e.target.value.replace(/\D/g, "").slice(0, 12))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Paste your UTR number here"
                disabled={checking}
              />
              <button onClick={verify} disabled={utr.length !== 12 || checking} className="btn btn-gold w-full shrink-0 !px-6 disabled:opacity-40 sm:w-auto">
                Verify
              </button>
            </div>
            {utr.length > 0 && utr.length < 12 && <p className="text-xs text-yellow">{12 - utr.length} more digit{utr.length === 11 ? "" : "s"} — the UTR has 12 digits.</p>}
            {error && <p className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          </PayStep>

          <div className="rounded-2xl border border-wa/40 bg-wa/10 p-5">
            <p className="flex items-center gap-2 text-base font-semibold text-white">
              <Icon name="shield" className="size-5 text-wa" /> Your money is safe
            </p>
            <p className="mt-2 text-sm text-white/70">
              Paid, but your ticket didn’t appear? <b className="text-white">Don’t worry and don’t pay again.</b> Send us a screenshot of your “Payment successful” screen on WhatsApp — our team checks it with the bank and sends your ticket to you <b className="text-white">manually</b>.
            </p>
            <button onClick={sendScreenshot} className="btn mt-4 w-full bg-wa text-white font-bold">
              <WhatsAppGlyph className="size-5" /> Send screenshot on WhatsApp
            </button>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
            <p className="text-base font-bold text-white">Need help? We’re here</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <b className="text-white">Payment failed but money was deducted?</b> It usually comes back to your account within 48 hours. Send us the screenshot and we’ll check.
              </li>
              <li>
                <b className="text-white">Can’t find the 12-digit number?</b> Open your UPI app’s payment history and tap this payment — or just send us the screenshot.
              </li>
              <li>
                <b className="text-white">Closed this page?</b> Verify any time at{" "}
                <Link href="/verify" className="font-semibold text-yellow underline underline-offset-2">
                  sportsfestivalindia.com/verify
                </Link>{" "}
                with your mobile number + the 12-digit number.
              </li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={EVENT.phoneHref} className="btn btn-line !px-3 text-sm rounded-xl border-white/20 text-white hover:border-yellow hover:text-yellow">
                <Icon name="phone" className="size-4" /> Call us
              </a>
              <a href={waHref(pending)} target="_blank" rel="noopener" className="btn btn-line !px-3 text-sm rounded-xl border-white/20 text-white hover:border-yellow hover:text-yellow">
                <WhatsAppGlyph className="size-4" /> WhatsApp us
              </a>
            </div>
          </div>
        </section>
      )}

      {step === 4 && pending && !pending.qr && (
        <section className="mt-8 space-y-5">
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-6 text-center">
            <p className="text-xs text-white/60 uppercase">Registration ID</p>
            <p className="display mt-1 text-4xl tracking-wider text-yellow">{pending.regId}</p>
            <p className="mt-3 font-bold text-white">{pending.label}</p>
            <p className="display mt-1 text-3xl text-white">{inr(pending.amount)}</p>
          </div>
          <p className="text-sm text-white/70">Your place is reserved. Send these details to the AOGA team on WhatsApp — they’ll share the UPI QR for {inr(pending.amount)} and confirm your athlete pass once it’s paid.</p>
          <a href={waHref(pending)} target="_blank" rel="noopener" className="btn w-full bg-wa text-white font-bold">
            <WhatsAppGlyph className="size-6" /> Send registration on WhatsApp
          </a>
        </section>
      )}

      {error && step !== 4 && <p className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {/* Desktop & In-Modal Action Buttons */}
      {step < 4 && (
        <div className={`mt-8 ${isModal ? "flex flex-col" : "hidden md:flex md:flex-col"} gap-2 pt-6 border-t border-white/10`}>
          <div className="flex items-center gap-3 w-full">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn btn-line !min-h-13 !px-6 rounded-xl border-white/20 text-white hover:border-yellow hover:text-yellow">
                Back
              </button>
            )}
            {step < 3 && (
              <button type="button" onClick={() => setStep(step + 1)} disabled={step === 2 && !detailsOk} className="btn btn-gold !min-h-13 flex-1 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg disabled:opacity-40">
                Continue <Icon name="arrow" className="arr size-5" />
              </button>
            )}
            {step === 3 && (
              <button type="button" onClick={submit} disabled={!agree || busy} className="btn btn-gold !min-h-13 flex-1 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg disabled:opacity-40">
                {busy ? "Redirecting to payment…" : fee ? `Pay ${testEntryToken || testing ? "₹1 (Test)" : inr(fee)} Securely` : "Confirm Free Registration"}
              </button>
            )}
          </div>
          {step === 2 && !detailsOk && missingDetailHint && (
            <p className="text-center text-xs text-amber-300/90 font-medium">{missingDetailHint}</p>
          )}
        </div>
      )}

      {checking && pending && <Verifying regId={pending.regId} amount={pending.amount} utr={utr} />}

      </div> {/* Close Main Box Card Container */}

      {/* Policy Links outside the box */}
      {!isModal && <PolicyLinks className="mt-8 text-white/50" />}

      {/* Mobile Pinned Bottom Action Bar (only when not in modal) */}
      {!isModal && (
        <div className={`t-ink fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-black/95 backdrop-blur-xl px-5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] md:hidden ${step === 4 ? "hidden" : ""}`}>
          <div className="mx-auto flex max-w-xl gap-3">
            {step > 1 && step < 4 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn btn-line !px-5 rounded-xl border-white/20 text-white">
                Back
              </button>
            )}
            {step < 3 && (
              <button type="button" onClick={() => setStep(step + 1)} disabled={step === 2 && !detailsOk} className="btn btn-gold flex-1 rounded-xl text-black font-extrabold disabled:opacity-40">
                Continue <Icon name="arrow" className="arr size-5" />
              </button>
            )}
            {step === 3 && (
              <button type="button" onClick={submit} disabled={!agree || busy} className="btn btn-gold flex-1 rounded-xl text-black font-extrabold disabled:opacity-40">
                {busy ? "Redirecting to payment…" : fee ? `Pay ${testEntryToken || testing ? "₹1 (Test)" : inr(fee)} securely` : "Confirm free registration"}
              </button>
            )}
          </div>
          {step === 2 && !detailsOk && missingDetailHint && (
            <p className="mx-auto mt-2 max-w-xl text-center text-xs text-amber-300 font-medium">
              {missingDetailHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** One numbered step of the pay screen — big number, plain words, for first-time UPI payers. */
function PayStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5 shadow-lg">
      <p className="flex items-center gap-3 text-base font-semibold text-white">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-yellow text-sm font-extrabold text-black">{n}</span>
        {title}
      </p>
      <div className="mt-3 space-y-3 text-sm text-white/70">{children}</div>
    </div>
  );
}

/** Full screen while the bank check runs (up to 3 min), so nobody wonders whether to close the page or pay again. */
function Verifying({ regId, amount, utr }: { regId: string; amount: number; utr: string }) {
  const [left, setLeft] = useState(180);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div role="alertdialog" aria-live="polite" aria-label="Verifying your payment" className="fixed inset-0 z-50 grid place-items-center bg-black/95 backdrop-blur-2xl px-6 text-center text-white">
      <div className="max-w-sm rounded-3xl border border-white/15 bg-black p-8 shadow-2xl">
        <span className="mx-auto block size-16 animate-spin rounded-full border-4 border-white/20 border-t-yellow" />
        <h2 className="display mt-6 text-4xl text-white">Verifying your payment</h2>
        <p className="mt-3 text-sm text-white/60">We’re checking your {inr(amount)} payment with the bank. This usually takes less than a minute.</p>
        <p className="mt-6 rounded-xl border border-yellow/40 bg-yellow/10 p-4 font-semibold text-yellow text-sm">Please don’t close this window and don’t pay again.</p>
        <p className="display tnum mt-6 text-5xl text-yellow">
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </p>
        <p className="mt-4 text-xs text-white/50">
          Registration {regId} · UTR {utr}
        </p>
      </div>
    </div>
  );
}

/** Paid by QR: the bank hasn't confirmed within ~3 min (or the athlete chose WhatsApp) — reassure, and get the screenshot. */
function Submitted({ done, resend, isModal, onClose }: { done: Done; resend: () => void; isModal?: boolean; onClose?: () => void }) {
  if (done.utr)
    return (
      <div className={isModal ? "relative w-full bg-black px-4 py-8 flex flex-col justify-center items-center" : "relative min-h-[100svh] w-full bg-black px-4 py-12 flex flex-col justify-center items-center"}>
        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-black/90 p-8 text-center shadow-2xl">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-wa text-white">
            <Icon name="shield" className="size-9" />
          </span>
          <h1 className="display mt-5 text-4xl text-white">Don’t worry — your payment is safe</h1>
          <p className="mt-3 text-sm text-white/70">
            The bank hasn’t confirmed your {inr(done.paid)} payment yet. <b className="text-white">Send a screenshot of your “Payment successful” screen on WhatsApp</b> — our team will check it and send your ticket to you on WhatsApp <b className="text-white">manually</b>. Please don’t pay again.
          </p>
          <button onClick={resend} className="btn mt-6 w-full bg-wa text-white font-bold">
            <WhatsAppGlyph className="size-6" /> Send payment screenshot on WhatsApp
          </button>
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] mt-6 p-6">
            <p className="text-xs text-white/60 uppercase">Your registration ID</p>
            <p className="display mt-1 text-4xl tracking-wider text-yellow">{done.regId}</p>
            <p className="mt-2 text-sm font-semibold text-white">{done.label}</p>
            <p className="mt-1 text-xs text-white/50">UTR {done.utr}</p>
          </div>
          <p className="mt-6 text-xs text-white/50">If the bank confirms it first, your ticket is also emailed to you automatically — and our team is alerted, so nobody is forgotten.</p>
          {onClose ? (
            <button type="button" onClick={onClose} className="btn btn-line mt-8 w-full border-white/20 text-white hover:border-yellow hover:text-yellow cursor-pointer">
              Close &amp; Back to festival
            </button>
          ) : (
            <Link href="/" className="btn btn-line mt-8 w-full border-white/20 text-white hover:border-yellow hover:text-yellow">
              Back to home
            </Link>
          )}
        </div>
      </div>
    );
  return (
    <div className={isModal ? "relative w-full bg-black px-4 py-8 flex flex-col justify-center items-center" : "relative min-h-[100svh] w-full bg-black px-4 py-12 flex flex-col justify-center items-center"}>
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-black/90 p-8 text-center shadow-2xl">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-yellow text-black font-extrabold">
          <Icon name="check" className="size-9" />
        </span>
        <h1 className="display mt-5 text-4xl text-white">Payment submitted</h1>
        <p className="mt-3 text-sm text-white/70">
          Thank you! Our team will check your {inr(done.paid)} payment and send your <b className="text-white">ticket on WhatsApp</b>, usually within 24 hours.
        </p>
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] mt-8 p-6">
          <p className="text-xs text-white/60 uppercase">Your registration ID</p>
          <p className="display mt-1 text-4xl tracking-wider text-yellow">{done.regId}</p>
          <p className="mt-2 text-sm font-semibold text-white">{done.label}</p>
        </div>
        <div className="mt-6 rounded-xl border border-yellow/40 bg-yellow/10 p-4 text-left text-sm">
          <b className="text-yellow">Did the screenshot go through?</b> In WhatsApp, attach the “Payment successful” screenshot and send it to <b className="text-white">{EVENT.paymentsWhatsApp.display}</b>. Didn’t open?
          <button onClick={resend} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-wa py-3 font-semibold text-white">
            <WhatsAppGlyph className="size-5" /> Open WhatsApp again
          </button>
        </div>
        <p className="mt-6 text-xs text-white/50">Keep your registration ID and payment screenshot until you receive your ticket.</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="btn btn-line mt-8 w-full border-white/20 text-white hover:border-yellow hover:text-yellow cursor-pointer">
            Close &amp; Back to festival
          </button>
        ) : (
          <Link href="/" className="btn btn-line mt-8 w-full border-white/20 text-white hover:border-yellow hover:text-yellow">
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}

/** Bank confirmed the payment: ticket right here (also emailed by the sheet). */
function Verified({ claim, regId, label, email, isModal, onClose }: { claim: Claim; regId: string; label: string; email: string; isModal?: boolean; onClose?: () => void }) {
  return (
    <div className={isModal ? "relative w-full bg-black px-4 py-8 flex flex-col justify-center items-center" : "relative min-h-[100svh] w-full bg-black px-4 py-12 flex flex-col justify-center items-center"}>
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-black/90 p-8 text-center shadow-2xl">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-wa text-white">
          <Icon name="check" className="size-9" />
        </span>
        <h1 className="display mt-5 text-4xl text-white">Payment verified</h1>
        <p className="mt-3 text-sm text-white/70">You’re registered for {label}. We’ve also emailed your ticket to {email}.</p>
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] mt-8 p-6">
          <p className="text-xs text-white/60 uppercase">{claim.ticketNo ? "Ticket no." : "Registration ID"}</p>
          <p className="display mt-1 text-4xl tracking-wider text-yellow">{claim.ticketNo ?? regId}</p>
        </div>
        {claim.ticketUrl && (
          <>
            <a href={`${claim.ticketUrl}/image`} download className="btn btn-gold mt-6 w-full text-black font-extrabold">
              Download ticket
            </a>
            <a href={claim.ticketUrl} className="btn btn-line mt-3 w-full border-white/20 text-white hover:border-yellow hover:text-yellow">
              Open my ticket <Icon name="arrow" className="arr size-5" />
            </a>
          </>
        )}
        <p className="mt-4 text-xs text-white/50">Save your ticket and bring it with your Government ID to check-in.</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="btn btn-line mt-8 w-full border-white/20 text-white hover:border-yellow hover:text-yellow cursor-pointer">
            Close &amp; Back to festival
          </button>
        ) : (
          <Link href="/" className="btn btn-line mt-8 w-full border-white/20 text-white hover:border-yellow hover:text-yellow">
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}

/** Success: the athlete pass (free registrations). */
function Pass({ done, name, city, when, isModal, onClose }: { done: Done; name: string; city: string; when: string; isModal?: boolean; onClose?: () => void }) {
  const share = encodeURIComponent(`I just registered for India’s Biggest Sports Festival 2026 — 6 championships, 4–6 Dec, Bhubaneswar. Register: ${typeof location !== "undefined" ? location.origin : ""}`);
  return (
    <div className={isModal ? "relative w-full bg-black px-4 py-8 flex flex-col justify-center items-center" : "relative min-h-[100svh] w-full bg-black px-4 py-12 flex flex-col justify-center items-center"}>
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-yellow text-black font-extrabold">
            <Icon name="check" className="size-9" />
          </span>
          <h1 className="display mt-5 text-5xl text-white">You’re registered!</h1>
          <p className="mt-2 text-sm text-white/70">
            Free registration confirmed.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-black border border-yellow/60 shadow-[0_30px_80px_-30px_#ff450077]">
          <div className="flex items-center justify-between bg-gradient-to-r from-orange to-yellow px-5 py-3 text-black">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Athlete pass</span>
            <span className="text-xs font-bold">4–6 DEC 2026</span>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <Wordmark />
              <span className="shrink-0 rounded-full bg-wa/15 px-2.5 py-1 text-[10px] font-bold text-wa uppercase">Confirmed</span>
            </div>
            <p className="mt-6 text-xs text-white/60 uppercase">Athlete</p>
            <p className="display text-4xl leading-tight text-white">{name}</p>
            <p className="text-sm text-white/60">{city}</p>
            <p className="mt-4 text-xs text-white/60 uppercase">Category</p>
            <p className="font-semibold text-white">{done.label}</p>
            <p className="mt-1 text-sm text-yellow">{when}</p>
            <div className="mt-6 flex items-end justify-between border-t border-dashed border-white/20 pt-4">
              <div>
                <p className="text-xs text-white/60 uppercase">Registration ID</p>
                <p className="display text-3xl tracking-wider whitespace-nowrap text-yellow">{done.regId}</p>
              </div>
              <p className="text-right text-xs text-white/60">
                {EVENT.venue}
                <br />
                Bhubaneswar
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/50">Screenshot this pass and show it at check-in.</p>

        <div className="rounded-2xl border border-white/15 bg-white/[0.03] mt-6 p-5">
          <p className="text-sm font-semibold text-white">Bring on event day</p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/70">
            {DOCUMENTS.map((d) => (
              <li key={d} className="flex gap-2">
                <Icon name="check" className="size-4 shrink-0 text-yellow" /> {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noopener" className="btn w-full bg-wa text-white font-bold">
            <WhatsAppGlyph className="size-6" /> Share with friends
          </a>
          {onClose ? (
            <button type="button" onClick={onClose} className="btn btn-line w-full border-white/20 text-white hover:border-yellow hover:text-yellow cursor-pointer">
              Close &amp; Back to festival
            </button>
          ) : (
            <Link href="/" className="btn btn-line w-full border-white/20 text-white hover:border-yellow hover:text-yellow">
              Back to home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
