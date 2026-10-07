// Run: npx tsx src/lib/pay.check.ts — fails loudly if the money path breaks.
import assert from "node:assert/strict";
import { checkEntry, checkStall, upiLink, validUtr } from "./pay";

const base = { sport: "bodybuilding", division: "mens-bb", cls: "75 kg", name: "Test Athlete", dob: "1998-05-10", phone: "9876543210", email: "a@b.in", city: "Bhubaneswar" };

const ok = checkEntry(base);
assert.ok(ok.ok && ok.fee === 5000, "physique category costs ₹5,000");
const run = checkEntry({ ...base, sport: "marathon", division: "run", cls: "Open" });
assert.ok(run.ok && run.fee === 600, "marathon costs ₹600");
const dangal = checkEntry({ ...base, sport: "dangal", division: "bouts-women", cls: "48–55 kg" });
assert.ok(dangal.ok && dangal.fee === 1000, "Dangal costs ₹1,000");
const box = checkEntry({ ...base, sport: "boxing", division: "boxing-men", cls: "Open" });
assert.ok(box.ok && box.fee === 1000, "Boxing costs ₹1,000");
const classic = checkEntry({ ...base, division: "classic-physique", cls: "Above 70 kg" });
assert.ok(classic.ok && classic.fee === 5000, "Classic Physique 70 kg classes open at ₹5,000");
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

assert.ok(validUtr("123456789012"), "12-digit UTR accepted");
assert.equal(validUtr("12345"), false, "short UTR rejected");
assert.equal(validUtr("12345678901a"), false, "non-numeric UTR rejected");
assert.equal(upiLink(5000, "SF26-ABC123") === null || upiLink(5000, "SF26-ABC123")!.includes("am=5000.00"), true, "UPI link carries the amount (or is off until the UPI ID is set)");

// tickets: sealed with ADMIN_KEY — tamper-proof, one UTR = one ticket number
process.env.ADMIN_KEY = "test-key-for-checks-only";
import("./ticket").then(({ seal, unseal, ticketNo, isAdmin }) => {
  const tk = { t: ticketNo("428109567123"), n: "Test Athlete", c: "Marathon · Open", w: "Fri 4 Dec", a: 600, u: "428109567123", i: new Date().toISOString() };
  assert.equal(ticketNo("428109567123"), tk.t, "same UTR → same ticket number");
  assert.notEqual(ticketNo("428109567124"), tk.t, "different UTR → different ticket number");
  const token = seal(tk);
  assert.deepEqual(unseal(token), tk, "ticket round-trips");
  const bad = token.slice(0, 20) + (token[20] === "A" ? "B" : "A") + token.slice(21);
  assert.equal(unseal(bad), null, "edited ticket link rejected");
  assert.ok(isAdmin("test-key-for-checks-only") && !isAdmin("wrong"), "staff password checked");
  console.log("pay.check: all passed");
});
