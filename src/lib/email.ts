// Server only. Sends confirmation email with Ticket PDF + Receipt PDF attached via Resend.
// Responsive HTML + plain text fallback. Includes retry logic with exponential backoff.

import { Resend } from "resend";
import { generateReceiptPdf, generateTicketPdf, PDFData, formatCurrency, formatIstDate } from "@/lib/pdf";
import { EVENT, whenForCategory } from "@/data/festival";
import { generateDownloadToken } from "@/lib/download-token";
import { recordNotificationFailure } from "@/lib/firebase";

const resendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return apiKey ? new Resend(apiKey) : null;
};

export interface EmailParams {
  regId: string;
  ticketNo: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  amount: number;
  utr: string;
  paymentMode?: string;
  origin: string;
  isTest?: boolean;
}

export async function sendConfirmationEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  const resend = resendClient();
  let rawFrom = process.env.EMAIL_FROM?.trim() || "India's Biggest Sports Festival <tickets@sportsfestivalindia.com>";
  
  if (/@gmail\.com/i.test(rawFrom)) {
    console.warn("[Email Config]: Resend does not allow sending directly from @gmail.com. Using onboarding@resend.dev");
    rawFrom = "India's Biggest Sports Festival <onboarding@resend.dev>";
  }
  const fromEmail = rawFrom;
  const replyTo = "sportsfestivalindia@gmail.com";
  const alertEmails = (process.env.ALERT_EMAILS || "sportsfestivalindia@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const cleanEmail = params.email.trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email" };
  }

  const siteBase = process.env.SITE_URL?.trim() || params.origin || "https://sportsfestivalindia.com";

  // Generate signed download URLs
  const ticketToken = generateDownloadToken(params.regId, "ticket");
  const receiptToken = generateDownloadToken(params.regId, "receipt");
  const ticketDownloadUrl = `${siteBase}/api/download/${ticketToken}`;
  const receiptDownloadUrl = `${siteBase}/api/download/${receiptToken}`;
  const profileUrl = `${siteBase}/profile`;
  const venueMapsUrl = EVENT.mapsUrl;

  // Category schedule & dates from single source of truth
  const compSchedule = whenForCategory(params.category);
  const enableGoogleLogin = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";

  const pdfData: PDFData = {
    regId: params.regId,
    ticketNo: params.ticketNo,
    name: params.name,
    phone: params.phone,
    email: params.email,
    category: params.category,
    amount: params.amount,
    utr: params.utr,
    paymentMode: params.paymentMode,
    verifyUrl: `${siteBase}/verify-ticket/${ticketToken}`,
    isTest: params.isTest,
  };

  // Generate PDF attachments
  let ticketPdfBuf: Buffer | null = null;
  let receiptPdfBuf: Buffer | null = null;
  try {
    const [tBytes, rBytes] = await Promise.all([
      generateTicketPdf(pdfData),
      generateReceiptPdf(pdfData),
    ]);
    ticketPdfBuf = Buffer.from(tBytes);
    receiptPdfBuf = Buffer.from(rBytes);
  } catch (err) {
    console.warn("[Email PDF Generation Warning]:", err);
  }

  const subjectPrefix = params.isTest ? "[TEST] " : "";
  const athleteSubject = `${subjectPrefix}Registration confirmed - ${params.category} | India's Biggest Sports Festival 2026 | ${params.regId}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #16181f; border-radius: 12px; overflow: hidden; border: 1px solid #2a2e39;">
          
          <!-- Gold Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, #d4af37, #f7d070, #d4af37); height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 28px 20px 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #d4af37; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">All Odisha Gym Association Presents</p>
              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">INDIA'S BIGGEST SPORTS FESTIVAL 2026</h1>
              <p style="margin: 0; color: #a0aec0; font-size: 14px;">National Multi-Sport Championship & Expo (4–6 Dec 2026)</p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 16px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #4ade80; font-size: 15px; font-weight: 700;">✓ Payment Confirmed & Spot Secured</p>
                    <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px;">Welcome to the championship, <strong style="color: #ffffff;">${params.name}</strong>!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Registration Details Card -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1f232e; border-radius: 8px; border: 1px solid #2d3342; padding: 20px;">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #2d3342;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Registration / Client ID</span>
                    <div style="color: #d4af37; font-size: 18px; font-weight: 800; font-family: monospace; margin-top: 2px;">${params.regId}</div>
                  </td>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #2d3342; text-align: right;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Pass Number</span>
                    <div style="color: #ffffff; font-size: 15px; font-weight: 700; font-family: monospace; margin-top: 2px;">${params.ticketNo}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px 0; border-bottom: 1px solid #2d3342;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Category / Discipline</span>
                    <div style="color: #ffffff; font-size: 15px; font-weight: 600; margin-top: 2px;">${params.category}</div>
                    <div style="color: #d4af37; font-size: 13px; font-weight: 600; margin-top: 4px;">🗓️ Competition Day: ${compSchedule}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Amount Paid</span>
                    <div style="color: #4ade80; font-size: 16px; font-weight: 700; margin-top: 2px;">${formatCurrency(params.amount, params.isTest)}</div>
                  </td>
                  <td style="padding-top: 12px; text-align: right;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600;">PayU UTR / Bank Ref</span>
                    <div style="color: #e2e8f0; font-size: 13px; font-family: monospace; margin-top: 2px;">${params.utr || "CONFIRMED"}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Download Action Buttons -->
          <tr>
            <td style="padding: 0 28px 28px 28px;" align="center">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #d4af37, #b89325); margin: 0 6px;">
                    <a href="${ticketDownloadUrl}" target="_blank" style="font-size: 14px; font-weight: 700; color: #000000; text-decoration: none; padding: 12px 24px; display: inline-block; border-radius: 6px;">
                      🎟️ Download Entry Pass (PDF)
                    </a>
                  </td>
                  <td style="width: 12px;">&nbsp;</td>
                  <td align="center" style="border-radius: 6px; background-color: #2d3342; border: 1px solid #3e4659;">
                    <a href="${receiptDownloadUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 20px; display: inline-block; border-radius: 6px;">
                      📄 Download Receipt (PDF)
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">(Official PDF copies are also attached to this email)</p>
            </td>
          </tr>

          <!-- Venue & Schedule -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #12141a; border-radius: 8px; padding: 18px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 6px 0; color: #ffffff; font-size: 15px; font-weight: 700;">Event Dates & Venue</h3>
                    <p style="margin: 0 0 4px 0; color: #d4af37; font-size: 14px; font-weight: 600;">🗓️ Festival Dates: ${EVENT.datesFull}</p>
                    <p style="margin: 0 0 6px 0; color: #ffffff; font-size: 13px; font-weight: 600;">⏱️ Your Schedule: ${compSchedule}</p>
                    <p style="margin: 0 0 8px 0; color: #cbd5e1; font-size: 13px; line-height: 1.4;">
                      📍 <strong>${EVENT.venueFull}</strong>
                    </p>
                    <a href="${venueMapsUrl}" target="_blank" style="color: #60a5fa; font-size: 12px; text-decoration: underline;">
                      Open Venue in Google Maps →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What to Carry Checklist -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <h4 style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What to Bring on Competition Day:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                <li>Official Entry Pass (PDF on phone or printed copy)</li>
                <li>Original Government Photo ID (Aadhaar / Voter ID / Passport / Driving Licence)</li>
                <li>Age Proof certificate (for Junior or Masters divisions)</li>
                <li>Report at accreditation desk 90 minutes prior to your division call</li>
              </ul>
            </td>
          </tr>

          ${enableGoogleLogin ? `
          <!-- Profile Link -->
          <tr>
            <td style="padding: 0 28px 28px 28px;" align="center">
              <a href="${profileUrl}" target="_blank" style="color: #d4af37; font-size: 13px; font-weight: 600; text-decoration: underline;">
                Login with Google to view your Athlete Profile & Events →
              </a>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f1015; padding: 24px 28px; text-align: center; border-top: 1px solid #232731;">
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px;">
                Organised by <strong>All Odisha Gym Association (AOGA)</strong>
              </p>
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 11px;">
                Need help? WhatsApp / Phone: ${EVENT.phone} · Email: ${EVENT.email}
              </p>
              <p style="margin: 0; color: #475569; font-size: 10px;">
                This is an official transaction confirmation email sent to ${cleanEmail}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
