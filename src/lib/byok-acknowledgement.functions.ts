import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  BYOK_ACK_TYPE,
  BYOK_TERMS_VERSION,
} from "./byok-acknowledgement";

const Lang = z.enum(["en", "it", "zh"]).catch("en");

export const getCurrentByokAck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_acknowledgements")
      .select("accepted_terms_version, accepted_at, accepted_language")
      .eq("user_id", context.userId)
      .eq("acknowledgement_type", BYOK_ACK_TYPE)
      .eq("accepted_terms_version", BYOK_TERMS_VERSION)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return {
      accepted: Boolean(data),
      currentVersion: BYOK_TERMS_VERSION,
      record: data
        ? {
            acceptedAt: data.accepted_at as string,
            version: data.accepted_terms_version as string,
            language: data.accepted_language as string,
          }
        : null,
    };
  });

export const recordByokAck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { language: string }) => ({ language: Lang.parse(d.language) }))
  .handler(async ({ context, data }) => {
    const fwd = getRequestHeader("x-forwarded-for") ?? getRequestHeader("cf-connecting-ip");
    const ip = fwd ? fwd.split(",")[0]!.trim() : null;
    const ua = (getRequestHeader("user-agent") ?? "").slice(0, 512) || null;

    const { error } = await context.supabase.from("user_acknowledgements").insert({
      user_id: context.userId,
      acknowledgement_type: BYOK_ACK_TYPE,
      accepted_terms_version: BYOK_TERMS_VERSION,
      accepted_language: data.language,
      ip_address: ip,
      user_agent: ua,
    });
    // Ignore duplicate-key (23505): user already accepted this version.
    if (error && (error as { code?: string }).code !== "23505") throw error;
    return { ok: true, version: BYOK_TERMS_VERSION };
  });

export const listByokAckHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_acknowledgements")
      .select("accepted_terms_version, accepted_at, accepted_language, acknowledgement_type")
      .eq("user_id", context.userId)
      .order("accepted_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { items: data ?? [] };
  });
