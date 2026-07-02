import { useTranslation } from "react-i18next";

export function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

export function InstagramLink({
  showLabel = true,
  className = "",
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <a
      href={t("common.instagramUrl")}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 hover:text-foreground ${className}`}
      aria-label="Instagram"
    >
      <InstagramIcon />
      {showLabel && <span>{t("footer.instagram")}</span>}
    </a>
  );
}
