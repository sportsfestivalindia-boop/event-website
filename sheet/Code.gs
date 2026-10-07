/**
 * Sports Festival 2026 — registrations sheet (Google Apps Script, bound to AOGA's Google Sheet).
 *
 * One-time setup (Extensions → Apps Script, paste this file, then):
 *   1. Run `setup` once and allow the permissions (edit this sheet, send email as you).
 *   2. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → copy the /exec URL.
 *   3. Put that URL in Vercel as SHEET_WEBHOOK_URL (Production) — the website then writes here.
 *
 * Daily use: check each WhatsApp payment screenshot against the Yes Bank merchant app, then issue the ticket at
 * sportsfestivalindia.com/admin/tickets. That marks the row Verified here and emails the athlete automatically.
 * (Setting Status = Verified by hand also sends the email.)
 */

const EVENT = {
  name: "India’s Biggest Sports Festival 2026",
  dates: "4–6 December 2026",
  venue: "Baramunda Ground Field, Bhubaneswar, Odisha",
  phone: "+91 80189 58655",
  site: "https://sportsfestivalindia.com",
  docs: "Government ID, age proof, a recent photograph, association / federation details, the signed athlete self-declaration and a medical declaration if applicable",
};

const STATUSES = ["Awaiting payment", "Pending", "Verified", "Rejected"];

const TABS = {
  Registrations: ["Reg ID", "Created", "Name", "DOB", "Mobile", "Email", "City", "Association", "Category", "Fee (₹)", "UTR", "UTR at", "Status", "Verified at", "Email sent", "WhatsApp", "Source", "Notes"],
  Stalls: ["Booking ID", "Created", "Stall", "Price (₹)", "Company", "Contact", "Mobile", "Email", "GSTIN", "Sector", "Status", "Notes"],
  Sponsors: ["Created", "Company", "Contact", "Mobile", "Email", "Interested in", "Budget", "Note", "Status", "Notes"],
};
const R = Object.fromEntries(TABS.Registrations.map((h, i) => [h, i + 1])); // header → column number

/* ───────────────────────── setup ───────────────────────── */

function setup() {
  const ss = SpreadsheetApp.getActive();
  for (const [name, headers] of Object.entries(TABS)) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#0a0a0a").setFontColor("#ffb81c");
    sh.setFrozenRows(1);
  }
  const reg = ss.getSheetByName("Registrations");
  // text formats so mobiles / UTRs keep their leading digits
  ["Mobile", "UTR", "DOB"].forEach((h) => reg.getRange(2, R[h], reg.getMaxRows() - 1).setNumberFormat("@"));
  reg.getRange(2, R["Status"], reg.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());

  const col = (h) => String.fromCharCode(64 + R[h]);
  const st = reg.getRange(2, R["Status"], reg.getMaxRows() - 1);
  const utr = reg.getRange(2, R["UTR"], reg.getMaxRows() - 1);
  const rule = (range, formula, colour) => SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formula).setBackground(colour).setRanges([range]).build();
  reg.setConditionalFormatRules([
    rule(utr, `=AND(${col("UTR")}2<>"",COUNTIF($${col("UTR")}:$${col("UTR")},${col("UTR")}2)>1)`, "#f4a3a3"), // same UTR used twice
    rule(st, `=${col("Status")}2="Verified"`, "#b7e1cd"),
    rule(st, `=${col("Status")}2="Pending"`, "#fce8b2"),
    rule(st, `=${col("Status")}2="Rejected"`, "#e6b8af"),
  ]);
  ["Stalls", "Sponsors"].forEach((n) => {
    const sh = ss.getSheetByName(n);
    const c = TABS[n].indexOf("Status") + 1;
    sh.getRange(2, c, sh.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["New", "Contacted", "Confirmed", "Paid", "Cancelled"], true).build());
  });
  const first = ss.getSheetByName("Sheet1");
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);

  // installable triggers: email on Verified (simple onEdit cannot send mail), hourly retry if Gmail quota ran out
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("onStatusEdit").forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger("retryEmails").timeBased().everyHours(1).create();
}

