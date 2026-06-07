import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Provider = z.enum(["openai", "anthropic", "gemini", "openrouter"]);

export const listProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: keys, error } = await context.supabase
      .from("user_ai_credentials_safe")
      .select("provider, key_hint, updated_at");
    if (error) throw error;
    const { data: endpoints, error: eErr } = await context.supabase
      .from("user_local_endpoints")
      .select("kind, base_url, default_model");
    if (eErr) throw eErr;

    // Decoder offers only two AI modes: user-managed BYOK keys and
    // local endpoints (Ollama / LM Studio). There is no server-managed
    // provider.
    return {
      keys: keys ?? [],
      endpoints: endpoints ?? [],
    };
  });

export const saveProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ provider: Provider, api_key: z.string().trim().min(8).max(500) }),
  )
  .handler(async ({ context, data }) => {
    const { assertByokAckAccepted } = await import("./byok-acknowledgement.server");
    await assertByokAckAccepted(context.supabase, context.userId);
    const { encryptSecret, keyHint } = await import("./crypto.server");
    const encrypted = encryptSecret(data.api_key);
    const hint = keyHint(data.api_key);
    const { error } = await context.supabase.from("user_ai_credentials").upsert(
      {
        owner_id: context.userId,
        provider: data.provider,
        encrypted_key: encrypted,
        key_hint: hint,
      },
      { onConflict: "owner_id,provider" },
    );
    if (error) throw error;
    return { ok: true, hint };
  });

export const deleteProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ provider: Provider }))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("user_ai_credentials")
      .delete()
      .eq("provider", data.provider);
    if (error) throw error;
    return { ok: true };
  });

export const saveLocalEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      kind: z.enum(["ollama", "lmstudio"]),
      base_url: z.string().trim().url().max(300),
      default_model: z.string().trim().max(160).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("user_local_endpoints").upsert(
      {
        owner_id: context.userId,
        kind: data.kind,
        base_url: data.base_url,
        default_model: data.default_model ?? null,
      },
      { onConflict: "owner_id,kind" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const deleteLocalEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ kind: z.enum(["ollama", "lmstudio"]) }))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("user_local_endpoints")
      .delete()
      .eq("kind", data.kind);
    if (error) throw error;
    return { ok: true };
  });
