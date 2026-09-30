// Run: npx tsx src/lib/pay.check.ts — fails loudly if the money path breaks.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkEntry, validSignature } from "./pay";

const base = { sport: "bodybuilding", division: "mens-bb", cls: "75 kg", name: "Test Athlete", phone: "9876543210", email: "a@b.in", city: "Bhubaneswar" };

const ok = checkEntry(base);
assert.ok(ok.ok && ok.fee === 5000, "paid category costs ₹5,000");
const star = checkEntry({ ...base, division: "star", cls: "Open" });
assert.ok(star.ok && star.fee === 0, "Star category is free");
assert.equal(checkEntry({ ...base, cls: "999 kg" }).ok, false, "unknown class rejected");
assert.equal(checkEntry({ ...base, phone: "12345" }).ok, false, "bad phone rejected");
assert.equal(checkEntry({ ...base, email: "nope" }).ok, false, "bad email rejected");

const sig = createHmac("sha256", "secret").update("order_1|pay_1").digest("hex");
assert.ok(validSignature("order_1", "pay_1", sig, "secret"), "valid signature accepted");
assert.equal(validSignature("order_1", "pay_2", sig, "secret"), false, "tampered payment rejected");
assert.equal(validSignature("order_1", "pay_1", "short", "secret"), false, "wrong-length signature rejected");

console.log("pay.check: all passed");
