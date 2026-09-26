/** Brand mark: the sun disc + a two-line expanded wordmark. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span aria-hidden className="sun size-7 shrink-0" />
      <span className="label !text-[10px] !leading-[1.25] !tracking-[.18em]">
        India’s Biggest
        <br />
        Sports Festival
      </span>
    </span>
  );
}

const ICON: Record<string, React.ReactNode> = {
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  down: <path d="M12 4v16M6 14l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  whatsapp: (
    <>
      <path d="M4 20l1.2-3.8A8 8 0 1 1 8 19z" />
      <path d="M9.2 8.4c.2-.4.5-.4.8-.4h.4c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.4c0 .4-.2.7-.5.9-.6.4-1.6.6-2.9 0a8.6 8.6 0 0 1-4.1-4.1c-.6-1.3-.3-2.4.2-3.2z" />
    </>
  ),
  external: <path d="M8 16L17 7M9 7h8v8" />,
};

export function Icon({ name, className = "size-5" }: { name: keyof typeof ICON | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="square" className={className} aria-hidden>
      {ICON[name]}
    </svg>
  );
}
