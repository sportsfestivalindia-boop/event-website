import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { generateTicketPdf, generateReceiptPdf, generateTicketPng, PDFData } from "../src/lib/pdf";

async function run() {
  const outDir = path.join(process.cwd(), "public", "generated-samples");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const realAthlete: PDFData = {
    regId: "SF26-A4C890",
    ticketNo: "SFT-77F821",
    name: "Samaira Pradhan Mohapatra",
    phone: "9778803677",
    email: "athlete@sportsfestivalindia.com",
    category: "Bodybuilding & Physique · Men's Bodybuilding · 55 kg",
    amount: 5000,
    utr: "123456789012",
    dateStr: "30 Oct 2026, 03:00 PM IST",
    paymentMode: "UPI / Net Banking",
    verifyUrl: "https://sportsfestivalindia.com/verify-ticket/sample-token-123",
    isTest: false,
  };

  console.log("Generating Official Ticket PDF...");
  const ticketPdfBytes = await generateTicketPdf(realAthlete);
  const ticketPdfPath = path.join(outDir, "Sample-Ticket.pdf");
  fs.writeFileSync(ticketPdfPath, Buffer.from(ticketPdfBytes));
  console.log("Ticket PDF written to:", ticketPdfPath);

  console.log("Generating Official Receipt PDF...");
  const receiptPdfBytes = await generateReceiptPdf(realAthlete);
  const receiptPdfPath = path.join(outDir, "Sample-Receipt.pdf");
  fs.writeFileSync(receiptPdfPath, Buffer.from(receiptPdfBytes));
  console.log("Receipt PDF written to:", receiptPdfPath);

  console.log("Generating Full Ticket PNG (1080px)...");
  const ticketPngBuffer = await generateTicketPng(realAthlete);
  const ticketPngPath = path.join(outDir, "AOGA2026-Ticket-SF26-A4C890.png");
  fs.writeFileSync(ticketPngPath, ticketPngBuffer);
  console.log("Ticket PNG written to:", ticketPngPath);

  try {
    const pdfPreviewPath = path.join(outDir, "Ticket-PDF-Page1-Preview.png");
    await sharp(ticketPdfPath, { density: 150 })
      .png()
      .toFile(pdfPreviewPath);
    console.log("PDF page rendered to preview PNG at:", pdfPreviewPath);
  } catch (e) {
    console.warn("PDF preview render via sharp note:", (e as Error).message);
  }

  console.log("All sample documents generated successfully!");
}

run().catch(console.error);
