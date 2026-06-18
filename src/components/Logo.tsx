import { useTranslation } from "react-i18next";

/**
 * Decoder logo.
 * Mark: rounded square containing the symbol "{=}" — curly braces stand for
 * code, the equals sign for translation / understanding.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Decoder"
      className={className}
    >
      <defs>
        <linearGradient id="decoder-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="decoder-mark-fg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="10"
        fill="url(#decoder-mark-bg)"
        stroke="#22D3EE"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      {/* { */}
      <path
        d="M14 11 C 11.5 11, 11 12.5, 11 14.5 L 11 18 C 11 19.2, 10.4 20, 9 20 C 10.4 20, 11 20.8, 11 22 L 11 25.5 C 11 27.5, 11.5 29, 14 29"
        fill="none"
        stroke="url(#decoder-mark-fg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* = */}
      <line
        x1="17"
        y1="17.5"
        x2="23"
        y2="17.5"
        stroke="#F8FAFC"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="22.5"
        x2="23"
        y2="22.5"
        stroke="#F8FAFC"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* } */}
      <path
        d="M26 11 C 28.5 11, 29 12.5, 29 14.5 L 29 18 C 29 19.2, 29.6 20, 31 20 C 29.6 20, 29 20.8, 29 22 L 29 25.5 C 29 27.5, 28.5 29, 26 29"
        fill="none"
        stroke="url(#decoder-mark-fg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <LogoMark size={32} />
      {withWordmark && <span className="text-base">{t("brand.name")}</span>}
    </span>
  );
}
