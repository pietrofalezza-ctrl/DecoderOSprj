import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Languages, Save, Globe, Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getEntryFull,
  upsertEntry,
  upsertTranslation,
  translateEntry,
  rebuildEdges,
} from "@/lib/knowledge-engine.functions";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/knowledge/drafts/$id")({
  component: DraftEditor,
});

type Lang = "en" | "it" | "zh";

function DraftEditor() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const get = useServerFn(getEntryFull);
  const saveEntry = useServerFn(upsertEntry);
  const saveTr = useServerFn(upsertTranslation);
  const translate = useServerFn(translateEntry);
  const rebuild = useServerFn(rebuildEdges);

  const q = useQuery({
    queryKey: ["entry", id],
    queryFn: () => get({ data: { id } }),
    retry: false,
  });

  const [meta, setMeta] = useState({
    slug: "",
    type: "concept",
    status: "ai_draft" as "ai_draft" | "in_review" | "published" | "archived",
    tags: "",
    related: "",
  });
  const [lang, setLang] = useState<Lang>("en");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const e = q.data?.entry;
    if (e) {
      setMeta({
        slug: e.slug,
        type: e.type,
        status: e.status,
        tags: (e.tags ?? []).join(", "),
        related: (e.related_slugs ?? []).join(", "),
      });
    }
  }, [q.data?.entry]);

  useEffect(() => {
    const tr = (q.data?.translations ?? []).find((t: { lang: string }) => t.lang === lang);
    setTitle(tr?.title ?? "");
    setSummary(tr?.summary ?? "");
    setBody(tr?.body_md ?? "");
  }, [q.data?.translations, lang]);

  const saveMut = useMutation({
    mutationFn: async (status?: "ai_draft" | "in_review" | "published") => {
      const entryRes = await saveEntry({
        data: {
          id,
          slug: meta.slug,
          type: meta.type,
          status: status ?? meta.status,
          lang_default: "en",
          tags: meta.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          related_slugs: meta.related
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          priority: 0,
        },
      });
      await saveTr({
        data: { entry_id: entryRes.id, lang, title, summary, body_md: body },
      });
      return entryRes;
    },
    onSuccess: () => {
      toast.success("Saved.");
      qc.invalidateQueries({ queryKey: ["entry", id] });
    },
    onError: (e) => toast.error(getErrorMessage(e, "Save failed")),
  });

  const trMut = useMutation({
    mutationFn: (target: "it" | "zh") => translate({ data: { entry_id: id, target } }),
    onSuccess: (_d, target) => {
      toast.success(`Translated to ${target.toUpperCase()}.`);
      qc.invalidateQueries({ queryKey: ["entry", id] });
    },
    onError: (e) => toast.error(getErrorMessage(e, "Translate failed")),
  });

  const edgesMut = useMutation({
    mutationFn: () => rebuild({ data: { entry_id: id } }),
    onSuccess: (r) => toast.success(`Rebuilt ${r.created} edges.`),
    onError: (e) => toast.error(getErrorMessage(e, "Edge rebuild failed")),
  });

  if (q.isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>;
  if (!q.data?.entry) return <p className="text-xs text-muted-foreground">Not found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admin/knowledge/drafts" })}
        >
          ← All drafts
        </Button>
        <span className="text-xs text-muted-foreground">/{meta.slug}</span>
      </div>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">Slug</span>
          <Input value={meta.slug} onChange={(e) => setMeta({ ...meta, slug: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">Type</span>
          <Input value={meta.type} onChange={(e) => setMeta({ ...meta, type: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs sm:col-span-2">
          <span className="text-muted-foreground">Tags (comma-separated)</span>
          <Input value={meta.tags} onChange={(e) => setMeta({ ...meta, tags: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs sm:col-span-2">
          <span className="text-muted-foreground">Related slugs (comma-separated)</span>
          <Input
            value={meta.related}
            onChange={(e) => setMeta({ ...meta, related: e.target.value })}
          />
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-1">
          {(["en", "it", "zh"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-1 text-xs ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
          <span className="ml-auto flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => trMut.mutate("it")}
              disabled={trMut.isPending}
            >
              <Languages className="mr-1 h-3.5 w-3.5" /> AI → IT
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => trMut.mutate("zh")}
              disabled={trMut.isPending}
            >
              <Languages className="mr-1 h-3.5 w-3.5" /> AI → ZH
            </Button>
          </span>
        </div>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Summary"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <Textarea
          placeholder="Body (Markdown)"
          rows={16}
          className="font-mono text-xs"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </section>

      <section className="flex flex-wrap gap-2">
        <Button onClick={() => saveMut.mutate(undefined)} disabled={saveMut.isPending}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save draft
        </Button>
        <Button
          variant="secondary"
          onClick={() => saveMut.mutate("in_review")}
          disabled={saveMut.isPending}
        >
          Mark in review
        </Button>
        <Button
          onClick={() => saveMut.mutate("published")}
          disabled={saveMut.isPending}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Globe className="mr-1.5 h-3.5 w-3.5" />
          Publish
        </Button>
        <Button variant="ghost" onClick={() => edgesMut.mutate()} disabled={edgesMut.isPending}>
          <Network className="mr-1.5 h-3.5 w-3.5" />
          Rebuild edges
        </Button>
      </section>
    </div>
  );
}
