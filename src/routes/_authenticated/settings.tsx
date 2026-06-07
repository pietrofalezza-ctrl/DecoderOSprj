import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ShieldCheck,
  Sparkles,
  Download,
  Trash2,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import {
  listProviders,
  saveProviderKey,
  deleteProviderKey,
  saveLocalEndpoint,
  deleteLocalEndpoint,
} from "@/lib/credentials.functions";
import { exportMyData, deleteMyAccount } from "@/lib/account.functions";
import { listByokAckHistory } from "@/lib/byok-acknowledgement.functions";
import { useByokAck } from "@/hooks/use-byok-ack";

import { supabase } from "@/integrations/supabase/client";

type Provider = "openai" | "anthropic" | "gemini" | "openrouter";
const PROVIDERS: Provider[] = ["openai", "anthropic", "gemini", "openrouter"];

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);
  const list = useServerFn(listProviders);
  const saveKey = useServerFn(saveProviderKey);
  const removeKey = useServerFn(deleteProviderKey);
  const saveEndpoint = useServerFn(saveLocalEndpoint);
  const removeEndpoint = useServerFn(deleteLocalEndpoint);
  const { requireAck } = useByokAck();

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const prov = useQuery({ queryKey: ["providers"], queryFn: () => list() });

  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<"en" | "it" | "zh">("en");

  useEffect(() => {
    if (profile.data?.profile) {
      setDisplayName(profile.data.profile.display_name ?? "");
      setLanguage((profile.data.profile.preferred_language as any) ?? "en");
    }
  }, [profile.data]);

  const profileMut = useMutation({
    mutationFn: () =>
      updateProfile({ data: { display_name: displayName, preferred_language: language } }),
    onSuccess: () => {
      toast.success(t("settings.saved"));
      i18n.changeLanguage(language);
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("settings.pageIntro")}</p>
          <nav className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "profile", label: t("settings.profileSection") },
              { id: "byok", label: t("settings.byokSection") },
              { id: "local", label: t("settings.localSection") },
              { id: "account", label: t("settings.accountSection") },
            ].map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-border bg-card px-3 py-1 hover:border-primary/40 hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </header>

        <section className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">{t("settings.lovableSection")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t("settings.lovableIntro")}</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                <ShieldCheck className="h-3 w-3" />
                {t("settings.lovableBadge")}
              </p>
            </div>
          </div>
        </section>





        <section id="profile" className="space-y-4 rounded-lg border border-border bg-card p-5 scroll-mt-20">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.profileSection")}
          </h2>
          <div className="space-y-1">
            <Label>{t("settings.displayName")}</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t("settings.language")}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("languages.en")}</SelectItem>
                <SelectItem value="it">{t("languages.it")}</SelectItem>
                <SelectItem value="zh">{t("languages.zh")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => profileMut.mutate()} disabled={profileMut.isPending}>
            {t("settings.save")}
          </Button>
        </section>

        <AcknowledgementSection />

        <section id="byok" className="space-y-4 rounded-lg border border-border bg-card p-5 scroll-mt-20">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.byokSection")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("settings.byokIntro")}</p>
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{t("byokAck.settings.removeKeyWarning")}</span>
          </div>
          <div className="space-y-3">
            {PROVIDERS.map((p) => {
              const existing = prov.data?.keys.find((k) => k.provider === p);
              return (
                <ProviderRow
                  key={p}
                  provider={p}
                  hint={existing?.key_hint ?? null}
                  onSave={(key) =>
                    new Promise<void>((resolve) => {
                      void requireAck(async () => {
                        try {
                          await saveKey({ data: { provider: p, api_key: key } });
                          qc.invalidateQueries({ queryKey: ["providers"] });
                          toast.success(t("settings.saved"));
                        } catch (e: any) {
                          toast.error(e?.message ?? t("errors.generic"));
                        } finally {
                          resolve();
                        }
                      });
                    })
                  }
                  onRemove={async () => {
                    await removeKey({ data: { provider: p } });
                    qc.invalidateQueries({ queryKey: ["providers"] });
                  }}
                />
              );
            })}
          </div>
        </section>


        <section id="local" className="space-y-4 rounded-lg border border-border bg-card p-5 scroll-mt-20">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.localSection")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("settings.localIntro")}</p>
          <div className="space-y-3">
            {(["ollama", "lmstudio"] as const).map((kind) => {
              const existing = prov.data?.endpoints.find((e) => e.kind === kind);
              return (
                <EndpointRow
                  key={kind}
                  kind={kind}
                  current={existing}
                  onSave={async (base_url, default_model) => {
                    await saveEndpoint({
                      data: { kind, base_url, default_model: default_model || undefined },
                    });
                    qc.invalidateQueries({ queryKey: ["providers"] });
                    toast.success(t("settings.saved"));
                  }}
                  onRemove={async () => {
                    await removeEndpoint({ data: { kind } });
                    qc.invalidateQueries({ queryKey: ["providers"] });
                  }}
                />
              );
            })}
          </div>
        </section>

        <AccountPrivacySection />

        <p className="text-center text-xs text-muted-foreground">{t("footer.ownership")}</p>
      </div>
    </AppShell>
  );
}

