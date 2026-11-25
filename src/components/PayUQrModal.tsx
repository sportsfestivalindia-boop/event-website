"use client";

import React, { useState } from "react";
import Image from "next/image";
import { QrCode, X, CheckCircle2, ShieldCheck, Download, Smartphone } from "lucide-react";
import { EVENT } from "@/data/festival";
import { WhatsAppGlyph } from "@/components/icons";

interface PayUQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  amount?: number | string;
  referenceId?: string;
}

export function PayUQrModal({
  isOpen,
  onClose,
  title = "Official PayU Bharat QR",
  subtitle = "India Sports Festival 2026 · AOGA",
  amount,
  referenceId,
}: PayUQrModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 p-6 sm:p-7 shadow-[0_20px_60px_rgba(255,222,0,0.2)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gold mb-2 border border-gold/30">
            <ShieldCheck className="size-3.5" />
            <span>PayU Verified Merchant QR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>
        </div>

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center">
          <div className="relative p-4 rounded-2xl bg-white shadow-2xl border-4 border-gold/80">
            <Image
              src="/img/payu-qr.png"
              alt="Official PayU QR Code"
              width={220}
              height={220}
              className="size-48 sm:size-52 object-contain"
              priority
            />
          </div>

          {/* Amount / Ref Badge if provided */}
          {(amount || referenceId) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {amount && (
                <span className="rounded-lg bg-gold/20 border border-gold/40 px-3 py-1 text-xs font-black text-gold">
                  Payable: {typeof amount === "number" ? `₹${amount.toLocaleString("en-IN")}` : amount}
                </span>
              )}
              {referenceId && (
                <span className="rounded-lg bg-white/10 border border-white/20 px-3 py-1 text-xs font-mono font-bold text-white/90">
                  Ref: {referenceId}
                </span>
              )}
            </div>
          )}

          {/* MID & Merchant Info */}
          <div className="mt-3 text-center">
            <p className="text-xs font-mono font-semibold text-white/70">
              PayU MID: <span className="text-gold font-bold">13824564</span>
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              Verified Beneficiary: <span className="text-white font-medium">India Sport Festival / AOGA</span>
            </p>
          </div>
        </div>

        {/* Supported UPI Apps */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center justify-center gap-1.5">
            <Smartphone className="size-3.5 text-gold" />
            <span>Scan with any UPI app</span>
          </p>
          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-white/80">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Google Pay</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">PhonePe</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Paytm</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">BHIM / CRED</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
          <a
            href="/img/payu-qr.png"
            download="PayU-India-Sports-Festival-QR.png"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-gold transition-colors font-semibold"
          >
            <Download className="size-3.5" />
            <span>Save QR</span>
          </a>

          <a
            href={`https://api.whatsapp.com/send/?phone=919437023145&text=${encodeURIComponent(
              `Hi AOGA Team, I have scanned and paid via PayU QR Code. Ref: ${referenceId || "Direct Pay"}. Please verify.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-wa hover:underline font-bold"
          >
            <WhatsAppGlyph className="size-3.5" />
            <span>Send Payment Proof</span>
          </a>
        </div>
      </div>
    </div>
  );
}
