// GET /api/download/[token]?type=receipt|ticket|ticket-image
// Serves secure, signed, expiring (30-day) downloadable PDFs and images.
// Rate limited, tamper-proof, Content-Disposition: attachment with official naming.

import { NextRequest } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { getRegistrationFromFirestore } from "@/lib/firebase";
import { generateReceiptPdf, generateTicketPdf, PDFData } from "@/lib/pdf";
import { checkIpRateLimit } from "@/lib/rate-limit";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const limit = checkIpRateLimit(`download:${ip}`, 40, 10 * 60 * 1000);
  if (!limit.allowed) {
    return new Response("Too many download requests. Please wait a few minutes.", { status: 429 });
  }

  const { token } = await params;
  if (!token) {
    return new Response("Missing download token", { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;
  const requestedType = searchParams.get("type");

  const verified = verifyDownloadToken(token);
  if (!verified) {
    return new Response("This download link is invalid or has expired (valid for 30 days). Please request a new link from your athlete profile.", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const regId = verified.regId;
  const targetType = (requestedType === "receipt" || requestedType === "ticket" || requestedType === "ticket-image")
    ? requestedType
    : verified.type;

  // Retrieve registration from Firestore
  const reg = await getRegistrationFromFirestore(regId);
  if (!reg) {
    return new Response("Registration record not found.", { status: 404 });
  }

  if (reg.status !== "Paid" && reg.status !== "Verified") {
    return new Response("Payment is not confirmed for this registration.", { status: 403 });
  }

  const origin = req.nextUrl.origin;
  const pdfData: PDFData = {
    regId: reg.regId,
    ticketNo: reg.ticketNo || `SFT-${reg.regId.slice(-6)}`,
    name: reg.name,
    phone: reg.phone,
    email: reg.email,
    category: reg.category,
    amount: reg.fee,
    utr: reg.utr || "CONFIRMED",
    verifyUrl: `${origin}/verify-ticket/${token}`,
    isTest: reg.isTest,
  };

  try {
    if (targetType === "receipt") {
      const pdfBytes = await generateReceiptPdf(pdfData);
      const filename = `AOGA2026-Receipt-${reg.regId}.pdf`;
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, max-age=86400",
        },
      });
    }

    if (targetType === "ticket-image") {
      // High-res QR pass badge for WhatsApp / phone gallery
      const qrPng = await QRCode.toBuffer(pdfData.verifyUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0b0c10",
          light: "#ffffff",
        },
      });
      const filename = `AOGA2026-Ticket-${reg.regId}.png`;
      return new Response(new Uint8Array(qrPng), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, max-age=86400",
        },
      });
    }

    // Default: Ticket PDF
    const pdfBytes = await generateTicketPdf(pdfData);
    const filename = `AOGA2026-Ticket-${reg.regId}.pdf`;
    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (err) {
    console.error(`[Download Error] ${regId}:`, err);
    return new Response("Failed to generate download file. Please contact support.", { status: 500 });
  }
}