function AccountPrivacySection() {
  const { t } = useTranslation();
  const exportFn = useServerFn(exportMyData);
  const deleteFn = useServerFn(deleteMyAccount);
  const navigate = useNavigate();

  const exportMut = useMutation({
    mutationFn: () => exportFn(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decoder-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("settings.saved"));
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      await deleteFn();
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      toast.success(t("settings.deleteDone"));
      setTimeout(() => navigate({ to: "/" }), 500);
    },
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  return (
    <section id="account" className="space-y-4 rounded-lg border border-border bg-card p-5 scroll-mt-20">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("settings.accountSection")}
      </h2>
      <p className="text-xs text-muted-foreground">{t("settings.accountIntro")}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportMut.mutate()}
          disabled={exportMut.isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {exportMut.isPending ? t("settings.exporting") : t("settings.exportData")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (window.confirm(t("settings.deleteConfirm"))) deleteMut.mutate();
          }}
          disabled={deleteMut.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteMut.isPending ? t("settings.deleting") : t("settings.deleteAccount")}
        </Button>
      </div>
    </section>
  );
}




function ProviderRow({
  provider,
  hint,
  onSave,
  onRemove,
}: {
  provider: Provider;
  hint: string | null;
  onSave: (key: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{t(`settings.providers.${provider}`)}</span>
        <span className="text-xs text-muted-foreground">
          {hint ? `${t("settings.configured")} · ${hint}` : t("settings.notConfigured")}
        </span>
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="sk-…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <Button
          size="sm"
          disabled={!val.trim() || busy}
          onClick={async () => {
            setBusy(true);
            try { await onSave(val.trim()); setVal(""); } finally { setBusy(false); }
          }}
        >
          {t("settings.addKey")}
        </Button>
        {hint && (
          <Button size="sm" variant="outline" disabled={busy} onClick={onRemove}>
            {t("settings.removeKey")}
          </Button>
        )}
      </div>
    </div>
  );
}

function EndpointRow({
  kind,
  current,
  onSave,
  onRemove,
}: {
  kind: "ollama" | "lmstudio";
  current?: { kind: string; base_url: string; default_model: string | null };
  onSave: (base_url: string, default_model: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState(current?.base_url ?? (kind === "ollama" ? "http://localhost:11434" : "http://localhost:1234"));
  const [model, setModel] = useState(current?.default_model ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{kind}</span>
        <span className="text-xs text-muted-foreground">
          {current ? t("settings.configured") : t("settings.notConfigured")}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input placeholder={t("settings.endpointUrl")} value={url} onChange={(e) => setUrl(e.target.value)} />
        <Input placeholder={t("settings.endpointModel")} value={model} onChange={(e) => setModel(e.target.value)} />
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          disabled={!url.trim() || busy}
          onClick={async () => { setBusy(true); try { await onSave(url.trim(), model.trim()); } finally { setBusy(false); } }}
        >
          {t("settings.addEndpoint")}
        </Button>
        {current && (
          <Button size="sm" variant="outline" disabled={busy} onClick={onRemove}>
            {t("settings.removeKey")}
          </Button>
        )}
      </div>
    </div>
  );
}
