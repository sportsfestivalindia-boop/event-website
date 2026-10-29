import test from "node:test";
import assert from "node:assert/strict";

import {
  isTestFeeOverrideEnabled,
  cleanPhoneNumber,
  isApprovedTestPhone,
  computePayableFee,
  checkDailyTestLimit,
} from "../src/lib/test-fee.ts";

test("Requirement 8(a): Normal phone numbers get full category fee even when override is ON", () => {
  const origOverride = process.env.TEST_FEE_OVERRIDE;
  const origPhones = process.env.TEST_FEE_PHONES;

  try {
    process.env.TEST_FEE_OVERRIDE = "1";
    process.env.TEST_FEE_PHONES = "9876543210,9999999999";

    const normalPhone = "9123456780";
    assert.equal(isApprovedTestPhone(normalPhone), false);

    const result = computePayableFee(5000, normalPhone);
    assert.equal(result.fee, 5000, "Normal athlete must be charged full category fee of ₹5,000");
    assert.equal(result.isTest, false);
    assert.equal(result.originalFee, undefined);
  } finally {
    process.env.TEST_FEE_OVERRIDE = origOverride;
    process.env.TEST_FEE_PHONES = origPhones;
  }
});

test("Requirement 8(b): Approved test phone numbers get ₹1 test fee with original fee preserved", () => {
  const origOverride = process.env.TEST_FEE_OVERRIDE;
  const origPhones = process.env.TEST_FEE_PHONES;

  try {
    process.env.TEST_FEE_OVERRIDE = "1";
    process.env.TEST_FEE_PHONES = "9876543210,9999999999";

    // Standard 10 digits
    assert.equal(isApprovedTestPhone("9876543210"), true);
    // Number with +91 and spaces
    assert.equal(isApprovedTestPhone("+91 98765 43210"), true);
    // Number with leading 0
    assert.equal(isApprovedTestPhone("09876543210"), true);

    const result = computePayableFee(5000, "+91 98765 43210");
    assert.equal(result.fee, 1, "Approved test phone must be charged exactly ₹1");
    assert.equal(result.isTest, true);
    assert.equal(result.originalFee, 5000, "Original category fee must be preserved");
  } finally {
    process.env.TEST_FEE_OVERRIDE = origOverride;
    process.env.TEST_FEE_PHONES = origPhones;
  }
});

test("Requirement 8(c): With TEST_FEE_OVERRIDE unset, nobody gets ₹1 fee", () => {
  const origOverride = process.env.TEST_FEE_OVERRIDE;
  const origPhones = process.env.TEST_FEE_PHONES;

  try {
    delete process.env.TEST_FEE_OVERRIDE;
    process.env.TEST_FEE_PHONES = "9876543210,9999999999";

    assert.equal(isTestFeeOverrideEnabled(), false);
    assert.equal(isApprovedTestPhone("9876543210"), false);

    // Both approved phone and normal phone get full category fee
    const res1 = computePayableFee(5000, "9876543210");
    assert.equal(res1.fee, 5000);
    assert.equal(res1.isTest, false);

    const res2 = computePayableFee(1000, "9123456780");
    assert.equal(res2.fee, 1000);
    assert.equal(res2.isTest, false);
  } finally {
    process.env.TEST_FEE_OVERRIDE = origOverride;
    process.env.TEST_FEE_PHONES = origPhones;
  }
});

test("Requirement 7: Daily test fee limit allows at most 5 payments per day", () => {
  const origLimit = process.env.TEST_FEE_DAILY_LIMIT;
  try {
    process.env.TEST_FEE_DAILY_LIMIT = "5";
    const testPhone = "98765" + Math.floor(10000 + Math.random() * 90000);

    for (let i = 1; i <= 5; i++) {
      const check = checkDailyTestLimit(testPhone);
      assert.equal(check.allowed, true, `Call ${i} should be allowed`);
    }

    // 6th call on same day must be rejected
    const blocked = checkDailyTestLimit(testPhone);
    assert.equal(blocked.allowed, false, "6th call on same day must be blocked");
    assert.equal(blocked.count, 5);
  } finally {
    process.env.TEST_FEE_DAILY_LIMIT = origLimit;
  }
});

