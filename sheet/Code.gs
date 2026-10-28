/**
 * Sports Festival 2026 — registrations sheet (standalone Google Apps Script on sportsfestivalindia@gmail.com,
 * writing to the sheet SHEET_ID below; standalone because "Extensions → Apps Script" breaks with several Google logins).
 *
 * One-time setup (script.google.com → New project, paste this file, then):
 *   1. Run `setup` once and allow the permissions (edit this sheet, send email as you).
 *   2. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → copy the /exec URL.
 *   3. Put that URL in Vercel as SHEET_WEBHOOK_URL (Production) — the website then writes here.
 *
 * Daily use: check each WhatsApp payment screenshot against the Yes Bank merchant app, then issue the ticket at
 * sportsfestivalindia.com/admin/tickets. That marks the row Verified here and emails the athlete automatically.
 * (Setting Status = Verified by hand also sends the email.)
 */

// "Sports Festival 2026 — Registrations" in sportsfestivalindia@gmail.com's Drive
const SHEET_ID = "1FQIaO79jL9hIiJt-dqY8GwSFX8JnG24IarrUEhB2eO8";
const book = () => SpreadsheetApp.openById(SHEET_ID);

const EVENT = {
  name: "India’s Biggest Sports Festival 2026",
  dates: "4–6 December 2026",
  venue: "Baramunda Ground Field, Bhubaneswar, Odisha",
  phone: "+91 80189 58655",
  site: "https://sportsfestivalindia.com",
  docs: "Government ID, age proof, a recent photograph, association / federation details, the signed athlete self-declaration and a medical declaration if applicable",
};

const STATUSES = ["Awaiting payment", "Pending", "Verified", "Rejected"];
const FEES = [600, 1000, 5000]; // entry fees — any other credit to the gym's account is not a festival payment
const ALERT_TO = "sportsfestivalindia@gmail.com,rupesh.zenvy@gmail.com,sportsfestivalindia@illusorydesignstudios.com"; // staff alerts from the watchdog

const REG_COLS = ["Reg ID", "Created", "Name", "DOB", "Mobile", "Email", "City", "Association", "Category", "Fee (₹)", "UTR", "UTR at", "Status", "Verified at", "Email sent", "WhatsApp", "Source", "Notes", "Ticket"];
// Tests: staff ₹1 test mode (/register?test=1) — same columns and same flow, kept out of the report and the totals
const REGS = ["Registrations", "Tests"];

const TABS = {
  Registrations: REG_COLS,
  Tests: REG_COLS,
  // Yes Bank credit alerts (SMS / email), parsed by the Make scenario — the proof a UTR was really paid
  Bank: ["Received", "Amount (₹)", "UTR", "Payer", "Source", "Raw", "Matched Reg ID"],
  Stalls: ["Booking ID", "Created", "Stall", "Price (₹)", "Company", "Contact", "Mobile", "Email", "GSTIN", "Sector", "Status", "Notes"],
  Sponsors: ["Created", "Company", "Contact", "Mobile", "Email", "Interested in", "Budget", "Note", "Status", "Notes"],
};
const R = Object.fromEntries(TABS.Registrations.map((h, i) => [h, i + 1])); // header → column number
const B = Object.fromEntries(TABS.Bank.map((h, i) => [h, i + 1]));

/* ───────────────────────── setup ───────────────────────── */

