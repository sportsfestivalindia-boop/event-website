import { validUtr } from "@/lib/pay";
import { razorpayKeys, validSignature } from "@/lib/razorpay";

/**
 * Confirms a payment before a pass / booking is issued.
 * - Razorpay: signature check → confirmed.
 * - UPI QR fallback: 12-digit UTR recorded → "verifying" until AOGA reconciles with the bank statement.
 */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { ref?: string; utr?: string; orderId?: string; paymentId?: string; signature?: string };
  if (!/^SF26-(ST-)?[0-9A-F]{6}$/.test(b.ref ?? "")) return Response.json({ error: "Reference not found. Please start again." }, { status: 400 });

  if (b.orderId) {
    const keys = razorpayKeys();
    if (!keys || !b.paymentId || !b.signature || !validSignature(b.orderId, b.paymentId, b.signature, keys.secret))
      return Response.json({ error: "We couldn’t verify this payment. If money was deducted, WhatsApp us your payment ID." }, { status: 400 });
    // ponytail: no database yet — the paid order (with all details in its notes) lives in the Razorpay dashboard.
    return Response.json({ ref: b.ref, status: "confirmed", paymentId: b.paymentId });
  }

  if (!validUtr(b.utr)) return Response.json({ error: "Enter the 12-digit UTR / UPI reference number from your payment app." }, { status: 400 });
  // ponytail: no database yet — UTRs aren't stored. Add Supabase (registrations + UTR + status) before real launch.
  return Response.json({ ref: b.ref, status: "verifying" });
}
