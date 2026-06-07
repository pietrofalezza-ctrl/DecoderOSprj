import { ArrowRight, Bot, ShieldCheck, Users } from "lucide-react";

export function GuardrailDiagram({ t }: { t: (k: string) => string }) {
  return (
    <div className="border border-border bg-background p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 border border-border bg-card px-2 py-3 text-center">
          <Bot className="mx-auto mb-1.5 h-4 w-4 text-foreground" />
          AI source
        </div>
        <div className="flex flex-col items-center text-foreground">
          <span className="h-px w-6 bg-border" />
          <ArrowRight className="h-3 w-3" />
        </div>
        <div className="flex-1 border-2 border-primary bg-primary/5 px-2 py-3 text-center text-primary">
          <ShieldCheck className="mx-auto mb-1.5 h-4 w-4" />
          Decoder
        </div>
        <div className="flex flex-col items-center text-foreground">
          <span className="h-px w-6 bg-border" />
          <ArrowRight className="h-3 w-3" />
        </div>
        <div className="flex-1 border border-border bg-card px-2 py-3 text-center">
          <Users className="mx-auto mb-1.5 h-4 w-4 text-foreground" />
          You
        </div>
      </div>
      <p className="mt-3 text-[9px] normal-case tracking-normal text-muted-foreground/80">
        {t("landing.guardrail.intro").split(". ")[0]}.
      </p>
    </div>
  );
}

export function CommunityCard({
  icon,
  title,
  body,
  link,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  link: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-3 border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-background"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary">
        {link}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  );
}

export function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
        {n}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </li>
  );
}

export function WhyNowCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function Value({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
