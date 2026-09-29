interface Props {
  className?: string;
  /** hides the wordmark on very small screens */
  compact?: boolean;
}

export function Logo({ className = "", compact }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 drop-shadow-[0_6px_18px_rgba(255,164,31,0.45)]" aria-hidden="true">
        <defs>
          <linearGradient id="evo-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd08a" />
            <stop offset="1" stopColor="#ee8500" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#evo-logo-grad)" />
        <path d="M16 12.5v15l12-7.5z" fill="#0a0a10" />
        <circle cx="9" cy="12" r="1.3" fill="#0a0a10" opacity="0.35" />
        <circle cx="9" cy="20" r="1.3" fill="#0a0a10" opacity="0.35" />
        <circle cx="9" cy="28" r="1.3" fill="#0a0a10" opacity="0.35" />
      </svg>
      <span className={`font-display text-[15px] font-bold tracking-wide text-white ${compact ? "hidden sm:inline" : ""}`}>
        EVOLVE<span className="gold-text">FILM</span>
      </span>
    </span>
  );
}
