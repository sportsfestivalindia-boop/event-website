import test from "node:test";
import assert from "node:assert/strict";

// We import the functions to test
import {
  isTestEntryEnabled,
  isTestEntryTokenValid,
  signTestRegistration,
  verifyTestRegistration,
  checkTestRateLimit,
  TEST_SPORT_ID,
  TEST_CATEGORY_LABEL,
  TEST_FEE,
} from "../src/lib/test-entry.ts";

import { checkEntry } from "../src/lib/pay.ts";

test("Requirement 1: Feature is completely inactive when TEST_ENTRY_ENABLED is not 'true'", () => {
  const origEnabled = process.env.TEST_ENTRY_ENABLED;
  const origToken = process.env.TEST_ENTRY_TOKEN;

  try {
    process.env.TEST_ENTRY_ENABLED = "false";
    process.env.TEST_ENTRY_TOKEN = "test_token_super_secret_string_12345";
    assert.equal(isTestEntryEnabled(), false);
    assert.equal(isTestEntryTokenValid("test_token_super_secret_string_12345"), false);

    delete process.env.TEST_ENTRY_ENABLED;
    assert.equal(isTestEntryEnabled(), false);
    assert.equal(isTestEntryTokenValid("test_token_super_secret_string_12345"), false);
  } finally {
    process.env.TEST_ENTRY_ENABLED = origEnabled;
    process.env.TEST_ENTRY_TOKEN = origToken;
  }
});

test("Requirement 2: Constant-time token comparison with valid and invalid tokens", () => {
  const origEnabled = process.env.TEST_ENTRY_ENABLED;
  const origToken = process.env.TEST_ENTRY_TOKEN;

  try {
    const validSecret = "tst_live_a1b2c3d4e5f678901234567890abcdef";
    process.env.TEST_ENTRY_ENABLED = "true";
    process.env.TEST_ENTRY_TOKEN = validSecret;

    assert.equal(isTestEntryEnabled(), true);
    // Correct token matches
    assert.equal(isTestEntryTokenValid(validSecret), true);
    // Wrong token fails
    assert.equal(isTestEntryTokenValid("wrong_token"), false);
    assert.equal(isTestEntryTokenValid(validSecret + "x"), false);
    assert.equal(isTestEntryTokenValid(""), false);
    assert.equal(isTestEntryTokenValid(null), false);
    assert.equal(isTestEntryTokenValid(undefined), false);
  } finally {
    process.env.TEST_ENTRY_ENABLED = origEnabled;
    process.env.TEST_ENTRY_TOKEN = origToken;
  }
});

test("Requirement 3: Cryptographic HMAC signature ensures only valid test orders can initiate payment", () => {
  const origEnabled = process.env.TEST_ENTRY_ENABLED;
  const origToken = process.env.TEST_ENTRY_TOKEN;

  try {
    process.env.TEST_ENTRY_ENABLED = "true";
    process.env.TEST_ENTRY_TOKEN = "tst_live_signature_secret_test_key_123";

    const regId = "SF26-A1B2C3";
    const sig = signTestRegistration(regId);
    assert.equal(typeof sig, "string");
    assert.equal(sig.length, 64); // sha256 hex

    // Valid verification
    assert.equal(verifyTestRegistration(regId, sig), true);

    // Tampered regId fails
    assert.equal(verifyTestRegistration("SF26-OTHER1", sig), false);

    // Tampered signature fails
    assert.equal(verifyTestRegistration(regId, sig.slice(0, -1) + "0"), false);
  } finally {
    process.env.TEST_ENTRY_ENABLED = origEnabled;
    process.env.TEST_ENTRY_TOKEN = origToken;
  }
});

test("Requirement 3 & 8: Normal category fees cannot be tampered to ₹1", () => {
  // A real athlete registering for Bodybuilding Men 75kg
  const normalEntry = {
    sport: "bodybuilding",
    division: "mens-bb",
    cls: "75 kg",
    name: "John Doe",
    dob: "1995-05-15",
    phone: "9876543210",
    email: "john@example.com",
    city: "Bhubaneswar",
  };

  const verified = checkEntry(normalEntry);
  assert.equal(verified.ok, true);
  if (verified.ok) {
    // Normal category fee must be the official fee (₹5000)
    assert.equal(verified.fee, 5000);
    assert.notEqual(verified.fee, 1);
  }
});

test("Requirement 6: Rate limit allows max 5 requests per IP per hour", () => {
  const testIp = `192.168.100.${Math.floor(Math.random() * 200 + 10)}`;

  for (let i = 1; i <= 5; i++) {
    const res = checkTestRateLimit(testIp);
    assert.equal(res.allowed, true, `Request ${i} should be allowed`);
  }

  // 6th request must be rejected
  const blocked = checkTestRateLimit(testIp);
  assert.equal(blocked.allowed, false, "6th request within window must be rejected");
  assert.equal(blocked.remaining, 0);
});
