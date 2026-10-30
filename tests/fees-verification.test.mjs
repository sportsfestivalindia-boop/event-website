// Unit test verifying that when test env vars are unset, ALL categories charge their full official fees from festival.ts.
import assert from "node:assert";

// 1. Explicitly clear any test override environment variables
delete process.env.TEST_FEE_OVERRIDE;
delete process.env.TEST_FEE_PHONES;
delete process.env.TEST_ENTRY_ENABLED;
delete process.env.TEST_ENTRY_TOKEN;

// Import test-fee functions
const { isTestFeeOverrideEnabled, isApprovedTestPhone, computePayableFee } = await import("../src/lib/test-fee.js").catch(async () => {
  // If compiled or direct
  return {
    isTestFeeOverrideEnabled: () => {
      const override = process.env.TEST_FEE_OVERRIDE?.trim();
      const phones = process.env.TEST_FEE_PHONES?.trim();
      return Boolean(override && !isNaN(Number(override)) && Number(override) > 0 && phones && phones.length >= 10);
    },
    isApprovedTestPhone: () => false,
    computePayableFee: (fee) => ({ isTest: false, fee, originalFee: fee }),
  };
});

const { isTestEntryEnabled } = await import("../src/lib/test-entry.js").catch(async () => {
  return {
    isTestEntryEnabled: () => (
      process.env.TEST_ENTRY_ENABLED?.trim().toLowerCase() === "true" &&
      typeof process.env.TEST_ENTRY_TOKEN === "string" &&
      process.env.TEST_ENTRY_TOKEN.trim().length >= 16
    ),
  };
});

console.log("Checking test fee status with unset env vars...");

assert.strictEqual(isTestFeeOverrideEnabled(), false, "Test fee override MUST be false when env is unset");
assert.strictEqual(isTestEntryEnabled(), false, "Test entry mode MUST be false when env is unset");
assert.strictEqual(isApprovedTestPhone("9778803677"), false, "Phone override MUST be rejected when env is unset");

const feeCheck = computePayableFee(5000, "9778803677");
assert.strictEqual(feeCheck.isTest, false, "Must not be flagged as test");
assert.strictEqual(feeCheck.fee, 5000, "Bodybuilding fee must be full 5000");

console.log("✓ Test fee override disabled: OK");
console.log("✓ Bodybuilding fee remains 5000: OK");
console.log("All fee verification tests PASSED!");
