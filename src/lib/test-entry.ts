// Server-only & client-safe definitions for the temporary live ₹1 test entry.
// Controlled strictly by TEST_ENTRY_ENABLED ("true") and TEST_ENTRY_TOKEN (secret random string).

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Championship } from "@/data/festival";

export const TEST_SPORT_ID = "test-sports";
export const TEST_DIVISION_ID = "test-entry-1";
export const TEST_CLASS_ID = "Live Gateway Verification";
export const TEST_CATEGORY_LABEL = "TEST ENTRY (₹1)";
export const TEST_FEE = 1;

/** Returns true only when explicitly turned on with a valid token configured. */
export function isTestEntryEnabled(): boolean {
  return (
    process.env.TEST_ENTRY_ENABLED?.trim().toLowerCase() === "true" &&
    typeof process.env.TEST_ENTRY_TOKEN === "string" &&
    process.env.TEST_ENTRY_TOKEN.trim().length >= 16
  );
}

/** Verifies the provided token against TEST_ENTRY_TOKEN using constant-time comparison. */
export function isTestEntryTokenValid(token: unknown): boolean {
  if (!isTestEntryEnabled() || typeof token !== "string" || !token.trim()) {
    return false;
  }
  const expected = process.env.TEST_ENTRY_TOKEN!.trim();
  const input = token.trim();

  try {
    const a = Buffer.from(createHash("sha256").update(input).digest("hex"));
    const b = Buffer.from(createHash("sha256").update(expected).digest("hex"));
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Secret key used to sign test registration records. */
function getSigningSecret(): string {
  return process.env.TEST_ENTRY_TOKEN?.trim() || process.env.ADMIN_KEY?.trim() || "test-entry-secret";
}

/** Signs a registration ID for test verification so payment initiation can prove origin. */
export function signTestRegistration(regId: string): string {
  return createHmac("sha256", getSigningSecret()).update(`test_reg:${regId}`).digest("hex");
}

/** Verifies a test registration signature in constant time. */
export function verifyTestRegistration(regId: string, signature: unknown): boolean {
  if (!isTestEntryEnabled() || typeof signature !== "string" || !signature.trim()) {
    return false;
  }
  const expected = signTestRegistration(regId);
  try {
    const a = Buffer.from(createHash("sha256").update(signature.trim()).digest("hex"));
    const b = Buffer.from(createHash("sha256").update(expected).digest("hex"));
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Championship definition for the test entry (injected only when authorized). */
export const TEST_CHAMPIONSHIP: Championship = {
  id: TEST_SPORT_ID,
  sport: "TEST ENTRY (₹1)",
  name: "Live Payment Test",
  level: "Gateway Verification",
  tagline: "Live ₹1 verification test for payment confirmation flow",
  when: "Testing Mode",
  divisions: [
    {
      id: TEST_DIVISION_ID,
      name: "TEST ENTRY (₹1)",
      classes: [TEST_CLASS_ID],
      prizes: [],
      fee: TEST_FEE,
      note: "Temporary test entry. Not valid for actual athletic event entry.",
    },
  ],
};

// ── Rate Limiter (Sliding Window: Max 5 per IP per 60 minutes) ──────────────────
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkTestRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;

  const existing = rateLimitMap.get(ip);
  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxRequests - existing.count };
}

