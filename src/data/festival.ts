// THE facts file. Every number, date and name on the site comes from here.
// `tbc` = not yet confirmed by AOGA. Preview builds show a TBC badge; production hides tbc items.

export type Prize = number | string; // string = non-cash prize (e.g. a motorcycle)
export type Extra = { label: string; prize: Prize };
export type Division = {
  id: string;
  name: string;
  classes: string[]; // weight / height / age classes; ["Open"] if none
  prizes: Prize[]; // per class, 1st → last paid place
  extras?: Extra[]; // overall titles contested across the division
  fee?: number; // overrides EVENT.fee
  note?: string;
  tbc?: string;
};
export type Championship = {
  id: string;
  sport: string;
  name: string;
  level: string;
  tagline: string;
  when: string; // competition day(s), from the circular schedule
  divisions: Division[];
  tbc?: string;
};
// Source of truth since 1 Oct 2026: AOGA official circular "Circular Design v3" (Ref. AOGA/AGC/2026/001).
export const EVENT = {
  name: "India’s Biggest Sports Festival",
  year: 2026,
  organiser: "All Odisha Gym Association",
  organiserShort: "AOGA",
  start: "2026-12-04T09:00:00+05:30",
  dateLabel: "4–6 Dec 2026",
  venue: "Baramunda Ground Field",
  city: "Bhubaneswar, Odisha",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Baramunda+Ground+Bhubaneswar",
  registrationCloses: "2026-11-20T23:59:59+05:30",
  fee: 5000,
  prizePool: 1_50_00_000,
  phone: "+91 99388 18919",
  phoneHref: "tel:+919938818919",
  whatsappHref: "https://wa.me/919938818919?text=" + encodeURIComponent("Hi, I have a question about registering for India’s Biggest Sports Festival 2026."),
  email: "aogaofficial@gmail.com",
  circularRef: "AOGA/AGC/2026/001",
  // ponytail: placeholder is deliberately NOT a valid UPI ID (no "@"), so nobody can pay a stranger by accident.
  upi: { id: "AOGA-UPI-ID-PENDING", payee: "All Odisha Gym Association" },
  regdNo: "[Regd. No. TBC]",
  gstin: "[GSTIN TBC]",
  address: "Baramunda Ground, Bhubaneswar, Odisha, India",
  socials: [{ label: "Instagram · @aoga_official", href: "https://instagram.com/aoga_official" }],
  tagline: "Strength · Discipline · Tradition · Culture · Odisha",
  tbc: {
    close: "Circular leaves registration opening/closing dates blank — 20 Nov assumed",
    identity: "Regd. No. and GSTIN not in the circular",
    upi: "AOGA's UPI ID needed — this QR is not payable until then",
  },
} as const;

const BB_MEN: Prize[] = [50000, 30000, 20000, 10000, 5000];
const OPEN_1L: Prize[] = [100000, 50000, 30000, 20000, 10000];

const FEE_TBC = "Circular lists fees for physique categories and the marathon only — fee to be announced";

