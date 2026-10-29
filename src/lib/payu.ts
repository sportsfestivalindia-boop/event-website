// Server only. PayU payment gateway integration.
// Hash formula (PayU docs): sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
// Response verification:    sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)

import { createHash } from "node:crypto";
import { PAYU_ALLOWED_PAYMENT_METHODS, PAYU_DROP_CATEGORY } from "@/data/payuBanks";

export const PAYU_KEY  = () => process.env.PAYU_MERCHANT_KEY?.trim()  ?? "";
export const PAYU_SALT = () => process.env.PAYU_MERCHANT_SALT?.trim() ?? "";
export const PAYU_URL  = () => process.env.PAYU_BASE_URL?.trim()       ?? "https://test.payu.in/_payment";

export const payuReady = () => PAYU_KEY().length > 0 && PAYU_SALT().length > 0;

/** Trim and sanitize productinfo, firstname and email (no | character, no newlines, no emoji) */
export function sanitizePayuString(val: string, maxLen = 100): string {
  if (!val) return "";
  return val
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[·–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, "") // strip emoji and non-ASCII characters
    .replace(/[|\r\n\t]/g, " ")   // strictly remove pipe and line-breaks
    .replace(/\s+/g, " ")         // collapse extra spaces
    .trim()
    .slice(0, maxLen);
}

export type PayUOrderInput = {
  txnid: string;
  amount: number | string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  enforce_paymethod?: string;
  drop_category?: string;
  pg?: string;
  bankcode?: string;
};

export type PayUFields = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  hash: string;
  enforce_paymethod?: string;
  drop_category?: string;
  pg?: string;
  bankcode?: string;
};

export type SharedPayUFields = Omit<PayUFields, "hash">;

/**
 * Builds the exact pipe-separated hash string according to PayU's documented formula:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 * exactly 6 pipes after udf5 (i.e. 5 empty strings between udf5 and salt).
 */
export function buildPayuHashString(fields: SharedPayUFields, salt: string): string {
  const parts = [
    fields.key,
    fields.txnid,
    fields.amount,
    fields.productinfo,
    fields.firstname,
    fields.email,
    fields.udf1,
    fields.udf2,
    fields.udf3,
    fields.udf4,
    fields.udf5,
    "", "", "", "", "", // 5 empty placeholders -> exactly 6 pipes (||||||) before salt
    salt,
  ];
  return parts.join("|");
}

export function generatePayuHash(fields: SharedPayUFields, salt: string): string {
  const hashString = buildPayuHashString(fields, salt);
  return createHash("sha512").update(hashString).digest("hex");
}

/**
 * Builds ONE shared payload object for both the hash calculation and the form fields.
 */
export function buildPayuPayload(input: PayUOrderInput): { fields: PayUFields; hashStringMasked: string; payuUrl: string } {
  const key = PAYU_KEY();
  const salt = PAYU_SALT();
  const payuUrl = PAYU_URL();

  if (!key || !salt) {
    throw new Error("PayU credentials missing. PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT must be configured.");
  }

  // Validate key mode vs PAYU_BASE_URL
  const isSecureUrl = payuUrl.includes("secure.payu.in");
  if (isSecureUrl && (key === "gtKFFx" || key.toLowerCase().includes("test"))) {
    throw new Error("PayU configuration mismatch: Test merchant key cannot be used with production secure.payu.in endpoint.");
  }

  // Format amount once as a string with 2 decimals
  const formattedAmount = Number(input.amount).toFixed(2);

  // Trim and sanitize firstname, email and productinfo
  const rawFirst = input.firstname.split(" ")[0] || "Athlete";
  const sanitizedFirstname = sanitizePayuString(rawFirst, 50).replace(/[^a-zA-Z0-9]/g, "") || "Athlete";
  const sanitizedEmail = sanitizePayuString(input.email, 100).toLowerCase().replace(/[^a-z0-9@._-]/g, "") || "noreply@sportsfestivalindia.com";
  const sanitizedProductInfo = sanitizePayuString(input.productinfo, 100) || "Sports Festival 2026";
  const sanitizedPhone = (input.phone || "").replace(/\D/g, "").slice(-10);

  // ONE shared object for both hashing and form fields
  const sharedFields: SharedPayUFields = {
    key,
    txnid: input.txnid.trim(),
    amount: formattedAmount,
    productinfo: sanitizedProductInfo,
    firstname: sanitizedFirstname,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    surl: input.surl,
    furl: input.furl,
    udf1: sanitizePayuString(input.udf1 ?? "", 50),
    udf2: sanitizePayuString(input.udf2 ?? "", 50),
    udf3: sanitizePayuString(input.udf3 ?? "", 50),
    udf4: sanitizePayuString(input.udf4 ?? "", 50),
    udf5: sanitizePayuString(input.udf5 ?? "", 50),
  };

  const hash = generatePayuHash(sharedFields, salt);
  const hashStringMasked = buildPayuHashString(sharedFields, "***");

  const enforce_paymethod = input.enforce_paymethod !== undefined ? input.enforce_paymethod : PAYU_ALLOWED_PAYMENT_METHODS;
  const drop_category = input.drop_category !== undefined ? input.drop_category : PAYU_DROP_CATEGORY;
  const pg = input.pg?.trim();
  const bankcode = input.bankcode?.trim();

  return {
    fields: {
      ...sharedFields,
      hash,
      ...(enforce_paymethod ? { enforce_paymethod } : {}),
      ...(drop_category ? { drop_category } : {}),
      ...(pg ? { pg } : {}),
      ...(bankcode ? { bankcode } : {}),
    },
    hashStringMasked,
    payuUrl,
  };
}

