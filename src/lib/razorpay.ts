// Razorpay (server only). Live when both env vars are set in Vercel; otherwise the site falls back to UPI QR / enquiry.
import { createHmac, timingSafeEqual } from "node:crypto";

export const razorpayKeys = () => {
  const id = process.env.RAZORPAY_KEY_ID,
    secret = process.env.RAZORPAY_KEY_SECRET;
  return id && secret ? { id, secret } : null;
};

/** Creates an order for `rupees`. Amount always comes from our own price list, never from the browser. */
export async function createOrder(rupees: number, receipt: string, notes: Record<string, string>) {
  const keys = razorpayKeys();
  if (!keys) return null;
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keys.id}:${keys.secret}`).toString("base64") },
    // Razorpay caps note values at 256 chars
    body: JSON.stringify({ amount: rupees * 100, currency: "INR", receipt, notes: Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, String(v).slice(0, 250)])) }),
  });
  if (!res.ok) throw new Error("Payment gateway is busy. Please try again in a minute.");
  const order = (await res.json()) as { id: string; amount: number };
  return { orderId: order.id, amount: order.amount, key: keys.id };
}

/** Checkout signature = HMAC-SHA256(order_id|payment_id, key_secret), hex. */
export function validSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected),
    b = Buffer.from(String(signature));
  return a.length === b.length && timingSafeEqual(a, b);
}
