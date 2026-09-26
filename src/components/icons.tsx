import type { Pictogram as PictogramId } from "@/data/festival";

/** Konark wheel — 8 major spokes with medallions, 8 minor spokes, beaded rim. Master brand asset. */
export function Wheel({ className = "", strokeWidth = 1, hollow = false }: { className?: string; strokeWidth?: number; hollow?: boolean }) {
  const ink = hollow ? "none" : "var(--color-ink, #0b0a08)";
  const major = Array.from({ length: 8 }, (_, i) => i * 45);
  const minor = major.map((a) => a + 22.5);
  const beads = Array.from({ length: 48 }, (_, i) => i * 7.5);
  return (
    <svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <circle r="97" strokeWidth={strokeWidth * 2.5} />
      <circle r="90" />
      <circle r="84" strokeWidth={strokeWidth * 1.5} />
      {beads.map((a) => (
        <circle key={a} r="1.6" cx={Math.cos((a * Math.PI) / 180) * 93.5} cy={Math.sin((a * Math.PI) / 180) * 93.5} fill="currentColor" stroke="none" />
      ))}
      {major.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M-4.5 -20 L-2.6 -84 L2.6 -84 L4.5 -20 Z" fill="currentColor" fillOpacity=".12" />
          <circle cy="-52" r="9" fill={ink} strokeWidth={strokeWidth * 1.4} />
          <circle cy="-52" r="4.5" />
        </g>
      ))}
      {minor.map((a) => (
        <line key={a} y1="-20" y2="-84" transform={`rotate(${a})`} strokeWidth={strokeWidth * 0.8} />
      ))}
      <circle r="20" strokeWidth={strokeWidth * 2} fill={ink} />
      <circle r="13" />
      <circle r="5" fill="currentColor" />
    </svg>
  );
}

/** Sport pictograms — one grid (24), 1.5 stroke, square-ish terminals. */
const PICTO: Record<PictogramId, React.ReactNode> = {
  bodybuilding: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M4 9.5c0-2.4 2.6-3 3.6-1.2L9.5 11h5l1.9-2.7c1-1.8 3.6-1.2 3.6 1.2" />
      <path d="M9.5 11l.6 5h3.8l.6-5M10 16l-1.3 5.5M14 16l1.3 5.5" />
    </>
  ),
  powerlifting: (
    <>
      <path d="M2 12h20" />
      <rect x="4" y="7" width="2.6" height="10" rx=".6" />
      <rect x="17.4" y="7" width="2.6" height="10" rx=".6" />
      <rect x="1.5" y="9" width="1.6" height="6" rx=".4" />
      <rect x="20.9" y="9" width="1.6" height="6" rx=".4" />
    </>
  ),
  weightlifting: (
    <>
      <path d="M2 3.5h20M4 1.5v4M20 1.5v4" />
      <circle cx="12" cy="8.5" r="1.9" />
      <path d="M7 3.5l3.5 7h3l3.5-7M10.5 10.5v5l-3 6M13.5 10.5v5l3 6" />
    </>
  ),
  armwrestling: (
    <>
      <path d="M2.5 20l5-6.5 3-1.2" />
      <path d="M21.5 20l-5-6.5-3-1.2" />
      <path d="M9 12.5c-.2-3 1.4-5.5 3-6 1.6.5 3.2 3 3 6-1.8 1-4.2 1-6 0z" />
      <path d="M5 21.5h14" />
    </>
  ),
  boxing: (
    <>
      <path d="M7 11V7.5A4.5 4.5 0 0 1 11.5 3h1A4.5 4.5 0 0 1 17 7.5V14a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4" />
      <path d="M7 11a2.5 2.5 0 0 1 0 5M9 18v3h6v-3M10.5 9.5h3" />
    </>
  ),
  dangal: (
    <>
      <circle cx="7" cy="5.5" r="2" />
      <circle cx="17" cy="5.5" r="2" />
      <path d="M7 8.5l-2 5 3 2-1.5 6M17 8.5l2 5-3 2 1.5 6" />
      <path d="M7.5 9.5L12 12l4.5-2.5M12 12v2" />
    </>
  ),
  marathon: (
    <>
      <circle cx="14.5" cy="4" r="2" />
      <path d="M8 9.5l3.5-2 3 1.5 1.5 3.5 3 1" />
      <path d="M11.5 7.5l-1.5 6 3.5 2.5-1 6M10 13.5l-3 3.5-4 .5" />
    </>
  ),
};

export function Pictogram({ id, className = "size-7" }: { id: PictogramId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PICTO[id]}
    </svg>
  );
}

/** Utility icons */
const ICON: Record<string, React.ReactNode> = {
  calendar: <path d="M4 6.5h16v13.5H4zM4 10.5h16M8.5 4v4M15.5 4v4" />,
  pin: <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  trophy: <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0zM7.5 6H4.5c0 3 1.5 4.5 3.3 4.7M16.5 6h3c0 3-1.5 4.5-3.3 4.7M12 13.5V17M8.5 20h7l-1-3h-5z" />,
  whatsapp: (
    <>
      <path d="M4 20l1.2-3.8A8 8 0 1 1 8 19z" />
      <path d="M9.2 8.4c.2-.4.5-.4.8-.4h.4c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.4c0 .4-.2.7-.5.9-.6.4-1.6.6-2.9 0a8.6 8.6 0 0 1-4.1-4.1c-.6-1.3-.3-2.4.2-3.2z" />
    </>
  ),
  phone: <path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />,
  shield: <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6zM8.5 12l2.5 2.5 4.5-5" />,
  badge: <path d="M6 3h12v18H6zM9.5 3v3.5h5V3M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8.5 16c.6-2 2-3 3.5-3s2.9 1 3.5 3" />,
  medal: <path d="M8 3l2.5 6M16 3l-2.5 6M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" />,
  camera: <path d="M3.5 7.5h4l1.5-2.5h6l1.5 2.5h4V19h-17zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />,
  broadcast: <path d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.5 18.5a9 9 0 0 1 0-13M18.5 5.5a9 9 0 0 1 0 13" />,
  hotel: <path d="M3 20V5M3 15h18v5M3 11h7v4M10 11h8a3 3 0 0 1 3 3v1M6.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />,
  clock: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  users: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.8 2.8 2.6 3 5.2" />,
  doc: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
  lock: <path d="M6 10.5h12V20H6zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />,
  plane: <path d="M3 13.5l7-1.5 4.5-7.5h2l-2 7.5 5 1v2l-5 1 2 5h-2l-4.5-5-7-1z" />,
  train: <path d="M6 4h12v11H6zM6 10h12M8.5 15l-2 5M15.5 15l2 5M9 12.5h.01M15 12.5h.01" />,
  search: <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20" />,
};

export function Icon({ name, className = "size-5" }: { name: keyof typeof ICON | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ICON[name]}
    </svg>
  );
}

/** AOGA crest placeholder — replaced by the vector crest (client item B7). */
export function Crest({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="All Odisha Gym Association">
      <circle cx="24" cy="24" r="23" fill="#0b0a08" stroke="#d4a537" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18.5" fill="none" stroke="#d4a537" strokeWidth=".6" strokeDasharray="1 2" />
      <text x="24" y="28.5" textAnchor="middle" fontFamily="var(--font-shoulders)" fontWeight="900" fontSize="13" fill="#d4a537" letterSpacing=".5">
        AOGA
      </text>
    </svg>
  );
}
