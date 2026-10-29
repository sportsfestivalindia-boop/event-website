import { checkEntry, regId, upiLink, type Entry } from "@/lib/pay";
import { isAdmin, issueTicket } from "@/lib/ticket";
import { after } from "next/server";
import { saveRegistrationToFirestore } from "@/lib/firebase";
import { EVENT } from "@/data/festival";
import { checkIpRateLimit } from "@/lib/rate-limit";
import {
  isTestEntryEnabled,
  isTestEntryTokenValid,
  signTestRegistration,
  checkTestRateLimit,
  TEST_SPORT_ID,
  TEST_CATEGORY_LABEL,
  TEST_FEE,
} from "@/lib/test-entry";
import {
  computePayableFee,
  checkDailyTestLimit,
  isApprovedTestPhone,
} from "@/lib/test-fee";

/** Step 3: validate the entry, reserve a registration ID, record it in Firestore and return order details. */
export async function POST(req: Request) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1";

  // IP Rate limiting
  const ipRate = checkIpRateLimit(clientIp, 30);
  if (!ipRate.allowed) {
    return Response.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  // Registration deadline enforcement
  if (new Date() > new Date(EVENT.registrationCloses)) {
    return Response.json({ error: "Registrations have officially closed for this festival." }, { status: 400 });
  }

  const entry = (await req.json().catch(() => ({}))) as Partial<Entry> & {
    tracking?: Record<string, string>;
    testKey?: string;
    testToken?: string;
  };

  // Check if hidden test category / token was used
  const isTestSport = entry.sport === TEST_SPORT_ID;
  const hasTestToken = typeof entry.testToken === "string" && entry.testToken.trim().length > 0;
  const isTestAttempt = isTestSport || hasTestToken;

  let fee: number;
  let label: string;
  let isTest = false;
  let originalFee: number | undefined;
  let testSig: string | undefined;

  if (isTestAttempt) {
    // 1. Strict validation: TEST_ENTRY_ENABLED must be exactly "true" and token must match in constant time
    if (!isTestEntryEnabled() || !isTestEntryTokenValid(entry.testToken)) {
      return Response.json(
        { error: "Test entry mode is disabled or unauthorized token." },
        { status: 403 },
      );
    }

    // 2. Rate limit: max 5 per IP per 60 minutes
    const rate = checkTestRateLimit(clientIp);
    if (!rate.allowed) {
      console.warn(`[TEST ENTRY] Rate limit exceeded for IP: ${clientIp}`);
      return Response.json(
        { error: "Test entry rate limit exceeded. Max 5 test registrations per hour." },
        { status: 429 },
      );
    }

    // 3. Validate basic athlete fields
    if (!entry.name || entry.name.trim().length < 2) {
      return Response.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(entry.phone ?? "")) {
      return Response.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email ?? "")) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    fee = TEST_FEE; // strictly 1
    label = TEST_CATEGORY_LABEL;
    isTest = true;
  } else {
    // Standard registration validation (normal sports)
    const check = checkEntry(entry);
    if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

    label = check.label;

    // Check phone-based test fee override (for client verification via normal flow)
    const phoneTest = computePayableFee(check.fee, entry.phone);
    if (phoneTest.isTest) {
      const daily = checkDailyTestLimit(entry.phone!);
      if (!daily.allowed) {
        console.warn(`[TEST FEE LIMIT] Daily limit reached for phone: ${entry.phone}`);
        return Response.json(
          { error: "Daily test payment limit exceeded (max 5 per day). Regular fee applies." },
          { status: 429 },
        );
      }
      fee = phoneTest.fee;
      originalFee = phoneTest.originalFee;
      isTest = true;
      console.log(`[TEST FEE OVERRIDE] Approved phone ${entry.phone}: fee ₹${fee} (original ₹${originalFee}), count: ${daily.count}/${daily.limit}`);
    } else {
      // Legacy staff test mode (/register?test=1 + staff password)
      const legacyStaffTest = entry.testKey !== undefined;
      if (legacyStaffTest && !isAdmin(entry.testKey)) {
        return Response.json({ error: "Wrong staff password." }, { status: 401 });
      }
      fee = legacyStaffTest && check.fee > 0 ? 1 : check.fee;
      label = legacyStaffTest ? `${check.label} · TEST ₹1` : check.label;
      isTest = legacyStaffTest;
    }
  }

  const id = regId();
  if (isTest) {
    testSig = signTestRegistration(id);
    console.log(`[TEST ORDER] Created: regId=${id}, ip=${clientIp}, fee=₹${fee}, time=${new Date().toISOString()}`);
  }

  const t = entry.tracking ?? {};

  // Save pending registration in Firestore (Google Sheet row & emails sent only once payment is confirmed)
  const runBackgroundTasks = async () => {
    await saveRegistrationToFirestore({
      regId: id,
      name: isTest ? `[TEST] ${entry.name!.trim()}` : entry.name!.trim(),
      dob: entry.dob || "2000-01-01",
      phone: entry.phone!,
      email: entry.email!.trim().toLowerCase(),
      city: (entry.city || "Testing").trim(),
      association: (entry.association ?? "").trim(),
      category: isTest ? `[TEST] ${label}` : label,
      fee,
      ...(originalFee ? { originalFee } : {}),
      status: fee === 0 ? "Paid" : "Awaiting payment",
      ...(isTest ? { isTest: true } : {}),
      source: isTest
        ? `LIVE_TEST_FEE (₹${fee})`
        : [t.utm_source, t.utm_campaign, t.gym && `gym:${t.gym}`].filter(Boolean).join(" · "),
    });
  };

  try {
    after(runBackgroundTasks);
  } catch {
    runBackgroundTasks().catch((e) => console.error("[Order Background Tasks Error]:", e));
  }

  // Free entry (e.g. Star category) - issue ticket and confirm immediately
  if (fee === 0) {
    const origin = new URL(req.url).origin;
    await issueTicket(
      {
        name: entry.name!.trim(),
        phone: entry.phone!,
        category: label,
        amount: 0,
        utr: "FREE" + id.replace(/\D/g, "").padStart(8, "0").slice(0, 8),
        regId: id,
        isTest,
      },
      origin,
    );
    return Response.json({ free: true, regId: id, label });
  }

  return Response.json({
    regId: id,
    amount: fee,
    originalFee,
    isTest,
    label,
    upi: upiLink(fee, id),
    testSig,
  });
}
