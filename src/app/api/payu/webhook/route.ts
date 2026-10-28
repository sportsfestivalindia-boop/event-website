// POST /api/payu/webhook
// PayU calls this URL after every payment (success AND failure).
// We verify the hash, then issue the ticket if status=success.
// This route is also called by PayU server-to-server — never trust it without hash verification.

import { verifyPayuResponse } from "@/lib/payu";
import { issueTicket } from "@/lib/ticket";
import { updateRegistrationInFirestore } from "@/lib/firebase";

export async function POST(req: Request) {
  // PayU sends application/x-www-form-urlencoded
  let params: Record<string, string> = {};
  try {
    const text = await req.text();
    params = Object.fromEntries(new URLSearchParams(text));
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  // ── 1. Verify hash — reject anything tampered ────────────────────────────
  if (!verifyPayuResponse(params)) {
    console.error("PayU webhook: hash mismatch", params.txnid);
    return Response.json({ error: "Hash mismatch" }, { status: 400 });
  }

  const { status, txnid, firstname, email, phone, amount, productinfo, mihpayid } = params;

  // ── 2. Only process successful payments ──────────────────────────────────
  if (status !== "success") {
    console.log(`PayU webhook: ${status} for ${txnid}`);
    return Response.json({ ok: true, status });
  }

  // txnid is our registration ID (SF26-XXXXXX)
  if (!/^SF26-[0-9A-F]{6}$/.test(txnid ?? "")) {
    console.error("PayU webhook: unexpected txnid", txnid);
    return Response.json({ error: "Unknown txnid" }, { status: 400 });
  }

  // mihpayid is PayU's own transaction reference — use as UTR for our records
  // (12 digits padded if shorter, so our validUtr check passes)
  const utr = String(mihpayid ?? "").replace(/\D/g, "").padStart(12, "0").slice(0, 12);
  const fee  = Math.round(parseFloat(amount ?? "0"));

  // ── 3. Issue the ticket ──────────────────────────────────────────────────
  const origin = new URL(req.url).origin;
  const result = await issueTicket(
    {
      name:     firstname ?? "",
      phone:    String(phone ?? "").replace(/\D/g, "").slice(-10),
      category: productinfo ?? "",
      amount:   fee,
      utr,
      regId:    txnid,
    },
    origin,
  );

  if ("duplicate" in result) {
    console.warn("PayU webhook: duplicate UTR for", txnid);
    return Response.json({ ok: true, duplicate: true });
  }

  // Update in Firestore
  await updateRegistrationInFirestore(txnid, {
    status: "Paid",
    utr,
    ticketNo: result.ticketNo,
    ticketUrl: result.url,
  });

  console.log(`PayU webhook: ticket issued ${result.ticketNo} for ${txnid}`);
  return Response.json({ ok: true, ticketNo: result.ticketNo, ticketUrl: result.url });
}

// PayU also calls as GET for health-check — return 200
export async function GET() {
  return Response.json({ ok: true });
}
