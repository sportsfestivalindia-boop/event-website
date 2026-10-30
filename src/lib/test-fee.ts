// Server-only logic for temporary ₹1 test fee override for approved client phone numbers.
// Controlled by TEST_FEE_OVERRIDE and TEST_FEE_PHONES environment variables.

/** Checks if the test fee override feature is enabled. */
export function isTestFeeOverrideEnabled(): boolean {
  const override = process.env.TEST_FEE_OVERRIDE?.trim();
  const phones = process.env.TEST_FEE_PHONES?.trim();
  return Boolean(override && !isNaN(Number(override)) && Number(override) > 0 && phones && phones.length >= 10);
}

/** Cleans a phone number to standard 10 digits without leading 0 or +91. */
export function cleanPhoneNumber(phone: unknown): string {
  if (typeof phone !== "string") return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  return digits.slice(-10);
}

/** Returns the list of configured 10-digit approved test phone numbers. */
export function getApprovedTestPhones(): string[] {
  const raw = process.env.TEST_FEE_PHONES ?? "";
  return raw
    .split(",")
    .map((p) => cleanPhoneNumber(p))
    .filter((p) => p.length === 10);
}

/** Verifies whether a given phone number is in the approved test list. */
export function isApprovedTestPhone(phone: unknown): boolean {
  if (!isTestFeeOverrideEnabled()) return false;
  const cleaned = cleanPhoneNumber(phone);
  if (cleaned.length !== 10) return false;
  const approved = getApprovedTestPhones();
  return approved.includes(cleaned);
}

/** Returns the daily test payment limit per phone (default: 5). */
export function getDailyTestLimit(): number {
  const envLimit = Number(process.env.TEST_FEE_DAILY_LIMIT);
  return Number.isFinite(envLimit) && envLimit > 0 ? envLimit : 50;
}

// ── In-Memory Daily Tracker (Resets automatically every midnight UTC/IST) ─────────
interface DailyRecord {
  count: number;
  dateKey: string;
}

const dailyTracker = new Map<string, DailyRecord>();

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function checkDailyTestLimit(phone: string): { allowed: boolean; count: number; limit: number } {
  const today = getTodayKey();
  const limit = getDailyTestLimit();
  const cleaned = cleanPhoneNumber(phone);

  const existing = dailyTracker.get(cleaned);
  if (!existing || existing.dateKey !== today) {
    dailyTracker.set(cleaned, { count: 1, dateKey: today });
    return { allowed: true, count: 1, limit };
  }

  if (existing.count >= limit) {
    return { allowed: false, count: existing.count, limit };
  }

  existing.count += 1;
  return { allowed: true, count: existing.count, limit };
}

/**
 * Computes the payable fee for an athlete:
 * If test fee override is ON and phone is approved, returns { fee: overrideFee, isTest: true, originalFee: categoryFee }
 * Otherwise returns { fee: categoryFee, isTest: false }
 */
export function computePayableFee(
  categoryFee: number,
  phone: unknown,
): { fee: number; isTest: boolean; originalFee?: number } {
  if (isApprovedTestPhone(phone)) {
    const override = Number(process.env.TEST_FEE_OVERRIDE);
    if (Number.isFinite(override) && override > 0) {
      return {
        fee: override,
        isTest: true,
        originalFee: categoryFee,
      };
    }
  }
  return {
    fee: categoryFee,
    isTest: false,
  };
}