// Six championships per circular §2.4; categories §4; prizes §9; fees §7; days §5.
export const CHAMPIONSHIPS: Championship[] = [
  {
    id: "bodybuilding",
    sport: "Bodybuilding & Physique",
    name: "Anil Gochhikar Classic",
    level: "International",
    tagline: "The flagship. Seven divisions, one Champion of Champions.",
    when: "Prelims Sat 5 Dec · Finals Sun 6 Dec, from 5 PM",
    divisions: [
      {
        id: "mens-bb",
        name: "Men’s Bodybuilding",
        classes: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg", "90–100 kg", "100 kg+"],
        prizes: BB_MEN,
        extras: [
          { label: "Champion of Champions", prize: 2000000 },
          { label: "Runner-up", prize: 500000 },
        ],
      },
      {
        id: "mens-physique",
        name: "Men’s Physique",
        classes: ["Below 165 cm", "Above 165 cm"],
        prizes: BB_MEN,
        extras: [
          { label: "Champion of Champions", prize: 500000 },
          { label: "Runner-up", prize: 150000 },
        ],
      },
      {
        id: "classic-physique",
        name: "Classic Physique",
        classes: ["Category 1", "Category 2"],
        prizes: BB_MEN,
        extras: [
          { label: "Champion of Champions", prize: 150000 },
          { label: "Runner-up", prize: 70000 },
        ],
        tbc: "Circular leaves the two Classic Physique category limits blank",
      },
      { id: "womens-bb", name: "Women’s Bodybuilding", classes: ["Open"], prizes: OPEN_1L },
      { id: "bikini", name: "Bikini Model", classes: ["Open"], prizes: OPEN_1L },
      { id: "masters", name: "Masters", classes: ["Open"], prizes: OPEN_1L, note: "For athletes aged 45 years & above" },
      {
        id: "star",
        name: "Star Category",
        classes: ["Open"],
        prizes: OPEN_1L,
        fee: 0,
        note: "For physically disabled / para athletes · free registration",
      },
    ],
  },
  {
    id: "powerlifting",
    sport: "Powerlifting",
    name: "All India Open Powerlifting Championship",
    level: "National",
    tagline: "Strong Man and Strong Woman titles.",
    when: "Fri 4 Dec, from 11 AM",
    divisions: [
      {
        id: "pl-men",
        name: "Men",
        classes: ["53 kg", "59 kg", "66 kg", "74 kg", "83 kg", "93 kg", "105 kg", "105 kg+"],
        prizes: [25000, 20000, 15000, 10000, 5000],
        extras: [{ label: "Strong Man", prize: 100000 }],
        tbc: `Weight classes from the earlier poster (not in circular). ${FEE_TBC}`,
      },
      {
        id: "pl-women",
        name: "Women",
        classes: ["47 kg", "52 kg", "57 kg", "63 kg", "69 kg", "76 kg", "84 kg", "84 kg+"],
        prizes: [25000, 20000, 15000, 10000, 5000],
        extras: [{ label: "Strong Woman", prize: 100000 }],
        tbc: `Weight classes from the earlier poster (not in circular). ${FEE_TBC}`,
      },
    ],
  },
  {
    id: "armwrestling",
    sport: "Arm Wrestling",
    name: "Arm Wrestling Championship",
    level: "National",
    tagline: "Top three in every class, plus a Champion of Champions.",
    when: "Fri 4 Dec, from 11 AM",
    divisions: [
      {
        id: "aw-open",
        name: "Open",
        classes: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg", "90 kg+"],
        prizes: [30000, 20000, 10000],
        extras: [{ label: "Champion of Champions", prize: 100000 }],
        tbc: `Weight classes from the earlier poster (not in circular). ${FEE_TBC}`,
      },
    ],
  },
  {
    id: "dangal",
    sport: "Dangal (Matti Kusti)",
    name: "Utkal Kesari Dangal",
    level: "Heritage",
    tagline: "After 25 years, the Dangal returns.",
    when: "Fri 4 Dec, from 11 AM",
    divisions: [{ id: "kesari", name: "Utkal Kesari", classes: ["Open"], prizes: ["Royal Enfield Bullet", 100000], tbc: FEE_TBC }],
  },
  {
    id: "boxing",
    sport: "Boxing",
    name: "Boxing Championship",
    level: "National",
    tagline: "Gloves on in Bhubaneswar.",
    when: "Fri 4 Dec, from 11 AM",
    divisions: [],
    tbc: "Circular lists Boxing but leaves categories and prizes blank",
  },
  {
    id: "marathon",
    sport: "Marathon",
    name: "Dutee’s Marathon",
    level: "National",
    tagline: "Run with the spirit of champions.",
    when: "Fri 4 Dec, 5:30 AM start",
    divisions: [{ id: "run", name: "Open", classes: ["Open"], prizes: [], fee: 600, tbc: "Distances and prizes not in the circular" }],
  },
];

// ---- derived numbers (never hand-type these) ----
const cash = (p: Prize) => (typeof p === "number" ? p : 0);
export const divisionTotal = (d: Division) =>
  d.classes.length * d.prizes.reduce<number>((s, p) => s + cash(p), 0) +
  (d.extras ?? []).reduce((s, e) => s + cash(e.prize), 0);
