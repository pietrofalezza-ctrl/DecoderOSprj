import { useTranslation } from "react-i18next";

/**
 * Decoder hero illustration: code input = human explanation output.
 * Left card: code lines. Center: equals sign. Right card: explanation lines.
 * Coherent with the {=} logo mark.
 */
export function HeroIllustration() {
  const { t } = useTranslation();

  const codeLines = [
    { w: "70%", c: "text-[#22D3EE]" },
    { w: "55%", c: "text-[#F8FAFC]/80" },
    { w: "80%", c: "text-[#7C3AED]" },
    { w: "45%", c: "text-[#F8FAFC]/80" },
    { w: "65%", c: "text-[#2DD4BF]" },
    { w: "35%", c: "text-[#F8FAFC]/60" },
  ];

  const explainLines = [6, 5, 6, 4, 5, 3];

  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
      style={{
        boxShadow: "var(--shadow-elegant)",
        backgroundImage:
          "linear-gradient(135deg, #0F172A 0%, #111C36 60%, #0F172A 100%)",
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6">
        {/* Code card */}
        <div className="rounded-xl border border-white/10 bg-[#0B1220]/80 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22D3EE]/70" />
            <span className="h-2 w-2 rounded-full bg-[#7C3AED]/60" />
            <span className="h-2 w-2 rounded-full bg-[#2DD4BF]/60" />
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-[#F8FAFC]/40">
              code
            </span>
          </div>
          <div className="space-y-2">
            {codeLines.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 text-right font-mono text-[9px] text-[#F8FAFC]/30">
                  {i + 1}
                </span>
                <span
                  className={`block h-1.5 rounded-sm bg-current ${l.c}`}
                  style={{ width: l.w, opacity: 0.85 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Equals */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#22D3EE]/30 bg-[#0F172A] md:h-14 md:w-14"
            style={{
              boxShadow:
                "0 0 0 1px rgba(34,211,238,0.15), 0 8px 32px -8px rgba(34,211,238,0.35)",
            }}
          >
            <div className="flex flex-col gap-1.5">
              <span className="block h-[2px] w-6 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#2DD4BF] md:w-7" />
              <span className="block h-[2px] w-6 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#2DD4BF] md:w-7" />
            </div>
          </div>
        </div>

        {/* Explanation card */}
        <div className="rounded-xl border border-white/10 bg-[#0B1220]/80 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2DD4BF]/70" />
            <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-[#F8FAFC]/40">
              {t("brand.name")}
            </span>
          </div>
          <div className="space-y-2.5">
            {explainLines.map((words, i) => (
              <div key={i} className="flex flex-wrap gap-1.5">
                {Array.from({ length: words }).map((_, j) => (
                  <span
                    key={j}
                    className="block h-1.5 rounded-full bg-[#F8FAFC]/70"
                    style={{
                      width: `${14 + ((i * 7 + j * 11) % 22)}px`,
                      opacity: 0.55 + ((j % 3) * 0.15),
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#F8FAFC]/40">
        <span>input</span>
        <span className="h-px w-6 bg-[#F8FAFC]/20" />
        <span className="text-[#22D3EE]/70">{"{ = }"}</span>
        <span className="h-px w-6 bg-[#F8FAFC]/20" />
        <span>output</span>
      </div>
    </div>
  );
}
