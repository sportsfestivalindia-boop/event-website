// Server only. Generates official Payment Receipt and Entry Pass PDFs using pdf-lib & qrcode.
// Mobile-friendly A4 portrait layout, crisp and print-safe with dark/gold branding accents.

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { EVENT, DOCUMENTS, CHAMPIONSHIPS } from "@/data/festival";
import { inr } from "@/lib/format";

const whenFor = (cat: string) => CHAMPIONSHIPS.find((c) => cat.startsWith(c.sport))?.when ?? "26, 27, 28 December 2026";

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

  page.drawText(data.isTest ? "TEST PAYMENT RECEIPT — VERIFICATION ONLY" : "OFFICIAL PAYMENT RECEIPT & TAX INVOICE", {
    x: 40,
    y: height - 42,
    size: 13,
    font: fontBold,
    color: black,
  });

  page.drawText("ORIGINAL FOR RECIPIENT", {
    x: width - 210,
    y: height - 42,
    size: 9,
    font: fontBold,
    color: black,
  });

  // Organiser Header
  let y = height - 90;
  page.drawText(EVENT.organiser.toUpperCase(), {
    x: 40,
    y,
    size: 14,
    font: fontBold,
    color: black,
  });

  y -= 16;
  page.drawText(`Regd. No. ${EVENT.regdNo || "AOGA/OD/2026"} · All Odisha Gym Association`, {
    x: 40,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  y -= 14;
  page.drawText(`Event: ${EVENT.name} ${EVENT.year} (${EVENT.dateLabel})`, {
    x: 40,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  y -= 14;
  page.drawText(`Venue: ${EVENT.venue}, ${EVENT.city}, Odisha`, {
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

  page.drawText("RECEIPT DETAILS", { x: width - 220, y: height - 90, size: 8, font: fontBold, color: lightGray });
  page.drawText(`Receipt No: ${receiptNo}`, { x: width - 220, y: height - 105, size: 9, font: fontMono, color: black });
  page.drawText(`Client ID: ${data.regId}`, { x: width - 220, y: height - 120, size: 9, font: fontMono, color: black });
  page.drawText(`Date & Time (IST):`, { x: width - 220, y: height - 134, size: 8, font: fontRegular, color: darkGray });
  page.drawText(`${dateFormatted}`, { x: width - 220, y: height - 146, size: 8, font: fontBold, color: black });

  // Divider
  y = height - 170;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, color: borderGray, thickness: 1 });

  // Bill To (Athlete Info)
  y -= 25;
  page.drawText("BILLED TO / ATHLETE DETAILS", { x: 40, y, size: 9, font: fontBold, color: lightGray });

  y -= 18;
  page.drawText(`Athlete Name:`, { x: 40, y, size: 10, font: fontRegular, color: darkGray });
  page.drawText(data.name, { x: 140, y, size: 11, font: fontBold, color: black });

  y -= 16;
  page.drawText(`WhatsApp / Tel:`, { x: 40, y, size: 10, font: fontRegular, color: darkGray });
  page.drawText(`+91 ${data.phone}`, { x: 140, y, size: 10, font: fontRegular, color: black });

  y -= 16;
  page.drawText(`Email Address:`, { x: 40, y, size: 10, font: fontRegular, color: darkGray });
  page.drawText(data.email, { x: 140, y, size: 10, font: fontRegular, color: black });

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

  page.drawText("PARTICULARS / PARTICIPATION CATEGORY", { x: 50, y: y + 2, size: 8, font: fontBold, color: darkGray });
  page.drawText("AMOUNT (INR)", { x: width - 130, y: y + 2, size: 8, font: fontBold, color: darkGray });

  // Transaction Line Item
  y -= 30;
  page.drawText(data.category, { x: 50, y, size: 10, font: fontBold, color: black });
  page.drawText(data.isTest ? "₹1.00 (Test Fee)" : inr(data.amount), { x: width - 130, y, size: 11, font: fontBold, color: black });

  y -= 16;
  page.drawText("Includes athlete registration, stage photography, reel, official accreditation & participation kit", {
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

  page.drawText("TOTAL PAID:", { x: width - 230, y: y + 15, size: 10, font: fontBold, color: darkGray });
  page.drawText(data.isTest ? "₹1.00" : inr(data.amount), { x: width - 120, y: y + 13, size: 15, font: fontBold, color: black });
  page.drawText("Payment Status: SUCCESS (CONFIRMED)", { x: width - 230, y: y - 2, size: 8, font: fontBold, color: rgb(0.1, 0.6, 0.2) });

  // Gateway Reference Details
  y -= 50;
  page.drawText("PAYMENT TRANSACTION DETAILS", { x: 40, y, size: 9, font: fontBold, color: lightGray });

  y -= 18;
  page.drawText("Gateway / Channel:", { x: 40, y, size: 9, font: fontRegular, color: darkGray });
  page.drawText("PayU Hosted Checkout (Secure 256-bit SSL)", { x: 160, y, size: 9, font: fontBold, color: black });

  y -= 16;
  page.drawText("PayU Ref / Bank UTR:", { x: 40, y, size: 9, font: fontRegular, color: darkGray });
  page.drawText(data.utr, { x: 160, y, size: 9, font: fontMono, color: black });

  y -= 16;
  page.drawText("Payment Mode:", { x: 40, y, size: 9, font: fontRegular, color: darkGray });
  page.drawText(data.paymentMode || "UPI / Cards / Net Banking", { x: 160, y, size: 9, font: fontRegular, color: black });

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

  page.drawText("CANCELLATION & REFUND POLICY NOTICE:", { x: 50, y: y + 2, size: 8, font: fontBold, color: rgb(0.6, 0.4, 0.0) });
  page.drawText("• Full refund if the event is cancelled or postponed by organisers.", { x: 50, y: y - 10, size: 8, font: fontRegular, color: darkGray });
  page.drawText("• 50% refund on athlete cancellations on or before 31 October 2026.", { x: 50, y: y - 22, size: 8, font: fontRegular, color: darkGray });
  page.drawText("• Free athlete substitution or category transfer available until registration closing.", { x: 50, y: y - 34, size: 8, font: fontRegular, color: darkGray });

  // Footer & Authorised Signatory
  y -= 85;
  page.drawText("For ALL ODISHA GYM ASSOCIATION", { x: width - 230, y: y + 30, size: 9, font: fontBold, color: black });
  page.drawText("Authorised Signatory", { x: width - 230, y: y - 15, size: 9, font: fontRegular, color: lightGray });

  page.drawText("This is a computer-generated tax receipt and requires no physical signature.", {
    x: 40,
    y: 40,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  page.drawText("Support WhatsApp: +91 80189 58655 · Email: aogaofficial@gmail.com", {
    x: width - 300,
    y: 40,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  return pdfDoc.save();
}

/** Generates the Official Entry Pass / Ticket PDF with QR (A4 Portrait) */
export async function generateTicketPdf(data: PDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const borderGray = rgb(0.85, 0.85, 0.85);
  const fillGray = rgb(0.97, 0.97, 0.97);
  const gold = rgb(0.88, 0.68, 0.0);
  const goldLight = rgb(0.99, 0.97, 0.92);

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
    color: rgb(0.08, 0.08, 0.08),
  });

  page.drawText("INDIA'S BIGGEST SPORTS FESTIVAL 2026", {
    x: 45,
    y: height - 55,
    size: 15,
    font: fontBold,
    color: gold,
  });

  page.drawText("OFFICIAL ATHLETE COMPETITION PASS & ACCREDITATION", {
    x: 45,
    y: height - 72,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText("DECEMBER 4–6, 2026 · BHUBANESWAR", {
    x: width - 250,
    y: height - 55,
    size: 10,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Test Ticket Banner (if applicable)
  if (data.isTest) {
    page.drawRectangle({
      x: 25,
      y: height - 122,
      width: width - 50,
      height: 22,
      color: rgb(0.9, 0.3, 0.1),
    });
    page.drawText("TEST PASS — LIVE PAYMENT VERIFICATION ONLY (NOT VALID FOR ENTRY)", {
      x: width / 2 - 180,
      y: height - 116,
      size: 9,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  // Generate QR Code image for the verification URL
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    margin: 1,
    width: 400,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  let y = height - (data.isTest ? 150 : 135);

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

  page.drawText("ATHLETE NAME", { x: 55, y: y - 25, size: 8, font: fontBold, color: lightGray });
  page.drawText(data.name.toUpperCase(), { x: 55, y: y - 48, size: 20, font: fontBold, color: black });

  page.drawText("COMPETITION CATEGORY", { x: 55, y: y - 75, size: 8, font: fontBold, color: lightGray });
  page.drawText(data.category, { x: 55, y: y - 92, size: 13, font: fontBold, color: black });

  const compDays = whenFor(data.category) || "Fri 4 Dec – Sun 6 Dec 2026";
  page.drawText(`Competition Schedule: ${compDays}`, { x: 55, y: y - 110, size: 9, font: fontRegular, color: darkGray });

  page.drawText(`Registration ID: ${data.regId}`, { x: 55, y: y - 135, size: 10, font: fontMono, color: black });
  page.drawText(`Pass No: ${data.ticketNo}`, { x: 220, y: y - 135, size: 10, font: fontMono, color: gold });
  page.drawText(`Amount Paid: ${data.isTest ? "₹1.00 (Test)" : inr(data.amount)} (UTR: ${data.utr.slice(-6)})`, {
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

  page.drawText("OFFICIAL SECURITY QR CODE", { x: 190, y: y - 25, size: 10, font: fontBold, color: black });
  page.drawText("Scan at Venue Check-In Desk for instant RFID badge issue", { x: 190, y: y - 40, size: 9, font: fontRegular, color: darkGray });
  page.drawText("• Encodes a cryptographically signed verification token.", { x: 190, y: y - 60, size: 8, font: fontRegular, color: darkGray });
  page.drawText("• Tamper-proof AES-256 sealed credential.", { x: 190, y: y - 72, size: 8, font: fontRegular, color: darkGray });
  page.drawText("• Verification URL: " + data.verifyUrl, { x: 190, y: y - 88, size: 8, font: fontMono, color: lightGray });

  // Reporting & Weigh-in Instructions Box
  y -= 160;
  page.drawText("REPORTING, WEIGH-IN & VENUE INSTRUCTIONS", { x: 40, y, size: 10, font: fontBold, color: black });

  y -= 20;
  const instructions = [
    "1. Reporting Time: Report at the accreditation desk at least 90 minutes before your division's weigh-in / call time.",
    "2. Weigh-in & Stature Measurement: Formal weigh-in takes place on event day morning at the athlete inspection area.",
    "3. Mandatory Documents: Original Government Photo ID (Aadhaar / Passport / Voter ID) + Age Proof Certificate.",
    "4. Athlete Kit: Official festival medal, participation certificate, kit bag, and T-shirt will be handed at check-in.",
    "5. Anti-Doping Regulations: All athletes must adhere to official anti-doping policies and agree to random testing.",
    "6. Photography & Video: Official stage photos and your individual reel will be uploaded within 72 hours.",
  ];

  for (const inst of instructions) {
    page.drawText(inst, { x: 45, y, size: 8, font: fontRegular, color: darkGray });
    y -= 14;
  }

  // Documents to Carry Checklist
  y -= 10;
  page.drawText("MANDATORY DOCUMENTS TO CARRY ON EVENT DAY:", { x: 40, y, size: 9, font: fontBold, color: black });
  y -= 16;
  const docsText = DOCUMENTS.map((d, i) => `[✓] ${d}`).join("    ");
  page.drawText(docsText, { x: 45, y, size: 8, font: fontRegular, color: darkGray });

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

  page.drawText(`VENUE: ${EVENT.venue}, ${EVENT.city}, Odisha`, { x: 50, y: y - 18, size: 9, font: fontBold, color: black });
  page.drawText("Emergency & Athlete Helpline: +91 80189 58655 / aogaofficial@gmail.com", {
    x: 50,
    y: y - 30,
    size: 8,
    font: fontRegular,
    color: darkGray,
  });

  // Footer Note
  page.drawText("Show this pass on your phone screen or bring a printout. Screenshot is completely valid.", {
    x: 40,
    y: 35,
    size: 8,
    font: fontRegular,
    color: lightGray,
  });

  page.drawText("Organised by All Odisha Gym Association (AOGA)", {
    x: width - 240,
    y: 35,
    size: 8,
    font: fontBold,
    color: lightGray,
  });

  return pdfDoc.save();
}
