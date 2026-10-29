"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wordmark } from "@/components/icons";
import { EVENT } from "@/data/festival";
import { inr } from "@/lib/format";
import { getRegistrationFromFirestore, type RegistrationRecord } from "@/lib/firebase";

export default function PaymentFailedPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="t-ink min-h-[100svh] grid place-items-center text-white">
          <p>Loading...</p>
        </main>
      }
    >
      <PaymentFailedPage />
    </Suspense>
  );
}

function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const regId = (searchParams.get("id") || "").trim().toUpperCase();
  const errorParam = searchParams.get("error") || "";

  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  useEffect(() => {
    if (!regId) {
      setLoadingRecord(false);
      return;
    }
    getRegistrationFromFirestore(regId)
      .then((rec) => {
        if (rec) setRecord(rec);
      })
      .catch((e) => console.error("Could not fetch registration:", e))
      .finally(() => setLoadingRecord(false));
  }, [regId]);

  async function handleTryAgain() {
    if (!regId) return;
    setRetrying(true);
    setRetryError("");

    try {
      const res = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId }),
      });

      const data = await res.json();
      if (!res.ok || !data.fields || !data.payuUrl) {
        throw new Error(data.error || "Could not re-initiate payment. Please try again.");
      }

      // Build hidden form and submit to PayU
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payuUrl;
      Object.entries(data.fields as Record<string, string>).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to connect to payment gateway.";
      setRetryError(msg);
      setRetrying(false);
    }
  }

  return (
    <main className="t-ink min-h-[100svh] px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label="Home">
            <Wordmark />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center">
          {/* Failure Icon */}
          <div className="mx-auto size-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl shadow-inner mb-4">
            ⚠️
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 mb-2">
            Payment Incomplete
          </span>

          <h1 className="display text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Payment Cancelled or Failed
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {errorParam || "Your payment could not be processed or was cancelled. No money was deducted from your account."}
          </p>

          {/* Details if available */}
          {record && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50 uppercase font-bold">Registration ID</span>
                <span className="font-mono font-bold text-gold">{regId}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50 uppercase font-bold">Category</span>
                <span className="font-semibold text-white/90 truncate max-w-[180px]">{record.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 uppercase font-bold">Payable Amount</span>
                <span className="font-bold text-white">
                  {record.isTest || record.fee === 1 ? "₹1 (Test)" : inr(record.fee)}
                </span>
              </div>
            </div>
          )}

          {retryError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-left">
              {retryError}
            </div>
          )}

          {/* Primary Action: Try Again */}
          <div className="mt-6 space-y-3">
            {regId ? (
              <button
                type="button"
                onClick={handleTryAgain}
                disabled={retrying}
                className="btn btn-gold w-full !min-h-13 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{retrying ? "Connecting to PayU..." : "Try Again Securely"}</span>
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <Link
                href="/register"
                className="btn btn-gold w-full !min-h-13 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg flex items-center justify-center gap-2"
              >
                <span>Register Again</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-line w-full !min-h-12 rounded-xl border-white/20 text-white font-semibold text-sm hover:border-gold hover:text-gold flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>

          {/* Hidden Fallback for Closed Tabs / Stuck Payments */}
          <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white/50 space-y-2">
            <p>
              Money was deducted from your account?{" "}
              <Link
                href={regId ? `/verify?id=${encodeURIComponent(regId)}` : "/verify"}
                className="text-gold underline underline-offset-2 hover:text-yellow"
              >
                Payment done but no confirmation? Verify your payment
              </Link>
            </p>
            <p>
              Or WhatsApp our helpdesk:{" "}
              <a
                href={EVENT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white underline underline-offset-2"
              >
                {EVENT.paymentsWhatsApp.display}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

