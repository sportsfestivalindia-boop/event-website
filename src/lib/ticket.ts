// Server only. Tickets are sealed (AES-256-GCM) with ADMIN_KEY, so a ticket link can't be faked or edited, and
// personal details never sit readable in the URL. The ticket number is derived from the UTR, so one payment = one ticket.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { CHAMPIONSHIPS } from "@/data/festival";
import { istNow, toSheet } from "@/lib/sheet";
import { sendTicketWhatsApp } from "@/lib/whatsapp";
import { sendConfirmationEmail } from "@/lib/email";
import { generateDownloadToken } from "@/lib/download-token";
import {
  getRegistrationFromFirestore,
  updateRegistrationInFirestore,
  NotificationInfo,
} from "@/lib/firebase";
import { after } from "next/server";

export type Ticket = {
  t: string; // ticket number
  n: string; // athlete name
  c: string; // category label
  w: string; // competition day(s)
  a: number; // amount paid (₹)
  u: string; // UTR
  r?: string; // registration ID
  i: string; // issued (ISO)
  isTest?: boolean;
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
  return "SFT-" + createHmac("sha256", secret() || "fallback-ticket-salt-key-2026").update(utr).digest("hex").slice(0, 8).toUpperCase();
}

export function seal(t: Ticket) {
  const iv = randomBytes(12);
  const k = secret() || "fallback-ticket-salt-key-2026";
  const c = createCipheriv("aes-256-gcm", aesKey(k), iv);
  const body = Buffer.concat([c.update(JSON.stringify(t), "utf8"), c.final()]);
  return Buffer.concat([iv, body, c.getAuthTag()]).toString("base64url");
}

export function unseal(token: string): Ticket | null {
  const k = secret() || "fallback-ticket-salt-key-2026";
  try {
    const raw = Buffer.from(token, "base64url");
    const d = createDecipheriv("aes-256-gcm", aesKey(k), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(raw.length - 16));
    return JSON.parse(Buffer.concat([d.update(raw.subarray(12, raw.length - 16)), d.final()]).toString("utf8")) as Ticket;
  } catch {
    return null;
  }
}

/** Competition day(s) for a category label like "Marathon · Open". */
export const whenFor = (category: string) => CHAMPIONSHIPS.find((c) => category.startsWith(c.sport))?.when ?? "";

export interface IssueTicketParams {
  name: string;
  phone: string;
  email?: string;
  category: string;
  amount: number;
  utr: string;
  regId?: string;
  when?: string;
  isTest?: boolean;
  paymentMode?: string;
  forceNotifications?: boolean;
}

/**
 * Seals the ticket and records it in the sheet, updates Firestore status to Paid,
 * and idempotently dispatches email and WhatsApp confirmations with ticket download links.
 */
export async function issueTicket(
  p: IssueTicketParams,
  origin: string,
): Promise<{ ticketNo: string; url: string } | { duplicate: string }> {
  const isTest = Boolean(p.isTest || p.category.includes("TEST ENTRY") || p.amount === 1);
  const t = isTest
    ? "TEST-" + createHmac("sha256", secret() || "test-salt").update(p.utr).digest("hex").slice(0, 6).toUpperCase()
    : ticketNo(p.utr);

  const token = seal({
    t,
    n: isTest ? `[TEST] ${p.name.replace(/^\[TEST\]\s*/i, "")}` : p.name,
    c: p.category,
    w: p.when || whenFor(p.category),
    a: p.amount,
    u: p.utr,
    r: p.regId || undefined,
    i: new Date().toISOString(),
    isTest: isTest || undefined,
  });

  const url = new URL(`/ticket/${token}`, origin).toString();
  const sheet = await toSheet("ticket", {
    regId: p.regId ?? "",
    utr: p.utr,
    ticketNo: t,
    ticketUrl: url,
    verifiedAt: istNow(),
    name: isTest ? `[TEST] ${p.name.replace(/^\[TEST\]\s*/i, "")}` : p.name,
    phone: p.phone,
    category: isTest ? `[TEST] ${p.category}` : p.category,
    fee: p.amount,
    status: isTest ? "TEST_VERIFIED" : "Verified",
  });

  if (sheet?.duplicate) return { duplicate: String(sheet.duplicate) };

  const runTicketTasks = async () => {
    let athleteEmail = p.email;
    let notifications: NotificationInfo = {};

    if (p.regId) {
      const existing = await getRegistrationFromFirestore(p.regId);
      if (existing) {
        athleteEmail = athleteEmail || existing.email;
        notifications = { ...(existing.notifications || {}) };
      }
    }

    const regId = p.regId || t;
    const ticketDownloadToken = generateDownloadToken(regId, "ticket");
    const downloadTicketUrl = `${origin}/api/download/${ticketDownloadToken}`;

    // 1. Email notification (Idempotent unless forced)
    if (athleteEmail && (!notifications.emailSentAt || p.forceNotifications)) {
      try {
        const emailRes = await sendConfirmationEmail({
          regId,
          ticketNo: t,
          name: p.name,
          email: athleteEmail,
          phone: p.phone,
          category: p.category,
          amount: p.amount,
          utr: p.utr,
          paymentMode: p.paymentMode,
          origin,
          isTest,
        });

        if (emailRes.success) {
          notifications.emailSentAt = new Date().toISOString();
          delete notifications.emailError;
        } else {
          notifications.emailError = emailRes.error;
        }
      } catch (err) {
        console.error(`[issueTicket] Email send error for ${regId}:`, err);
        notifications.emailError = err instanceof Error ? err.message : String(err);
      }
    }

    // 2. WhatsApp notification (Idempotent unless forced)
    if (!notifications.whatsappSentAt || p.forceNotifications) {
      try {
        const waRes = await sendTicketWhatsApp({
          phone: p.phone,
          name: p.name,
          amount: p.amount,
          category: p.category,
          ticketNo: t,
          regId,
          url: downloadTicketUrl,
          isTest,
        });

        if (waRes.success) {
          notifications.whatsappSentAt = new Date().toISOString();
          delete notifications.whatsappError;
        } else {
          notifications.whatsappError = waRes.error;
        }
      } catch (err) {
        console.error(`[issueTicket] WhatsApp send error for ${regId}:`, err);
        notifications.whatsappError = err instanceof Error ? err.message : String(err);
      }
    }

    notifications.lastAttemptAt = new Date().toISOString();
    if (p.forceNotifications) {
      notifications.resendCount = (notifications.resendCount || 0) + 1;
    }

    // 3. Update Firestore registration
    if (p.regId) {
      await updateRegistrationInFirestore(p.regId, {
        status: "Paid",
        utr: p.utr,
        ticketNo: t,
        ticketUrl: url,
        notifications,
        ...(isTest ? { isTest: true } : {}),
      });
    }
  };

  try {
    after(runTicketTasks);
  } catch {
    runTicketTasks().catch((e) => console.error("[Ticket Background Tasks Error]:", e));
  }

  return { ticketNo: t, url };
}
