import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { knowledgeDashboard, proposeFromText } from "@/lib/knowledge-engine.functions";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/knowledge/")({
  component: DashboardPage,
});

function DashboardPage() {
  const qc = useQueryClient();
  const dash = useServerFn(knowledgeDashboard);
  const propose = useServerFn(proposeFromText);
  const [text, setText] = useState("");
  const [hint, setHint] = useState("");

  const q = useQuery({ queryKey: ["knowledge-dash"], queryFn: () => dash(), retry: false });
  const proposeMut = useMutation({
    mutationFn: () => propose({ data: { text, hint: hint || undefined } }),
    onSuccess: () => {
      toast.success("Opportunity drafted by AI.");
      setText("");
      setHint("");
      qc.invalidateQueries({ queryKey: ["knowledge-dash"] });
    },
    onError: (e) => toast.error(getErrorMessage(e, "Propose failed")),
  });

  if (q.error && /forbidden/i.test(getErrorMessage(q.error, ""))) {
    return <p className="text-sm text-muted-foreground">Admin only.</p>;
  }

  const entries = q.data?.entries ?? {};
  const opps = q.data?.opportunities ?? {};

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2">
        <Card title="Entries by status" data={entries} />
        <Card title="Opportunities by status" data={opps} />
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Propose new content from text
        </h2>
        <p className="text-xs text-muted-foreground">
          Paste a PR description, README, changelog, or feature brief. The AI extracts a draft
          opportunity. Nothing is published automatically.
        </p>
        <Input
          placeholder="Optional hint (e.g. 'focus on BYOK angle')"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
        />
        <Textarea
          rows={8}
          placeholder="Paste source text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          onClick={() => proposeMut.mutate()}
          disabled={proposeMut.isPending || text.length < 20}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {proposeMut.isPending ? "Drafting…" : "Generate opportunity"}
        </Button>
      </section>
    </div>
  );
}

function Card({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="mt-2 text-2xl font-semibold">{total}</p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {Object.entries(data).map(([k, v]) => (
          <li key={k} className="flex justify-between">
            <span>{k}</span>
            <span className="font-mono">{v}</span>
          </li>
        ))}
        {total === 0 && <li>No records yet.</li>}
      </ul>
    </div>
  );
}
