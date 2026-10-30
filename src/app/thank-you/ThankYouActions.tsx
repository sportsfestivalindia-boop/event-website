"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Image as ImageIcon, Share2, MessageCircle, RefreshCw, Check, AlertCircle } from "lucide-react";

interface ThankYouActionsProps {
  regId: string;
  name: string;
  ticketDownloadUrl: string;
  receiptDownloadUrl: string;
  imageDownloadUrl: string;
  phone: string;
}

export function ThankYouActions({
  regId,
  name,
  ticketDownloadUrl,
  receiptDownloadUrl,
  imageDownloadUrl,
  phone,
}: ThankYouActionsProps) {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  // Check if Web Share API is supported
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  // Auto-download ticket once on mount (with iOS Safari safety check)
  useEffect(() => {
    if (!regId || typeof window === "undefined") return;

    const storageKey = `aoga_ticket_downloaded_${regId}`;
    if (localStorage.getItem(storageKey)) return;

    // Detect in-app browsers (Instagram, WhatsApp, Facebook webviews) where auto-triggering download can crash or fail
    const ua = navigator.userAgent || "";
    const isInApp = /FBAN|FBAV|Instagram|WhatsApp/i.test(ua);
    const isIos = /iPhone|iPad|iPod/i.test(ua);

    if (!isInApp && !isIos) {
      const timer = setTimeout(() => {
        try {
          const a = document.createElement("a");
          a.href = ticketDownloadUrl;
          a.download = `AOGA2026-Ticket-${regId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          localStorage.setItem(storageKey, "1");
        } catch (e) {
          console.warn("Auto-download skipped:", e);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [regId, ticketDownloadUrl]);

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: "India's Biggest Sports Festival 2026 - Entry Pass",
        text: `I'm registered for India's Biggest Sports Festival 2026! Registration ID: ${regId}`,
        url: ticketDownloadUrl,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    setResendError(null);
    try {
      const res = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend confirmation.");
      }
      setResendStatus("Confirmation sent to your email & WhatsApp!");
    } catch (err: unknown) {
      setResendError(err instanceof Error ? err.message : "Error resending confirmation");
    } finally {
      setResending(false);
    }
  };

  const waOfficialUrl = `https://wa.me/918018958655?text=${encodeURIComponent(
    `Hi, my Client ID is ${regId}, please share my ticket for India's Biggest Sports Festival 2026.`
  )}`;

  return (
    <div className="space-y-3">
      {/* Primary Download Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href={ticketDownloadUrl}
          download={`AOGA2026-Ticket-${regId}.pdf`}
          className="btn btn-gold !min-h-12 rounded-xl text-black font-extrabold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Download Ticket (PDF)</span>
        </a>

        <a
          href={receiptDownloadUrl}
          download={`AOGA2026-Receipt-${regId}.pdf`}
          className="btn btn-line !min-h-12 rounded-xl border-white/20 bg-white/[0.04] text-white font-semibold text-sm hover:border-gold hover:text-gold flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 shrink-0 text-gold" />
          <span>Download Receipt (PDF)</span>
        </a>
      </div>

      {/* Secondary Actions: Save Image & Share */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href={imageDownloadUrl}
          download={`AOGA2026-Ticket-${regId}.png`}
          className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition flex items-center justify-center gap-1.5"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Save Ticket Image (PNG)</span>
        </a>

        {canShare && (
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Share Ticket / Pass</span>
          </button>
        )}
      </div>

      {/* WhatsApp Organiser Chat Link */}
      <a
        href={waOfficialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        <span>Get ticket directly on WhatsApp (Organiser Desk)</span>
      </a>

      {/* Resend Action */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          <span>{resending ? "Re-sending..." : "Didn't receive email or WhatsApp? Click to Resend"}</span>
        </button>

        {resendStatus && (
          <div className="mt-2 text-xs text-emerald-400 flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>{resendStatus}</span>
          </div>
        )}

        {resendError && (
          <div className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{resendError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

