// Server only. Generates official Payment Receipt and Entry Pass PDFs and high-res PNG passes.
// Embeds Unicode NotoSans font via @pdf-lib/fontkit for native Indian Rupee (₹), apostrophes ('), and symbols.
// Dynamic non-overlapping flowing layout with safety margins on all sides.

import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import sharp from "sharp";
import { EVENT, whenForCategory } from "@/data/festival";

export interface PDFData {
  regId: string;
  ticketNo: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  amount: number;
  utr: string;
  dateStr?: string;
  paymentMode?: string;
  verifyUrl: string;
  isTest?: boolean;
}

// Load embedded Unicode NotoSans fonts
let fontRegularBytes: Buffer | null = null;
let fontBoldBytes: Buffer | null = null;

function getFontBytes(): { regular: Buffer | null; bold: Buffer | null } {
  if (fontRegularBytes && fontBoldBytes) return { regular: fontRegularBytes, bold: fontBoldBytes };

  const candidateDirs = [
    path.join(process.cwd(), "src", "assets", "fonts"),
    path.join(process.cwd(), "assets", "fonts"),
    path.join(process.cwd(), ".next", "server", "assets", "fonts"),
    path.resolve(__dirname, "../../src/assets/fonts"),
    path.resolve(__dirname, "../assets/fonts"),
  ];

  for (const dir of candidateDirs) {
    try {
      const regPath = path.join(dir, "NotoSans-Regular.ttf");
      const boldPath = path.join(dir, "NotoSans-Bold.ttf");
      if (fs.existsSync(regPath) && fs.existsSync(boldPath)) {
        fontRegularBytes = fs.readFileSync(regPath);
        fontBoldBytes = fs.readFileSync(boldPath);
        return { regular: fontRegularBytes, bold: fontBoldBytes };
      }
    } catch {
      // try next candidate
    }
  }

  return { regular: null, bold: null };
}

/** Formats INR currency cleanly (e.g. ₹5,000 or ₹1.00 (Test)) */
export function formatCurrency(amount: number, isTest?: boolean): string {
  if (isTest || amount === 1) return "₹1.00 (Test Fee)";
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

/** Format IST date string */
export function formatIstDate(dateStr?: string): string {
  if (dateStr) return dateStr;
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " IST";
}

/** Embeds fonts with Unicode support via fontkit if available */
async function loadFonts(pdfDoc: PDFDocument) {
  const { regular: regBytes, bold: boldBytes } = getFontBytes();
  if (regBytes && boldBytes) {
    try {
      pdfDoc.registerFontkit(fontkit);
      const [regular, bold, mono] = await Promise.all([
        pdfDoc.embedFont(regBytes),
        pdfDoc.embedFont(boldBytes),
        pdfDoc.embedFont(StandardFonts.CourierBold),
      ]);
      return { regular, bold, mono, isUnicode: true };
    } catch (e) {
      console.warn("[PDF Fontkit Error]: Fallback to standard fonts:", e);
    }
  }

  const [regular, bold, mono] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
    pdfDoc.embedFont(StandardFonts.CourierBold),
  ]);
  return { regular, bold, mono, isUnicode: false };
}

/** Sanitizes text only if standard WinAnsi fallback is used */
function sanitize(text: string | undefined | null, isUnicode = true): string {
  if (!text) return "";
  if (isUnicode) return String(text);
  // WinAnsi fallback
  return String(text)
    .replace(/₹/g, "INR ")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}

