// POST /api/resend
// Re-sends confirmation email and WhatsApp for confirmed registrations.
// Athlete rate limit: max 3 resends per day. Admin bypass with admin key.

import { NextRequest, NextResponse } from "next/server";
import { getRegistrationFromFirestore, updateRegistrationInFirestore } from "@/lib/firebase";
import { issueTicket, isAdmin } from "@/lib/ticket";
import { checkIpRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const limit = checkIpRateLimit(`resend:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many resend requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { regId, adminKey } = body;

    if (!regId || typeof regId !== "string") {
      return NextResponse.json({ error: "Missing registration ID." }, { status: 400 });
    }

    const cleanId = regId.trim().toUpperCase();
    const reg = await getRegistrationFromFirestore(cleanId);
    if (!reg) {
      return NextResponse.json({ error: "Registration record not found." }, { status: 404 });
    }

    if (reg.status !== "Paid" && reg.status !== "Verified") {
      return NextResponse.json({ error: "Payment has not been confirmed for this registration." }, { status: 400 });
    }

    const isStaff = isAdmin(adminKey);
    const notifications = reg.notifications || {};
    const resendCount = notifications.resendCount || 0;

    // Check 3/day limit for athletes
    if (!isStaff && resendCount >= 3) {
      return NextResponse.json(
        { error: "Daily resend limit reached (max 3 times per day). Please check your email spam folder or contact WhatsApp support at +91 80189 58655." },
        { status: 429 }
      );
    }

    const origin = req.nextUrl.origin;
    const utr = reg.utr || "CONFIRMED";

    // Trigger re-delivery with forceNotifications flag
    const result = await issueTicket(
      {
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        category: reg.category,
        amount: reg.fee,
        utr,
        regId: reg.regId,
        forceNotifications: true,
        isTest: reg.isTest,
      },
      origin
    );

    return NextResponse.json({
      success: true,
      message: "Confirmation email and WhatsApp re-sent successfully.",
      resendCount: resendCount + 1,
    });
  } catch (err) {
    console.error("[API Resend Error]:", err);
    return NextResponse.json({ error: "Failed to resend confirmation. Please try again." }, { status: 500 });
  }
}

