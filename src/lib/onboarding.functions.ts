import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ONBOARDING_ACK_TYPE, ONBOARDING_TERMS_VERSION } from "./onboarding";

const Lang = z.enum(["en", "it", "zh"]).catch("en");

export const getOnboardingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_acknowledgements")
      .select("accepted_terms_version, accepted_at, accepted_language")
      .eq("user_id", context.userId)
      .eq("acknowledgement_type", ONBOARDING_ACK_TYPE)
      .eq("accepted_terms_version", ONBOARDING_TERMS_VERSION)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return {
      completed: Boolean(data),
      currentVersion: ONBOARDING_TERMS_VERSION,
      record: data
        ? {
            acceptedAt: data.accepted_at as string,
            version: data.accepted_terms_version as string,
            language: data.accepted_language as string,
          }
        : null,
    };
  });

export const recordOnboardingCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { language: string }) => ({ language: Lang.parse(d.language) }))
  .handler(async ({ context, data }) => {
    const fwd = getRequestHeader("x-forwarded-for") ?? getRequestHeader("cf-connecting-ip");
    const ip = fwd ? fwd.split(",")[0]!.trim() : null;
    const ua = (getRequestHeader("user-agent") ?? "").slice(0, 512) || null;

    const { error } = await context.supabase.from("user_acknowledgements").insert({
      user_id: context.userId,
      acknowledgement_type: ONBOARDING_ACK_TYPE,
      accepted_terms_version: ONBOARDING_TERMS_VERSION,
      accepted_language: data.language,
      ip_address: ip,
      user_agent: ua,
    });
    if (error && (error as { code?: string }).code !== "23505") throw error;
    return { ok: true, version: ONBOARDING_TERMS_VERSION };
  });
