// Run: npx tsx src/lib/pay.check.ts — fails loudly if the money path breaks.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkEntry, checkStall } from "./pay";
import { validSignature } from "./razorpay";

const base = { sport: "bodybuilding", division: "mens-bb", cls: "75 kg", name: "Test Athlete", dob: "1998-05-10", phone: "9876543210", email: "a@b.in", city: "Bhubaneswar" };

const ok = checkEntry(base);
assert.ok(ok.ok && ok.fee === 5000, "physique category costs ₹5,000");
const run = checkEntry({ ...base, sport: "marathon", division: "run", cls: "Open" });
assert.ok(run.ok && run.fee === 600, "marathon costs ₹600");
const star = checkEntry({ ...base, division: "star", cls: "Open" });
assert.ok(star.ok && star.fee === 0, "Star category is free");
assert.equal(checkEntry({ ...base, cls: "999 kg" }).ok, false, "unknown class rejected");
assert.equal(checkEntry({ ...base, phone: "12345" }).ok, false, "bad phone rejected");
assert.equal(checkEntry({ ...base, email: "nope" }).ok, false, "bad email rejected");
assert.equal(checkEntry({ ...base, dob: "" }).ok, false, "missing DOB rejected");
assert.equal(checkEntry({ ...base, division: "masters", cls: "Open" }).ok, false, "under-45 rejected from Masters");
assert.ok(checkEntry({ ...base, division: "masters", cls: "Open", dob: "1975-01-01" }).ok, "45+ accepted in Masters");

const firm = { stall: "s50x30", company: "Acme Nutrition", contact: "Test Person", phone: "9876543210", email: "a@b.in" };
const big = checkStall(firm);
assert.ok(big.ok && big.price === 10_00_000, "50x30 stall costs ₹10,00,000");
assert.equal(checkStall({ ...firm, stall: "s1x1" }).ok, false, "unknown stall rejected");
assert.equal(checkStall({ ...firm, gstin: "BADGST" }).ok, false, "bad GSTIN rejected");
assert.ok(checkStall({ ...firm, gstin: "21AABCU9603R1ZM" }).ok, "valid GSTIN accepted");

const sig = createHmac("sha256", "secret").update("order_1|pay_1").digest("hex");
assert.ok(validSignature("order_1", "pay_1", sig, "secret"), "valid Razorpay signature accepted");
assert.equal(validSignature("order_1", "pay_2", sig, "secret"), false, "tampered payment rejected");
assert.equal(validSignature("order_1", "pay_1", "short", "secret"), false, "wrong-length signature rejected");

console.log("pay.check: all passed");
