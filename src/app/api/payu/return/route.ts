import { NextResponse } from "next/server";
import { verifyPayuResponse, verifyPaymentWithPayuApi } from "@/lib/payu";
import { issueTicket } from "@/lib/ticket";
import {
  getRegistrationFromFirestore,
  updateRegistrationInFirestore,
} from "@/lib/firebase";

/**
 * PayU redirects athletes by POSTing an application/x-www-form-urlencoded form to surl/furl.
 * This API endpoint receives the POST from the browser, validates reverse hash + PayU verify_payment API,
 * ensures idempotency, and redirects the athlete to /thank-you?id=... or /payment-failed?id=...
 */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  try {
    const text = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text));

    const status = String(params.status ?? "").toLowerCase();
    const txnid = String(params.txnid ?? "").toUpperCase().trim();
    const mihpayid = String(params.mihpayid ?? "");
    const amountStr = params.amount ?? "0";
    const firstname = params.firstname ?? "";
    const phone = params.phone ?? "";
    const productinfo = params.productinfo ?? "";
    const errorMessage = params.error_Message || params.field9 || "";

    // 1. Verify PayU reverse hash
    const isHashValid = verifyPayuResponse(params);
    if (!isHashValid) {
      console.error("[PayU Return] Reverse hash mismatch for txnid:", txnid);
      return NextResponse.redirect(
        new URL(`/payment-failed?id=${encodeURIComponent(txnid)}&error=Security+hash+verification+failed`, origin),
        303,
      );
    }

    // 2. Handle failure or cancellation
    if (status !== "success") {
      console.warn(`[PayU Return] Payment ${status} for txnid: ${txnid}`);
      const existing = await getRegistrationFromFirestore(txnid);
      if (existing && existing.status !== "Paid" && existing.status !== "Verified") {
        await updateRegistrationInFirestore(txnid, { status: "Failed" });
      }
      const failMsg = errorMessage || "Payment was cancelled or unsuccessful. No money was deducted.";
      return NextResponse.redirect(
        new URL(`/payment-failed?id=${encodeURIComponent(txnid)}&error=${encodeURIComponent(failMsg)}`, origin),
        303,
      );
    }

    // 3. Confirm with PayU's verify_payment API
    let apiVerified = false;
    let verifiedAmount: number | undefined;
    try {
      const apiResult = await verifyPaymentWithPayuApi(txnid);
      if (apiResult.ok && apiResult.verified) {
        apiVerified = true;
        verifiedAmount = apiResult.amount;
      } else if (!apiResult.ok) {
        // Fallback: if PayU postservice is unreachable or timeout, trust verified reverse hash
        console.warn(`[PayU Return] verify_payment API non-fatal fallback for ${txnid}:`, apiResult.error);
        apiVerified = true;
      }
    } catch (e) {
      console.warn(`[PayU Return] verify_payment API exception for ${txnid}:`, e);
      apiVerified = true; // Trust verified reverse hash
    }

    if (!apiVerified) {
      console.error("[PayU Return] verify_payment API reported transaction unverified:", txnid);
      return NextResponse.redirect(
        new URL(`/payment-failed?id=${encodeURIComponent(txnid)}&error=Payment+verification+could+not+be+confirmed`, origin),
        303,
      );
    }

    // 4. Idempotency check with Firestore
    const existing = await getRegistrationFromFirestore(txnid);
    const fee = verifiedAmount ?? Math.round(parseFloat(amountStr));
    const isTest = Boolean(existing?.isTest || productinfo.includes("TEST ENTRY") || fee === 1);
    const utr = mihpayid.replace(/\D/g, "").padStart(12, "0").slice(0, 12);

    if (existing && (existing.status === "Paid" || existing.status === "Verified")) {
      console.log(`[PayU Return] Registration ${txnid} already confirmed (idempotent).`);
      return NextResponse.redirect(new URL(`/thank-you?id=${encodeURIComponent(txnid)}`, origin), 303);
    }

    // 5. Issue ticket, notify sheet, email & WhatsApp
    try {
      const result = await issueTicket(
        {
          name: existing?.name || firstname,
          phone: String(existing?.phone || phone).replace(/\D/g, "").slice(-10),
          email: existing?.email,
          category: existing?.category || productinfo,
          amount: fee,
          utr,
          regId: txnid,
          paymentMode: params.mode || "PayU Hosted Checkout",
          isTest,
        },
        origin,
      );

      if ("url" in result && result.url) {
        await updateRegistrationInFirestore(txnid, {
          status: "Paid",
          utr,
          ticketNo: result.ticketNo,
          ticketUrl: result.url,
          ...(isTest ? { isTest: true } : {}),
        });
      }
    } catch (e) {
      console.error("[PayU Return] Error issuing ticket on return:", e);
    }

    return NextResponse.redirect(new URL(`/thank-you?id=${encodeURIComponent(txnid)}`, origin), 303);
  } catch (err) {
    console.error("[PayU Return Exception]:", err);
    return NextResponse.redirect(new URL("/payment-failed?error=An+unexpected+error+occurred", origin), 303);
  }
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/", origin), 302);
}
