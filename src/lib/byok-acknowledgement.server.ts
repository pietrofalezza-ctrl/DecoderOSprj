import { setResponseStatus } from "@tanstack/react-start/server";

import {
  BYOK_ACK_TYPE,
  BYOK_TERMS_VERSION,
  BYOK_ACK_ERROR,
} from "./byok-acknowledgement";

/**
 * Server-side guard used inside other server functions. Throws with a
 * recognizable code so the client UI can pop the BYOK modal.
 *
 * Server-only: lives in a *.server.ts file so it is never reachable from
 * the client bundle.
 */
export async function assertByokAckAccepted(
  supabase: { from: (t: string) => any },
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("user_acknowledgements")
    .select("id")
    .eq("user_id", userId)
    .eq("acknowledgement_type", BYOK_ACK_TYPE)
    .eq("accepted_terms_version", BYOK_TERMS_VERSION)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    setResponseStatus(403);
    throw new Error(BYOK_ACK_ERROR);
  }
}
