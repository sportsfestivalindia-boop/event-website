// Server-side registration + payment helpers. The fee is always computed here, never trusted from the client.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { CHAMPIONSHIPS, EVENT } from "../data/festival";

export type Entry = { sport: string; division: string; cls: string; name: string; phone: string; email: string; city: string; gym?: string };

/** Validates the entry against the facts file; returns the category label + fee in rupees, or an error. */
export function checkEntry(e: Partial<Entry>): { ok: true; fee: number; label: string } | { ok: false; error: string } {
  const champ = CHAMPIONSHIPS.find((c) => c.id === e.sport);
  const div = champ?.divisions.find((d) => d.id === e.division);
  if (!champ || !div || !e.cls || !div.classes.includes(e.cls)) return { ok: false, error: "Please choose a valid category." };
  if (!e.name || e.name.trim().length < 2 || e.name.length > 80) return { ok: false, error: "Please enter your full name." };
  if (!/^[6-9]\d{9}$/.test(e.phone ?? "")) return { ok: false, error: "Please enter a valid 10-digit mobile number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email ?? "")) return { ok: false, error: "Please enter a valid email address." };
  if (!e.city || e.city.trim().length < 2) return { ok: false, error: "Please enter your city." };
  const label = `${champ.sport} · ${div.name}${div.classes.length > 1 ? ` · ${e.cls}` : ""}`;
  return { ok: true, fee: div.fee ?? EVENT.fee, label };
}

export const regId = () => "SF26-" + randomBytes(4).toString("hex").toUpperCase().slice(0, 6);

/** Razorpay is live only when both keys are set; otherwise the site runs in demo mode. */
export const razorpayKeys = () => {
  const id = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  return id && secret ? { id, secret } : null;
};

/** Razorpay checkout signature = HMAC-SHA256(order_id|payment_id, key_secret), hex. */
export function validSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(String(signature));
  return a.length === b.length && timingSafeEqual(a, b);
}