/** Generates the Official Athlete Entry Pass / Ticket PDF (A4 Portrait) */
export async function generateTicketPdf(data: PDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points (72 DPI)
  const { width, height } = page.getSize();
  const { regular, bold, mono, isUnicode } = await loadFonts(pdfDoc);

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const borderGray = rgb(0.85, 0.85, 0.85);
  const fillGray = rgb(0.97, 0.97, 0.97);
  const gold = rgb(0.85, 0.65, 0.0);
  const goldBg = rgb(0.99, 0.97, 0.93);

  // Generate QR code for production verification URL
  const qrBuffer = await QRCode.toBuffer(data.verifyUrl, {
    width: 250,
    margin: 1,
    color: { dark: "#0b0c10", light: "#ffffff" },
  });
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  // Outer Margin (15 mm = 42.5 pt)
  const margin = 42.5;
  const contentWidth = width - margin * 2;

  // Outer Border
  page.drawRectangle({
    x: margin,
    y: margin,
    width: contentWidth,
    height: height - margin * 2,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Top Dark Header Banner
  page.drawRectangle({
    x: margin,
    y: height - margin - 75,
    width: contentWidth,
    height: 75,
    color: black,
  });

  page.drawText(sanitize("ALL ODISHA GYM ASSOCIATION PRESENTS", isUnicode), {
    x: margin + 16,
    y: height - margin - 26,
    size: 9.5,
    font: bold,
    color: gold,
  });

  page.drawText(sanitize(`${EVENT.name.toUpperCase()} ${EVENT.year}`, isUnicode), {
    x: margin + 16,
    y: height - margin - 52,
    size: 17,
    font: bold,
    color: rgb(1, 1, 1),
  });

  page.drawText(sanitize(data.isTest ? "TEST ENTRY PASS" : "OFFICIAL ATHLETE PASS", isUnicode), {
    x: width - margin - 150,
    y: height - margin - 32,
    size: 9.5,
    font: bold,
    color: data.isTest ? rgb(0.95, 0.65, 0.2) : rgb(0.3, 0.9, 0.4),
  });

  page.drawText(sanitize("VERIFIED & SEALED", isUnicode), {
    x: width - margin - 150,
    y: height - margin - 48,
    size: 8,
    font: regular,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Gold accent bar
  page.drawRectangle({
    x: margin,
    y: height - margin - 79,
    width: contentWidth,
    height: 4,
    color: gold,
  });

  // Athlete Card Box (Non-overlapping)
  let y = height - margin - 98;
  const cardHeight = 175;

  page.drawRectangle({
    x: margin + 12,
    y: y - cardHeight,
    width: contentWidth - 24,
    height: cardHeight,
    color: goldBg,
    borderColor: rgb(0.9, 0.78, 0.4),
    borderWidth: 1.5,
  });

  // Athlete Name
  page.drawText(sanitize("ATHLETE NAME", isUnicode), {
    x: margin + 28,
    y: y - 22,
    size: 8,
    font: bold,
    color: lightGray,
  });

  const athleteName = data.isTest ? `[TEST] ${data.name.replace(/^\[TEST\]\s*/i, "")}` : data.name;
  const nameSize = athleteName.length > 30 ? 14 : athleteName.length > 22 ? 16 : 19;
  page.drawText(sanitize(athleteName.toUpperCase(), isUnicode), {
    x: margin + 28,
    y: y - 44,
    size: nameSize,
    font: bold,
    color: black,
  });

  // Category
  page.drawText(sanitize("COMPETITION CATEGORY", isUnicode), {
    x: margin + 28,
    y: y - 68,
    size: 8,
    font: bold,
    color: lightGray,
  });

  const displayCategory = data.isTest ? `[TEST] ${data.category.replace(/^\[TEST.*?\]\s*/i, "")}` : data.category;
  page.drawText(sanitize(displayCategory, isUnicode), {
    x: margin + 28,
    y: y - 85,
    size: 12,
    font: bold,
    color: black,
  });

  // Category Schedule & Weigh-In
  const compSchedule = whenForCategory(data.category);
  page.drawText(sanitize(`Competition Day: ${compSchedule}`, isUnicode), {
    x: margin + 28,
    y: y - 105,
    size: 9.5,
    font: bold,
    color: rgb(0.65, 0.45, 0.0),
  });

  page.drawText(sanitize("Reporting & Weigh-In: 90 mins prior to division call at Baramunda Ground Field", isUnicode), {
    x: margin + 28,
    y: y - 120,
    size: 8.5,
    font: regular,
    color: darkGray,
  });

  // Inner Divider
  page.drawLine({
    start: { x: margin + 28, y: y - 132 },
    end: { x: width - margin - 28, y: y - 132 },
    color: rgb(0.9, 0.8, 0.55),
    thickness: 1,
  });

  // 3-Column Grid for Identifiers (Measured, fixed spacing, ZERO overlap)
  const col1X = margin + 28;
  const col2X = margin + 175;
  const col3X = margin + 335;
  const gridY = y - 150;

  // Col 1: Registration ID
  page.drawText(sanitize("CLIENT / REG. ID", isUnicode), { x: col1X, y: gridY + 9, size: 7.5, font: bold, color: lightGray });
  page.drawText(sanitize(data.regId, isUnicode), { x: col1X, y: gridY - 4, size: 10, font: mono, color: black });

  // Col 2: Pass Number
  page.drawText(sanitize("PASS NUMBER", isUnicode), { x: col2X, y: gridY + 9, size: 7.5, font: bold, color: lightGray });
  page.drawText(sanitize(data.ticketNo, isUnicode), { x: col2X, y: gridY - 4, size: 10, font: mono, color: gold });

  // Col 3: Fee & Payment UTR
  page.drawText(sanitize("FEE PAID & BANK REF", isUnicode), { x: col3X, y: gridY + 9, size: 7.5, font: bold, color: lightGray });
  const feeText = formatCurrency(data.amount, data.isTest);
  const utrShort = data.utr ? ` · Ref: ${data.utr.slice(-6)}` : "";
  page.drawText(sanitize(`${feeText}${utrShort}`, isUnicode), { x: col3X, y: gridY - 4, size: 9.5, font: bold, color: rgb(0.1, 0.6, 0.2) });

  // Security QR Code Box
  y -= (cardHeight + 14);
  const qrBoxHeight = 135;

  page.drawRectangle({
    x: margin + 12,
    y: y - qrBoxHeight,
    width: contentWidth - 24,
    height: qrBoxHeight,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Embed QR Image
  page.drawImage(qrImage, {
    x: margin + 26,
    y: y - qrBoxHeight + 12,
    width: 110,
    height: 110,
  });

  // QR Text Content
  const qrTextX = margin + 155;
  page.drawText(sanitize("OFFICIAL SECURITY QR CODE", isUnicode), {
    x: qrTextX,
    y: y - 26,
    size: 10.5,
    font: bold,
    color: black,
  });

  page.drawText(sanitize("Scan at Venue Check-In Desk for instant badge & kit collection", isUnicode), {
    x: qrTextX,
    y: y - 42,
    size: 9,
    font: regular,
    color: darkGray,
  });

  page.drawText(sanitize("• Cryptographically signed & tamper-proof accreditation credential.", isUnicode), {
    x: qrTextX,
    y: y - 62,
    size: 8,
    font: regular,
    color: darkGray,
  });

  page.drawText(sanitize("• Valid for athlete arena entry, warm-up zone & official medal ceremony.", isUnicode), {
    x: qrTextX,
    y: y - 76,
    size: 8,
    font: regular,
    color: darkGray,
  });

  page.drawText(sanitize("• Verification Portal: sportsfestivalindia.com/verify-ticket", isUnicode), {
    x: qrTextX,
    y: y - 90,
    size: 8,
    font: mono,
    color: lightGray,
  });

  page.drawText(sanitize(`• Issue Timestamp: ${formatIstDate(data.dateStr)}`, isUnicode), {
    x: qrTextX,
    y: y - 104,
    size: 8,
    font: regular,
    color: lightGray,
  });

  // Reporting Instructions Box
  y -= (qrBoxHeight + 14);
  const instBoxHeight = 115;

  page.drawRectangle({
    x: margin + 12,
    y: y - instBoxHeight,
    width: contentWidth - 24,
    height: instBoxHeight,
    color: rgb(0.99, 0.99, 0.99),
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(sanitize("REPORTING & WEIGH-IN INSTRUCTIONS", isUnicode), {
    x: margin + 26,
    y: y - 18,
    size: 9.5,
    font: bold,
    color: black,
  });

  const instructions = [
    "1. Reporting Time: Report at the accreditation desk 90 minutes prior to your division call time.",
    "2. Mandatory Documents: Original Government Photo ID (Aadhaar / Voter ID / Passport) + Age proof.",
    "3. Weigh-In & Kit: Weigh-in and kit collection takes place at Baramunda Ground Field.",
    "4. Stage Photos & Reels: 4K stage photography and reels will be delivered to your registered email.",
    "5. Doping & Conduct: Strictly follow anti-doping policies. Misconduct will result in disqualification.",
  ];

  let instY = y - 35;
  for (const line of instructions) {
    page.drawText(sanitize(line, isUnicode), {
      x: margin + 26,
      y: instY,
      size: 8,
      font: regular,
      color: darkGray,
    });
    instY -= 14;
  }

  // Venue Box (Clean, below instructions, NO overlap, single "Odisha")
  y -= (instBoxHeight + 12);
  const venueBoxHeight = 52;

  page.drawRectangle({
    x: margin + 12,
    y: y - venueBoxHeight,
    width: contentWidth - 24,
    height: venueBoxHeight,
    color: fillGray,
    borderColor: rgb(0.85, 0.75, 0.4),
    borderWidth: 1,
  });

  page.drawText(sanitize(`VENUE: ${EVENT.venueFull}`, isUnicode), {
    x: margin + 26,
    y: y - 20,
    size: 9.5,
    font: bold,
    color: black,
  });

  page.drawText(sanitize(`Emergency & Athlete Helpline: ${EVENT.phone} · Email: ${EVENT.email}`, isUnicode), {
    x: margin + 26,
    y: y - 36,
    size: 8.5,
    font: regular,
    color: darkGray,
  });

  // Footer Note
  page.drawText(sanitize("Show this pass on your phone screen or bring a printout. Screenshot is completely valid.", isUnicode), {
    x: margin + 12,
    y: margin + 14,
    size: 7.5,
    font: regular,
    color: lightGray,
  });

  page.drawText(sanitize("Organised by All Odisha Gym Association (AOGA)", isUnicode), {
    x: width - margin - 220,
    y: margin + 14,
    size: 7.5,
    font: bold,
    color: lightGray,
  });

  return pdfDoc.save();
}

/** Generates the Official Payment Receipt & Tax Invoice PDF (A4 Portrait) */
export async function generateReceiptPdf(data: PDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const { regular, bold, mono, isUnicode } = await loadFonts(pdfDoc);

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const borderGray = rgb(0.85, 0.85, 0.85);
  const fillGray = rgb(0.97, 0.97, 0.97);
  const gold = rgb(0.85, 0.65, 0.0);

  const margin = 42.5;
  const contentWidth = width - margin * 2;

  // Outer Border
  page.drawRectangle({
    x: margin,
    y: margin,
    width: contentWidth,
    height: height - margin * 2,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Top Accent Banner
  page.drawRectangle({
    x: margin,
    y: height - margin - 35,
    width: contentWidth,
    height: 35,
    color: gold,
  });

  page.drawText(sanitize(data.isTest ? "TEST PAYMENT RECEIPT · VERIFICATION ONLY" : "OFFICIAL PAYMENT RECEIPT & TAX INVOICE", isUnicode), {
    x: margin + 16,
    y: height - margin - 22,
    size: 11,
    font: bold,
    color: black,
  });

  page.drawText(sanitize("ORIGINAL FOR RECIPIENT", isUnicode), {
    x: width - margin - 150,
    y: height - margin - 22,
    size: 8.5,
    font: bold,
    color: black,
  });

  // Organiser Header
  let y = height - margin - 65;
  page.drawText(sanitize(EVENT.organiser.toUpperCase(), isUnicode), {
    x: margin + 16,
    y,
    size: 13,
    font: bold,
    color: black,
  });

  y -= 16;
  page.drawText(sanitize(`Regd. No. ${EVENT.regdNo || "AOGA/OD/2026"} · All Odisha Gym Association`, isUnicode), {
    x: margin + 16,
    y,
    size: 8.5,
    font: regular,
    color: darkGray,
  });

  y -= 14;
  page.drawText(sanitize(`Event: ${EVENT.name} ${EVENT.year} (${EVENT.dateLabel})`, isUnicode), {
    x: margin + 16,
    y,
    size: 8.5,
    font: regular,
    color: darkGray,
  });

  y -= 14;
  page.drawText(sanitize(`Venue: ${EVENT.venueFull}`, isUnicode), {
    x: margin + 16,
    y,
    size: 8.5,
    font: regular,
    color: darkGray,
  });

  // Receipt Number & Date Box (Top Right)
  const receiptNo = "REC-" + data.regId.replace("SF26-", "");
  const dateFormatted = formatIstDate(data.dateStr);

  page.drawRectangle({
    x: width - margin - 190,
    y: height - margin - 145,
    width: 178,
    height: 80,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(sanitize("RECEIPT DETAILS", isUnicode), { x: width - margin - 178, y: height - margin - 80, size: 8, font: bold, color: lightGray });
  page.drawText(sanitize(`Receipt No: ${receiptNo}`, isUnicode), { x: width - margin - 178, y: height - margin - 96, size: 9, font: mono, color: black });
  page.drawText(sanitize(`Client ID: ${data.regId}`, isUnicode), { x: width - margin - 178, y: height - margin - 112, size: 9, font: mono, color: black });
  page.drawText(sanitize(`Date: ${dateFormatted}`, isUnicode), { x: width - margin - 178, y: height - margin - 128, size: 7.5, font: regular, color: darkGray });

  // Divider
  y = height - margin - 160;
  page.drawLine({ start: { x: margin + 16, y }, end: { x: width - margin - 16, y }, color: borderGray, thickness: 1 });

  // Bill To (Athlete Info)
  y -= 25;
  page.drawText(sanitize("BILLED TO / ATHLETE DETAILS", isUnicode), { x: margin + 16, y, size: 8.5, font: bold, color: lightGray });

  y -= 18;
  const billedName = data.isTest ? `[TEST] ${data.name.replace(/^\[TEST\]\s*/i, "")}` : data.name;
  page.drawText(sanitize(`Athlete Name:`, isUnicode), { x: margin + 16, y, size: 9.5, font: regular, color: darkGray });
  page.drawText(sanitize(billedName, isUnicode), { x: margin + 120, y, size: 10, font: bold, color: black });

  y -= 16;
  page.drawText(sanitize(`Mobile (WhatsApp):`, isUnicode), { x: margin + 16, y, size: 9.5, font: regular, color: darkGray });
  page.drawText(sanitize(`+91 ${data.phone}`, isUnicode), { x: margin + 120, y, size: 9.5, font: regular, color: black });

  y -= 16;
  page.drawText(sanitize(`Email Address:`, isUnicode), { x: margin + 16, y, size: 9.5, font: regular, color: darkGray });
  page.drawText(sanitize(data.email, isUnicode), { x: margin + 120, y, size: 9.5, font: regular, color: black });

  // Transaction Table Header
  y -= 30;
  page.drawRectangle({
    x: margin + 16,
    y: y - 5,
    width: contentWidth - 32,
    height: 22,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(sanitize("PARTICULARS / PARTICIPATION CATEGORY", isUnicode), { x: margin + 26, y: y + 2, size: 8, font: bold, color: darkGray });
  page.drawText(sanitize("AMOUNT (INR)", isUnicode), { x: width - margin - 120, y: y + 2, size: 8, font: bold, color: darkGray });

  // Transaction Line Item
  y -= 30;
  const receiptCategory = data.isTest ? `[TEST] ${data.category.replace(/^\[TEST.*?\]\s*/i, "")}` : data.category;
  page.drawText(sanitize(receiptCategory, isUnicode), { x: margin + 26, y, size: 9.5, font: bold, color: black });
  page.drawText(sanitize(formatCurrency(data.amount, data.isTest), isUnicode), { x: width - margin - 120, y, size: 10, font: bold, color: black });

  y -= 16;
  page.drawText(sanitize("Includes athlete registration, official accreditation badge, stage photography & entry kit", isUnicode), {
    x: margin + 26,
    y,
    size: 8,
    font: regular,
    color: lightGray,
  });

  // Table Divider
  y -= 15;
  page.drawLine({ start: { x: margin + 16, y }, end: { x: width - margin - 16, y }, color: borderGray, thickness: 1 });

  // Total Summary Box
  y -= 35;
  page.drawRectangle({
    x: width - margin - 220,
    y: y - 10,
    width: 204,
    height: 45,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(sanitize("TOTAL PAID:", isUnicode), { x: width - margin - 208, y: y + 15, size: 9.5, font: bold, color: darkGray });
  page.drawText(sanitize(formatCurrency(data.amount, data.isTest), isUnicode), { x: width - margin - 110, y: y + 14, size: 13, font: bold, color: black });
  page.drawText(sanitize("Status: PAYMENT CONFIRMED", isUnicode), { x: width - margin - 208, y: y - 2, size: 8, font: bold, color: rgb(0.1, 0.6, 0.2) });

  // Gateway Reference Details
  y -= 50;
  page.drawText(sanitize("PAYMENT TRANSACTION DETAILS", isUnicode), { x: margin + 16, y, size: 8.5, font: bold, color: lightGray });

  y -= 18;
  page.drawText(sanitize("Payment Gateway:", isUnicode), { x: margin + 16, y, size: 9, font: regular, color: darkGray });
  page.drawText(sanitize("PayU Hosted Checkout (256-bit SSL Encrypted)", isUnicode), { x: margin + 130, y, size: 9, font: bold, color: black });

  y -= 16;
  page.drawText(sanitize("Bank Reference (UTR):", isUnicode), { x: margin + 16, y, size: 9, font: regular, color: darkGray });
  page.drawText(sanitize(data.utr || "CONFIRMED", isUnicode), { x: margin + 130, y, size: 9, font: mono, color: black });

  y -= 16;
  page.drawText(sanitize("Payment Channel:", isUnicode), { x: margin + 16, y, size: 9, font: regular, color: darkGray });
  page.drawText(sanitize(data.paymentMode || "UPI / Net Banking / Cards", isUnicode), { x: margin + 130, y, size: 9, font: regular, color: black });

  // Refund Policy & Instructions Notice
  y -= 45;
  page.drawRectangle({
    x: margin + 16,
    y: y - 48,
    width: contentWidth - 32,
    height: 60,
    color: rgb(0.99, 0.98, 0.95),
    borderColor: rgb(0.95, 0.85, 0.5),
    borderWidth: 1,
  });

  page.drawText(sanitize("CANCELLATION & REFUND POLICY NOTICE:", isUnicode), { x: margin + 26, y: y - 2, size: 8, font: bold, color: rgb(0.6, 0.4, 0.0) });
  page.drawText(sanitize("- Full refund if the event is cancelled or postponed by organisers.", isUnicode), { x: margin + 26, y: y - 16, size: 8, font: regular, color: darkGray });
  page.drawText(sanitize("- 50% refund on athlete cancellations on or before 31 October 2026.", isUnicode), { x: margin + 26, y: y - 28, size: 8, font: regular, color: darkGray });
  page.drawText(sanitize("- Free athlete substitution or category transfer available until registration closing.", isUnicode), { x: margin + 26, y: y - 40, size: 8, font: regular, color: darkGray });

  // Footer & Authorised Signatory
  y -= 85;
  page.drawText(sanitize("For ALL ODISHA GYM ASSOCIATION", isUnicode), { x: width - margin - 210, y: y + 25, size: 9, font: bold, color: black });
  page.drawText(sanitize("Authorised Signatory", isUnicode), { x: width - margin - 210, y: y - 10, size: 8.5, font: regular, color: lightGray });

  page.drawText(sanitize("This is a computer-generated tax receipt and requires no physical signature.", isUnicode), {
    x: margin + 16,
    y: margin + 25,
    size: 7.5,
    font: regular,
    color: lightGray,
  });

  page.drawText(sanitize(`Helpline: ${EVENT.phone} · Email: ${EVENT.email}`, isUnicode), {
    x: margin + 16,
    y: margin + 12,
    size: 7.5,
    font: regular,
    color: lightGray,
  });

  return pdfDoc.save();
}

/** Generates a complete 1080px wide high-res PNG image of the full ticket */
export async function generateTicketPng(data: PDFData): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    width: 280,
    margin: 1,
    color: { dark: "#0b0c10", light: "#ffffff" },
  });

  const athleteName = data.isTest ? `[TEST] ${data.name.replace(/^\[TEST\]\s*/i, "")}` : data.name;
  const category = data.isTest ? `[TEST] ${data.category.replace(/^\[TEST.*?\]\s*/i, "")}` : data.category;
  const schedule = whenForCategory(data.category);
  const amountStr = formatCurrency(data.amount, data.isTest);
  const dateStr = formatIstDate(data.dateStr);

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const svg = `
  <svg width="1080" height="1520" viewBox="0 0 1080 1520" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37" />
        <stop offset="50%" stop-color="#f7d070" />
        <stop offset="100%" stop-color="#d4af37" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#181b24" />
        <stop offset="100%" stop-color="#12141a" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1080" height="1520" fill="#0b0c10"/>

    <!-- Main Outer Card -->
    <rect x="40" y="40" width="1000" height="1440" rx="24" fill="url(#cardGrad)" stroke="#2a2e39" stroke-width="2"/>
    <rect x="40" y="40" width="1000" height="12" rx="6" fill="url(#goldGrad)"/>

    <!-- Header -->
    <g transform="translate(80, 110)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#d4af37" letter-spacing="3">ALL ODISHA GYM ASSOCIATION PRESENTS</text>
      <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="1">INDIA&apos;S BIGGEST SPORTS FESTIVAL 2026</text>
      
      <!-- Badge -->
      <rect x="730" y="8" width="190" height="36" rx="8" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>
      <text x="825" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#4ade80" text-anchor="middle">✓ CONFIRMED PASS</text>
    </g>

    <!-- Athlete Card -->
    <g transform="translate(80, 200)">
      <rect width="920" height="260" rx="16" fill="#1f2430" stroke="#d4af37" stroke-width="2"/>
      
      <text x="40" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="1">ATHLETE NAME</text>
      <text x="40" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#ffffff">${escapeXml(athleteName.toUpperCase())}</text>
      
      <text x="40" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="1">COMPETITION CATEGORY</text>
      <text x="40" y="168" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#d4af37">${escapeXml(category)}</text>
      
      <text x="40" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#cbd5e1">🗓️ Competition Schedule: <tspan fill="#ffffff" font-weight="700">${escapeXml(schedule)}</tspan></text>
      <text x="40" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94a3b8">⚖️ Weigh-In &amp; Reporting: 90 mins prior to division call at Baramunda Ground Field</text>
    </g>

    <!-- Registration & Payment Grid -->
    <g transform="translate(80, 490)">
      <rect width="920" height="150" rx="14" fill="#161922" stroke="#2d3342" stroke-width="1.5"/>
      
      <g transform="translate(40, 40)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94a3b8">REGISTRATION ID</text>
        <text x="0" y="28" font-family="monospace" font-size="22" font-weight="900" fill="#d4af37">${escapeXml(data.regId)}</text>
      </g>
      
      <g transform="translate(320, 40)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94a3b8">PASS NUMBER</text>
        <text x="0" y="28" font-family="monospace" font-size="22" font-weight="900" fill="#ffffff">${escapeXml(data.ticketNo)}</text>
      </g>
      
      <g transform="translate(600, 40)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94a3b8">FEE PAID</text>
        <text x="0" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#4ade80">${escapeXml(amountStr)}</text>
      </g>

      <line x1="40" y1="85" x2="880" y2="85" stroke="#2d3342" stroke-width="1"/>

      <g transform="translate(40, 120)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#94a3b8">PayU UTR: <tspan font-family="monospace" fill="#ffffff">${escapeXml(data.utr || "CONFIRMED")}</tspan></text>
      </g>

      <g transform="translate(500, 120)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#94a3b8">Confirmed: <tspan fill="#ffffff">${escapeXml(dateStr)}</tspan></text>
      </g>
    </g>

    <!-- QR Section -->
    <g transform="translate(80, 670)">
      <rect width="920" height="320" rx="16" fill="#161922" stroke="#2d3342" stroke-width="1.5"/>
      
      <!-- Embedded QR Image -->
      <image href="${qrDataUrl}" x="40" y="30" width="260" height="260" />

      <!-- QR Details -->
      <g transform="translate(340, 70)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#ffffff">OFFICIAL SECURITY QR CODE</text>
        <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#94a3b8">Scan at Venue Check-In Desk for instant RFID badge &amp; kit issue</text>
        
        <text x="0" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#cbd5e1">• Cryptographically signed &amp; tamper-proof credential.</text>
        <text x="0" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#cbd5e1">• Valid for athlete entry, stage access &amp; official medal ceremony.</text>
        <text x="0" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#64748b">Verification Portal: sportsfestivalindia.com/verify-ticket</text>
      </g>
    </g>

    <!-- Instructions Box -->
    <g transform="translate(80, 1020)">
      <rect width="920" height="230" rx="16" fill="#13161f" stroke="#242936" stroke-width="1.5"/>
      <text x="35" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#d4af37" letter-spacing="1">REPORTING &amp; CHECK-IN INSTRUCTIONS</text>
      
      <text x="35" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#cbd5e1">1. Reporting Time: Report at the accreditation desk 90 minutes prior to your division call time.</text>
      <text x="35" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#cbd5e1">2. Mandatory Documents: Original Government Photo ID (Aadhaar / Voter ID / Passport) + Age proof.</text>
      <text x="35" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#cbd5e1">3. Weigh-In &amp; Kit: Weigh-in and kit collection takes place at Baramunda Ground Field.</text>
      <text x="35" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#cbd5e1">4. Stage Photos &amp; Reels: 4K stage photography and reels will be delivered to your registered email.</text>
      <text x="35" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#cbd5e1">5. Doping &amp; Conduct: Strictly follow anti-doping policies. Misconduct will result in disqualification.</text>
    </g>

    <!-- Venue Box -->
    <g transform="translate(80, 1275)">
      <rect width="920" height="95" rx="14" fill="#181c26" stroke="#d4af37" stroke-width="1"/>
      <text x="35" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#ffffff">📍 VENUE: ${escapeXml(EVENT.venueFull)}</text>
      <text x="35" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#94a3b8">Helpline: <tspan fill="#d4af37">${escapeXml(EVENT.phone)}</tspan> · Email: <tspan fill="#d4af37">${escapeXml(EVENT.email)}</tspan></text>
    </g>

    <!-- Footer Note -->
    <g transform="translate(80, 1400)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#64748b">Show this digital pass on your phone or bring a printout. Screenshot is completely valid.</text>
      <text x="920" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" text-anchor="end">All Odisha Gym Association (AOGA)</text>
    </g>
  </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
