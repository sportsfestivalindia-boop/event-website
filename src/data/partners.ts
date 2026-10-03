// Brand partners: sponsorship tiers + exhibition stalls at Baramunda Ground.
// Source: AOGA deck "India's Biggest Sports Festival 2026" — p13 (stall rates) and p16 (sponsorship).

export const SPONSOR_MIN = 2_00_000;

export const TIERS = [
  { id: "title", name: "Title Partner", line: "Your brand in the festival name — on every banner, ticket, stream and stage.", top: true },
  { id: "presenting", name: "Presenting Partner", line: "“Presented by” placement across stage, media and the athlete pass." },
  { id: "championship", name: "Championship Partner", line: "Own one championship — Bodybuilding, Powerlifting, Arm Wrestling, Dangal, Boxing or the Marathon." },
  { id: "associate", name: "Associate Partner", line: "Logo placement on venue branding, website and social media." },
  { id: "category", name: "Official Category Partner", line: "Be the official nutrition, sportswear, healthcare or other category brand." },
];

export const SECTORS = ["Nutrition", "Fitness", "Sportswear", "Healthcare", "Hospitality", "Banking", "Automobile", "Technology"];

export const STALLS = [
  { id: "s10x10", size: "10 ft × 10 ft", sqft: 100, price: 60_000 },
  { id: "s20x10", size: "20 ft × 10 ft", sqft: 200, price: 1_20_000 },
  { id: "s20x15", size: "20 ft × 15 ft", sqft: 300, price: 1_50_000 },
  { id: "s25x20", size: "25 ft × 20 ft", sqft: 500, price: 5_00_000 },
  { id: "s50x20", size: "50 ft × 20 ft", sqft: 1000, price: 8_00_000 },
  { id: "s50x30", size: "50 ft × 30 ft", sqft: 1500, price: 10_00_000 },
];

export const STALL_TBC = "GST, what's included (power, furniture, branding) and stall allotment rules not yet confirmed by AOGA";

export const PARTNER_WHY = [
  { icon: "users", t: "Thousands of visitors", b: "Athletes, coaches, gym owners and families across 3 days at Baramunda Ground." },
  { icon: "trophy", t: "6 championships", b: "Bodybuilding to Dangal — one stage for India’s strength and fitness community." },
  { icon: "broadcast", t: "Media & digital reach", b: "Coverage across social media, digital platforms and traditional media." },
  { icon: "badge", t: "Brand activations", b: "Sponsor zones, sampling, athlete meet & greet and on-ground engagement." },
];
