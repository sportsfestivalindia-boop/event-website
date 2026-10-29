import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  sanitizePayuString,
  buildPayuHashString,
  generatePayuHash,
  buildPayuPayload,
  verifyPayuResponse,
} from "../src/lib/payu.ts";

test("PayU Hash Formula matches documented PayU standard sample", () => {
  // Official PayU test sample parameters
  const sampleFields = {
    key: "gtKFFx",
    txnid: "txnid12345",
    amount: "10.00",
    productinfo: "test",
    firstname: "John",
    email: "test@example.com",
    phone: "9876543210",
    surl: "https://example.com/success",
    furl: "https://example.com/fail",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
  };
  const testSalt = "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW";

  // Build hash string
  const hashString = buildPayuHashString(sampleFields, testSalt);

  // Assert exact sequence and pipe structure: exactly 6 pipes after udf5 (||||||)
  assert.equal(
    hashString,
    "gtKFFx|txnid12345|10.00|test|John|test@example.com|||||||||||4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW",
  );

  // Compute hash using our library
  const hash = generatePayuHash(sampleFields, testSalt);

  // Official hash confirmed by PayU sandbox server
  const expectedHash = "1ab74c0e5dd86a7a6d0808c3c054ae6836d001734885bba0bb605da98b150562c11713db0e257d5a06c4ba8bacbfe592763dd5617dc0a6542fdec9b7174ec2cf";

  assert.equal(hash, expectedHash);
});

test("Sanitizer strips pipes, newlines, emoji and non-ASCII characters", () => {
  const dirty = "Bodybuilding & Physique · Men’s Bodybuilding 🏆 | 75 kg\n\r";
  const cleaned = sanitizePayuString(dirty);

  // Assert no pipe, no newline, no emoji, and quotes/dots cleanly normalized
  assert.equal(cleaned.includes("|"), false);
  assert.equal(cleaned.includes("\n"), false);
  assert.equal(cleaned.includes("\r"), false);
  assert.equal(cleaned.includes("🏆"), false);
  assert.equal(cleaned, "Bodybuilding & Physique - Men's Bodybuilding 75 kg");
});

test("Masked hash string replaces salt with *** and preserves exactly 6 pipes", () => {
  const fields = {
    key: "gtKFFx",
    txnid: "SF26-A1B2C3",
    amount: "5000.00",
    productinfo: "Boxing",
    firstname: "Athlete",
    email: "athlete@example.com",
    phone: "9876543210",
    surl: "https://example.com/return",
    furl: "https://example.com/return",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
  };

  const masked = buildPayuHashString(fields, "***");
  assert.equal(
    masked,
    "gtKFFx|SF26-A1B2C3|5000.00|Boxing|Athlete|athlete@example.com|||||||||||***",
  );
  assert.equal(masked.endsWith("||||||***"), true);
});

test("buildPayuPayload builds fields and hash from ONE shared object with 2-decimal amount", () => {
  process.env.PAYU_MERCHANT_KEY = "gtKFFx";
  process.env.PAYU_MERCHANT_SALT = "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW";
  process.env.PAYU_BASE_URL = "https://test.payu.in/_payment";

  const { fields, hashStringMasked, payuUrl } = buildPayuPayload({
    txnid: "SF26-TEST01",
    amount: 1000,
    productinfo: "Boxing · Open 🥊 | Ring A",
    firstname: "Rahul Sharma",
    email: "Rahul.Sharma@Example.COM",
    phone: "+91 98765-43210",
    surl: "https://example.com/return",
    furl: "https://example.com/return",
  });

  // Amount formatted with 2 decimals
  assert.equal(fields.amount, "1000.00");
  // Firstname sanitized to single word alphanumeric
  assert.equal(fields.firstname, "Rahul");
  // Email sanitized & lowercase
  assert.equal(fields.email, "rahul.sharma@example.com");
  // Phone normalized
  assert.equal(fields.phone, "9876543210");
  // Productinfo stripped of pipe and emoji
  assert.equal(fields.productinfo, "Boxing - Open Ring A");
  // UDFs 1-5 present as strings
  assert.equal(fields.udf1, "");
  assert.equal(fields.udf5, "");

  // Hash generated correctly
  assert.equal(fields.hash.length, 128); // SHA-512 hex length
  assert.equal(payuUrl, "https://test.payu.in/_payment");

  // Verify hash matches manual calculation on the exact shared fields
  const expectedHash = createHash("sha512")
    .update(`gtKFFx|SF26-TEST01|1000.00|Boxing - Open Ring A|Rahul|rahul.sharma@example.com|||||||||||4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW`)
    .digest("hex");
  assert.equal(fields.hash, expectedHash);
});

test("verifyPayuResponse validates reverse hash correctly", () => {
  process.env.PAYU_MERCHANT_KEY = "gtKFFx";
  process.env.PAYU_MERCHANT_SALT = "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW";

  const status = "success";
  const firstname = "Rahul";
  const amount = "1000.00";
  const txnid = "SF26-TEST01";
  const productinfo = "Boxing";
  const email = "rahul@example.com";

  // Reverse hash sequence:
  // salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const reverseStr = `4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW|success|||||||||||rahul@example.com|Rahul|Boxing|1000.00|SF26-TEST01|gtKFFx`;
  const validHash = createHash("sha512").update(reverseStr).digest("hex");

  const isValid = verifyPayuResponse({
    status,
    firstname,
    amount,
    txnid,
    productinfo,
    email,
    hash: validHash,
  });

  assert.equal(isValid, true);

  const isInvalid = verifyPayuResponse({
    status,
    firstname,
    amount,
    txnid,
    productinfo,
    email,
    hash: "tampered_hash_value",
  });

  assert.equal(isInvalid, false);
});

test("PayU Configuration: enforce_paymethod drops EMI and includes upi, cards, netbanking", () => {
  process.env.PAYU_MERCHANT_KEY = "gtKFFx";
  process.env.PAYU_MERCHANT_SALT = "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW";
  process.env.PAYU_BASE_URL = "https://test.payu.in/_payment";

  const { fields } = buildPayuPayload({
    txnid: "SF26-NB01",
    amount: 1000,
    productinfo: "Dangal",
    firstname: "Aman",
    email: "aman@example.com",
    phone: "9876543210",
    surl: "https://example.com/return",
    furl: "https://example.com/return",
    pg: "NB",
    bankcode: "SBIB",
  });

  // Verify enforce_paymethod excludes EMI
  assert.equal(fields.enforce_paymethod, "creditcard|debitcard|netbanking|upi");
  assert.equal(fields.drop_category, "EMI");
  assert.equal(fields.pg, "NB");
  assert.equal(fields.bankcode, "SBIB");

  // Verify hash calculation remains strictly the standard 11 fields and does NOT include pg/bankcode/enforce_paymethod
  const expectedHash = createHash("sha512")
    .update(`gtKFFx|SF26-NB01|1000.00|Dangal|Aman|aman@example.com|||||||||||4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW`)
    .digest("hex");
  assert.equal(fields.hash, expectedHash);
});


