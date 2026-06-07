// Bump this when the BYOK / AI provider acknowledgement text changes.
// Format: ISO date of the change. Each bump forces a new acknowledgement
// from every user before any cloud AI call or BYOK key save can proceed.
export const BYOK_TERMS_VERSION = "2026-06-07";

export type AcknowledgementType = "byok_cloud_ai";
export const BYOK_ACK_TYPE: AcknowledgementType = "byok_cloud_ai";

export const BYOK_ACK_ERROR = "byok_ack_required";
