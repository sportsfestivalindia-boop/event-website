import { toSheet } from "@/lib/sheet";

export function parseBankSms(text: string): { amount: number; utr: string; payer: string } {
  if (!text) return { amount: 0, utr: "", payer: "" };

  // 1. Amount Extraction (supports Rs. 1,000, INR 1000, ₹1000, credited with 1000, etc.)
  const amtMatch =
    text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/credited\s+(?:with|by)\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/(?:received|deposited)\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i);

  let amount = 0;
  if (amtMatch) {
    amount = parseFloat(amtMatch[1].replace(/,/g, ""));
  }

  // 2. 12-digit UPI / IMPS Ref / UTR
  const utrMatch =
    text.match(/(?:UPI(?:\s*ref(?:\s*no\.?)?|\s*txn(?:\s*id)?|\s*id)?|ref(?:\s*no\.?)?|UTR|rrn|txn(?:\s*id)?)\s*[:#-]?\s*([0-9]{12})/i) ||
    text.match(/\b([0-9]{12})\b/);

  const utr = utrMatch ? utrMatch[1] : "";

  // 3. Payer Name or VPA
  const payerMatch =
    text.match(/(?:from|payer[:\s]|remitter[:\s])\s+([A-Za-z0-9@._\s]+?)(?:\s+on|\s+via|\s+to|\s+ref|\.|\s*$)/i);

  const payer = payerMatch ? payerMatch[1].trim() : "";

  return { amount, utr, payer };
}

export async function GET() {
  return Response.json({
    status: "active",
    endpoint: "Bank SMS Parser & Sheet Sync Webhook",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let data: Record<string, unknown> = {};

    try {
      data = JSON.parse(rawBody);
    } catch {
      // In case sent as query / form text
      data = { text: rawBody };
    }

    const text = String(data.text ?? data.message ?? data.body ?? rawBody ?? "").trim();
    const from = String(data.from ?? data.sender ?? "SMS Forwarder").trim();

    // Health / connectivity test from SMS Forwarder app
    const lower = text.toLowerCase();
    const isTestMessage =
      !text ||
      lower === "test" ||
      lower.includes("test") ||
      lower.includes("sms forwarder") ||
      lower.includes("sample") ||
      text.includes("%text%");

    if (isTestMessage && !/^\d{12}$/.test(text)) {
      return Response.json({
        ok: true,
        message: "SMS Forwarder Webhook is connected and working perfectly!",
      });
    }

    const parsed = parseBankSms(text);

    // If valid bank credit with 12-digit UTR and positive amount
    if (parsed.amount > 0 && /^\d{12}$/.test(parsed.utr)) {
      const sheetRes = await toSheet("bank", {
        amount: parsed.amount,
        utr: parsed.utr,
        payer: parsed.payer,
        source: `SMS ${from}`,
        raw: text.slice(0, 500),
      });

      console.log(`[Bank SMS Webhook] Added credit: ₹${parsed.amount}, UTR: ${parsed.utr}, Payer: ${parsed.payer}`);

      return Response.json({
        ok: true,
        amount: parsed.amount,
        utr: parsed.utr,
        payer: parsed.payer,
        sheet: sheetRes,
      });
    }

    // Fallback if SMS didn't match standard bank pattern
    console.warn(`[Bank SMS Webhook] Could not parse amount/UTR from: "${text}"`);
    return Response.json({
      ok: false,
      error: "Could not find amount or 12-digit UTR in SMS text.",
      receivedText: text,
    });
  } catch (err) {
    console.error("[Bank SMS Webhook Error]:", err);
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

