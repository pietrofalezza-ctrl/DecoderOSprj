import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Cloud,
  ExternalLink,
  Laptop,
  Server,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { recordByokAck } from "@/lib/byok-acknowledgement.functions";
import { BYOK_TERMS_VERSION } from "@/lib/byok-acknowledgement";

const CHECK_KEYS = ["cost", "providers", "authorized", "review", "terms"] as const;
type CheckKey = (typeof CHECK_KEYS)[number];

export function ByokAcknowledgementDialog({
  open,
  onOpenChange,
  onAccepted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAccepted?: () => void | Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const record = useServerFn(recordByokAck);
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({
    cost: false,
    providers: false,
    authorized: false,
    review: false,
    terms: false,
  });
  const [flowOpen, setFlowOpen] = useState(false);

  const allChecked = useMemo(() => CHECK_KEYS.every((k) => checks[k]), [checks]);

  const mut = useMutation({
    mutationFn: () => record({ data: { language: i18n.language } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["byok-ack"] });
      onOpenChange(false);
      setChecks({ cost: false, providers: false, authorized: false, review: false, terms: false });
      setFlowOpen(false);
      if (onAccepted) await onAccepted();
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !mut.isPending && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <DialogTitle className="text-lg">{t("byokAck.title")}</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {t("byokAck.versionLabel", { version: BYOK_TERMS_VERSION })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          {(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"] as const).map((k) => (
            <li key={k}>{t(`byokAck.body.${k}`)}</li>
          ))}
        </ol>

        <Collapsible open={flowOpen} onOpenChange={setFlowOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ChevronDown
                className={"h-3.5 w-3.5 transition-transform " + (flowOpen ? "rotate-180" : "")}
              />
              {t("byokAck.dataFlow.toggle")}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3 rounded-md border border-border bg-muted/40 p-3 text-xs">
            <div>
              <p className="font-medium text-foreground">{t("byokAck.dataFlow.localTitle")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
                <FlowNode icon={<Laptop className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.userMachine")} />
                <ArrowRight className="h-3.5 w-3.5" />
                <FlowNode icon={<Server className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.localModel")} />
                <ArrowRight className="h-3.5 w-3.5" />
                <FlowNode icon={<Laptop className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.decoderUi")} />
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("byokAck.dataFlow.cloudTitle")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
                <FlowNode icon={<Laptop className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.codeSelection")} />
                <ArrowRight className="h-3.5 w-3.5" />
                <FlowNode icon={<Server className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.decoderBackend")} />
                <ArrowRight className="h-3.5 w-3.5" />
                <FlowNode icon={<Cloud className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.aiProvider")} />
                <ArrowRight className="h-3.5 w-3.5" />
                <FlowNode icon={<Laptop className="h-3.5 w-3.5" />} label={t("byokAck.dataFlow.decoderUi")} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Link to="/terms" target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline">
            {t("byokAck.links.terms")} <ExternalLink className="h-3 w-3" />
          </Link>
          <Link to="/privacy" target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline">
            {t("byokAck.links.privacy")} <ExternalLink className="h-3 w-3" />
          </Link>
          <Link to="/docs" target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline">
            {t("byokAck.links.docs")} <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-5 space-y-3 rounded-md border border-border p-4">
          {CHECK_KEYS.map((k) => (
            <label key={k} className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={checks[k]}
                onCheckedChange={(v) => setChecks((s) => ({ ...s, [k]: v === true }))}
                aria-required
              />
              <span className="leading-snug text-foreground">{t(`byokAck.checks.${k}`)}</span>
            </label>
          ))}
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            variant="ghost"
            disabled={mut.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("byokAck.cancel")}
          </Button>
          <Button
            disabled={!allChecked || mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? t("byokAck.saving") : t("byokAck.cta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FlowNode({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
      {icon}
      <span>{label}</span>
    </span>
  );
}
