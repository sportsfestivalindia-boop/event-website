import fs from "node:fs";
import path from "node:path";
import { generateTicketPdf, generateReceiptPdf, PDFData } from "../src/lib/pdf";

async function testUnicode() {
  const athlete: PDFData = {
    regId: "SF26-U89A12",
    ticketNo: "SFT-88B12C",
    name: "ଅଦିତି ସିଂହ (Aditi Singh)",
    phone: "9778803677",
    email: "aditi@example.com",
    category: "Bodybuilding & Physique · Men's Bodybuilding · 55 kg",
    amount: 5000,
    utr: "123456789012",
    dateStr: "30 Oct 2026, 03:00 PM IST",
    paymentMode: "UPI / Net Banking",
    verifyUrl: "https://sportsfestivalindia.com/verify-ticket/sample-token",
    isTest: false,
  };

  const tBytes = await generateTicketPdf(athlete);
  const rBytes = await generateReceiptPdf(athlete);
  console.log("Unicode Odia + Hindi Ticket PDF generated, bytes:", tBytes.length);
  console.log("Unicode Odia + Hindi Receipt PDF generated, bytes:", rBytes.length);
}

testUnicode().catch(console.error);

