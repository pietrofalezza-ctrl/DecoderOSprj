import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Cloud,
  Laptop,
  Server,
  ArrowRight,
  KeyRound,
  Upload,
  ListChecks,
  Users,
  Eye,
  ShieldCheck,
  Rocket,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { recordOnboardingCompletion } from "@/lib/onboarding.functions";
import { ONBOARDING_TERMS_VERSION } from "@/lib/onboarding";

const TOTAL_STEPS = 9;
const ACK_KEYS = ["cost", "providers", "authorized", "review", "terms"] as const;
type AckKey = (typeof ACK_KEYS)[number];

export function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const record = useServerFn(recordOnboardingCompletion);
  const [step, setStep] = useState(1);
  const [checks, setChecks] = useState<Record<AckKey, boolean>>({
    cost: false,
    providers: false,
    authorized: false,
    review: false,
    terms: false,
  });

  const allChecked = useMemo(() => ACK_KEYS.every((k) => checks[k]), [checks]);

  const completeMut = useMutation({
    mutationFn: () => record({ data: { language: i18n.language } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      setStep(9);
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const close = () => {
    onOpenChange(false);
    // reset after a tick so reopen starts fresh once completed
    setTimeout(() => {
      setStep(1);
      setChecks({ cost: false, providers: false, authorized: false, review: false, terms: false });
    }, 200);
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const goto = (to: "/dashboard" | "/settings") => {
    close();
    if (to === "/settings") navigate({ to: "/settings", hash: "byok" });
    else navigate({ to: "/dashboard" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // allow closing only when step 9 (after ack) — earlier steps still dismissable but will re-open next login
        if (!v && !completeMut.isPending) close();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("onboarding.stepLabel", { current: step, total: TOTAL_STEPS })}
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="mt-2 h-1.5" />
          <DialogTitle className="mt-4 text-xl">
            {t(`onboarding.steps.s${step}.title`)}
          </DialogTitle>
          {t(`onboarding.steps.s${step}.subtitle`, { defaultValue: "" }) ? (
            <DialogDescription className="text-sm">
              {t(`onboarding.steps.s${step}.subtitle`)}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="mt-4 min-h-[260px]">
          {step === 1 && <StepWelcome />}
          {step === 2 && <StepModes />}
          {step === 3 && <StepProvider />}
          {step === 4 && <StepImport />}
          {step === 5 && <StepAnalysis />}
          {step === 6 && <StepReader />}
          {step === 7 && <StepReview />}
          {step === 8 && (
            <StepAck checks={checks} setChecks={setChecks} />
          )}
          {step === 9 && <StepStart onGo={goto} />}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
          <div className="text-[11px] text-muted-foreground">
            {t("onboarding.versionLabel", { version: ONBOARDING_TERMS_VERSION })}
          </div>
          <div className="flex gap-2">
            {step > 1 && step < 9 && (
              <Button variant="ghost" onClick={back} disabled={completeMut.isPending}>
                {t("onboarding.back")}
              </Button>
            )}
            {step < 8 && (
              <Button onClick={next}>{t("onboarding.continue")}</Button>
            )}
            {step === 8 && (
              <Button
                onClick={() => completeMut.mutate()}
                disabled={!allChecked || completeMut.isPending}
              >
                {completeMut.isPending ? t("onboarding.saving") : t("onboarding.finish")}
              </Button>
            )}
            {step === 9 && (
              <Button onClick={close}>{t("onboarding.close")}</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Steps ───────── */

function StepWelcome() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground">
          {t("onboarding.steps.s1.body")}
        </p>
      </div>
    </div>
  );
}

function StepModes() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ModeCard
        icon={<Laptop className="h-4 w-4" />}
        title={t("onboarding.steps.s2.local.title")}
        bullets={[
          t("onboarding.steps.s2.local.b1"),
          t("onboarding.steps.s2.local.b2"),
          t("onboarding.steps.s2.local.b3"),
        ]}
        flow={[t("onboarding.steps.s2.local.flow.code"), t("onboarding.steps.s2.local.flow.model"), t("onboarding.steps.s2.local.flow.ui")]}
      />
      <ModeCard
        icon={<Cloud className="h-4 w-4" />}
        title={t("onboarding.steps.s2.cloud.title")}
        bullets={[
          t("onboarding.steps.s2.cloud.b1"),
          t("onboarding.steps.s2.cloud.b2"),
          t("onboarding.steps.s2.cloud.b3"),
          t("onboarding.steps.s2.cloud.b4"),
        ]}
        flow={[
          t("onboarding.steps.s2.cloud.flow.code"),
          t("onboarding.steps.s2.cloud.flow.backend"),
          t("onboarding.steps.s2.cloud.flow.provider"),
          t("onboarding.steps.s2.cloud.flow.ui"),
        ]}
      />
    </div>
  );
}

function ModeCard({
  icon,
  title,
  bullets,
  flow,
}: {
  icon: React.ReactNode;
  title: string;
  bullets: string[];
  flow: string[];
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="rounded-md bg-primary/10 p-1.5 text-primary">{icon}</span>
        {title}
      </div>
      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 p-2 text-[11px]">
        {flow.map((n, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="rounded bg-background px-1.5 py-0.5 font-medium">{n}</span>
            {i < flow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
          </span>
        ))}
      </div>
    </div>
  );
}

const PROVIDERS = [
  { id: "ollama", local: true },
  { id: "lmstudio", local: true },
  { id: "openai", local: false },
  { id: "anthropic", local: false },
  { id: "gemini", local: false },
  { id: "openrouter", local: false },
] as const;

function StepProvider() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {PROVIDERS.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-sm"
          >
            <div className="flex items-center gap-2">
              {p.local ? (
                <Server className="h-4 w-4 text-emerald-500" />
              ) : (
                <Cloud className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium">{t(`onboarding.providers.${p.id}`)}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {p.local ? t("onboarding.providerLocal") : t("onboarding.providerCloud")}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("onboarding.steps.s3.warning")}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("onboarding.steps.s3.configureLater")}</p>
    </div>
  );
}

function StepImport() {
  const { t } = useTranslation();
  const opts = ["zip", "paste", "github", "demo"] as const;
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {opts.map((o) => (
          <div key={o} className="flex items-center gap-3 rounded-md border border-border bg-card p-3 text-sm">
            <Upload className="h-4 w-4 text-primary" />
            <span>{t(`onboarding.steps.s4.opts.${o}`)}</span>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
        {t("onboarding.steps.s4.safePath")}
      </div>
    </div>
  );
}

function StepAnalysis() {
  const { t } = useTranslation();
  const items = ["repoSummary", "fileExplain", "selectionExplain", "maintainability", "security", "inlineComments"] as const;
  return (
    <div className="space-y-4">
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((k) => (
          <li key={k} className="flex items-start gap-2 rounded-md border border-border bg-card p-3 text-sm">
            <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{t(`onboarding.steps.s5.opts.${k}`)}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        {t("onboarding.steps.s5.disclaimer")}
      </div>
    </div>
  );
}

function StepReader() {
  const { t } = useTranslation();
  const levels = ["nonTech", "junior", "intermediate", "senior", "architect", "cto"] as const;
  return (
    <div className="space-y-4">
      <ul className="grid gap-2 sm:grid-cols-2">
        {levels.map((k) => (
          <li key={k} className="flex items-center gap-2 rounded-md border border-border bg-card p-3 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span>{t(`onboarding.steps.s6.levels.${k}`)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{t("onboarding.steps.s6.body")}</p>
    </div>
  );
}

function StepReview() {
  const { t } = useTranslation();
  const points = ["inaccurate", "verify", "actions"] as const;
  return (
    <div className="space-y-3">
      {points.map((k) => (
        <div key={k} className="flex items-start gap-3 rounded-md border border-border bg-card p-3 text-sm">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{t(`onboarding.steps.s7.points.${k}`)}</span>
        </div>
      ))}
    </div>
  );
}

function StepAck({
  checks,
  setChecks,
}: {
  checks: Record<AckKey, boolean>;
  setChecks: React.Dispatch<React.SetStateAction<Record<AckKey, boolean>>>;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-md border border-primary/40 bg-primary/5 p-3 text-xs">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{t("onboarding.steps.s8.intro")}</span>
      </div>
      <div className="space-y-3 rounded-md border border-border p-4">
        {ACK_KEYS.map((k) => (
          <label key={k} className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              checked={checks[k]}
              onCheckedChange={(v) => setChecks((s) => ({ ...s, [k]: v === true }))}
              aria-required
            />
            <span className="leading-snug text-foreground">{t(`onboarding.steps.s8.checks.${k}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepStart({ onGo }: { onGo: (to: "/dashboard" | "/settings") => void }) {
  const { t } = useTranslation();
  const actions = ["a1", "a2", "a3", "a4"] as const;
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
        <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">{t("onboarding.steps.s9.title")}</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {actions.map((k) => (
              <li key={k} className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span>{t(`onboarding.steps.s9.actions.${k}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onGo("/dashboard")}>
          {t("onboarding.steps.s9.cta.demo")}
        </Button>
        <Button variant="outline" onClick={() => onGo("/settings")}>
          {t("onboarding.steps.s9.cta.provider")}
        </Button>
        <Button variant="ghost" onClick={() => onGo("/dashboard")}>
          {t("onboarding.steps.s9.cta.dashboard")}
        </Button>
      </div>
    </div>
  );
}
