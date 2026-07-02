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

const filtersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  type: z.string().trim().max(100).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(500).default(100),
  offset: z.number().int().min(0).default(0),
});

type ConsentRow = {
  id: string;
  user_id: string;
  acknowledgement_type: string;
  accepted_terms_version: string;
  accepted_at: string;
  accepted_language: string;
  ip_address: string | null;
  user_agent: string | null;
  email: string | null;
};

async function queryConsents(input: z.infer<typeof filtersSchema>): Promise<{
  rows: ConsentRow[];
  total: number;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let q = supabaseAdmin
    .from("user_acknowledgements")
    .select(
      "id,user_id,acknowledgement_type,accepted_terms_version,accepted_at,accepted_language,ip_address,user_agent",
      { count: "exact" },
    )
    .order("accepted_at", { ascending: false });

  if (input.type) q = q.eq("acknowledgement_type", input.type);
  if (input.from) q = q.gte("accepted_at", input.from);
  if (input.to) q = q.lte("accepted_at", input.to);

  // search by user id substring (UUID) when it looks like one; otherwise we filter
  // by email after the auth.users lookup.
  if (input.search && /^[0-9a-f-]{6,}$/i.test(input.search)) {
    q = q.ilike("user_id", `%${input.search}%`);
  }

  const { data, error, count } = await q.range(input.offset, input.offset + input.limit - 1);
  if (error) throw error;

  const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id)));
  const emails = new Map<string, string>();
  // Batch lookup via Auth Admin API (paginated). For large pages we'd need
  // a server-side index; current admin dashboard expects ≤500 rows.
  for (const id of userIds) {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(id);
    if (u?.user?.email) emails.set(id, u.user.email);
  }

  let rows: ConsentRow[] = (data ?? []).map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    acknowledgement_type: r.acknowledgement_type as string,
    accepted_terms_version: r.accepted_terms_version as string,
    accepted_at: r.accepted_at as string,
    accepted_language: r.accepted_language as string,
    ip_address: (r.ip_address as string | null) ?? null,
    user_agent: (r.user_agent as string | null) ?? null,
    email: emails.get(r.user_id as string) ?? null,
  }));

  if (input.search && !/^[0-9a-f-]{6,}$/i.test(input.search)) {
    const needle = input.search.toLowerCase();
    rows = rows.filter((r) => (r.email ?? "").toLowerCase().includes(needle));
  }

  return { rows, total: count ?? rows.length };
}

export const listConsents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => filtersSchema.parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return await queryConsents(data);
  });

export const exportConsentsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    filtersSchema.parse({ ...(data as object), limit: 500, offset: 0 }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { rows } = await queryConsents(data);

    const headers = [
      "user_id",
      "email",
      "acknowledgement_type",
      "accepted_terms_version",
      "accepted_at",
      "accepted_language",
      "ip_address",
      "user_agent",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.user_id,
          r.email,
          r.acknowledgement_type,
          r.accepted_terms_version,
          r.accepted_at,
          r.accepted_language,
          r.ip_address,
          r.user_agent,
        ]
          .map(escape)
          .join(","),
      );
    }
    const csv = lines.join("\n");

    // Audit the export for compliance traceability.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("maintenance_audit_log").insert({
      job_name: "consents_export",
      status: "ok",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: 0,
      stats: {
        exported_by: context.userId,
        count: rows.length,
        filters: {
          type: data.type,
          from: data.from,
          to: data.to,
          search: data.search ? "***" : null,
        },
      },
    });

    return { csv, count: rows.length };
  });
