import { razorpayKeys, validSignature } from "@/lib/razorpay";

/** Confirms a Razorpay payment (signature check) before a pass / booking is issued. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { ref?: string; orderId?: string; paymentId?: string; signature?: string };
  if (!/^SF26-(ST-)?[0-9A-F]{6}$/.test(b.ref ?? "")) return Response.json({ error: "Reference not found. Please start again." }, { status: 400 });

  const keys = razorpayKeys();
  if (!keys || !b.orderId || !b.paymentId || !b.signature || !validSignature(b.orderId, b.paymentId, b.signature, keys.secret))
    return Response.json({ error: "We couldn’t verify this payment. If money was deducted, WhatsApp us your payment ID." }, { status: 400 });
  // ponytail: no database yet — the paid order (with all details in its notes) lives in the Razorpay dashboard.
  return Response.json({ ref: b.ref, status: "confirmed", paymentId: b.paymentId });
}
