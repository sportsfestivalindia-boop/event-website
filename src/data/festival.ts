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
  divisions: Division[];
  tbc?: string;
};
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
  email: "info@[domain-tbc]",
  regdNo: "[Regd. No. TBC]",
  gstin: "[GSTIN TBC]",
  address: "[Registered office address TBC], Bhubaneswar, Odisha",
  socials: [{ label: "Instagram", href: "https://instagram.com/aoga_official" }],
  tbc: {
    venue: "Deck p5 says Janata Maidan; 5 posters say Baramunda Ground",
    close: "Registration close date assumed — confirm",
    identity: "Regd. No., GSTIN, address, domain email pending",
  },
} as const;

const BB_MEN: Prize[] = [50000, 30000, 20000, 10000, 5000];
const OPEN_1L: Prize[] = [100000, 50000, 30000, 20000, 10000];

export const CHAMPIONSHIPS: Championship[] = [
  {
    id: "bodybuilding",
    sport: "Bodybuilding & Physique",
    name: "Anil Gochhikar Classic",
    level: "International",
    tagline: "The flagship. Seven divisions, one Champion of Champions.",
    divisions: [
      {
        id: "mens-bb",
        name: "Men’s Bodybuilding",
        classes: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg", "100 kg", "100 kg+"],
        prizes: BB_MEN,
        extras: [
          { label: "Champion of Champions", prize: 2000000 },
          { label: "Runner-up", prize: 500000 },
        ],
        tbc: "Poster lists both “90 KG+” and “100 KG” — top classes to confirm",
      },
      {
        id: "classic-physique",
        name: "Classic Physique",
        classes: ["Below 70 kg", "Above 70 kg"],
        prizes: BB_MEN,
        extras: [
          { label: "Champion of Champions", prize: 150000 },
          { label: "Runner-up", prize: 70000 },
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
      { id: "womens-bb", name: "Women’s Bodybuilding", classes: ["Open"], prizes: OPEN_1L },
      { id: "bikini", name: "Bikini Model", classes: ["Open"], prizes: OPEN_1L },
      { id: "masters", name: "Masters", classes: ["Open"], prizes: OPEN_1L, tbc: "Masters age cut-off" },
      {
        id: "star",
        name: "Star Category",
        classes: ["Open"],
        prizes: OPEN_1L,
        fee: 0,
        note: "For physically disabled athletes · free registration",
      },
    ],
  },
  {
    id: "powerlifting",
    sport: "Powerlifting",
    name: "Ranu National Powerlifting Championship",
    level: "National",
    tagline: "Sixteen classes. Strong Man and Strong Woman titles.",
    divisions: [
      {
        id: "pl-men",
        name: "Men",
        classes: ["53 kg", "59 kg", "66 kg", "74 kg", "83 kg", "93 kg", "105 kg", "105 kg+"],
        prizes: [25000, 20000, 15000, 10000, 5000],
        extras: [{ label: "Strong Man", prize: 100000 }],
      },
      {
        id: "pl-women",
        name: "Women",
        classes: ["47 kg", "52 kg", "57 kg", "63 kg", "69 kg", "76 kg", "84 kg", "84 kg+"],
        prizes: [25000, 20000, 15000, 10000, 5000],
        extras: [{ label: "Strong Woman", prize: 100000 }],
      },
    ],
    tbc: "Deck calls it “All India Open Powerlifting” — confirm name",
  },
  {
    id: "armwrestling",
    sport: "Arm Wrestling",
    name: "All India Open Arm Wrestling",
    level: "National",
    tagline: "Nine weight classes. One overall champion.",
    divisions: [
      {
        id: "aw-open",
        name: "Open",
        classes: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg", "90 kg+"],
        prizes: [30000, 20000, 10000],
        extras: [{ label: "Overall Champion", prize: 100000 }],
        tbc: "Poster: top-3 ₹30k/20k/10k. Deck: top-5 ₹50k→5k. Confirm",
      },
    ],
  },
  {
    id: "dangal",
    sport: "Dangal (Wrestling)",
    name: "Utkal Kesari 2026",
    level: "Heritage",
    tagline: "After 25 years, the Dangal returns.",
    divisions: [
      { id: "kesari", name: "Utkal Kesari", classes: ["Open"], prizes: ["Royal Enfield Bullet", 100000] },
    ],
  },
  {
    id: "boxing",
    sport: "Boxing",
    name: "AOGA Boxing Championship",
    level: "National & International",
    tagline: "Elite and amateur. Men and women.",
    divisions: [],
    tbc: "Categories and prize table not published",
  },
  {
    id: "weightlifting",
    sport: "Weightlifting",
    name: "Weightlifting Championship",
    level: "National",
    tagline: "Snatch. Clean & jerk. Lift the nation.",
    divisions: [],
    tbc: "Named in the deck; no categories or prizes published",
  },
  {
    id: "marathon",
    sport: "Marathon",
    name: "Dutee Marathon",
    level: "National",
    tagline: "Run with the spirit of champions.",
    divisions: [],
    tbc: "Distances conflict (5K/21K/42K vs 2K/5K/10K/21.1K); fee and prizes not published",
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
    title: "The Grand Opening",
    items: ["Opening ceremony", "Athlete check-in + weigh-ins", "Preliminary rounds"],
  },
  {
    day: "Day 2",
    date: "Sat · 5 Dec",
    title: "The Power of Performance",
    items: ["Bodybuilding, powerlifting, weightlifting", "Arm wrestling + boxing bouts", "Marathon"],
  },
  {
    day: "Day 3",
    date: "Sun · 6 Dec",
    title: "The Grand Finale",
    items: ["Championship finals", "Champion of Champions", "Awards + closing celebration"],
  },
];

export const ORGANISERS = [
  { name: "Santosh Mohanty", role: "President" },
  { name: "Anil Gochhikar", role: "Senior Vice-President" },
  { name: "Dwiti Krishna Behera", role: "Secretary" },
];

export const LEGENDS = [
  { name: "Anil Gochhikar", title: "Bodybuilder · The Classic is named after him", line: "Anil Gochhikar Classic", face: "/img/pfp-anil.webp", tbc: true },
  { name: "Ranu Mohanty", title: "Powerlifting champion", line: "Ranu National Powerlifting", face: "/img/pfp-ranu.webp", tbc: true },
  { name: "Dutee Chand", title: "Asian Games silver medallist · Pride of India", line: "Dutee Marathon", face: "/img/pfp-dutee.webp", tbc: true },
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
  { q: "Is the competition drug-tested?", a: "The anti-doping policy for each championship is published in its rulebook.", tbc: true },
  {
    q: "Who judges, and how is it kept fair?",
    a: "An independent panel of certified judges from multiple states. Scores and results are published, and every championship has a formal protest procedure.",
    tbc: true,
  },
  {
    q: "Which day do I need to be in Bhubaneswar?",
    a: "Each category competes on a fixed session. Your session day is shown when you choose your category and on your athlete pass.",
  },
  {
    q: "Can I enter more than one category?",
    a: "Yes — each category is a separate entry. Register once per category.",
    tbc: true,
  },
  { q: "I’m a coach. Can I register my whole team?", a: "Yes. Message us on WhatsApp and our team will send a single payment link for your athletes." },
  {
    q: "Is the Star Category really free?",
    a: "Yes. Registration for physically disabled athletes is free, with a ₹2,10,000 prize table.",
  },
  {
    q: "I paid but didn’t get a confirmation.",
    a: "UPI payments can take a few minutes to confirm. Do not pay again — you’ll receive your confirmation on WhatsApp and email. If not within 30 minutes, message us with your UTR number.",
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
