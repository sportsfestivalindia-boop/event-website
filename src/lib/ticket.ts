// Server only. Tickets are sealed (AES-256-GCM) with ADMIN_KEY, so a ticket link can't be faked or edited, and
// personal details never sit readable in the URL. The ticket number is derived from the UTR, so one payment = one ticket.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type Ticket = {
  t: string; // ticket number
  n: string; // athlete name
  c: string; // category label
  w: string; // competition day(s)
  a: number; // amount paid (₹)
  u: string; // UTR
  r?: string; // registration ID
  i: string; // issued (ISO)
};

const secret = () => {
  const k = process.env.ADMIN_KEY;
  return k && k.length >= 12 ? k : null;
};
const aesKey = (k: string) => createHash("sha256").update("ticket:" + k).digest();

export const ticketReady = () => secret() !== null;

/** Staff password check (constant-time). */
export function isAdmin(key: unknown) {
  const k = secret();
  if (!k || typeof key !== "string") return false;
  const a = Buffer.from(createHash("sha256").update(key).digest("hex")),
    b = Buffer.from(createHash("sha256").update(k).digest("hex"));
  return timingSafeEqual(a, b);
}

export function ticketNo(utr: string) {
  return "SFT-" + createHmac("sha256", secret()!).update(utr).digest("hex").slice(0, 8).toUpperCase();
}

export function seal(t: Ticket) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", aesKey(secret()!), iv);
  const body = Buffer.concat([c.update(JSON.stringify(t), "utf8"), c.final()]);
  return Buffer.concat([iv, body, c.getAuthTag()]).toString("base64url");
}

export function unseal(token: string): Ticket | null {
  const k = secret();
  if (!k) return null;
  try {
    const raw = Buffer.from(token, "base64url");
    const d = createDecipheriv("aes-256-gcm", aesKey(k), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(raw.length - 16));
    return JSON.parse(Buffer.concat([d.update(raw.subarray(12, raw.length - 16)), d.final()]).toString("utf8")) as Ticket;
  } catch {
    return null;
  }
}