function setup() {
  const ss = book();
  for (const [name, headers] of Object.entries(TABS)) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#0a0a0a").setFontColor("#ffb81c");
    sh.setFrozenRows(1);
  }
  const bank = ss.getSheetByName("Bank");
  bank.getRange(2, B["UTR"], bank.getMaxRows() - 1).setNumberFormat("@");
  const col = (h) => String.fromCharCode(64 + R[h]);
  const rule = (range, formula, colour) => SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formula).setBackground(colour).setRanges([range]).build();
  REGS.forEach((name) => {
    const reg = ss.getSheetByName(name);
    // text formats so mobiles / UTRs keep their leading digits
    ["Mobile", "UTR", "DOB"].forEach((h) => reg.getRange(2, R[h], reg.getMaxRows() - 1).setNumberFormat("@"));
    reg.getRange(2, R["Status"], reg.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
    const st = reg.getRange(2, R["Status"], reg.getMaxRows() - 1);
    const utr = reg.getRange(2, R["UTR"], reg.getMaxRows() - 1);
    reg.setConditionalFormatRules([
      rule(utr, `=AND(${col("UTR")}2<>"",COUNTIF($${col("UTR")}:$${col("UTR")},${col("UTR")}2)>1)`, "#f4a3a3"), // same UTR used twice
      rule(st, `=${col("Status")}2="Verified"`, "#b7e1cd"),
      rule(st, `=${col("Status")}2="Pending"`, "#fce8b2"),
      rule(st, `=${col("Status")}2="Rejected"`, "#e6b8af"),
    ]);
  });
  ss.getSheetByName("Tests").setTabColor("#ffb81c");
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
  ScriptApp.newTrigger("watchdog").timeBased().everyMinutes(10).create();
}

