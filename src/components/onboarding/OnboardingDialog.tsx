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
  ShieldOff,
  FileCode2,
  Bug,
  Bot,
  History,
  Languages,
  Gift,
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
import { Badge } from "@/components/ui/badge";
import { recordOnboardingCompletion } from "@/lib/onboarding.functions";
import { ONBOARDING_TERMS_VERSION } from "@/lib/onboarding";
import { getErrorMessage } from "@/lib/errors";

// Step ordering: insertion of new "sFree" step between welcome (s1) and modes (s2)
// keeps existing i18n keys (s1..s9) untouched.
const STEP_KEYS = ["s1", "sFree", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"] as const;
const TOTAL_STEPS = STEP_KEYS.length;
const ACK_STEP_INDEX = STEP_KEYS.indexOf("s8") + 1; // 1-based
const FINAL_STEP_INDEX = STEP_KEYS.indexOf("s9") + 1;

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

  const stepKey = STEP_KEYS[step - 1];
  const allChecked = useMemo(() => ACK_KEYS.every((k) => checks[k]), [checks]);
  const subtitle = t(`onboarding.steps.${stepKey}.subtitle`, { defaultValue: "" });

  const completeMut = useMutation({
    mutationFn: () => record({ data: { language: i18n.language } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      setStep(FINAL_STEP_INDEX);
    },
    onError: (e) => toast.error(getErrorMessage(e, t("errors.generic"))),
  });

  const close = () => {
    onOpenChange(false);
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

  const skipToAck = () => setStep(ACK_STEP_INDEX);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
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
            {t(`onboarding.steps.${stepKey}.title`)}
          </DialogTitle>
          <DialogDescription className={subtitle ? "text-sm" : "sr-only"}>
            {subtitle || t("onboarding.versionLabel", { version: ONBOARDING_TERMS_VERSION })}
          </DialogDescription>
        </DialogHeader>

        <div
          key={stepKey}
          className="mt-4 min-h-[260px] animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {stepKey === "s1" && <StepWelcome />}
          {stepKey === "sFree" && <StepFree />}
          {stepKey === "s2" && <StepModes />}
          {stepKey === "s3" && <StepProvider onSkip={skipToAck} />}
          {stepKey === "s4" && <StepImport />}
          {stepKey === "s5" && <StepAnalysis />}
          {stepKey === "s6" && <StepReader />}
          {stepKey === "s7" && <StepReview />}
          {stepKey === "s8" && <StepAck checks={checks} setChecks={setChecks} />}
          {stepKey === "s9" && <StepStart onGo={goto} />}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
          <div className="text-[11px] text-muted-foreground">
            {t("onboarding.versionLabel", { version: ONBOARDING_TERMS_VERSION })}
          </div>
          <div className="flex gap-2">
            {step > 1 && step < FINAL_STEP_INDEX && (
              <Button variant="ghost" onClick={back} disabled={completeMut.isPending}>
                {t("onboarding.back")}
              </Button>
            )}
            {step < ACK_STEP_INDEX && <Button onClick={next}>{t("onboarding.continue")}</Button>}
            {step === ACK_STEP_INDEX && (
              <Button
                onClick={() => completeMut.mutate()}
                disabled={!allChecked || completeMut.isPending}
              >
                {completeMut.isPending ? t("onboarding.saving") : t("onboarding.finish")}
              </Button>
            )}
            {step === FINAL_STEP_INDEX && <Button onClick={close}>{t("onboarding.close")}</Button>}
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
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed text-foreground">{t("onboarding.steps.s1.body")}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            <Gift className="mr-1 h-3 w-3" />
            {t("onboarding.welcomeBadges.free")}
          </Badge>
          <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">
            <ShieldOff className="mr-1 h-3 w-3" />
            {t("onboarding.welcomeBadges.noKey")}
          </Badge>
          <Badge variant="secondary" className="border-border bg-muted">
            <ShieldCheck className="mr-1 h-3 w-3" />
            {t("onboarding.welcomeBadges.privacy")}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {(["languages", "formats", "modes"] as const).map((k) => (
          <div key={k} className="rounded-md border border-border bg-card p-3">
            <div className="text-sm font-semibold text-foreground">
              {t(`onboarding.welcomeStats.${k}`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepFree() {
  const { t } = useTranslation();
  const items: { id: string; icon: React.ReactNode; tone: string }[] = [
    { id: "static", icon: <FileCode2 className="h-4 w-4" />, tone: "text-blue-500" },
    { id: "malware", icon: <Bug className="h-4 w-4" />, tone: "text-red-500" },
    { id: "aiOrigin", icon: <Bot className="h-4 w-4" />, tone: "text-purple-500" },
    { id: "upload", icon: <Upload className="h-4 w-4" />, tone: "text-emerald-500" },
    { id: "history", icon: <History className="h-4 w-4" />, tone: "text-amber-500" },
    { id: "i18n", icon: <Languages className="h-4 w-4" />, tone: "text-cyan-500" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className={`mt-0.5 shrink-0 rounded-md bg-muted p-1.5 ${it.tone}`}>{it.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  {t(`onboarding.steps.sFree.items.${it.id}.title`)}
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300"
                >
                  {t("onboarding.steps.sFree.badge")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(`onboarding.steps.sFree.items.${it.id}.body`)}
              </p>
            </div>
          </div>
        ))}
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
        flow={[
          t("onboarding.steps.s2.local.flow.code"),
          t("onboarding.steps.s2.local.flow.model"),
          t("onboarding.steps.s2.local.flow.ui"),
        ]}
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

function StepProvider({ onSkip }: { onSkip: () => void }) {
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("onboarding.steps.s3.configureLater")}</p>
        <Button size="sm" variant="outline" onClick={onSkip}>
          <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
          {t("onboarding.steps.s9.cta.noKey")}
        </Button>
      </div>
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
          <div
            key={o}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-3 text-sm"
          >
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
  const items = [
    "repoSummary",
    "fileExplain",
    "selectionExplain",
    "maintainability",
    "security",
    "inlineComments",
  ] as const;
  return (
    <div className="space-y-4">
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((k) => (
          <li
            key={k}
            className="flex items-start gap-2 rounded-md border border-border bg-card p-3 text-sm"
          >
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
          <li
            key={k}
            className="flex items-center gap-2 rounded-md border border-border bg-card p-3 text-sm"
          >
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
        <div
          key={k}
          className="flex items-start gap-3 rounded-md border border-border bg-card p-3 text-sm"
        >
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
            <span className="leading-snug text-foreground">
              {t(`onboarding.steps.s8.checks.${k}`)}
            </span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <a href="/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {t("byokAck.links.terms")}
        </a>
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          {t("byokAck.links.privacy")}
        </a>
        <a
          href="/data-flow"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          {t("footer.dataFlow")}
        </a>
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
          <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
          {t("onboarding.steps.s9.cta.noKey")}
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
