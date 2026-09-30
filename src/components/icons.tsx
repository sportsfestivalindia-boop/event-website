import Image from "next/image";

/** Brand lockup: fist-and-bolt mark + two-line wordmark (as in the client's homepage visual). */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Image src="/img/mark.webp" alt="" width={240} height={137} className="h-8 w-auto md:h-9" priority />
      <span className="leading-none">
        <span className="display block text-[17px] tracking-[0.02em] md:text-[19px]">India’s Biggest</span>
        <span className="mt-1 block text-[9px] font-semibold tracking-[0.24em] text-gold uppercase md:text-[10px]">Sports Festival 2026</span>
      </span>
    </span>
  );
}

const ICON: Record<string, React.ReactNode> = {
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  down: <path d="M12 4v15M6 13l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  external: <path d="M8 16L17 7M9 7h8v8" />,
  calendar: <path d="M4 6.5h16v13.5H4zM4 10.5h16M8.5 4v4M15.5 4v4" />,
  pin: <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  users: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.8 2.8 2.6 3 5.2" />,
  ticket: <path d="M3 8.5V6h18v2.5a2.5 2.5 0 0 0 0 5V16H3v-2.5a2.5 2.5 0 0 0 0-5zM14 6v10" transform="rotate(-18 12 11)" />,
  trophy: <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0zM7.5 6H4.5c0 3 1.5 4.5 3.3 4.7M16.5 6h3c0 3-1.5 4.5-3.3 4.7M12 13.5V17M8.5 20h7l-1-3h-5z" />,
  medal: <path d="M8 3l2.5 6M16 3l-2.5 6M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" />,
  shield: <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6zM8.5 12l2.5 2.5 4.5-5" />,
  badge: <path d="M6 3h12v18H6zM9.5 3v3.5h5V3M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8.5 16c.6-2 2-3 3.5-3s2.9 1 3.5 3" />,
  camera: <path d="M3.5 7.5h4l1.5-2.5h6l1.5 2.5h4V19h-17zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />,
  broadcast: <path d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.5 18.5a9 9 0 0 1 0-13M18.5 5.5a9 9 0 0 1 0 13" />,
  hotel: <path d="M3 20V5M3 15h18v5M3 11h7v4M10 11h8a3 3 0 0 1 3 3v1M6.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />,
  clock: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" />,
  bolt: <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z" />,
  rupee: <path d="M7 4h10M7 8.5h10M7 4c5 0 7 1.5 7 4.5S12 13 7 13l8 8" />,
  phone: <path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />,
  lock: <path d="M6 10.5h12V20H6zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />,
  plane: <path d="M3 13.5l7-1.5 4.5-7.5h2l-2 7.5 5 1v2l-5 1 2 5h-2l-4.5-5-7-1z" />,
  train: <path d="M6 4h12v11H6zM6 10h12M8.5 15l-2 5M15.5 15l2 5" />,
  doc: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
  flame: <path d="M12 21c-4 0-6.5-2.7-6.5-6.3 0-3.2 2.2-5 3.5-7.7.5 2 1.5 3 2.5 3.5C12 7 13 4.5 15 3c.2 3 3.5 5.5 3.5 10.2 0 4.8-2.5 7.8-6.5 7.8z" />,
};

export function Icon({ name, className = "size-5" }: { name: keyof typeof ICON | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ICON[name]}
    </svg>
  );
}

/** Filled WhatsApp glyph — the shape Indian users recognise instantly. */
export function WhatsAppGlyph({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="currentColor">
      <path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 6.9L3 29l6.5-2c1.9 1 4.1 1.6 6.5 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.3c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-3.9 1.2 1.2-3.8-.3-.4a10.4 10.4 0 0 1-1.7-5.7C5.1 10 10 5.3 16 5.3S26.9 10 26.9 15.8 22 26.3 16 26.3zm5.9-7.8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.2 1.4 3.5 2.4 3.6 5.8 5c2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.3z" />
    </svg>
  );
}