/* ───────────────────────── website → sheet ───────────────────────── */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = book();
    if (d.action === "registration") {
      const sh = ss.getSheetByName(d.source === "STAFF TEST" ? "Tests" : "Registrations");
      const row = new Array(TABS.Registrations.length).fill("");
      const set = (h, v) => (row[R[h] - 1] = v);
      set("Reg ID", d.regId); set("Created", new Date()); set("Name", d.name); set("DOB", d.dob); set("Mobile", d.phone);
      set("Email", d.email); set("City", d.city); set("Association", d.association); set("Category", d.category);
      set("Fee (₹)", d.fee); set("Status", d.status); set("Source", d.source);
      sh.appendRow(row);
      const r = sh.getLastRow();
      sh.getRange(r, R["WhatsApp"]).setFormula(waFormula(sh, r));
      if (d.status === "Verified") confirm(sh, r); // free Star category: confirmed straight away
    } else if (d.action === "claim") {
      // athlete (or Make) says "registration X was paid with UTR Y": record it, and tell the website whether
      // Yes Bank's own alert for that UTR is already here — the website issues the ticket only if it is
      // by Reg ID (payment screen) or by mobile number (the /verify page, for athletes who closed the screen)
      // by mobile: the registration that already carries this UTR (athlete registered twice) — else their latest unconfirmed one
      const own = findReg(ss, R["UTR"], d.utr);
      const ownsUtr = !d.regId && own.r && String(cell(own, "Mobile")) === String(d.phone);
      const at = d.regId ? findReg(ss, R["Reg ID"], d.regId) : ownsUtr ? own : latestFor(ss, d.phone);
      const { sh, r } = at;
      const v = (row, h) => sh.getRange(row, R[h]).getValue();
      if (!r) return json({ ok: false, error: "not-found" });
      if (v(r, "Status") === "Verified") return json({ ok: true, verified: true, regId: v(r, "Reg ID"), ticketUrl: v(r, "Ticket") });
      if (own.r && !(own.sh.getName() === sh.getName() && own.r === r) && cell(own, "Status") === "Verified") return json({ ok: false, duplicate: true });
      asText(sh.getRange(r, R["UTR"]), d.utr);
      sh.getRange(r, R["UTR at"]).setValue(new Date()); // a real time: the watchdog measures how long it has waited
      sh.getRange(r, R["Status"]).setValue("Pending");
      const bank = ss.getSheetByName("Bank");
      const b = findRow(bank, B["UTR"], d.utr);
      return json({
        ok: true,
        regId: v(r, "Reg ID"),
        row: { name: v(r, "Name"), phone: String(v(r, "Mobile")), category: v(r, "Category"), fee: Number(v(r, "Fee (₹)")) },
        bank: b ? { amount: Number(bank.getRange(b, B["Amount (₹)"]).getValue()) } : null,
      });
    } else if (d.action === "bank") {
      // Make parsed a Yes Bank credit alert → log it once, and return the registration waiting on that UTR (if any);
      // Make then calls the website's /api/claim, which issues the ticket
      const bank = ss.getSheetByName("Bank");
      const utr = String(d.utr || "").replace(/\D/g, "");
      const amount = Number(d.amount);
      if (!/^\d{12}$/.test(utr) || !(amount > 0)) return json({ ok: false, error: "bad-credit" });
      if (!findRow(bank, B["UTR"], utr)) {
        bank.appendRow([d.received || new Date(), amount, "", d.payer || "", d.source || "", String(d.raw || "").slice(0, 500), ""]);
        asText(bank.getRange(bank.getLastRow(), B["UTR"]), utr);
      }
      const at = findReg(ss, R["UTR"], utr);
      const waiting = at.r && cell(at, "Status") !== "Verified";
      return json({ ok: true, utr, match: waiting ? cell(at, "Reg ID") : "" });
    } else if (d.action === "lookup") {
      // read-only: the athlete's personal payment link (/pay?id=…) reopens their payment page
      const at = findReg(ss, R["Reg ID"], d.regId);
      if (!at.r) return json({ ok: false });
      const c = (h) => cell(at, h);
      return json({
        ok: true,
        regId: c("Reg ID"),
        name: c("Name"),
        phone: String(c("Mobile")),
        email: c("Email"),
        city: c("City"),
        dob: c("DOB") instanceof Date ? Utilities.formatDate(c("DOB"), "Asia/Kolkata", "yyyy-MM-dd") : String(c("DOB")),
        category: c("Category"),
        fee: Number(c("Fee (₹)")),
        status: c("Status"),
        ticketUrl: c("Ticket"),
      });
    } else if (d.action === "summary") {
      // daily report for the organisers (Make → email / WhatsApp)
      const reg = ss.getSheetByName("Registrations");
      const n = reg.getLastRow() - 1;
      const rows = n > 0 ? reg.getRange(2, 1, n, TABS.Registrations.length).getValues() : [];
      const byStatus = {};
      let collected = 0;
      rows.forEach((x) => {
        const s = x[R["Status"] - 1] || "Blank";
        byStatus[s] = (byStatus[s] || 0) + 1;
        if (s === "Verified") collected += Number(x[R["Fee (₹)"] - 1]) || 0;
      });
      const bank = ss.getSheetByName("Bank");
      const bn = bank.getLastRow() - 1;
      // festival-sized only: the gym's other income (₹82 etc.) also lands in this account
      const unmatched = values(bank, TABS.Bank.length).filter((x) => !x[B["Matched Reg ID"] - 1] && FEES.includes(Number(x[B["Amount (₹)"] - 1]))).length;
      return json({ ok: true, total: rows.length, byStatus, collected, unmatchedBankCredits: unmatched });
    } else if (d.action === "ticket") {
      // staff issued a ticket on the website → refuse a UTR already ticketed for someone else (reused screenshot),
      // else mark the athlete's row Verified and email them; no matching row (no Reg ID) → log the ticket as a new row
      const u = findReg(ss, R["UTR"], d.utr);
      if (u.r && cell(u, "Status") === "Verified" && (d.regId ? cell(u, "Reg ID") !== d.regId : cell(u, "Name") !== d.name))
        return json({ ok: false, duplicate: `${cell(u, "Reg ID") || "no Reg ID"} · ${cell(u, "Name")}` });
      const at = d.regId ? findReg(ss, R["Reg ID"], d.regId) : u;
      const sh = at.sh;
      let r = at.r;
      if (!r) {
        const row = new Array(TABS.Registrations.length).fill("");
        const set = (h, val) => (row[R[h] - 1] = val);
        set("Reg ID", d.regId); set("Created", d.verifiedAt); set("Name", d.name); set("Mobile", d.phone);
        set("Category", d.category); set("Fee (₹)", d.fee); set("Source", "Ticket desk");
        sh.appendRow(row);
        r = sh.getLastRow();
        sh.getRange(r, R["WhatsApp"]).setFormula(waFormula(sh, r));
      }
      asText(sh.getRange(r, R["UTR"]), d.utr);
      sh.getRange(r, R["Ticket"]).setValue(d.ticketUrl);
      sh.getRange(r, R["Status"]).setValue("Verified");
      const bank = ss.getSheetByName("Bank");
      const b = findRow(bank, B["UTR"], d.utr);
      if (b) bank.getRange(b, B["Matched Reg ID"]).setValue(d.regId || d.name);
      confirm(sh, r);
    } else if (d.action === "stall") {
      ss.getSheetByName("Stalls").appendRow([d.bookingId, d.created, d.stall, d.price, d.company, d.contact, d.phone, d.email, d.gstin, d.sector, d.status, ""]);
    } else if (d.action === "enquiry") {
      ss.getSheetByName("Sponsors").appendRow([d.created, d.company, d.contact, d.phone, d.email, d.tier, d.budget, d.note, d.status, ""]);
    }
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Make calls with GET + query parameters: Apps Script's POST → 302 → reply hop is unreliable inside Make, GET is not.
// Same actions as doPost (the /exec URL itself is the secret).
function doGet(e) {
  return doPost({ postData: { contents: JSON.stringify(e.parameter || {}) } });
}