export const championshipTotal = (c: Championship) => c.divisions.reduce((s, d) => s + divisionTotal(d), 0);
export const allocated = CHAMPIONSHIPS.reduce((s, c) => s + championshipTotal(c), 0);
export const unallocated = EVENT.prizePool - allocated;
export const paidPlaces = CHAMPIONSHIPS.flatMap((c) => c.divisions).reduce(
  (s, d) => s + d.classes.length * d.prizes.length + (d.extras?.length ?? 0),
  0,
);
export const categoryCount = CHAMPIONSHIPS.flatMap((c) => c.divisions).reduce((s, d) => s + d.classes.length, 0);
export const topPrize = Math.max(...CHAMPIONSHIPS.flatMap((c) => c.divisions.flatMap((d) => [...d.prizes, ...(d.extras ?? []).map((e) => e.prize)].map(cash))));

export const HEADLINE_PRIZES: { label: string; sub: string; prize: Prize }[] = [
  { label: "Champion of Champions", sub: "Men’s Bodybuilding", prize: 2000000 },
  { label: "Champion of Champions", sub: "Men’s Physique", prize: 500000 },
  { label: "Utkal Kesari", sub: "Dangal winner", prize: "Royal Enfield Bullet" },
  { label: "Strong Man · Strong Woman", sub: "Powerlifting", prize: 100000 },
];

export const VALUE: { title: string; body: string; icon: string; tbc?: boolean }[] = [
  { title: "Official athlete ID", body: "Your entry pass and access to the athlete zone on your competition day.", icon: "badge" },
  { title: "Medal, certificate & T-shirt", body: "Festival medal, participation certificate and official athlete T-shirt.", icon: "medal", tbc: true },
  { title: "Your photos & reel", body: "10 professional stage photos + a 15-second Instagram reel of you, within 72 hours.", icon: "camera", tbc: true },
  { title: "Live on stream", body: "Your category is broadcast live — family and friends can watch from home.", icon: "broadcast", tbc: true },
  { title: "Warm-up zone & medical", body: "Pump-up area, drinking water, and doctors on site all 3 days.", icon: "shield", tbc: true },
  { title: "Hotel & travel help", body: "Special athlete rates at partner hotels in Bhubaneswar.", icon: "hotel", tbc: true },
];

export const DAYS = [
  {
    day: "Day 1",
    date: "Fri · 4 Dec",
    title: "Strength Day",
    items: [
      "5:30 AM — Dutee’s Marathon start",
      "8–10 AM — Athlete spot registration",
      "10 AM — Athlete check-in",
      "11 AM onwards — Boxing, Powerlifting, Arm Wrestling, Matti Kusti",
      "5 PM — Cultural programme",
      "7 PM — Stage inauguration & marathon prizes",
    ],
  },
  {
    day: "Day 2",
    date: "Sat · 5 Dec",
    title: "Bodybuilding Prelims",
    items: ["8 AM — Registration / check-in, strength-sport competitions", "5 PM — Bodybuilding preliminary rounds", "Cultural programme"],
  },
  {
    day: "Day 3",
    date: "Sun · 6 Dec",
    title: "The Grand Finale",
    items: ["5 PM — Bodybuilding finals", "Championship finals & Champion of Champions", "Prize distribution & closing ceremony"],
  },
];

export const ORGANISERS = [
  { name: "Rosaleen Nayak", role: "Chairman" },
  { name: "Santosh Mohanty", role: "President" },
  { name: "Anil Gochhikar", role: "Senior Vice-President" },
  { name: "Dwiti Krishna Behera", role: "Secretary" },
];

export const COMMITTEE = [
  "Rosaleen Nayak", "Santosh Mohanty", "Dwiti Krishna Behera", "Bhabani Sankar Sahoo", "Jalal Khan", "Rameswari Nanda",
  "Lopamudra Sahoo", "Sangita Singh", "Ranu Mohanty", "Nishant Bahidar", "SK Mustaque", "Manoj Kumar Swain",
  "Sanjay Kumar Sahoo", "Biswajeet Mallick", "Soubhagya Ranjan Sahoo", "Akhilla Pattnaik",
];

export const DOCUMENTS = ["Government ID", "Age proof", "Recent photograph", "Association / federation details", "Athlete self-declaration", "Medical declaration, if applicable"];

