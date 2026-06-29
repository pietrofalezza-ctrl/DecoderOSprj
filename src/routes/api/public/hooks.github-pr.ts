import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * GitHub PR webhook → ingests merged PRs into knowledge_sources and creates
 * an "open" opportunity for editor review. Set GITHUB_WEBHOOK_SECRET in the
 * project secrets and configure the webhook with `application/json` +
 * `pull_request` events.
 *
 * NEVER publishes content. The editor reviews the opportunity in
 * /admin/knowledge/opportunities and converts it to a draft when relevant.
 */
export const Route = createFileRoute("/api/public/hooks/github-pr")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const sigHeader = request.headers.get("x-hub-signature-256") ?? "";
        const raw = await request.text();
        const expected =
          "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
        const a = Buffer.from(sigHeader);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const event = request.headers.get("x-github-event");
        if (event !== "pull_request") return new Response("ignored", { status: 200 });

        const payload = JSON.parse(raw) as {
          action?: string;
          pull_request?: {
            number: number;
            title: string;
            body?: string | null;
            merged?: boolean;
            html_url: string;
            user?: { login?: string };
          };
          repository?: { full_name?: string };
        };
        if (payload.action !== "closed" || !payload.pull_request?.merged) {
          return new Response("not a merged PR", { status: 200 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const pr = payload.pull_request;
        const repo = payload.repository?.full_name ?? "unknown";

        const { data: src, error: sErr } = await supabaseAdmin
          .from("knowledge_sources")
          .insert({
            kind: "pr",
            ref: `${repo}#${pr.number}`,
            payload: { title: pr.title, body: pr.body, url: pr.html_url, author: pr.user?.login },
          })
          .select("id")
          .single();
        if (sErr) return new Response(sErr.message, { status: 500 });

        await supabaseAdmin.from("knowledge_opportunities").insert({
          title: `PR: ${pr.title}`,
          rationale: (pr.body ?? "").slice(0, 800),
          suggested_type: "capability",
          suggested_slug: `pr-${pr.number}-${pr.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`,
          keywords: [],
          status: "open",
          kind: "pr",
          source: "pr",
          generated_from: { source_id: src.id, url: pr.html_url, author: pr.user?.login },
          priority: 5,
        });

        return Response.json({ ok: true, source_id: src.id });
      },
    },
  },
});