/* ───────────────────────── staff verifies → confirmation ───────────────────────── */

function onStatusEdit(e) {
  const sh = e.range.getSheet();
  if (!REGS.includes(sh.getName()) || e.range.getColumn() !== R["Status"] || e.range.getRow() < 2) return;
  if (e.value === "Verified") confirm(sh, e.range.getRow());
}

function confirm(sh, r) {
  const v = (h) => sh.getRange(r, R[h]).getValue();
  if (!v("Verified at")) sh.getRange(r, R["Verified at"]).setValue(new Date());
  if (!v("Email")) return; // ticket-desk row without an email: the WhatsApp ticket is their confirmation
  if (v("Email sent") && String(v("Email sent")).indexOf("Quota") !== 0) return; // never email twice
  if (MailApp.getRemainingDailyQuota() < 1) return sh.getRange(r, R["Email sent"]).setValue("Quota — retries hourly");
  const fee = Number(v("Fee (₹)"));
  const lines = [
    `Hi ${v("Name")},`,
    "",
    `Your registration for ${EVENT.name} is CONFIRMED.`,
    "",
    `Registration ID: ${v("Reg ID")}`,
    ...(v("Ticket") ? [`Your ticket: ${v("Ticket")}`] : []),
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
  REGS.forEach((name) => {
    const sh = book().getSheetByName(name);
    values(sh, REG_COLS.length).forEach((row, i) => {
      if (row[R["Status"] - 1] === "Verified" && (!row[R["Email sent"] - 1] || String(row[R["Email sent"] - 1]).indexOf("Quota") === 0)) confirm(sh, i + 2);
    });
  });
}

/* ───────────────────────── watchdog: nobody who paid is left waiting ───────────────────────── */

// Every 10 min (trigger from setup). Payments still unconfirmed after 15 min → one reassurance email to the athlete and
// a staff alert (with when the last bank SMS arrived — a long gap means the forwarder phone is asleep). Festival-sized
// bank credits nobody claimed → staff alert listing the likely registrations. Each item alerts once.
function watchdog() {
  const ss = book();
  const regs = values(ss.getSheetByName("Registrations"), REG_COLS.length);
  const tests = values(ss.getSheetByName("Tests"), REG_COLS.length);
  const credits = values(ss.getSheetByName("Bank"), TABS.Bank.length);
  const g = (x, h) => x[R[h] - 1];
  const gb = (x, h) => x[B[h] - 1];
  const props = PropertiesService.getScriptProperties();
  const seen = JSON.parse(props.getProperty("alerted") || "[]");
  const waited = (t) => !(t instanceof Date) || Date.now() - t.getTime() > 15 * 60 * 1000;

  const stuck = regs.concat(tests).filter((x) => g(x, "Status") === "Pending" && waited(g(x, "UTR at")) && !seen.includes("reg:" + g(x, "Reg ID")));
  const orphans = credits.filter(
    (x) => !gb(x, "Matched Reg ID") && FEES.includes(Number(gb(x, "Amount (₹)"))) && waited(gb(x, "Received")) && !seen.includes("bank:" + gb(x, "UTR")),
  );
  // Reached the payment page 30+ min ago but never verified (didn't pay, or paid and forgot the UTR): one friendly
  // email with their personal payment link and the WhatsApp-screenshot route. Old rows with no real time are skipped.
  const created = (x) => asDate(g(x, "Created"));
  const abandoned = regs
    .concat(tests)
    .filter((x) => g(x, "Status") === "Awaiting payment" && g(x, "Email") && created(x) && Date.now() - created(x).getTime() > 30 * 60 * 1000 && !seen.includes("remind:" + g(x, "Reg ID")));
  abandoned.forEach((x) => {
    if (MailApp.getRemainingDailyQuota() < 5) return;
    const id = g(x, "Reg ID");
    const wa = `https://wa.me/${EVENT.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`PAYMENT SCREENSHOT for registration ${id} (${g(x, "Name")})`)}`;
    MailApp.sendEmail({
      to: g(x, "Email"),
      subject: `Complete your registration — ${id} · ${EVENT.name}`,
      name: "All Odisha Gym Association",
      body: [
        `Hi ${g(x, "Name")},`,
        "",
        `You started registering for ${g(x, "Category")} (₹${g(x, "Fee (₹)")}) at ${EVENT.name}, but we haven't received your payment confirmation yet.`,
        "",
        "HAVEN'T PAID YET? Complete your payment here (your QR is ready):",
        `${EVENT.site}/pay?id=${id}`,
        "",
        "ALREADY PAID? Don't worry — your money is safe. Open the same link and enter the 12-digit UTR from your payment screen, or send your payment screenshot on WhatsApp and we'll send your ticket there:",
        wa,
        "",
        "Please don't pay twice.",
        `Questions? WhatsApp or call ${EVENT.phone}.`,
        "",
        "All Odisha Gym Association",
      ].join("\n"),
    });
    seen.push("remind:" + id);
  });
  if (abandoned.length) props.setProperty("alerted", JSON.stringify(seen.slice(-2000)));

  if ((!stuck.length && !orphans.length) || MailApp.getRemainingDailyQuota() < 2) return;

  stuck.forEach((x) => {
    if (!g(x, "Email") || MailApp.getRemainingDailyQuota() < 2) return;
    MailApp.sendEmail({
      to: g(x, "Email"),
      subject: `Payment details received — ${g(x, "Reg ID")} · ${EVENT.name}`,
      name: "All Odisha Gym Association",
      body: [
        `Hi ${g(x, "Name")},`,
        "",
        `We have received your payment details (₹${g(x, "Fee (₹)")}, UTR ${g(x, "UTR")}) for ${EVENT.name}.`,
        "We are confirming it with the bank — your ticket will be emailed to you as soon as it is confirmed. Please don't pay again.",
        "",
        `Check any time: ${EVENT.site}/verify (your mobile number + UTR).`,
        `Questions? WhatsApp ${EVENT.phone}.`,
        "",
        "All Odisha Gym Association",
      ].join("\n"),
    });
  });

  const lastSms = credits.length ? gb(credits[credits.length - 1], "Received") : "never";
  const lines = [];
  if (stuck.length) {
    lines.push(`PAID, NOT YET CONFIRMED (${stuck.length}) — check each UTR in the Yes Bank app, then issue the ticket at ${EVENT.site}/admin/tickets`);
    stuck.forEach((x) => lines.push(`• ${g(x, "Reg ID")} · ${g(x, "Name")} · +91 ${g(x, "Mobile")} · ₹${g(x, "Fee (₹)")} · UTR ${g(x, "UTR")}`));
    lines.push(`Last bank SMS received: ${when(lastSms)}. If that is long ago, the SMS forwarder phone is asleep or offline — open the app.`, "");
  }
  if (orphans.length) {
    lines.push(`BANK CREDITS NOBODY CLAIMED (${orphans.length}) — someone paid but didn't enter the UTR`);
    orphans.forEach((x) => {
      const amount = Number(gb(x, "Amount (₹)"));
      lines.push(`• ₹${amount} · UTR ${gb(x, "UTR")} · ${when(gb(x, "Received"))}`);
      regs
        .filter((y) => g(y, "Status") === "Awaiting payment" && Number(g(y, "Fee (₹)")) === amount)
        .slice(-5)
        .reverse()
        .forEach((y) => lines.push(`    maybe: ${g(y, "Reg ID")} · ${g(y, "Name")} · +91 ${g(y, "Mobile")} · registered ${g(y, "Created")}`));
    });
    lines.push(`Call them, confirm, then issue the ticket at ${EVENT.site}/admin/tickets with that UTR.`, "");
  }
  lines.push(`Sheet: ${ss.getUrl()}`);
  MailApp.sendEmail({ to: ALERT_TO, subject: `⚠️ Sports Festival: ${stuck.length + orphans.length} payment(s) need attention`, body: lines.join("\n"), name: "Sports Festival payments" });

  stuck.forEach((x) => seen.push("reg:" + g(x, "Reg ID")));
  orphans.forEach((x) => seen.push("bank:" + gb(x, "UTR")));
  props.setProperty("alerted", JSON.stringify(seen.slice(-2000)));
}

/* ───────────────────────── helpers ───────────────────────── */

function values(sh, width) {
  const last = sh.getLastRow();
  return last < 2 ? [] : sh.getRange(2, 1, last - 1, width).getValues();
}

// the tab + row whose `col` holds `value` — real registrations first, then tests; not found → Registrations, row 0
function findReg(ss, col, value) {
  for (const name of REGS) {
    const sh = ss.getSheetByName(name);
    const r = findRow(sh, col, value);
    if (r) return { sh, r };
  }
  return { sh: ss.getSheetByName("Registrations"), r: 0 };
}

function cell(at, h) {
  return at.sh.getRange(at.r, R[h]).getValue();
}

// the athlete's latest unconfirmed registration for this mobile (else their latest one, to hand back a ticket)
function latestFor(ss, phone) {
  const p = String(phone || "").replace(/\D/g, "").slice(-10);
  let any = { sh: ss.getSheetByName("Registrations"), r: 0 };
  if (p.length !== 10) return any;
  for (const name of REGS) {
    const sh = ss.getSheetByName(name);
    const rows = values(sh, REG_COLS.length);
    for (let i = rows.length - 1; i >= 0; i--) {
      if (String(rows[i][R["Mobile"] - 1]) !== p) continue;
      if (rows[i][R["Status"] - 1] !== "Verified") return { sh, r: i + 2 };
      if (!any.r) any = { sh, r: i + 2 };
    }
  }
  return any;
}

// a sheet time: a real Date, or the website's old "d/m/yyyy, hh:mm:ss" IST text; null when unknown
function asDate(v) {
  if (v instanceof Date) return v;
  const m = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +(m[6] || 0)) - 330 * 60 * 1000) : null;
}

