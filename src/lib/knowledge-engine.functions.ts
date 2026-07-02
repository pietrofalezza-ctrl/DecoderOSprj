import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`role check failed: ${error.message}`);
  if (!data) throw new Error("Forbidden");
}

type EntryStatus = "ai_draft" | "in_review" | "published" | "archived";
type EntryType = "capability" | "concept" | "integration" | "format" | "case_study" | "guide";
type OppStatus = "open" | "accepted" | "dismissed" | "converted";

async function audit(
  actor: string,
  action: string,
  payload: { entry_id?: string; opportunity_id?: string; diff?: unknown },
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("knowledge_audit").insert({
    actor,
    action,
    entry_id: payload.entry_id ?? null,
    opportunity_id: payload.opportunity_id ?? null,
    diff: (payload.diff ?? {}) as never,
  });
}

// ---------- Dashboard ----------
export const knowledgeDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [entries, opps, audits] = await Promise.all([
      supabaseAdmin.from("knowledge_entries").select("status").limit(1000),
      supabaseAdmin.from("knowledge_opportunities").select("status").limit(1000),
      supabaseAdmin
        .from("knowledge_audit")
        .select("id, action, entity_type:entry_id, at, actor")
        .order("at", { ascending: false })
        .limit(20),
    ]);
    const byStatus = (rows: { status: string }[] | null) =>
      (rows ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      }, {});
    return {
      entries: byStatus(entries.data as { status: string }[] | null),
      opportunities: byStatus(opps.data as { status: string }[] | null),
      recent: audits.data ?? [],
    };
  });

// ---------- Opportunities ----------
export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ status: z.string().optional() }).optional())
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("knowledge_opportunities")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (data?.status) q = q.eq("status", data.status as OppStatus);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [] };
  });

export const updateOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["open", "accepted", "dismissed", "converted"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("knowledge_opportunities")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    await audit(context.userId, `opportunity:${data.status}`, { opportunity_id: data.id });
    return { ok: true };
  });

// ---------- Drafts ----------
export const listDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("knowledge_entries")
      .select("id, slug, type, status, lang_default, updated_at, published_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return { rows: data ?? [] };
  });

export const getEntryFull = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: entry }, { data: translations }] = await Promise.all([
      supabaseAdmin.from("knowledge_entries").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin.from("knowledge_translations").select("*").eq("entry_id", data.id),
    ]);
    return { entry, translations: translations ?? [] };
  });

export const upsertEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      slug: z.string().min(2).max(120),
      type: z.string(),
      status: z.enum(["ai_draft", "in_review", "published", "archived"]),
      lang_default: z.string().default("en"),
      tags: z.array(z.string()).default([]),
      related_slugs: z.array(z.string()).default([]),
      priority: z.number().int().default(0),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      ...data,
      type: data.type as EntryType,
      status: data.status as EntryStatus,
      reviewed_by: data.status === "published" ? context.userId : null,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };
    const { data: row, error } = await supabaseAdmin
      .from("knowledge_entries")
      .upsert(payload, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw error;
    await audit(context.userId, `entry:upsert:${data.status}`, { entry_id: row.id, diff: payload });
    return { id: row.id as string };
  });

export const upsertTranslation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      entry_id: z.string().uuid(),
      lang: z.enum(["en", "it", "zh"]),
      title: z.string().min(2),
      summary: z.string().default(""),
      body_md: z.string().default(""),
      meta_title: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("knowledge_translations")
      .upsert(data, { onConflict: "entry_id,lang" });
    if (error) throw error;
    await audit(context.userId, `translation:upsert:${data.lang}`, {
      entry_id: data.entry_id,
      diff: { lang: data.lang },
    });
    return { ok: true };
  });

