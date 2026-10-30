"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/icons";
import { auth, getRegistrationsByEmail, claimRegistration, type RegistrationRecord } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { inr } from "@/lib/format";
import { EVENT } from "@/data/festival";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Claim registration form state
  const [claimRegId, setClaimRegId] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Re-pay state
  const [payingRegId, setPayingRegId] = useState<string | null>(null);

  // Profile download & resend state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendNotifs, setResendNotifs] = useState<{ [regId: string]: { ok: boolean; msg: string } }>({});

  async function handleProfileDownload(regId: string, type: "ticket" | "receipt") {
    if (!user?.email) return;
    setDownloadingId(`${regId}:${type}`);
    try {
      const res = await fetch("/api/profile/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId, email: user.email, type }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || "Failed to generate download link.");
        return;
      }
      const a = document.createElement("a");
      a.href = data.url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert("Failed to download file. Please check connection.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleProfileResend(regId: string) {
    setResendingId(regId);
    setResendNotifs((prev) => ({ ...prev, [regId]: { ok: true, msg: "Sending..." } }));
    try {
      const res = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendNotifs((prev) => ({ ...prev, [regId]: { ok: false, msg: data.error || "Failed to resend" } }));
      } else {
        setResendNotifs((prev) => ({ ...prev, [regId]: { ok: true, msg: "Sent to your email & WhatsApp!" } }));
        if (user?.email) await loadRegistrations(user.email);
      }
    } catch (e) {
      setResendNotifs((prev) => ({ ...prev, [regId]: { ok: false, msg: "Network error" } }));
    } finally {
      setResendingId(null);
    }
  }

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser?.email) {
        loadRegistrations(currentUser.email);
      }
    });
    return () => unsub();
  }, []);

  async function loadRegistrations(email: string) {
    setLoadingRegs(true);
    try {
      const list = await getRegistrationsByEmail(email);
      setRegistrations(list);
    } catch (e) {
      console.error("Error loading registrations:", e);
    } finally {
      setLoadingRegs(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Google sign in failed";
      console.error("Login error:", msg);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setRegistrations([]);
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    setClaiming(true);
    setClaimMessage(null);

    const res = await claimRegistration(claimRegId, claimPhone, user.email);
    setClaiming(false);

    if (res.success) {
      setClaimMessage({
        type: "success",
        text: `Registration ${claimRegId.trim().toUpperCase()} successfully claimed and linked to your account!`,
      });
      setClaimRegId("");
      setClaimPhone("");
      await loadRegistrations(user.email);
    } else {
      setClaimMessage({
        type: "error",
        text: res.error || "Could not claim this registration. Check your ID and mobile.",
      });
    }
  }

  async function handlePayPending(regId: string) {
    setPayingRegId(regId);
    try {
      const res = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId }),
      });
      const data = await res.json();
      if (!res.ok || !data.fields || !data.payuUrl) {
        throw new Error(data.error || "Could not initiate payment.");
      }

      // Auto POST to PayU
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment initiation failed";
      alert(msg);
      setPayingRegId(null);
    }
  }

  return (
    <main className="t-ink min-h-[100svh] px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" aria-label="Home">
            <Wordmark />
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-white/60 hover:text-white font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Auth Loading */}
        {authLoading ? (
          <div className="text-center py-20 text-white/50">Loading profile...</div>
        ) : !user ? (
          /* Sign In Screen */
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 shadow-2xl text-center">
            <div className="mx-auto size-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-3xl mb-4">
              👤
            </div>
            <h1 className="display text-3xl font-extrabold text-white">Athlete Profile</h1>
            <p className="mt-2 text-sm text-white/70 max-w-md mx-auto">
              Sign in with your Google account to view your festival registrations, download tickets,
              and check live match schedules.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn btn-gold w-full sm:w-auto px-8 !min-h-13 rounded-xl text-black font-extrabold text-base tracking-wide shadow-lg inline-flex items-center justify-center gap-3"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="space-y-6">
            {/* User Bar */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="size-12 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="size-12 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {user.displayName || "Athlete"}
                  </h2>
                  <p className="text-xs text-white/60">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-white/50 hover:text-white border border-white/15 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>

            {/* Registrations List */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="display text-xl sm:text-2xl font-bold text-white">
                  My Registrations & Passes
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                  {registrations.length} {registrations.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              {loadingRegs ? (
                <p className="text-center py-8 text-white/40 text-sm">Loading your events...</p>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl p-6">
                  <p className="text-white/60 text-sm mb-4">
                    No registrations found under <strong className="text-white">{user.email}</strong>.
                  </p>
                  <Link href="/register" className="btn btn-gold text-black text-xs font-bold px-4 py-2 rounded-lg">
                    Register for an Event
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((reg) => {
                    const isPaid = reg.status === "Paid" || reg.status === "Verified";
                    return (
                      <div
                        key={reg.regId}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gold">{reg.regId}</span>
                            <span
                              className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${
                                isPaid
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {isPaid ? "Confirmed" : "Payment Pending"}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white">{reg.category}</h4>
                          <p className="text-xs text-white/60">
                            Fee: {reg.isTest || reg.fee === 1 ? "₹1 (Test)" : inr(reg.fee)}
                            {reg.utr ? ` · Ref: ${reg.utr}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2">
                          {isPaid ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleProfileDownload(reg.regId, "ticket")}
                                disabled={downloadingId === `${reg.regId}:ticket`}
                                className="btn btn-gold !min-h-9 text-xs font-extrabold text-black px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {downloadingId === `${reg.regId}:ticket` ? "Generating..." : "🎟️ Ticket (PDF)"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleProfileDownload(reg.regId, "receipt")}
                                disabled={downloadingId === `${reg.regId}:receipt`}
                                className="btn btn-line !min-h-9 text-xs font-semibold text-white/90 border-white/20 hover:border-gold hover:text-gold px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {downloadingId === `${reg.regId}:receipt` ? "Generating..." : "📄 Receipt (PDF)"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleProfileResend(reg.regId)}
                                disabled={resendingId === reg.regId}
                                className="text-[11px] text-white/50 hover:text-gold underline underline-offset-2 px-1 cursor-pointer disabled:opacity-50"
                              >
                                {resendingId === reg.regId ? "Sending..." : "Resend Pass"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePayPending(reg.regId)}
                              disabled={payingRegId === reg.regId}
                              className="btn btn-gold !min-h-10 text-xs font-extrabold text-black px-4 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                              {payingRegId === reg.regId ? "Opening PayU..." : "Pay Now →"}
                            </button>
                          )}

                          {resendNotifs[reg.regId] && (
                            <span
                              className={`text-[11px] font-medium ${
                                resendNotifs[reg.regId].ok ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {resendNotifs[reg.regId].msg}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Claim my registration box */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-8 shadow-xl">
              <h3 className="display text-lg sm:text-xl font-bold text-white mb-1">
                Claim My Registration
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mb-5">
                Registered using a different email address? Enter your Registration ID and 10-digit mobile
                to link it to your Google account.
              </p>

              {claimMessage && (
                <div
                  className={`mb-4 p-3.5 rounded-xl text-xs border ${
                    claimMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  {claimMessage.text}
                </div>
              )}

              <form onSubmit={handleClaim} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Registration ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SF26-A1B2C3"
                      value={claimRegId}
                      onChange={(e) => setClaimRegId(e.target.value)}
                      required
                      className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/15 px-3.5 text-sm text-white uppercase placeholder-white/30 focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Registered Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      maxLength={10}
                      value={claimPhone}
                      onChange={(e) => setClaimPhone(e.target.value)}
                      required
                      className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/15 px-3.5 text-sm text-white placeholder-white/30 focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={claiming || !claimRegId.trim() || !claimPhone.trim()}
                  className="btn btn-line !min-h-11 rounded-xl border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:border-gold hover:text-gold disabled:opacity-40"
                >
                  {claiming ? "Verifying..." : "Link to My Account"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