function when(t) {
  return t instanceof Date ? Utilities.formatDate(t, "Asia/Kolkata", "d MMM, h:mm a") : String(t);
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function findRow(sh, col, value) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  // a UTR like 025759167451 that Sheets once stored as the number 25759167451 still matches
  const norm = (x) => (/^\d{9,12}$/.test(String(x)) ? String(x).padStart(12, "0") : String(x));
  const want = norm(value);
  const vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (let i = vals.length - 1; i >= 0; i--) if (norm(vals[i][0]) === want) return i + 2;
  return 0;
}

// Sheets turns "025759167451" into the number 25759167451 unless the cell is plain text — UTRs can start with 0
function asText(range, value) {
  range.setNumberFormat("@").setValue(String(value));
}

function waFormula(sh, r) {
  const v = (h) => sh.getRange(r, R[h]).getValue();
  const text = `✅ Confirmed — ${EVENT.name}\nReg ID: ${v("Reg ID")}\n${v("Category")}\n${EVENT.dates} · ${EVENT.venue}\nPlease bring your Government ID and documents. See you there! — AOGA`;
  const url = `https://wa.me/91${v("Mobile")}?text=${encodeURIComponent(text)}`;
  return `=HYPERLINK("${url.replace(/"/g, '""')}","Send ✅")`;
}
