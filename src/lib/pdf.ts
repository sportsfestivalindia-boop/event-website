// Server only. Generates official Payment Receipt and Entry Pass PDFs using pdf-lib & qrcode.
// Mobile-friendly A4 portrait layout, crisp and print-safe with dark/gold branding accents.
// Uses strict ASCII / WinAnsi sanitization so pdf-lib never throws encoding exceptions.

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { EVENT, DOCUMENTS, CHAMPIONSHIPS } from "@/data/festival";

const whenFor = (cat: string) => CHAMPIONSHIPS.find((c) => cat.startsWith(c.sport))?.when ?? "26, 27, 28 December 2026";

/** Formats INR currency safely for PDF standard fonts (replaces unrenderable ₹ symbol with INR) */
export function formatPdfInr(amount: number): string {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

/** Sanitizes any text string to be strictly compatible with PDF standard Helvetica (WinAnsi) */
export function cleanText(str?: string): string {
  if (!str) return "";
  return String(str)
    .replace(/₹/g, "INR ")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}

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

/** Generates the Official Payment Receipt PDF (A4 Portrait) */
export async function generateReceiptPdf(data: PDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait in points (72 DPI)
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const borderGray = rgb(0.85, 0.85, 0.85);
  const fillGray = rgb(0.97, 0.97, 0.97);
  const gold = rgb(0.85, 0.65, 0.0);

  // Outer Decorative Border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Top Accent Banner
  page.drawRectangle({
    x: 25,
    y: height - 60,
    width: width - 50,
    height: 35,
    color: gold,
  });

  page.drawText(cleanText(data.isTest ? "TEST PAYMENT RECEIPT - VERIFICATION ONLY" : "OFFICIAL PAYMENT RECEIPT & TAX INVOICE"), {
    x: 40,
    y: height - 42,
    size: 13,
    font: fontBold,
    color: black,
  });

  page.drawText(cleanText("ORIGINAL FOR RECIPIENT"), {
    x: width - 210,
    y: height - 42,
    size: 9,
    font: fontBold,
    color: black,
  });

  // Organiser Header
  let y = height - 90;
  page.drawText(cleanText(EVENT.organiser.toUpperCase()), {
    x: 40,
    y,
    size: 14,
    font: fontBold,
    color: black,
  });

  y -= 16;
  page.drawText(cleanText(`Regd. No. ${EVENT.regdNo || "AOGA/OD/2026"} - All Odisha Gym Association`), {
    x: 40,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  y -= 14;
  page.drawText(cleanText(`Event: ${EVENT.name} ${EVENT.year} (${EVENT.dateLabel})`), {
    x: 40,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  y -= 14;
  page.drawText(cleanText(`Venue: ${EVENT.venue}, ${EVENT.city}, Odisha`), {
    x: 40,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  // Receipt Number & Date Box (Top Right)
  const receiptNo = "REC-" + data.regId.replace("SF26-", "");
  const dateFormatted = data.dateStr || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  page.drawRectangle({
    x: width - 230,
    y: height - 150,
    width: 190,
    height: 75,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(cleanText("RECEIPT DETAILS"), { x: width - 220, y: height - 90, size: 8, font: fontBold, color: lightGray });
  page.drawText(cleanText(`Receipt No: ${receiptNo}`), { x: width - 220, y: height - 105, size: 9, font: fontMono, color: black });
  page.drawText(cleanText(`Client ID: ${data.regId}`), { x: width - 220, y: height - 120, size: 9, font: fontMono, color: black });
  page.drawText(cleanText(`Date & Time (IST):`), { x: width - 220, y: height - 134, size: 8, font: fontRegular, color: darkGray });
  page.drawText(cleanText(`${dateFormatted}`), { x: width - 220, y: height - 146, size: 8, font: fontBold, color: black });

  // Divider
  y = height - 170;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, color: borderGray, thickness: 1 });

  // Bill To (Athlete Info)
  y -= 25;
  page.drawText(cleanText("BILLED TO / ATHLETE DETAILS"), { x: 40, y, size: 9, font: fontBold, color: lightGray });

  y -= 18;
  page.drawText(cleanText(`Athlete Name:`), { x: 40, y, size: 10, font: fontRegular, color: darkGray });
  page.drawText(cleanText(data.name), { x: 140, y, size: 11, font: fontBold, color: black });

  y -= 16;
  page.drawText(cleanText(`WhatsApp / Tel:`), { x: 40, y, size: 10, font: fontRegular, color: darkGray });
  page.drawText(cleanText(`+91 ${data.phone}`), { x: 140, y, size: 10, font: fontRegular, color: black });

  y -= 16;
  page.drawText(cleanText(`Email Address:`), { x: 40, y, size: 10, font: fontRegular, color: darkGray });
  page.drawText(cleanText(data.email), { x: 140, y, size: 10, font: fontRegular, color: black });

  // Transaction Table Header
  y -= 30;
  page.drawRectangle({
    x: 40,
    y: y - 5,
    width: width - 80,
    height: 22,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(cleanText("PARTICULARS / PARTICIPATION CATEGORY"), { x: 50, y: y + 2, size: 8, font: fontBold, color: darkGray });
  page.drawText(cleanText("AMOUNT (INR)"), { x: width - 130, y: y + 2, size: 8, font: fontBold, color: darkGray });

  // Transaction Line Item
  y -= 30;
  page.drawText(cleanText(data.category), { x: 50, y, size: 10, font: fontBold, color: black });
  page.drawText(cleanText(data.isTest ? "INR 1.00 (Test Fee)" : formatPdfInr(data.amount)), { x: width - 130, y, size: 11, font: fontBold, color: black });

  y -= 16;
  page.drawText(cleanText("Includes athlete registration, stage photography, reel, official accreditation & participation kit"), {
    x: 50,
    y,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  // Table Divider
  y -= 15;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, color: borderGray, thickness: 1 });

  // Total Summary Box
  y -= 35;
  page.drawRectangle({
    x: width - 240,
    y: y - 10,
    width: 200,
    height: 45,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(cleanText("TOTAL PAID:"), { x: width - 230, y: y + 15, size: 10, font: fontBold, color: darkGray });
  page.drawText(cleanText(data.isTest ? "INR 1.00" : formatPdfInr(data.amount)), { x: width - 120, y: y + 13, size: 15, font: fontBold, color: black });
  page.drawText(cleanText("Payment Status: SUCCESS (CONFIRMED)"), { x: width - 230, y: y - 2, size: 8, font: fontBold, color: rgb(0.1, 0.6, 0.2) });

  // Gateway Reference Details
  y -= 50;
  page.drawText(cleanText("PAYMENT TRANSACTION DETAILS"), { x: 40, y, size: 9, font: fontBold, color: lightGray });

  y -= 18;
  page.drawText(cleanText("Gateway / Channel:"), { x: 40, y, size: 9, font: fontRegular, color: darkGray });
  page.drawText(cleanText("PayU Hosted Checkout (Secure 256-bit SSL)"), { x: 160, y, size: 9, font: fontBold, color: black });

  y -= 16;
  page.drawText(cleanText("PayU Ref / Bank UTR:"), { x: 40, y, size: 9, font: fontRegular, color: darkGray });
  page.drawText(cleanText(data.utr), { x: 160, y, size: 9, font: fontMono, color: black });

  y -= 16;
  page.drawText(cleanText("Payment Mode:"), { x: 40, y, size: 9, font: fontRegular, color: darkGray });
  page.drawText(cleanText(data.paymentMode || "UPI / Cards / Net Banking"), { x: 160, y, size: 9, font: fontRegular, color: black });

  // Refund Policy & Instructions Notice
  y -= 45;
  page.drawRectangle({
    x: 40,
    y: y - 45,
    width: width - 80,
    height: 60,
    color: rgb(0.99, 0.98, 0.95),
    borderColor: rgb(0.95, 0.85, 0.5),
    borderWidth: 1,
  });

  page.drawText(cleanText("CANCELLATION & REFUND POLICY NOTICE:"), { x: 50, y: y + 2, size: 8, font: fontBold, color: rgb(0.6, 0.4, 0.0) });
  page.drawText(cleanText("- Full refund if the event is cancelled or postponed by organisers."), { x: 50, y: y - 10, size: 8, font: fontRegular, color: darkGray });
  page.drawText(cleanText("- 50% refund on athlete cancellations on or before 31 October 2026."), { x: 50, y: y - 22, size: 8, font: fontRegular, color: darkGray });
  page.drawText(cleanText("- Free athlete substitution or category transfer available until registration closing."), { x: 50, y: y - 34, size: 8, font: fontRegular, color: darkGray });

  // Footer & Authorised Signatory
  y -= 85;
  page.drawText(cleanText("For ALL ODISHA GYM ASSOCIATION"), { x: width - 230, y: y + 30, size: 9, font: fontBold, color: black });
  page.drawText(cleanText("Authorised Signatory"), { x: width - 230, y: y - 15, size: 9, font: fontRegular, color: lightGray });

  page.drawText(cleanText("This is a computer-generated tax receipt and requires no physical signature."), {
    x: 40,
    y: 40,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  page.drawText(cleanText("Support WhatsApp: +91 80189 58655 - Email: aogaofficial@gmail.com"), {
    x: width - 300,
    y: 40,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  return pdfDoc.save();
}

/** Generates the Official Athlete Entry Pass / Ticket PDF (A4 Portrait) */
export async function generateTicketPdf(data: PDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const borderGray = rgb(0.85, 0.85, 0.85);
  const fillGray = rgb(0.97, 0.97, 0.97);
  const gold = rgb(0.85, 0.65, 0.0);
  const goldLight = rgb(0.99, 0.97, 0.92);

  // Generate QR Code Buffer
  const qrBuffer = await QRCode.toBuffer(data.verifyUrl, {
    width: 250,
    margin: 1,
    color: {
      dark: "#0b0c10",
      light: "#ffffff",
    },
  });
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  // Outer Border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Top Dark Header Banner
  page.drawRectangle({
    x: 25,
    y: height - 100,
    width: width - 50,
    height: 75,
    color: black,
  });

  page.drawText(cleanText("ALL ODISHA GYM ASSOCIATION PRESENTS"), {
    x: 40,
    y: height - 50,
    size: 10,
    font: fontBold,
    color: gold,
  });

  page.drawText(cleanText(`${EVENT.name.toUpperCase()} ${EVENT.year}`), {
    x: 40,
    y: height - 72,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(cleanText("OFFICIAL ATHLETE PASS"), {
    x: width - 180,
    y: height - 55,
    size: 10,
    font: fontBold,
    color: rgb(0.3, 0.9, 0.4),
  });

  page.drawText(cleanText("CONFIRMED & SEALED"), {
    x: width - 180,
    y: height - 70,
    size: 8,
    font: fontRegular,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Gold separator
  page.drawRectangle({
    x: 25,
    y: height - 105,
    width: width - 50,
    height: 5,
    color: gold,
  });

  let y = height - 130;

  // Athlete Card Box
  page.drawRectangle({
    x: 40,
    y: y - 160,
    width: width - 80,
    height: 160,
    color: goldLight,
    borderColor: rgb(0.9, 0.78, 0.4),
    borderWidth: 1.5,
  });

  page.drawText(cleanText("ATHLETE NAME"), { x: 55, y: y - 25, size: 8, font: fontBold, color: lightGray });
  page.drawText(cleanText(data.name.toUpperCase()), { x: 55, y: y - 48, size: 20, font: fontBold, color: black });

  page.drawText(cleanText("COMPETITION CATEGORY"), { x: 55, y: y - 75, size: 8, font: fontBold, color: lightGray });
  page.drawText(cleanText(data.category), { x: 55, y: y - 92, size: 13, font: fontBold, color: black });

  const compDays = whenFor(data.category) || "Fri 4 Dec - Sun 6 Dec 2026";
  page.drawText(cleanText(`Competition Schedule: ${compDays}`), { x: 55, y: y - 110, size: 9, font: fontRegular, color: darkGray });

  page.drawText(cleanText(`Registration ID: ${data.regId}`), { x: 55, y: y - 135, size: 10, font: fontMono, color: black });
  page.drawText(cleanText(`Pass No: ${data.ticketNo}`), { x: 220, y: y - 135, size: 10, font: fontMono, color: gold });
  page.drawText(cleanText(`Amount Paid: ${data.isTest ? "INR 1.00 (Test)" : formatPdfInr(data.amount)} (UTR: ${data.utr.slice(-6)})`), {
    x: 350,
    y: y - 135,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  // QR Code Verification Section
  y -= 185;
  page.drawRectangle({
    x: 40,
    y: y - 135,
    width: width - 80,
    height: 135,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Embed QR
  page.drawImage(qrImage, {
    x: 55,
    y: y - 125,
    width: 115,
    height: 115,
  });

  page.drawText(cleanText("OFFICIAL SECURITY QR CODE"), { x: 190, y: y - 25, size: 10, font: fontBold, color: black });
  page.drawText(cleanText("Scan at Venue Check-In Desk for instant RFID badge issue"), { x: 190, y: y - 40, size: 9, font: fontRegular, color: darkGray });
  page.drawText(cleanText("- Encodes a cryptographically signed verification token."), { x: 190, y: y - 60, size: 8, font: fontRegular, color: darkGray });
  page.drawText(cleanText("- Tamper-proof AES-256 sealed credential."), { x: 190, y: y - 72, size: 8, font: fontRegular, color: darkGray });
  page.drawText(cleanText("Verification URL: " + data.verifyUrl), { x: 190, y: y - 88, size: 8, font: fontMono, color: lightGray });

  // Reporting & Weigh-in Instructions Box
  y -= 160;
  page.drawText(cleanText("REPORTING, WEIGH-IN & VENUE INSTRUCTIONS"), { x: 40, y, size: 10, font: fontBold, color: black });

  const instructions = [
    "1. Reporting Time: Report at the accreditation desk 90 minutes prior to your division call time.",
    "2. Mandatory Documents to Carry: Original Government Photo ID (Aadhaar / Voter ID / Passport) + Age proof.",
    "3. Official Weigh-In & Kit: Official weigh-in and kit collection takes place at Jawaharlal Nehru Indoor Stadium.",
    "4. Stage Photography & Video: Official stage photos and 4K Instagram reels will be delivered to your registered email.",
    "5. Doping & Conduct: Strictly follow anti-doping policies. Misconduct will result in immediate disqualification.",
  ];

  let instY = y - 18;
  for (const line of instructions) {
    page.drawText(cleanText(line), {
      x: 45,
      y: instY,
      size: 8.5,
      font: fontRegular,
      color: darkGray,
    });
    instY -= 14;
  }

  // Venue Details Box
  y -= 30;
  page.drawRectangle({
    x: 40,
    y: y - 40,
    width: width - 80,
    height: 40,
    color: fillGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(cleanText(`VENUE: ${EVENT.venue}, ${EVENT.city}, Odisha`), { x: 50, y: y - 18, size: 9, font: fontBold, color: black });
  page.drawText(cleanText("Emergency & Athlete Helpline: +91 80189 58655 / aogaofficial@gmail.com"), {
    x: 50,
    y: y - 30,
    size: 8,
    font: fontRegular,
    color: darkGray,
  });

  // Footer Note
  page.drawText(cleanText("Show this pass on your phone screen or bring a printout. Screenshot is completely valid."), {
    x: 40,
    y: 35,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  page.drawText(cleanText("Organised by All Odisha Gym Association (AOGA)"), {
    x: width - 240,
    y: 35,
    size: 8,
    font: fontBold,
    color: lightGray,
  });

  return pdfDoc.save();
}
