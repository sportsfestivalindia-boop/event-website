import { NextResponse } from "next/server";
import { verifyPayuResponse } from "@/lib/payu";
import { issueTicket } from "@/lib/ticket";
import { updateRegistrationInFirestore } from "@/lib/firebase";

/**
 * PayU redirects athletes by POSTing an application/x-www-form-urlencoded form to surl/furl.
 * This API endpoint receives the POST from the browser, validates the payment, updates the ticket,
 * and issues an HTTP 303 redirect to the user-facing /payu/return page.
 */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  try {
    const text = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text));

    const status = String(params.status ?? "").toLowerCase();
    const txnid = String(params.txnid ?? "").toUpperCase();
    const mihpayid = String(params.mihpayid ?? "");
    const amount = params.amount ?? "0";
    const firstname = params.firstname ?? "";
    const phone = params.phone ?? "";
    const productinfo = params.productinfo ?? "";
    const errorMessage = params.error_Message || params.field9 || "";

    const returnUrl = new URL("/payu/return", origin);
    returnUrl.searchParams.set("status", status);
    if (txnid) returnUrl.searchParams.set("txnid", txnid);
    if (mihpayid) returnUrl.searchParams.set("mihpayid", mihpayid);
    if (errorMessage) returnUrl.searchParams.set("error_Message", errorMessage);

    // If successful and hash verified, ensure ticket is generated
    if (status === "success" && /^SF26-[0-9A-F]{6}$/.test(txnid)) {
      if (verifyPayuResponse(params)) {
        try {
          const utr = mihpayid.replace(/\D/g, "").padStart(12, "0").slice(0, 12);
          const fee = Math.round(parseFloat(amount));
          const result = await issueTicket(
            {
              name: firstname,
              phone: String(phone).replace(/\D/g, "").slice(-10),
              category: productinfo,
              amount: fee,
              utr,
              regId: txnid,
            },
            origin,
          );

          if ("url" in result && result.url) {
            returnUrl.searchParams.set("ticketUrl", result.url);
            await updateRegistrationInFirestore(txnid, {
              status: "Paid",
              utr,
              ticketNo: result.ticketNo,
              ticketUrl: result.url,
            });
          }
        } catch (e) {
          console.error("Error issuing ticket on return:", e);
        }
      }
    }

    // 303 (See Other) forces the browser to GET /payu/return
    return NextResponse.redirect(returnUrl, 303);
  } catch (err) {
    console.error("PayU return error:", err);
    return NextResponse.redirect(new URL("/payu/return?status=failure", origin), 303);
  }
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/payu/return", origin), 302);
}
