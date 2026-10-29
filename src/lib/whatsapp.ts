// Server only. Sends the athlete their ticket on WhatsApp from +91 80189 58655 through AiSensy (official WhatsApp API in
// coexistence — the phone app keeps working). Off until AISENSY_API_KEY is set in Vercel. Never throws: the ticket is
// already on screen and in the email, WhatsApp is a bonus copy.

// AiSensy "API campaign" bound to the approved utility template `ticket_ready`, whose body uses {{1}}–{{5}} in this order.
const CAMPAIGN = "ticket_ready_api";

export async function sendTicketWhatsApp(t: {
  phone: string;
  name: string;
  amount: number;
  category: string;
  ticketNo: string;
  url: string;
  isTest?: boolean;
}) {
  const apiKey = process.env.AISENSY_API_KEY?.trim();
  if (!apiKey || !/^[6-9]\d{9}$/.test(t.phone)) return false;
  try {
    const displayName = t.isTest ? `[TEST] ${t.name.replace(/^\[TEST\]\s*/i, "")}` : t.name;
    const displayCategory = t.isTest ? `[TEST ENTRY] ${t.category.replace(/^\[TEST.*?\]\s*/i, "")}` : t.category;
    const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        campaignName: CAMPAIGN,
        destination: "91" + t.phone,
        userName: displayName,
        source: "sportsfestivalindia.com",
        templateParams: [displayName, String(t.amount), displayCategory, t.ticketNo, t.url],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`WhatsApp ticket ${t.ticketNo}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    return res.ok;
  } catch (e) {
    console.error(`WhatsApp ticket ${t.ticketNo}:`, e);
    return false;
  }
}
