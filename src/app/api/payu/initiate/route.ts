// POST /api/payu/initiate
// Called by the browser after /api/order succeeds or when re-initiating from /payment-failed or /profile.
// Returns the PayU form fields (including hash) so the frontend can auto-POST to PayU.

import { buildPayuPayload, payuReady } from "@/lib/payu";
import { checkEntry, type Entry } from "@/lib/pay";
import { getRegistrationFromFirestore } from "@/lib/firebase";
import { EVENT } from "@/data/festival";
import { checkIpRateLimit } from "@/lib/rate-limit";
import {
  isValidPayUBankCode,
  PAYU_ALLOWED_PAYMENT_METHODS,
  PAYU_DROP_CATEGORY,
} from "@/data/payuBanks";
import {
  isTestEntryEnabled,
  isTestEntryTokenValid,
  verifyTestRegistration,
  checkTestRateLimit,
  TEST_SPORT_ID,
  TEST_CATEGORY_LABEL,
  TEST_FEE,
} from "@/lib/test-entry";
import {
  computePayableFee,
  checkDailyTestLimit,
} from "@/lib/test-fee";

export async function POST(req: Request) {
  if (!payuReady()) {
    return Response.json(
      { error: "PayU is not configured yet. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in environment variables." },
      { status: 503 },
    );
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1";

  // Rate limiting check
  const ipRate = checkIpRateLimit(clientIp, 30);
  if (!ipRate.allowed) {
    return Response.json({ error: "Too many payment requests. Please wait a few minutes." }, { status: 429 });
  }

  const b = (await req.json().catch(() => ({}))) as {
    regId?: string;
    amount?: number;
    label?: string;
    testToken?: string;
    testSig?: string;
    entry?: Partial<Entry>;
    method?: string;
    bankcode?: string;
  };

  const regId = String(b.regId ?? "").trim().toUpperCase();
  if (!/^SF26-[0-9A-F]{6}$/.test(regId)) {
    return Response.json({ error: "Invalid registration ID." }, { status: 400 });
  }

  // Check if already paid in Firestore
  const existing = await getRegistrationFromFirestore(regId);
  if (existing && (existing.status === "Paid" || existing.status === "Verified")) {
    return Response.json({ error: "This registration has already been paid and confirmed." }, { status: 400 });
  }

  // Check if test payment requested
  const isTestRequested =
    b.entry?.sport === TEST_SPORT_ID ||
    b.label?.includes("TEST ENTRY") ||
    Number(b.amount) === TEST_FEE ||
    b.testToken !== undefined ||
    b.testSig !== undefined ||
    existing?.isTest === true;

  // Deadline enforcement
  if (new Date() > new Date(EVENT.registrationCloses) && !isTestRequested) {
    return Response.json({ error: "Registrations have officially closed for this festival." }, { status: 400 });
  }

  let amount: number;
  let productinfo: string;
  let firstname = b.entry?.name ?? existing?.name ?? "Athlete";
  let email = b.entry?.email ?? existing?.email ?? "noreply@sportsfestivalindia.com";
  let phone = b.entry?.phone ?? existing?.phone ?? "";

  if (isTestRequested) {
    // 3. Reject test category unless flag is on AND valid token / signature is presented
    const tokenValid = isTestEntryTokenValid(b.testToken);
    const sigValid = verifyTestRegistration(regId, b.testSig);

    if (!isTestEntryEnabled() || (!tokenValid && !sigValid && !existing?.isTest)) {
      console.warn(`[TEST ENTRY REJECTED] Unauthorized test payment attempt for regId=${regId} from IP=${clientIp}`);
      return Response.json(
        { error: "Test entry mode is disabled or unauthorized." },
        { status: 403 },
      );
    }

    const rate = checkTestRateLimit(clientIp);
    if (!rate.allowed) {
      console.warn(`[TEST ENTRY] Rate limit exceeded on initiate for IP=${clientIp}`);
      return Response.json(
        { error: "Test entry rate limit exceeded. Max 5 test registrations per hour." },
        { status: 429 },
      );
    }

    console.log(`[TEST ENTRY] PayU initiate authorized: regId=${regId}, ip=${clientIp}, fee=₹${TEST_FEE}`);
    amount = TEST_FEE; // strictly 1
    productinfo = TEST_CATEGORY_LABEL;
  } else if (!b.entry || !b.entry.sport || !b.entry.division) {
    // Re-initiating payment for existing registration (from /payment-failed or /profile)
    if (!existing) {
      return Response.json({ error: "Registration not found." }, { status: 400 });
    }
    amount = existing.fee;
    productinfo = existing.category;
    firstname = existing.name;
    email = existing.email;
    phone = existing.phone;
  } else {
    // Standard registration amount verification (never trust browser-supplied amount)
    const verified = checkEntry(b.entry);
    if (!verified.ok) {
      return Response.json({ error: verified.error }, { status: 400 });
    }

    // Check phone-based test fee override (for client verification)
    const phoneTest = computePayableFee(verified.fee, b.entry.phone);
    if (phoneTest.isTest) {
      const daily = checkDailyTestLimit(b.entry.phone!);
      if (!daily.allowed) {
        return Response.json(
          { error: "Daily test payment limit exceeded (max 5 per day)." },
          { status: 429 },
        );
      }
      amount = phoneTest.fee;
      console.log(`[PayU Initiate] Test fee override applied for phone ${b.entry.phone}: locked to ₹${amount.toFixed(2)} (original ₹${phoneTest.originalFee})`);
    } else {
      // Amount is locked strictly to verified server-side category fee
      amount = verified.fee;
    }
    productinfo = verified.label;
    firstname = b.entry.name || firstname;
    email = b.entry.email || email;
    phone = b.entry.phone || phone;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ error: "Invalid amount." }, { status: 400 });
  }

  // Method & Bank code handling
  const chosenMethod = typeof b.method === "string" ? b.method.trim().toLowerCase() : "";
  let pg: string | undefined;
  let bankcode: string | undefined;
  let enforce_paymethod: string | undefined;

  if (chosenMethod === "nb" || chosenMethod === "netbanking") {
    pg = "NB";
    enforce_paymethod = "netbanking";
    if (b.bankcode) {
      const code = String(b.bankcode).trim().toUpperCase();
      if (!isValidPayUBankCode(code)) {
        return Response.json({ error: "Invalid or unsupported bank code." }, { status: 400 });
      }
      bankcode = code;
    }
  } else if (chosenMethod === "upi") {
    pg = "UPI";
    enforce_paymethod = "upi";
  } else if (chosenMethod === "card" || chosenMethod === "cards" || chosenMethod === "cc") {
    pg = "CC";
    enforce_paymethod = "creditcard|debitcard";
  } else {
    enforce_paymethod = PAYU_ALLOWED_PAYMENT_METHODS;
  }

  const origin = new URL(req.url).origin;

  try {
    // Build hash string and form fields from ONE shared object
    const { fields, hashStringMasked, payuUrl } = buildPayuPayload({
      txnid: regId,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${origin}/api/payu/return`,
      furl: `${origin}/api/payu/return`,
      enforce_paymethod,
      drop_category: PAYU_DROP_CATEGORY,
      pg,
      bankcode,
    });

    console.log("[PayU Initiate] Hash string (masked):", hashStringMasked);
    console.log("[PayU Initiate] Form fields for PayU:", {
      ...fields,
      hash: fields.hash ? `${fields.hash.slice(0, 8)}...${fields.hash.slice(-8)}` : "",
    });

    return Response.json({ fields, payuUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate PayU payment.";
    console.error("[PayU Initiate Error]:", message);
    return Response.json({ error: message }, { status: 400 });
  }
}
