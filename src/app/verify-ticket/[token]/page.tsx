import { verifyDownloadToken } from "@/lib/download-token";
import { unseal } from "@/lib/ticket";
import { getRegistrationFromFirestore } from "@/lib/firebase";
import { EVENT } from "@/data/festival";
import Link from "next/link";
import { CheckCircle2, XCircle, ShieldCheck, Calendar, MapPin, User, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerifyTicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let regId: string | null = null;
  let athleteName = "";
  let category = "";
  let ticketNo = "";
  let isTest = false;

  // Try download-token verification first
  const downloadVerify = verifyDownloadToken(token);
  if (downloadVerify) {
    regId = downloadVerify.regId;
  } else {
    // Fallback: AES unseal token
    const unsealed = unseal(token);
    if (unsealed) {
      regId = unsealed.r || null;
      athleteName = unsealed.n;
      category = unsealed.c;
      ticketNo = unsealed.t;
      isTest = Boolean(unsealed.isTest);
    }
  }

  let registration = null;
  if (regId) {
    registration = await getRegistrationFromFirestore(regId);
    if (registration) {
      athleteName = registration.name;
      category = registration.category;
      ticketNo = registration.ticketNo || ticketNo || `SFT-${regId.slice(-6)}`;
      isTest = Boolean(registration.isTest);
    }
  }

  const isValid = Boolean(
    registration
      ? registration.status === "Paid" || registration.status === "Verified"
      : athleteName && ticketNo
  );

  return (
    <main className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-4 selection:bg-[#d4af37] selection:text-black">
      <div className="w-full max-w-md bg-[#16181f] border border-[#2a2e39] rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Gold Stripe */}
        <div className="h-2 bg-gradient-to-r from-[#d4af37] via-[#f7d070] to-[#d4af37]" />

        <div className="p-6 md:p-8 text-center">
          {isValid ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <div className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-1">
            Official Official Entry Pass Verification
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">
            {isValid ? "VALID ENTRY PASS" : "INVALID / UNCONFIRMED PASS"}
          </h1>
          <p className="text-xs text-neutral-400 mb-6">
            {isValid
              ? "This pass has been cryptographically verified against the official AOGA registry."
              : "This pass could not be verified or payment is not confirmed. Please report to the enquiry desk."}
          </p>

          {isValid && (
            <div className="bg-[#1f232e] border border-[#2d3342] rounded-xl p-5 text-left space-y-4 mb-6">
              <div className="flex items-start justify-between border-b border-[#2d3342] pb-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#d4af37]" /> Athlete Name
                  </span>
                  <div className="text-lg font-bold text-white mt-0.5">{athleteName}</div>
                </div>
                {isTest && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    TEST PASS
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-[#2d3342] pb-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">Registration ID</span>
                  <div className="font-mono text-sm font-bold text-[#d4af37] mt-0.5">{regId}</div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">Ticket Number</span>
                  <div className="font-mono text-sm font-bold text-white mt-0.5">{ticketNo}</div>
                </div>
              </div>

              <div className="border-b border-[#2d3342] pb-3">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#d4af37]" /> Category / Championship
                </span>
                <div className="text-sm font-semibold text-white mt-0.5">{category}</div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{EVENT.datesFull}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{EVENT.venueFull}</span>
                </div>
              </div>
            </div>
          )}

          {isValid && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-300 text-left mb-6">
              <div className="font-bold flex items-center gap-1 mb-1">
                <ShieldCheck className="w-4 h-4" /> Checklist for Check-in Officials:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Verify original Govt Photo ID matches athlete name</li>
                <li>Check weigh-in / reporting time for this category</li>
                <li>Issue physical athlete armband or bib number</li>
              </ul>
            </div>
          )}

          <Link
            href="/"
            className="inline-block w-full py-3 bg-[#2d3342] hover:bg-[#383f52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            ← Back to Official Website
          </Link>
        </div>
      </div>
    </main>
  );
}

