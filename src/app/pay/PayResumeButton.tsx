"use client";

import React, { useState } from "react";
import { inr } from "@/lib/format";

export function PayResumeButton({
  regId,
  amount,
  label,
  isTest,
}: {
  regId: string;
  amount: number;
  label: string;
  isTest?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId }),
      });
      const data = await res.json();
      if (!res.ok || !data.fields || !data.payuUrl) {
        throw new Error(data.error || "Could not connect to PayU checkout.");
      }
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
      setError(e instanceof Error ? e.message : "Failed to open payment gateway.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handlePay}
        disabled={busy}
        className="btn btn-gold w-full !min-h-13 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span>
          {busy
            ? "Redirecting to PayU..."
            : isTest || amount === 1
            ? "Pay ₹1 (Test) via PayU"
            : `Pay ${inr(amount)} via PayU`}
        </span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

