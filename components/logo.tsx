/**
 * StudioBook brand mark — a camera lens rising from an open book.
 * Strokes inherit `currentColor` (navy on light, white on navy). The lens needs an
 * opaque disc behind it to mask the book lines, so pass `bg` = the surface colour it
 * sits on (white by default, navy on the dark header).
 */

export function LogoMark({
  className = "h-7 w-7",
  bg = "#FFFFFF",
}: {
  className?: string;
  bg?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="StudioBook"
    >
      {/* Open book */}
      <g transform="translate(3.2 11.2) scale(2.4)" strokeWidth={1.25}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </g>
      {/* Camera lens rising from the book */}
      <circle cx="32" cy="20" r="9" fill={bg} stroke="none" />
      <circle cx="32" cy="20" r="9" />
      <circle cx="32" cy="20" r="3.2" strokeWidth={2.3} />
      <path d="M38 12.5 h4" />
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark. `markBg` masks the lens; `accent` colours "Book". */
export function Logo({
  className = "",
  markClassName = "h-7 w-7",
  accentClassName = "text-accent",
  markBg = "#FFFFFF",
}: {
  className?: string;
  markClassName?: string;
  accentClassName?: string;
  markBg?: string;
}) {
  return (
    <span className={`flex items-center gap-2 text-lg font-extrabold tracking-tight ${className}`}>
      <LogoMark className={markClassName} bg={markBg} />
      <span>
        Studio<span className={accentClassName}>Book</span>
      </span>
    </span>
  );
}
