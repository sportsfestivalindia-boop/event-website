"use client";

import { useState } from "react";
import { EVENT } from "@/data/festival";
import { WhatsAppGlyph } from "@/components/icons";

const input = "h-12 w-full rounded-lg border border-line bg-raise px-4 text-base outline-none focus:border-gold";
const KEY = "sf26_staff_key";

type Result = { regId: string; name: string; phone: string; category: string; ticketUrl: string; status: string };

export function TicketLookup() {
  const [key, setKey] = useState(() => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } });
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function lookup() {
    setError(""); setResult(null); setBusy(true);
    try {
      const isPhone = /^\d{10}$/.test(query.trim());
      const res = await fetch("/api/ticket-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, ...(isPhone ? { phone: query.trim() } : { regId: query.trim() }) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Lookup failed.");
      try { localStorage.setItem(KEY, key); } catch {}
      setResult(d);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const cleanPhone = result?.phone ? String(result.phone).replace(/\D/g, "").slice(-10) : "";
  const waMsg = result
    ? `✅ Payment verified — ${EVENT.name} ${EVENT.year}\n\nHi ${result.name}, your ticket is ready.\n${result.category}\n\nOpen your ticket: ${result.ticketUrl}\n\nShow this ticket and your Government ID at check-in. ${EVENT.dateLabel} · ${EVENT.venue}, Bhubaneswar.\n— All Odisha Gym Association`
    : "";
  const waUrl = cleanPhone
    ? `https://api.whatsapp.com/send/?phone=91${cleanPhone}&text=${encodeURIComponent(waMsg)}`
    : `https://api.whatsapp.com/send/?text=${encodeURIComponent(waMsg)}`;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Staff password</span>
        <input className={input} type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Registration ID or WhatsApp number</span>
        <input
          className={`${input} uppercase`}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="SF26-XXXXXX  or  10-digit number"
        />
      </label>
      {error && <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <button onClick={lookup} disabled={!query.trim() || !key || busy} className="btn btn-line w-full disabled:opacity-40">
        {busy ? "Searching…" : "Find ticket"}
      </button>

      {result && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 space-y-3">
          <div>
            <p className="label text-gold text-xs">Ticket found ✅</p>
            <p className="font-semibold mt-1">{result.name}</p>
            <p className="text-sm text-muted">{result.category}</p>
            <p className="text-xs text-muted mt-1">{result.regId} · {result.status}</p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={result.ticketUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-gold w-full text-center"
            >
              Open ticket
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full bg-wa text-white flex items-center justify-center gap-2"
            >
              <WhatsAppGlyph className="size-5" /> Send on WhatsApp {cleanPhone ? `(+91 ${cleanPhone})` : ""}
            </a>
            <button
              onClick={() => navigator.clipboard?.writeText(result.ticketUrl)}
              className="text-sm text-muted underline"
            >
              Copy ticket link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

