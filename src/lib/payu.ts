// Server only. PayU payment gateway integration.
// Hash formula (PayU docs): SHA512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
// Response verification:    SHA512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)

import { createHash } from "node:crypto";

export const PAYU_KEY  = () => process.env.PAYU_MERCHANT_KEY?.trim()  ?? "";
export const PAYU_SALT = () => process.env.PAYU_MERCHANT_SALT?.trim() ?? "";
export const PAYU_URL  = () => process.env.PAYU_BASE_URL?.trim()       ?? "https://test.payu.in/_payment";

export const payuReady = () => PAYU_KEY().length > 0 && PAYU_SALT().length > 0;

export type PayUOrder = {
  txnid:       string;   // our registration ID (SF26-XXXXXX)
  amount:      number;   // in rupees
  productinfo: string;   // category label
  firstname:   string;
  email:       string;
  phone:       string;
  surl:        string;   // success callback URL
  furl:        string;   // failure callback URL
};

/** SHA-512 hex digest */
const sha512 = (s: string) => createHash("sha512").update(s).digest("hex");

/** Compute the request hash PayU requires before redirecting the athlete. */
export function payuHash(o: PayUOrder): string {
  // 10 pipe-separated fields, then 5 empty (udf1–udf5), then salt
  const str = [
    PAYU_KEY(), o.txnid, o.amount.toFixed(2), o.productinfo,
    o.firstname, o.email, "", "", "", "", "", "", "", "", "",
    PAYU_SALT(),
  ].join("|");
  return sha512(str);
}

/** Verify PayU's response hash to ensure the callback was not tampered. */
export function verifyPayuResponse(params: Record<string, string>): boolean {
  const { status, firstname, amount, txnid, productinfo, email, hash } = params;
  if (!hash) return false;
  // Reverse hash: salt|status|udf5..udf1 (reversed)|email|firstname|productinfo|amount|txnid|key
  const str = [
    PAYU_SALT(), status, "", "", "", "", "",
    email, firstname, productinfo, amount, txnid, PAYU_KEY(),
  ].join("|");
  return sha512(str) === hash.toLowerCase();
}

/** Build the hidden-form fields that the browser POSTs to PayU. */
export function payuFields(o: PayUOrder, origin: string): Record<string, string> {
  return {
    key:         PAYU_KEY(),
    txnid:       o.txnid,
    amount:      o.amount.toFixed(2),
    productinfo: o.productinfo,
    firstname:   o.firstname,
    email:       o.email,
    phone:       o.phone,
    surl:        o.surl || `${origin}/api/payu/return`,
    furl:        o.furl || `${origin}/api/payu/return`,
    hash:        payuHash(o),
  };
}
