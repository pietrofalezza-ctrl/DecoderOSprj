import { useTranslation } from "react-i18next";

/**
 * Decoder logo.
 * Mark: rounded square containing the symbol "{=}" — curly braces stand for
 * code, the equals sign for translation / understanding.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/favicon.png"
      width={size}
      height={size}
      alt="Decoder"
      className={className}
      style={{ borderRadius: 8 }}
    />
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
