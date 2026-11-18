interface BrandLogoProps {
  size?: 'sm' | 'md';
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'sm', showText = true, className = '' }: BrandLogoProps) {
  const iconBoxClass = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  const textClass =
    size === 'md'
      ? 'font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0'
      : 'font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0';

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconBoxClass} shrink-0`}
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="9" fill="#1D4ED8" />
        <rect x="9.5" y="8.5" width="4.4" height="19" rx="1.2" fill="#93C5FD" />
        <path
          d="M15.6 8.5H18.8C24.1 8.5 27.3 12.2 27.3 18C27.3 23.8 24.1 27.5 18.8 27.5H15.6V23.2H18.6C21.3 23.2 22.9 21.1 22.9 18C22.9 14.9 21.3 12.8 18.6 12.8H15.6V8.5Z"
          fill="#FFFFFF"
        />
      </svg>
      {showText && <span className={textClass}>Thiết Kế Việt 24h</span>}
    </span>
  );
}
