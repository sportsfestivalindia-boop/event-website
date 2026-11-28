// POST /api/payu/webhook
// PayU calls this URL server-to-server after every payment (success and failure).
// We verify reverse hash AND confirm via PayU verify_payment API, then issue the ticket if status=success.
// Fully idempotent: if return URL or webhook already marked this registration Paid, no duplicates.

import { verifyPayuResponse, verifyPaymentWithPayuApi, PAYU_KEY } from "@/lib/payu";
import { issueTicket } from "@/lib/ticket";
import { toSheet } from "@/lib/sheet";
import {
  getRegistrationFromFirestore,
  updateRegistrationInFirestore,
  saveScannerPaymentToFirestore,
} from "@/lib/firebase";

export async function POST(req: Request) {
  let params: Record<string, string> = {};
  try {
    const text = await req.text();
    params = Object.fromEntries(new URLSearchParams(text));
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  // 1. Verify reverse hash — reject anything tampered
  if (!verifyPayuResponse(params)) {
    console.error("[PayU Webhook] Hash mismatch for txnid:", params.txnid);
    return Response.json({ error: "Hash mismatch" }, { status: 400 });
  }

  const { status, txnid, firstname, phone, amount, productinfo, mihpayid } = params;
  const cleanTxnid = String(txnid ?? "").toUpperCase().trim();

  // 2. Only process successful payments
  if (status !== "success") {
    console.log(`[PayU Webhook] Status ${status} for ${cleanTxnid}`);
    const existing = await getRegistrationFromFirestore(cleanTxnid);
    if (existing && existing.status !== "Paid" && existing.status !== "Verified") {
      await updateRegistrationInFirestore(cleanTxnid, { status: "Failed" });
    }
    return Response.json({ ok: true, status });
  }

  const isWebsiteOrder = /^SF26-[0-9A-F]{6}$/.test(cleanTxnid);

  // -------------------------------------------------------------
  // Direct PayU Scanner (SBQR / Bharat QR / VPA) Payment Handler
  // -------------------------------------------------------------
  if (!isWebsiteOrder) {
    const rawUtr = String(
      params.bank_ref_num ||
      params.bank_ref_no ||
      params.field9 ||
      params.mihpayid ||
      ""
    ).replace(/\D/g, "");
    const utr = rawUtr.length >= 12 ? rawUtr.slice(-12) : rawUtr.padStart(12, "0");
    const parsedAmount = Math.round(parseFloat(amount ?? "0"));
    const payerName = String(firstname || params.name_on_card || "PayU Scanner Payer").trim();
    const payerPhone = String(phone || "").replace(/\D/g, "").slice(-10);

    console.log(`[PayU Webhook] SBQR Scanner payment received: ₹${parsedAmount}, UTR: ${utr}, Txn: ${cleanTxnid}`);

    // 1. Immediately log into Google Sheet "Bank" tab
    const sheetRes = await toSheet("bank", {
      amount: parsedAmount,
      utr,
      payer: `${payerName}${payerPhone ? ` (${payerPhone})` : ""}`,
      source: "PayU QR Scanner",
      raw: `PayU SBQR Txn: ${cleanTxnid}, Mode: ${params.mode || "UPI"}, BankRef: ${params.bank_ref_num || ""}, Date: ${params.addedon || ""}`,
    });

    // 2. Also save into Firestore payu_scanner_payments collection for live tracking
    await saveScannerPaymentToFirestore({
      amount: parsedAmount,
      utr,
      txnid: cleanTxnid,
      payerName,
      payerPhone,
      mode: params.mode || "UPI",
      status: "success",
      sheetSync: Boolean(sheetRes?.ok),
      rawParams: params,
    });

    return Response.json({
      ok: true,
      type: "scanner_payment",
      utr,
      amount: parsedAmount,
      sheet: sheetRes,
    });
  }

  // 3. Confirm status and amount via verify_payment API
  let apiVerified = false;
  let verifiedAmount: number | undefined;
  try {
    const apiResult = await verifyPaymentWithPayuApi(cleanTxnid);
    if (apiResult.ok && apiResult.verified) {
      apiVerified = true;
      verifiedAmount = apiResult.amount;
    } else if (!apiResult.ok) {
      console.warn(`[PayU Webhook] verify_payment API non-fatal fallback for ${cleanTxnid}:`, apiResult.error);
      apiVerified = true; // Trust verified reverse hash
    }
  } catch (e) {
    console.warn(`[PayU Webhook] verify_payment API exception for ${cleanTxnid}:`, e);
    apiVerified = true;
  }

  if (!apiVerified) {
    console.error("[PayU Webhook] verify_payment API reported unverified:", cleanTxnid);
    return Response.json({ error: "Payment verification unconfirmed" }, { status: 400 });
  }

  // 4. Idempotency check with Firestore
  const existing = await getRegistrationFromFirestore(cleanTxnid);
  if (existing && (existing.status === "Paid" || existing.status === "Verified")) {
    console.log(`[PayU Webhook] Registration ${cleanTxnid} already processed (idempotent).`);
    return Response.json({ ok: true, duplicate: true, ticketUrl: existing.ticketUrl });
  }

  const utr = String(mihpayid ?? "").replace(/\D/g, "").padStart(12, "0").slice(0, 12);
  const fee = verifiedAmount ?? Math.round(parseFloat(amount ?? "0"));
  const isTest = Boolean(existing?.isTest || (productinfo && productinfo.includes("TEST ENTRY")) || fee === 1);

  // 5. Issue ticket, notify sheet, email & WhatsApp
  const origin = new URL(req.url).origin;
  const result = await issueTicket(
    {
      name:     existing?.name || firstname || "Athlete",
      phone:    String(existing?.phone || phone || "").replace(/\D/g, "").slice(-10),
      email:    existing?.email,
      category: existing?.category || productinfo || "Sports Festival 2026",
      amount:   fee,
      utr,
      regId:    cleanTxnid,
      paymentMode: params.mode || "PayU Hosted Checkout",
      isTest,
    },
    origin,
  );

  if ("duplicate" in result) {
    console.warn("[PayU Webhook] Duplicate ticket result for:", cleanTxnid);
    return Response.json({ ok: true, duplicate: true });
  }

  // Update in Firestore
  await updateRegistrationInFirestore(cleanTxnid, {
    status: "Paid",
    utr,
    ticketNo: result.ticketNo,
    ticketUrl: result.url,
    ...(isTest ? { isTest: true } : {}),
  });

  console.log(`[PayU Webhook] Confirmed ticket ${result.ticketNo} for ${cleanTxnid}`);
  return Response.json({ ok: true, ticketNo: result.ticketNo, ticketUrl: result.url });
}

// PayU also calls as GET for health-check — return 200
export async function GET() {
  return Response.json({ ok: true });
}
