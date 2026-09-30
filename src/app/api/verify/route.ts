import { razorpayKeys, regId, validSignature } from "@/lib/pay";

/** After checkout: confirm the payment really happened before issuing a registration ID. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { demo?: boolean; orderId?: string; paymentId?: string; signature?: string };
  const keys = razorpayKeys();

  if (!keys) {
    // demo mode only exists while no gateway keys are configured
    if (body.demo) return Response.json({ regId: regId(), demo: true });
    return Response.json({ error: "Payments are not configured." }, { status: 400 });
  }
  if (!body.orderId || !body.paymentId || !body.signature || !validSignature(body.orderId, body.paymentId, body.signature, keys.secret)) {
    return Response.json({ error: "We couldn’t verify this payment. If money was deducted, WhatsApp us your UTR number." }, { status: 400 });
  }
  // ponytail: no database yet — registrations live in the Razorpay dashboard (order notes). Add Supabase before real launch.
  return Response.json({ regId: regId(), paymentId: body.paymentId });
}