INDIA'S BIGGEST SPORTS FESTIVAL 2026
National Multi-Sport Championship & Expo (4–6 Dec 2026)
Organised by All Odisha Gym Association (AOGA)

==================================================
REGISTRATION CONFIRMED
==================================================
Athlete Name: ${params.name}
Registration ID: ${params.regId}
Pass No: ${params.ticketNo}
Category: ${params.category}
Amount Paid: ${formatCurrency(params.amount, params.isTest)}
Payment Reference: ${params.utr || "CONFIRMED"}
Festival Dates: ${EVENT.datesFull}
Your Competition Day: ${compSchedule}
Venue: ${EVENT.venueFull}
Weigh-in & Reporting: 90 mins prior to division call at Baramunda Ground Field

DOWNLOAD YOUR PASS & RECEIPT:
- Ticket PDF: ${ticketDownloadUrl}
- Receipt PDF: ${receiptDownloadUrl}
${enableGoogleLogin ? `- Athlete Profile: ${profileUrl}` : ""}

WHAT TO BRING ON EVENT DAY:
1. Official Entry Pass (show on phone or printed copy)
2. Original Government Photo ID (Aadhaar / Voter ID / Passport)
3. Age proof (for Junior or Masters categories)
4. Gym or federation card (if applicable)

Organiser Helpline: ${EVENT.phone}
Email: ${EVENT.email}
Venue Maps: ${venueMapsUrl}
  `.trim();

  const attachments: Array<{ filename: string; content: Buffer }> = [];
  if (ticketPdfBuf) {
    attachments.push({
      filename: `AOGA2026-Ticket-${params.regId}.pdf`,
      content: ticketPdfBuf,
    });
  }
  if (receiptPdfBuf) {
    attachments.push({
      filename: `AOGA2026-Receipt-${params.regId}.pdf`,
      content: receiptPdfBuf,
    });
  }

  // Retry up to 3 times with exponential backoff
  let attempt = 0;
  let lastErr: string | undefined;

  if (!resend) {
    console.warn(`[Email Resend] RESEND_API_KEY is not configured. Email to ${cleanEmail} logged only.`);
    return { success: true };
  }

  while (attempt < 3) {
    attempt++;
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: [cleanEmail],
        replyTo,
        subject: athleteSubject,
        html: htmlBody,
        text: textBody,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log(`[Email Success] Sent confirmation email to ${cleanEmail} for ${params.regId} on attempt ${attempt}`);

      // Internal copy to ALERT_EMAILS
      if (alertEmails.length > 0) {
        resend.emails.send({
          from: fromEmail,
          to: alertEmails,
          replyTo: cleanEmail,
          subject: `NEW REGISTRATION: ${params.name} - ${params.category} (${formatCurrency(params.amount, params.isTest)}) [${params.regId}]`,
          html: htmlBody,
          text: textBody,
          attachments: attachments.length > 0 ? attachments : undefined,
        }).catch((e) => console.warn("[Alert Email Error]:", e));
      }

      return { success: true };
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err.message : String(err);
      console.warn(`[Email Attempt ${attempt} Failed] ${cleanEmail}:`, lastErr);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  await recordNotificationFailure({
    regId: params.regId,
    type: "email",
    recipient: cleanEmail,
    error: lastErr || "Failed after 3 retries",
    timestamp: new Date().toISOString(),
  });

  return { success: false, error: lastErr };
}