// ---------- AI proposal ----------
async function callLovableAI(prompt: string, system: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

export const proposeFromText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      text: z.string().min(20).max(20000),
      hint: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const system = `You are a knowledge editor for Decoder, an AI code review platform.
Given input describing a feature, PR, or concept, return STRICT JSON (no markdown) with shape:
{"title":"...","slug":"kebab-case","type":"capability|concept|integration|format|provider|security|workflow","rationale":"why this deserves a page","keywords":["..."],"long_tail":["..."],"related_slugs":[],"draft_body_md":"## Overview\\n...\\n## FAQ\\n..."}.
Keep title <60 chars, slug <60 chars, draft 250-600 words, ground claims in the input.`;
    const out = await callLovableAI(`Hint: ${data.hint ?? "none"}\n\nInput:\n${data.text}`, system);
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(out.replace(/^```json\s*|\s*```$/g, "").trim());
    } catch {
      throw new Error("AI returned non-JSON; retry.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("knowledge_opportunities")
      .insert({
        title: String(parsed.title ?? "Untitled"),
        rationale: String(parsed.rationale ?? ""),
        suggested_slug: String(parsed.slug ?? ""),
        suggested_type: ([
          "capability",
          "concept",
          "integration",
          "format",
          "case_study",
          "guide",
        ].includes(String(parsed.type))
          ? String(parsed.type)
          : "concept") as EntryType,
        keywords: Array.isArray(parsed.keywords) ? (parsed.keywords as string[]) : [],
        related_entries: Array.isArray(parsed.related_slugs)
          ? (parsed.related_slugs as string[])
          : [],
        status: "open",
        kind: "manual",
        source: "manual",
        generated_from: { hint: data.hint ?? null, raw: parsed } as never,
        priority: 5,
      })
      .select("id")
      .single();
    if (error) throw error;
    await audit(context.userId, "opportunity:propose", {
      opportunity_id: row.id,
      diff: { hint: data.hint },
    });
    return { id: row.id as string, draft_body_md: String(parsed.draft_body_md ?? "") };
  });

export const convertOpportunityToDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), body_md: z.string().default("") }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: opp } = await supabaseAdmin
      .from("knowledge_opportunities")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!opp) throw new Error("Opportunity not found");
    const { data: entry, error: e1 } = await supabaseAdmin
      .from("knowledge_entries")
      .upsert(
        {
          slug: opp.suggested_slug || `draft-${data.id.slice(0, 8)}`,
          type: (opp.suggested_type ?? "concept") as EntryType,
          status: "ai_draft" as EntryStatus,
          lang_default: "en",
          tags: opp.keywords ?? [],
          related_slugs: opp.related_entries ?? [],
          priority: opp.priority ?? 0,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (e1) throw e1;
    await supabaseAdmin.from("knowledge_translations").upsert(
      {
        entry_id: entry.id,
        lang: "en",
        title: opp.title,
        summary: opp.rationale ?? "",
        body_md: data.body_md,
      },
      { onConflict: "entry_id,lang" },
    );
    await supabaseAdmin
      .from("knowledge_opportunities")
      .update({ status: "converted" })
      .eq("id", data.id);
    await audit(context.userId, "opportunity:converted", {
      opportunity_id: data.id,
      entry_id: entry.id,
    });
    return { entry_id: entry.id as string };
  });

export const translateEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ entry_id: z.string().uuid(), target: z.enum(["it", "zh"]) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src } = await supabaseAdmin
      .from("knowledge_translations")
      .select("title, summary, body_md")
      .eq("entry_id", data.entry_id)
      .eq("lang", "en")
      .maybeSingle();
    if (!src) throw new Error("English source not found");
    const langName = data.target === "it" ? "Italian" : "Simplified Chinese";
    const system = `Translate the given JSON to ${langName}. Return STRICT JSON {"title":"...","summary":"...","body_md":"..."}. Preserve markdown structure and code blocks.`;
    const out = await callLovableAI(JSON.stringify(src), system);
    const parsed = JSON.parse(out.replace(/^```json\s*|\s*```$/g, "").trim()) as {
      title: string;
      summary: string;
      body_md: string;
    };
    const { error } = await supabaseAdmin
      .from("knowledge_translations")
      .upsert(
        { entry_id: data.entry_id, lang: data.target, ...parsed },
        { onConflict: "entry_id,lang" },
      );
    if (error) throw error;
    await audit(context.userId, `translation:ai:${data.target}`, { entry_id: data.entry_id });
    return { ok: true };
  });

// ---------- Graph edges ----------
export const rebuildEdges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ entry_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: entry } = await supabaseAdmin
      .from("knowledge_entries")
      .select("id, related_slugs")
      .eq("id", data.entry_id)
      .maybeSingle();
    if (!entry) throw new Error("Not found");
    const slugs = (entry.related_slugs ?? []) as string[];
    if (slugs.length === 0) return { created: 0 };
    const { data: targets } = await supabaseAdmin
      .from("knowledge_entries")
      .select("id, slug")
      .in("slug", slugs);
    const rows = (targets ?? []).map((t) => ({
      from_entry: entry.id,
      to_entry: t.id,
      relation: "related",
      weight: 1,
      auto_generated: true,
    }));
    if (rows.length === 0) return { created: 0 };
    await supabaseAdmin
      .from("knowledge_edges")
      .delete()
      .eq("from_entry", entry.id)
      .eq("auto_generated", true);
    const { error } = await supabaseAdmin.from("knowledge_edges").insert(rows);
    if (error) throw error;
    return { created: rows.length };
  });