/* ───────────────────────── website → sheet ───────────────────────── */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActive();
    if (d.action === "registration") {
      const sh = ss.getSheetByName("Registrations");
      const row = new Array(TABS.Registrations.length).fill("");
      const set = (h, v) => (row[R[h] - 1] = v);
      set("Reg ID", d.regId); set("Created", d.created); set("Name", d.name); set("DOB", d.dob); set("Mobile", d.phone);
      set("Email", d.email); set("City", d.city); set("Association", d.association); set("Category", d.category);
      set("Fee (₹)", d.fee); set("Status", d.status); set("Source", d.source);
      sh.appendRow(row);
      const r = sh.getLastRow();
      sh.getRange(r, R["WhatsApp"]).setFormula(waFormula(sh, r));
      if (d.status === "Verified") confirm(sh, r); // free Star category: confirmed straight away
    } else if (d.action === "utr") {
      const sh = ss.getSheetByName("Registrations");
      const r = findRow(sh, R["Reg ID"], d.regId);
      if (r) {
        sh.getRange(r, R["UTR"]).setValue(d.utr);
        sh.getRange(r, R["UTR at"]).setValue(d.utrAt);
        if (sh.getRange(r, R["Status"]).getValue() !== "Verified") sh.getRange(r, R["Status"]).setValue("Pending");
      }
    } else if (d.action === "ticket") {
      // staff issued a ticket on the website → mark the athlete Verified and email them (if a row exists for this Reg ID)
      const sh = ss.getSheetByName("Registrations");
      const r = findRow(sh, R["Reg ID"], d.regId);
      if (r) {
        sh.getRange(r, R["UTR"]).setValue(d.utr);
        sh.getRange(r, R["Notes"]).setValue(`Ticket ${d.ticketNo}: ${d.ticketUrl}`);
        sh.getRange(r, R["Status"]).setValue("Verified");
        confirm(sh, r);
      }
    } else if (d.action === "stall") {
      ss.getSheetByName("Stalls").appendRow([d.bookingId, d.created, d.stall, d.price, d.company, d.contact, d.phone, d.email, d.gstin, d.sector, d.status, ""]);
    } else if (d.action === "enquiry") {
      ss.getSheetByName("Sponsors").appendRow([d.created, d.company, d.contact, d.phone, d.email, d.tier, d.budget, d.note, d.status, ""]);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/* ───────────────────────── staff verifies → confirmation ───────────────────────── */

function onStatusEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== "Registrations" || e.range.getColumn() !== R["Status"] || e.range.getRow() < 2) return;
  if (e.value === "Verified") confirm(sh, e.range.getRow());
}

function confirm(sh, r) {
  const v = (h) => sh.getRange(r, R[h]).getValue();
  if (!v("Verified at")) sh.getRange(r, R["Verified at"]).setValue(new Date());
  if (v("Email sent") && String(v("Email sent")).indexOf("Quota") !== 0) return; // never email twice
  if (MailApp.getRemainingDailyQuota() < 1) return sh.getRange(r, R["Email sent"]).setValue("Quota — retries hourly");
  const fee = Number(v("Fee (₹)"));
  const lines = [
    `Hi ${v("Name")},`,
    "",
    `Your registration for ${EVENT.name} is CONFIRMED.`,
    "",
    `Registration ID: ${v("Reg ID")}`,
    `Category: ${v("Category")}`,
    fee ? `Amount received: ₹${fee.toLocaleString("en-IN")} (UPI, UTR ${v("UTR")})` : "Entry: Free (Star / Para category)",
    `Dates: ${EVENT.dates}`,
    `Venue: ${EVENT.venue}`,
    "",
    `Please bring: ${EVENT.docs}.`,
    "Keep this email — it is your payment receipt. Show your Registration ID at check-in.",
    "",
    `Questions? WhatsApp ${EVENT.phone} · ${EVENT.site}`,
    "",
    "All Odisha Gym Association",
  ];
  MailApp.sendEmail({ to: v("Email"), subject: `Registration confirmed — ${v("Reg ID")} · ${EVENT.name}`, body: lines.join("\n"), name: "All Odisha Gym Association" });
  sh.getRange(r, R["Email sent"]).setValue(new Date());
}

function retryEmails() {
  const sh = SpreadsheetApp.getActive().getSheetByName("Registrations");
  const last = sh.getLastRow();
  if (last < 2) return;
  const vals = sh.getRange(2, 1, last - 1, TABS.Registrations.length).getValues();
  vals.forEach((row, i) => {
    if (row[R["Status"] - 1] === "Verified" && (!row[R["Email sent"] - 1] || String(row[R["Email sent"] - 1]).indexOf("Quota") === 0)) confirm(sh, i + 2);
  });
}

/* ───────────────────────── helpers ───────────────────────── */

function findRow(sh, col, value) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (let i = vals.length - 1; i >= 0; i--) if (vals[i][0] === value) return i + 2;
  return 0;
}

function waFormula(sh, r) {
  const v = (h) => sh.getRange(r, R[h]).getValue();
  const text = `✅ Confirmed — ${EVENT.name}\nReg ID: ${v("Reg ID")}\n${v("Category")}\n${EVENT.dates} · ${EVENT.venue}\nPlease bring your Government ID and documents. See you there! — AOGA`;
  const url = `https://wa.me/91${v("Mobile")}?text=${encodeURIComponent(text)}`;
  return `=HYPERLINK("${url.replace(/"/g, '""')}","Send ✅")`;
}
