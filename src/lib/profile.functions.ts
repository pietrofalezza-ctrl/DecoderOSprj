import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return { profile: data };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      display_name: z.string().trim().max(120).optional(),
      preferred_language: z.enum(["en", "it", "zh"]).optional(),
      preferred_proficiency: z
        .enum(["nontech", "junior", "intermediate", "senior", "architect", "cto"])
        .optional(),
      preferred_explanation_type: z.enum(["human", "technical"]).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").upsert({ id: userId, ...data });
    if (error) throw error;
    return { ok: true };
  });
