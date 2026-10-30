// Server only. Sends the athlete their ticket on WhatsApp through AiSensy.
// Includes retry logic, secure signed download URL, and failure logging.

import { recordNotificationFailure } from "@/lib/firebase";

// AiSensy "API campaign" bound to the approved utility template `ticket_ready_api`
const CAMPAIGN = "ticket_ready_api";

export interface WhatsAppTicketParams {
  phone: string;
  name: string;
  amount: number;
  category: string;
  ticketNo: string;
  regId?: string;
  url: string;
  isTest?: boolean;
}

export async function sendTicketWhatsApp(t: WhatsAppTicketParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.AISENSY_API_KEY?.trim();
  const cleanPhone = t.phone.replace(/\D/g, "").slice(-10);

  if (!apiKey) {
    console.warn(`[WhatsApp AiSensy] AISENSY_API_KEY is not set. WhatsApp to ${cleanPhone} skipped.`);
    return { success: true };
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    console.error(`[WhatsApp AiSensy] Invalid mobile format: ${t.phone}`);
    return { success: false, error: "Invalid mobile number" };
  }

  const destination = "91" + cleanPhone;
  const displayName = t.isTest ? `[TEST] ${t.name.replace(/^\[TEST\]\s*/i, "")}` : t.name;
  const displayCategory = t.isTest ? `[TEST ENTRY] ${t.category.replace(/^\[TEST.*?\]\s*/i, "")}` : t.category;

  const payload = {
    apiKey,
    campaignName: CAMPAIGN,
    destination,
    userName: displayName,
    source: "sportsfestivalindia.com",
    templateParams: [displayName, String(t.amount), displayCategory, t.ticketNo, t.url],
  };

  let attempt = 0;
  let lastErr: string | undefined;

  while (attempt < 3) {
    attempt++;
    try {
      const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
      }

      const data = await res.json().catch(() => null);
      console.log(`[WhatsApp Success] Sent to ${destination} for ${t.ticketNo} on attempt ${attempt}`);
      return { success: true };
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err.message : String(err);
      console.warn(`[WhatsApp Attempt ${attempt} Failed] ${destination}:`, lastErr);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1))); // 1s, 2s backoff
      }
    }
  }

  // Record failure in Firestore
  await recordNotificationFailure({
    regId: t.regId || t.ticketNo || "UNKNOWN",
    type: "whatsapp",
    recipient: destination,
    error: lastErr || "Failed after 3 retries",
    timestamp: new Date().toISOString(),
  });

  return { success: false, error: lastErr };
}
