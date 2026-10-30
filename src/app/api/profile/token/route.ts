// POST /api/profile/token
// Returns signed download token for logged-in athletes verifying their registration email.

import { NextRequest, NextResponse } from "next/server";
import { getRegistrationFromFirestore } from "@/lib/firebase";
import { generateDownloadToken } from "@/lib/download-token";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { regId, email, type } = await req.json();
    if (!regId || !email) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const reg = await getRegistrationFromFirestore(regId.trim().toUpperCase());
    if (!reg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (reg.status !== "Paid" && reg.status !== "Verified") {
      return NextResponse.json({ error: "Registration not paid" }, { status: 403 });
    }

    // Verify email matches
    if (reg.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    const targetType = type === "receipt" ? "receipt" : type === "ticket-image" ? "ticket-image" : "ticket";
    const token = generateDownloadToken(reg.regId, targetType);

    return NextResponse.json({
      success: true,
      url: `/api/download/${token}?type=${targetType}`,
      filename: `AOGA2026-${targetType === "receipt" ? "Receipt" : "Ticket"}-${reg.regId}.${targetType === "ticket-image" ? "png" : "pdf"}`,
    });
  } catch (e) {
    console.error("[Profile Token Error]:", e);
    return NextResponse.json({ error: "Failed to create download link" }, { status: 500 });
  }
}

