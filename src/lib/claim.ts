// Browser: ask /api/claim every 9 s (≈3 min) until Yes Bank's alert for the UTR has arrived and the ticket is issued.
export type Claim = { verified?: boolean; pending?: boolean; ticketUrl?: string | null; ticketNo?: string };

/** The ticket once the bank confirms; null if it hasn't within ~3 min (it's saved — Make or staff finish it). Throws the API's message. */
export async function waitForTicket(body: { regId?: string; phone?: string; utr: string }): Promise<Claim | null> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch("/api/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const c = (await res.json()) as Claim & { error?: string };
    if (!res.ok) throw new Error(c.error ?? "Something went wrong. Please try again.");
    if (c.verified) return c;
    await new Promise((r) => setTimeout(r, 9000));
  }
  return null;
}
