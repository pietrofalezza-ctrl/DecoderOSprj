import { useTranslation } from "react-i18next";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-2 font-semibold">
      <span
        aria-hidden
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card font-mono text-[11px] tracking-tighter text-primary shadow-sm"
        style={{ backgroundImage: "var(--gradient-logo)" }}
      >
        &lt;/&gt;
      </span>
      {withWordmark && <span>{t("brand.name")}</span>}
    </span>
  );
}
