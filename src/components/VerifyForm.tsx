"use client";

import Link from "next/link";
import { useState } from "react";
import { EVENT } from "@/data/festival";
import { type Claim, waitForTicket } from "@/lib/claim";
import { Icon, WhatsAppGlyph } from "./icons";

const input = "h-13 w-full rounded-lg border border-line bg-raise px-4 text-base outline-none transition-colors focus:border-gold";

/** Athletes who closed the payment screen: mobile number + UTR → same bank check as the payment screen. */
export function VerifyForm() {
  const [phone, setPhone] = useState("");
  const [utr, setUtr] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Claim | "saved" | null>(null);
  const ok = /^[6-9]\d{9}$/.test(phone) && utr.length === 12;

  async function verify() {
    setError("");
    setChecking(true);
    try {
      setResult((await waitForTicket({ phone, utr })) ?? "saved");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      setUtr(text.match(/\d{12}/)?.[0] ?? text.replace(/\D/g, "").slice(0, 12));
    } catch {
      setError("Couldn’t read the copied text — please type the 12 digits.");
    }
  }

  if (result === "saved")
    return (
      <div className="card p-6 text-center">
        <p className="display text-3xl">Payment details saved</p>
        <p className="mt-3 text-muted">
          The bank’s confirmation for UTR {utr} hasn’t arrived yet. Your <b className="text-white">ticket will be emailed</b> to you as soon as it does, and our team is
          alerted automatically if it takes more than 15 minutes. <b className="text-white">Don’t pay again.</b>
        </p>
        <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="btn mt-6 w-full bg-wa text-white">
          <WhatsAppGlyph className="size-5" /> WhatsApp {EVENT.paymentsWhatsApp.display}
        </a>
      </div>
    );

  if (result)
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-wa text-white">
          <Icon name="check" className="size-8" />
        </span>
        <p className="display mt-4 text-4xl">Payment verified</p>
        {result.ticketNo && <p className="display mt-2 text-3xl tracking-wider text-gold">{result.ticketNo}</p>}
        {result.ticketUrl ? (
          <>
            <a href={`${result.ticketUrl}/image`} download className="btn btn-gold mt-6 w-full">
              Download ticket
            </a>
            <a href={result.ticketUrl} className="btn btn-line mt-3 w-full">
              Open my ticket <Icon name="arrow" className="arr size-5" />
            </a>
          </>
        ) : (
          <p className="mt-3 text-muted">Your ticket has been emailed to you.</p>
        )}
      </div>
    );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Mobile number you registered with</span>
        <div className="flex">
          <span className="grid place-items-center rounded-l-lg border border-r-0 border-line bg-raise px-3 text-sm text-muted">+91</span>
          <input
            className={`${input} rounded-l-none`}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(-10))}
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit number"
            disabled={checking}
          />
        </div>
      </label>
      <div>
        <label htmlFor="utr" className="mb-2 block text-sm font-semibold">
          UTR / UPI reference number
        </label>
        <div className="flex gap-2">
          <input
            id="utr"
            className={`${input} tnum min-w-0 text-center text-xl tracking-[0.2em]`}
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="12 digits"
            disabled={checking}
          />
          <button onClick={paste} disabled={checking} className="btn btn-line shrink-0 !px-4 text-sm">
            Paste
          </button>
        </div>
        <span className="mt-2 block text-xs text-muted">On your “Payment successful” screen — GPay: “UPI transaction ID” · PhonePe: “UTR” · Paytm: “UPI Ref. No.”</span>
      </div>
      {error && <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <button onClick={verify} disabled={!ok || checking} className="btn btn-gold w-full disabled:opacity-40">
        {checking ? "Checking with the bank…" : "Verify my payment"}
      </button>
      {checking && <p className="text-center text-sm text-gold">Keep this page open — this can take up to 3 minutes.</p>}
      <p className="text-center text-xs text-muted">
        Not registered yet?{" "}
        <Link href="/register" className="underline underline-offset-2 hover:text-white">
          Register here
        </Link>
      </p>
    </div>
  );
}