/** Legacy helper maintaining backward compatibility */
export type PayUOrder = {
  txnid:       string;
  amount:      number;
  productinfo: string;
  firstname:   string;
  email:       string;
  phone:       string;
  surl:        string;
  furl:        string;
};

export function payuHash(o: PayUOrder): string {
  const { fields } = buildPayuPayload(o);
  return fields.hash;
}

export function payuFields(o: PayUOrder, origin: string): Record<string, string> {
  const { fields } = buildPayuPayload({
    ...o,
    surl: o.surl || `${origin}/api/payu/return`,
    furl: o.furl || `${origin}/api/payu/return`,
  });
  return fields as unknown as Record<string, string>;
}

/**
 * Verify PayU's response hash to ensure the callback was not tampered.
 * Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayuResponse(params: Record<string, string>): boolean {
  const {
    status, firstname, amount, txnid, productinfo, email, hash,
    udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "",
  } = params;
  if (!hash) return false;

  const salt = PAYU_SALT();
  const key = PAYU_KEY();

  // Reverse hash sequence:
  // salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const parts = [
    salt,
    status ?? "",
    "", "", "", "", "", // udf10, udf9, udf8, udf7, udf6
    udf5, udf4, udf3, udf2, udf1,
    email ?? "",
    firstname ?? "",
    productinfo ?? "",
    amount ?? "",
    txnid ?? "",
    key,
  ];

  const str = parts.join("|");
  const calculated = createHash("sha512").update(str).digest("hex");
  return calculated.toLowerCase() === hash.toLowerCase();
}

export type PayUVerifyResult = {
  ok: boolean;
  verified: boolean;
  status?: string;
  amount?: number;
  mihpayid?: string;
  bankRefNum?: string;
  mode?: string;
  raw?: unknown;
  error?: string;
};

/**
 * Server-to-server verification via PayU verify_payment web service.
 * API Endpoint: https://info.payu.in/merchant/postservice.php?form=2 (or test.payu.in)
 * Hash: sha512(key|command|var1|salt)
 */
export async function verifyPaymentWithPayuApi(txnid: string): Promise<PayUVerifyResult> {
  const key = PAYU_KEY();
  const salt = PAYU_SALT();
  const payuUrl = PAYU_URL();

  if (!key || !salt) {
    return { ok: false, verified: false, error: "PayU credentials not configured" };
  }

  const endpoint = payuUrl.includes("test.payu.in")
    ? "https://test.payu.in/merchant/postservice.php?form=2"
    : "https://info.payu.in/merchant/postservice.php?form=2";

  const command = "verify_payment";
  const hashString = `${key}|${command}|${txnid}|${salt}`;
  const hash = createHash("sha512").update(hashString).digest("hex");

  const body = new URLSearchParams({
    key,
    command,
    var1: txnid,
    hash,
  });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return { ok: false, verified: false, error: `PayU API HTTP ${res.status}` };
    }

    const json = (await res.json()) as {
      status?: number;
      msg?: string;
      transaction_details?: Record<string, Record<string, unknown>>;
    };

    if (json && json.status === 1 && json.transaction_details) {
      const details = json.transaction_details[txnid];
      if (details) {
        const isSuccess =
          String(details.status).toLowerCase() === "success" ||
          String(details.unmappedstatus).toLowerCase() === "captured";
        const amt = parseFloat(String(details.amt || details.transaction_amount || "0"));
        return {
          ok: true,
          verified: isSuccess,
          status: String(details.status || ""),
          amount: amt,
          mihpayid: String(details.mihpayid || ""),
          bankRefNum: String(details.bank_ref_num || ""),
          mode: String(details.mode || ""),
          raw: details,
        };
      }
    }

    return {
      ok: true,
      verified: false,
      status: "not_found",
      error: json?.msg || "Transaction not found in PayU",
      raw: json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`verifyPaymentWithPayuApi error for ${txnid}:`, message);
    return { ok: false, verified: false, error: message };
  }
}