export const LEGENDS = [
  { name: "Anil Gochhikar", title: "Bodybuilder · The Classic is named after him", line: "Anil Gochhikar Classic", face: "/img/pfp-anil.webp", tbc: true },
  { name: "Ranu Mohanty", title: "Asian Powerlifting Championship silver medallist · Senior National champion", line: "All India Open Powerlifting", face: "/img/pfp-ranu.webp", tbc: true },
  { name: "Dutee Chand", title: "Olympian · 2× Asian Games silver medallist (2018) · National 100m record holder", line: "Dutee’s Marathon", face: "/img/pfp-dutee.webp", tbc: true },
];

export const FAQ: { q: string; a: string; tbc?: boolean }[] = [
  {
    q: "Is the prize money guaranteed?",
    a: "Yes. The ₹1.5 Crore prize pool is committed by the organisers and does not depend on how many athletes register. The full payout policy — timelines, KYC and tax — is published on the prize page.",
    tbc: true,
  },
  {
    q: "What does the ₹5,000 registration include?",
    a: "Competition entry, official accreditation, medal and certificate, athlete kit, professional stage photos and a short reel of your moment, live-stream presence and athlete-lounge access.",
    tbc: true,
  },
  {
    q: "Can I get a refund?",
    a: "Full refund if the organiser cancels or postpones. 50% refund until 31 October. You can transfer your entry to another athlete or change category free of charge until registrations close.",
    tbc: true,
  },
  {
    q: "When and how are prizes paid?",
    a: "Winners are announced on stage and paid by bank transfer after KYC (PAN + bank details). Tax (TDS) is deducted as required by Indian law.",
    tbc: true,
  },
  {
    q: "Which federation rules apply? Will competing affect my federation status?",
    a: "Athletes from all federations are welcome. Sport-specific rules, judging criteria and weigh-in procedures are published in each rulebook.",
    tbc: true,
  },
  {
    q: "Is the competition drug-tested?",
    a: "If anti-doping testing is implemented, athletes must comply with the applicable rules and testing procedures. Every athlete signs an anti-doping consent at registration.",
  },
  {
    q: "Who judges, and how is it kept fair?",
    a: "A panel of qualified judges appointed by the Organising / Technical Committee, led by a Chief Judge with jury, statisticians and marshals. Judges must stay impartial, follow the official criteria, and may not coach or photograph competitors while judging.",
  },
  {
    q: "Which day do I need to be in Bhubaneswar?",
    a: "Marathon, powerlifting, arm wrestling, boxing and Dangal start on Friday 4 Dec. Bodybuilding & physique prelims are on Saturday 5 Dec and finals on Sunday 6 Dec. Your day is shown when you pick your category.",
  },
  {
    q: "Is weigh-in compulsory?",
    a: "Yes. Weight-category athletes must complete the official weigh-in within the scheduled time — missing it means elimination.",
  },
  {
    q: "What documents do I need to bring?",
    a: "Government ID, age proof, a recent photograph, your association / federation details, the signed athlete self-declaration and a medical declaration if applicable.",
  },
  { q: "Who is the Masters category for?", a: "Athletes aged 45 years and above." },
  {
    q: "How much is the marathon entry?",
    a: "Dutee’s Marathon entry is ₹600. All bodybuilding and physique categories are ₹5,000. The Star / Para category is free.",
  },
  {
    q: "Can I enter more than one category?",
    a: "Yes — each category is a separate entry. Register once per category.",
    tbc: true,
  },
  { q: "I’m a coach. Can I register my whole team?", a: "Yes. Message us on WhatsApp with your athletes’ details and our team will send one UPI QR for the total." },
  {
    q: "Is the Star Category really free?",
    a: "Yes. Registration for physically disabled athletes is free, with a ₹2,10,000 prize table.",
  },
  {
    q: "I paid but didn’t get a confirmation.",
    a: "Do not pay again. After paying by UPI QR, enter your 12-digit UTR number — AOGA checks it against the bank statement and confirms on WhatsApp within 24 hours. If you closed the page, WhatsApp us your payment screenshot.",
  },
];

export const registerHref = (champ?: string, division?: string, cls?: string) => {
  const q = new URLSearchParams();
  if (champ) q.set("sport", champ);
  if (division) q.set("division", division);
  if (cls) q.set("class", cls);
  const s = q.toString();
  return "/register" + (s ? `?${s}` : "");
};
